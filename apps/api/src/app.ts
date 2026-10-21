import Fastify, { type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import staticFiles from "@fastify/static";
import { PrismaClient } from "@prisma/client";
import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { mkdir } from "node:fs/promises";
import { z } from "zod";
import { articleInputSchema, type Article } from "@kidrue/shared";
import { uploadMedia, type MediaConfig } from "./media.js";

type AppConfig = Partial<MediaConfig> & {
  databaseUrl: string;
  mediaDirectory: string;
  adminPassword: string;
  sessionSecret: string;
  origin?: string;
  trustProxy?: false | string[];
  development?: boolean;
  logger?: boolean;
};
const SESSION = "kidrue_session";
const serialize = (
  article: { createdAt: Date; updatedAt: Date } & Record<string, unknown>,
) =>
  ({
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  }) as Article;
const digest = (value: string) => createHash("sha256").update(value).digest();
const fail = (statusCode: number, message: string): never => {
  throw Object.assign(new Error(message), { statusCode });
};

export async function createApp(config: AppConfig) {
  const app = Fastify({
    logger: config.logger ?? false,
    bodyLimit: 1_000_000,
    trustProxy: config.trustProxy ?? false,
  });
  const prisma = new PrismaClient({
    datasources: { db: { url: config.databaseUrl } },
  });
  await prisma.$connect();
  app.addHook("onClose", async () => prisma.$disconnect());
  await mkdir(config.mediaDirectory, { recursive: true });
  await app.register(cookie);
  await app.register(multipart);
  await app.register(rateLimit, { global: false });
  await app.register(staticFiles, {
    root: config.mediaDirectory,
    prefix: "/uploads/videos/",
    dotfiles: "deny",
    setHeaders: (response) => {
      response.header("X-Content-Type-Options", "nosniff");
      response.header(
        "Content-Security-Policy",
        "default-src 'none'; media-src 'self'",
      );
    },
  });
  const hashSession = (token: string) =>
    createHmac("sha256", config.sessionSecret).update(token).digest("hex");
  const authenticated = async (request: FastifyRequest) => {
    const token = request.cookies[SESSION];
    if (!token || token.length > 200) return false;
    const session = await prisma.session.findUnique({
      where: { id: hashSession(token) },
    });
    return Boolean(session && session.expiresAt.getTime() > Date.now());
  };
  app.addHook("onRequest", async (request, reply) => {
    reply.header("X-Content-Type-Options", "nosniff");
    const path = request.routeOptions.url ?? "";
    if (path.startsWith("/api/admin")) {
      reply.header("Cache-Control", "no-store");
      if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
        const expected =
          config.origin ?? `${request.protocol}://${request.headers.host}`;
        if (request.headers.origin !== expected)
          fail(403, "请求来源不受信任，请从本站操作");
      }
      if (
        path !== "/api/admin/session" &&
        path !== "/api/admin/login" &&
        !(await authenticated(request))
      )
        fail(401, "请先登录文章管理");
    }
  });
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof z.ZodError)
      return reply
        .code(400)
        .send({ message: error.issues[0]?.message ?? "文章内容不符合要求" });
    const known = error as Error & { statusCode?: number };
    const code =
      typeof known.statusCode === "number" &&
      known.statusCode >= 400 &&
      known.statusCode <= 599
        ? known.statusCode
        : 500;
    if (code === 500) request.log.error(error);
    return reply.code(code).send({
      message: code === 500 ? "服务暂时不可用，请稍后重试" : known.message,
    });
  });
  const mediaConfig = {
    ...config,
    maxImageBytes: config.maxImageBytes ?? 10 * 1024 * 1024,
    maxVideoBytes: config.maxVideoBytes ?? 100 * 1024 * 1024,
  };
  app.get("/api/health", async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, database: "postgresql" };
  });
  app.get("/api/admin/session", async (request) => ({
    authenticated: await authenticated(request),
    development: config.development ?? true,
    uploads: {
      configured: Boolean(config.imgurClientId || config.imgurAccessToken),
      maxImageBytes: mediaConfig.maxImageBytes,
      maxVideoBytes: mediaConfig.maxVideoBytes,
    },
  }));
  app.post(
    "/api/admin/login",
    { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const { password } = z
        .object({ password: z.string().max(500) })
        .parse(request.body);
      if (!timingSafeEqual(digest(password), digest(config.adminPassword)))
        fail(401, "密码不正确，请重试");
      const token = randomBytes(32).toString("base64url");
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.session.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      await prisma.session.create({
        data: { id: hashSession(token), expiresAt: expires },
      });
      reply.setCookie(SESSION, token, {
        httpOnly: true,
        sameSite: "strict",
        secure:
          config.development === false ||
          Boolean(config.origin?.startsWith("https://")),
        path: "/",
        expires,
      });
      return { authenticated: true };
    },
  );
  app.post("/api/admin/logout", async (request, reply) => {
    if (request.cookies[SESSION])
      await prisma.session.deleteMany({
        where: { id: hashSession(request.cookies[SESSION]!) },
      });
    reply.clearCookie(SESSION, { path: "/" }).code(204).send();
  });
  app.get("/api/articles", async (_, reply) => {
    reply.header("Cache-Control", "no-cache");
    return {
      articles: (
        await prisma.article.findMany({
          where: { status: "published" },
          orderBy: { updatedAt: "desc" },
        })
      ).map(serialize),
    };
  });
  app.get<{ Params: { id: string } }>("/api/articles/:id", async (request) => {
    const article = await prisma.article.findFirst({
      where: { id: request.params.id, status: "published" },
    });
    if (!article) return fail(404, "文章不存在或尚未发布");
    return { article: serialize(article) };
  });
  app.get("/api/admin/articles", async () => ({
    articles: (
      await prisma.article.findMany({ orderBy: { updatedAt: "desc" } })
    ).map(serialize),
  }));
  const validate = (body: unknown) => {
    const input = articleInputSchema.parse(body);
    if (input.status === "published" && !input.body.trim())
      fail(400, "发布前请填写文章正文");
    return {
      ...input,
      readTime: Math.max(1, Math.ceil(input.body.length / 500)),
    };
  };
  app.post("/api/admin/articles", async (request, reply) => {
    const input = validate(request.body);
    const article = await prisma.article.create({
      data: {
        ...input,
        id: randomUUID(),
        date: new Date().toISOString().slice(0, 10),
      },
    });
    return reply.code(201).send({ article: serialize(article) });
  });
  app.put<{ Params: { id: string } }>(
    "/api/admin/articles/:id",
    async (request) => {
      const { revision } = z
        .object({ revision: z.number().int().positive() })
        .parse(request.body);
      const input = validate(request.body);
      const result = await prisma.article.updateMany({
        where: { id: request.params.id, revision },
        data: { ...input, revision: { increment: 1 } },
      });
      if (!result.count) {
        if (
          !(await prisma.article.findUnique({
            where: { id: request.params.id },
          }))
        )
          fail(404, "文章不存在");
        fail(
          409,
          "文章已被其他窗口修改，当前文字已保留，请重新加载服务器版本后再保存",
        );
      }
      const article = await prisma.article.findUniqueOrThrow({
        where: { id: request.params.id },
      });
      return { article: serialize(article) };
    },
  );
  app.delete<{ Params: { id: string } }>(
    "/api/admin/articles/:id",
    async (request, reply) => {
      const result = await prisma.article.deleteMany({
        where: { id: request.params.id },
      });
      if (!result.count) fail(404, "文章不存在");
      return reply.code(204).send();
    },
  );
  await uploadMedia(app, mediaConfig);
  return app;
}
