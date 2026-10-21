import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Fastify, { type FastifyInstance } from "fastify";
import multipartPlugin from "@fastify/multipart";
import { uploadMedia, type MediaConfig } from "./media.js";
import { createApp } from "./app.js";
import { startDevDatabase } from "./dev-database.js";

const input = {
  title: "测试文章",
  description: "持久保存",
  category: "技术",
  tags: ["Node"],
  body: "# 正文",
  coverUrl: "",
  status: "draft",
};
const origin = "http://localhost:5173";
let app: FastifyInstance;
let directory: string;
let database: Awaited<ReturnType<typeof startDevDatabase>>;
let cookie = "";
const config = () => ({
  databaseUrl: database.databaseUrl,
  origin,
  mediaDirectory: join(directory, "videos"),
  adminPassword: "test-password",
  sessionSecret: "test-secret-that-is-long-enough-for-tests",
  logger: false as const,
  trustProxy: ["127.0.0.1"],
});
const headers = () => ({ origin, cookie });
function multipart(name: string, mime: string, data: Buffer) {
  const boundary = "kidrue-test-boundary";
  return {
    headers: {
      ...headers(),
      "content-type": `multipart/form-data; boundary=${boundary}`,
    },
    payload: Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${name}"\r\nContent-Type: ${mime}\r\n\r\n`,
      ),
      data,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
  };
}
// 第三方 HTTP 契约直接验证上传路由；认证和持久化由真实 SQL 集成场景覆盖。
async function createUploadApp(config: Partial<MediaConfig>) {
  const uploadApp = Fastify();
  await uploadApp.register(multipartPlugin);
  await uploadMedia(uploadApp, {
    maxImageBytes: 10 * 1024 * 1024,
    maxVideoBytes: 100 * 1024 * 1024,
    ...config,
  });
  return uploadApp;
}
beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), "kidrue-api-test-"));
  database = await startDevDatabase({
    directory: join(directory, "database"),
    port: 0,
  });
  app = await createApp(config());
}, 60000);
afterAll(async () => {
  await app?.close();
  await database?.close();
  if (directory) await rm(directory, { recursive: true, force: true });
});

describe("可信代理与登录限流", () => {
  it("可信代理后的不同客户端分别限流，拒绝未可信来源伪造 IP", async () => {
    const attempt = (remoteAddress: string, forwarded: string) =>
      app.inject({
        method: "POST",
        url: "/api/admin/login",
        remoteAddress,
        headers: { origin, "x-forwarded-for": forwarded },
        payload: { password: "wrong-password" },
      });
    for (let i = 0; i < 8; i++)
      expect((await attempt("127.0.0.1", "203.0.113.10")).statusCode).toBe(401);
    expect((await attempt("127.0.0.1", "203.0.113.10")).statusCode).toBe(429);
    expect((await attempt("127.0.0.1", "203.0.113.11")).statusCode).toBe(401);
    for (let i = 0; i < 8; i++)
      expect(
        (await attempt("203.0.113.20", `198.51.100.${i + 1}`)).statusCode,
      ).toBe(401);
    expect((await attempt("203.0.113.20", "198.51.100.99")).statusCode).toBe(
      429,
    );
  });
});

describe("文章管理与真实 SQL 持久化", () => {
  let articleId: string;
  it("匿名用户不能写入或读取草稿，拒绝跨源登录", async () => {
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/admin/articles",
          payload: input,
          headers: { origin },
        })
      ).statusCode,
    ).toBe(401);
    expect((await app.inject("/api/admin/articles")).statusCode).toBe(401);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/admin/login",
          payload: { password: "test-password" },
          headers: { origin: "https://evil.example" },
        })
      ).statusCode,
    ).toBe(403);
    expect((await app.inject("/api/articles")).json()).toEqual({
      articles: [],
    });
  });
  it("登录设置安全 Cookie 并创建草稿", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/api/admin/login",
      payload: { password: "test-password" },
      headers: { origin },
    });
    expect(login.statusCode).toBe(200);
    expect(login.headers["set-cookie"]).toContain("HttpOnly");
    expect(login.headers["set-cookie"]).toContain("SameSite=Strict");
    cookie = String(login.headers["set-cookie"]).split(";")[0];
    const created = await app.inject({
      method: "POST",
      url: "/api/admin/articles",
      payload: input,
      headers: headers(),
    });
    expect(created.statusCode).toBe(201);
    articleId = created.json().article.id;
    expect(created.json().article.revision).toBe(1);
    expect((await app.inject("/api/articles")).json().articles).toHaveLength(0);
    expect((await app.inject(`/api/articles/${articleId}`)).statusCode).toBe(
      404,
    );
    expect(
      (
        await app.inject({ url: "/api/admin/articles", headers: headers() })
      ).json().articles,
    ).toHaveLength(1);
  });
  it("原子修订更新防止覆盖并允许发布", async () => {
    const publish = await app.inject({
      method: "PUT",
      url: `/api/admin/articles/${articleId}`,
      headers: headers(),
      payload: { ...input, status: "published", revision: 1 },
    });
    expect(publish.statusCode).toBe(200);
    expect(publish.json().article.revision).toBe(2);
    expect(
      (
        await app.inject({
          method: "PUT",
          url: `/api/admin/articles/${articleId}`,
          headers: headers(),
          payload: { ...input, revision: 1 },
        })
      ).statusCode,
    ).toBe(409);
    expect((await app.inject("/api/articles")).json().articles[0].status).toBe(
      "published",
    );
  });
  it("重启数据库与应用后文章和会话持久存在", async () => {
    await app.close();
    await database.close();
    database = await startDevDatabase({
      directory: join(directory, "database"),
      port: 0,
    });
    app = await createApp(config());
    expect((await app.inject("/api/articles")).json().articles[0].id).toBe(
      articleId,
    );
    expect(
      (
        await app.inject({ url: "/api/admin/session", headers: headers() })
      ).json().authenticated,
    ).toBe(true);
  }, 60000);
  it("注销使旧 Cookie 失效", async () => {
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/admin/logout",
          headers: headers(),
        })
      ).statusCode,
    ).toBe(204);
    expect(
      (
        await app.inject({ url: "/api/admin/session", headers: headers() })
      ).json().authenticated,
    ).toBe(false);
    const login = await app.inject({
      method: "POST",
      url: "/api/admin/login",
      headers: { origin },
      payload: { password: "test-password" },
    });
    cookie = String(login.headers["set-cookie"]).split(";")[0];
  });
});

describe("媒体上传不向第三方发送测试文件", () => {
  it("拒绝伪造视频与 SVG", async () => {
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/admin/uploads",
          ...multipart("fake.mp4", "video/mp4", Buffer.from("not a video")),
        })
      ).statusCode,
    ).toBe(415);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/admin/uploads",
          ...multipart("evil.svg", "image/svg+xml", Buffer.from("<svg/>")),
        })
      ).statusCode,
    ).toBe(415);
  });
  it("没有 Imgur 凭据明确失败", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/admin/uploads",
      ...multipart(
        "image.png",
        "image/png",
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]),
      ),
    });
    expect(response.statusCode).toBe(503);
    expect(response.json().message).toContain("IMGUR_CLIENT_ID");
  });
  it("已有本地视频仍支持 Range 读取", async () => {
    const bytes = Buffer.concat([
      Buffer.from([0, 0, 0, 24]),
      Buffer.from("ftypisom"),
      Buffer.alloc(20),
    ]);
    await writeFile(join(directory, "videos", "existing.mp4"), bytes);
    const range = await app.inject({
      url: "/uploads/videos/existing.mp4",
      headers: { range: "bytes=0-7" },
    });
    expect(range.statusCode).toBe(206);
    expect(range.headers["content-type"]).toContain("video/mp4");
    expect(range.headers["content-range"]).toBe(`bytes 0-7/${bytes.length}`);
    expect(range.rawPayload).toEqual(bytes.subarray(0, 8));
  });
  it("Imgur 上游失败或错误业务码不会伪造成功", async () => {
    for (const response of [
      new Response("failure", { status: 502 }),
      Response.json({
        success: false,
        status: 400,
        data: { link: "https://i.imgur.com/bad.png" },
      }),
      Response.json({
        success: true,
        status: 200,
        data: { link: "javascript:alert(1)" },
      }),
      Response.json({
        success: true,
        status: 200,
        data: { link: "https://evil.example/image.png" },
      }),
    ]) {
      const uploadApp = await createUploadApp({
        imgurClientId: "test-client",
        fetch: async () => response,
      });
      try {
        const result = await uploadApp.inject({
          method: "POST",
          url: "/api/admin/uploads",
          ...multipart(
            "test.png",
            "image/png",
            Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]),
          ),
        });
        expect(result.statusCode).toBe(502);
      } finally {
        await uploadApp.close();
      }
    }
  });
  it("图片使用 Client-ID 与 image 字段上传到 Imgur", async () => {
    const uploadApp = await createUploadApp({
      imgurClientId: "test-client",
      fetch: async (url, options) => {
        expect(url).toBe("https://api.imgur.com/3/upload");
        expect(options?.method).toBe("POST");
        expect(new Headers(options?.headers).get("Authorization")).toBe(
          "Client-ID test-client",
        );
        const form = options?.body as FormData;
        expect(form.get("type")).toBe("file");
        expect(form.has("video")).toBe(false);
        expect(form.has("token")).toBe(false);
        expect((form.get("image") as File).type).toBe("image/png");
        return Response.json({
          success: true,
          status: 200,
          data: { link: "https://i.imgur.com/uploaded.png" },
        });
      },
    });
    try {
      const response = await uploadApp.inject({
        method: "POST",
        url: "/api/admin/uploads",
        ...multipart(
          "photo.png",
          "image/png",
          Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]),
        ),
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        type: "image",
        name: "photo.png",
        url: "https://i.imgur.com/uploaded.png",
      });
    } finally {
      await uploadApp.close();
    }
  });
  it("视频使用 video 字段上传到 Imgur 并返回可播放 MP4", async () => {
    const uploadApp = await createUploadApp({
      imgurClientId: "test-client",
      imgurAccessToken: "test-access-token",
      fetch: async (url, options) => {
        expect(url).toBe("https://api.imgur.com/3/upload");
        expect(new Headers(options?.headers).get("Authorization")).toBe(
          "Bearer test-access-token",
        );
        const form = options?.body as FormData;
        expect(form.has("image")).toBe(false);
        expect((form.get("video") as File).type).toBe("video/mp4");
        return Response.json({
          success: true,
          status: 200,
          data: {
            link: "https://i.imgur.com/clip.gifv",
            mp4: "https://i.imgur.com/clip.mp4",
          },
        });
      },
    });
    try {
      const response = await uploadApp.inject({
        method: "POST",
        url: "/api/admin/uploads",
        ...multipart(
          "clip.mp4",
          "video/mp4",
          Buffer.concat([
            Buffer.from([0, 0, 0, 24]),
            Buffer.from("ftypisom"),
            Buffer.alloc(20),
          ]),
        ),
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        type: "video",
        name: "clip.mp4",
        url: "https://i.imgur.com/clip.mp4",
      });
    } finally {
      await uploadApp.close();
    }
  });
  it("视频只有处理票据或网页链接时不能伪造可播放地址", async () => {
    for (const data of [
      { ticket: "processing" },
      { link: "https://imgur.com/clip" },
      { link: "https://i.imgur.com/clip.gifv" },
    ]) {
      const uploadApp = await createUploadApp({
        imgurClientId: "test-client",
        fetch: async () => Response.json({ success: true, status: 200, data }),
      });
      try {
        const response = await uploadApp.inject({
          method: "POST",
          url: "/api/admin/uploads",
          ...multipart(
            "clip.webm",
            "video/webm",
            Buffer.concat([
              Buffer.from([26, 69, 223, 163]),
              Buffer.from("webm"),
            ]),
          ),
        });
        expect(response.statusCode).toBe(502);
      } finally {
        await uploadApp.close();
      }
    }
  });
});
