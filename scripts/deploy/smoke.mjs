import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { validateRuntime, runtimeCompose, renderNginx } from "./config.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const revision = process.argv[2] ?? process.env.GITHUB_SHA;
if (!/^[a-f0-9]{40}$/.test(revision ?? ""))
  throw new Error("请传入已构建镜像的 40 位提交 SHA");
const project = `kidrue-blog-smoke-${randomBytes(5).toString("hex")}`;
await mkdir(join(root, ".data"), { recursive: true });
const directory = await mkdtemp(join(root, ".data/docker-smoke-"));
const freePort = async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return String(port);
};
const runtime = validateRuntime({
  BLOG_WEB_PORT: await freePort(),
  BLOG_API_PORT: await freePort(),
  POSTGRES_PASSWORD: randomBytes(32).toString("hex"),
  ADMIN_PASSWORD: randomBytes(24).toString("hex"),
  SESSION_SECRET: randomBytes(32).toString("hex"),
});
const compose = [
  "compose",
  "--project-directory",
  directory,
  "--env-file",
  join(directory, "image.env"),
  "-p",
  project,
  "-f",
  join(root, "deploy/compose.production.yaml"),
  "-f",
  join(directory, "runtime.compose.json"),
];
function docker(args, { input, capture = false } = {}) {
  const result = spawnSync("docker", args, {
    input,
    encoding: capture ? null : "utf8",
    stdio: capture || input ? ["pipe", "pipe", "pipe"] : "inherit",
    timeout: 240000,
  });
  if (result.error || result.status !== 0)
    throw new Error("Docker smoke 命令失败；请检查容器状态，未打印运行配置。");
  return result.stdout;
}
const request = (url, options) =>
  fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
try {
  await writeFile(
    join(directory, "image.env"),
    `BLOG_IMAGE_TAG=${revision}\nBLOG_API_PORT=${runtime.BLOG_API_PORT}\nBLOG_WEB_PORT=${runtime.BLOG_WEB_PORT}\n`,
    { mode: 0o600 },
  );
  await writeFile(
    join(directory, "runtime.compose.json"),
    JSON.stringify(runtimeCompose(runtime, "127.0.0.1")),
    { mode: 0o600 },
  );
  docker([...compose, "config", "--quiet"]);
  // Verify Compose's real interpolation, including literal $ and quotes.
  const special = validateRuntime({
    ...runtime,
    POSTGRES_PASSWORD: "test-$#'\"-password",
    ADMIN_PASSWORD: "test-$#'\"-admin",
  });
  await writeFile(
    join(directory, "special.json"),
    JSON.stringify(runtimeCompose(special, "127.0.0.1")),
    { mode: 0o600 },
  );
  const resolved = JSON.parse(
    docker(
      [
        ...compose,
        "-f",
        join(directory, "special.json"),
        "config",
        "--format",
        "json",
      ],
      { capture: true },
    ).toString(),
  );
  assert.equal(
    resolved.services.api.environment.ADMIN_PASSWORD,
    special.ADMIN_PASSWORD,
  );
  assert.equal(
    decodeURIComponent(
      new URL(resolved.services.api.environment.DATABASE_URL).password,
    ),
    special.POSTGRES_PASSWORD,
  );
  docker([
    ...compose,
    "up",
    "-d",
    "--no-build",
    "--wait",
    "--wait-timeout",
    "120",
    "postgres",
  ]);
  docker([...compose, "run", "--rm", "--no-deps", "migrate"]);
  docker([
    ...compose,
    "up",
    "-d",
    "--no-build",
    "--wait",
    "--wait-timeout",
    "180",
    "api",
    "web",
  ]);
  const origin = `http://127.0.0.1:${runtime.BLOG_API_PORT}`;
  assert.equal((await request(`${origin}/api/health`)).status, 200);
  assert.equal((await request(`${origin}/api/admin/articles`)).status, 401);
  const headers = {
    origin: "https://kidrue.top",
    "content-type": "application/json",
  };
  assert.equal(
    (await request(`${origin}/api/admin/uploads`, { method: "POST", headers }))
      .status,
    401,
  );
  const login = await request(`${origin}/api/admin/login`, {
    method: "POST",
    headers,
    body: JSON.stringify({ password: runtime.ADMIN_PASSWORD }),
  });
  assert.equal(login.status, 200);
  assert.match(login.headers.get("set-cookie"), /Secure/);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  headers.cookie = cookie;
  const response = await request(`${origin}/api/admin/articles`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: "Docker smoke",
      description: "生产镜像验证",
      body: "# 持久化测试",
      category: "技术",
      tags: ["smoke"],
      coverUrl: "",
      status: "draft",
    }),
  });
  assert.equal(response.status, 201);
  const article = (await response.json()).article;
  const publish = await request(`${origin}/api/admin/articles/${article.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      title: article.title,
      description: article.description,
      body: article.body,
      category: article.category,
      tags: article.tags,
      coverUrl: article.coverUrl,
      status: "published",
      revision: article.revision,
    }),
  });
  assert.equal(publish.status, 200);
  docker([
    ...compose,
    "exec",
    "-T",
    "api",
    "node",
    "-e",
    "require('node:fs').writeFileSync('/app/.data/videos/smoke.mp4','smoke-video-content')",
  ]);
  const video = await request(`${origin}/uploads/videos/smoke.mp4`, {
    headers: { range: "bytes=0-4" },
  });
  assert.equal(video.status, 206);
  assert.equal(await video.text(), "smoke");
  const web = `http://127.0.0.1:${runtime.BLOG_WEB_PORT}`;
  assert.equal(
    (await (await request(`${web}/blog-release.json`)).json()).revision,
    revision,
  );
  for (const path of ["/", "/blog", "/editor"])
    assert.match(await (await request(`${web}${path}`)).text(), /id="root"/);
  assert.equal(
    (await request(`${web}/fonts/chill-round-regular.woff2`)).status,
    200,
  );
  docker([
    ...compose,
    "up",
    "-d",
    "--no-build",
    "--force-recreate",
    "--wait",
    "--wait-timeout",
    "180",
    "postgres",
    "api",
    "web",
  ]);
  assert.equal(
    (await (await request(`${origin}/api/articles`)).json()).articles[0].id,
    article.id,
  );
  assert.equal(
    (
      await (
        await request(`${origin}/api/admin/session`, { headers: { cookie } })
      ).json()
    ).authenticated,
    true,
  );
  assert.equal(
    (await request(`${origin}/uploads/videos/smoke.mp4`)).status,
    200,
  );
  const backup = docker(
    [
      ...compose,
      "exec",
      "-T",
      "postgres",
      "pg_dump",
      "-U",
      "kidrue_blog",
      "-d",
      "kidrue_blog",
      "--format=custom",
    ],
    { capture: true },
  );
  assert.ok(backup.length > 0);
  docker([
    ...compose,
    "exec",
    "-T",
    "postgres",
    "createdb",
    "-U",
    "kidrue_blog",
    "restore_smoke",
  ]);
  docker(
    [
      ...compose,
      "exec",
      "-T",
      "postgres",
      "pg_restore",
      "-U",
      "kidrue_blog",
      "-d",
      "restore_smoke",
      "--no-owner",
    ],
    { input: backup },
  );
  const count = docker(
    [
      ...compose,
      "exec",
      "-T",
      "postgres",
      "psql",
      "-U",
      "kidrue_blog",
      "-d",
      "restore_smoke",
      "-tAc",
      "SELECT count(*) FROM kidrue_articles",
    ],
    { capture: true },
  );
  assert.equal(count.toString().trim(), "1");
  // Parse a TLS vhost alongside a legacy hostname without touching host Nginx.
  const certificates = join(directory, "certificates/kidrue-blog-kidrue.top");
  await mkdir(certificates, { recursive: true });
  const cert = spawnSync(
    "openssl",
    [
      "req",
      "-x509",
      "-nodes",
      "-newkey",
      "rsa:2048",
      "-days",
      "1",
      "-subj",
      "/CN=kidrue.top",
      "-keyout",
      join(certificates, "privkey.pem"),
      "-out",
      join(certificates, "fullchain.pem"),
    ],
    { stdio: "ignore" },
  );
  assert.equal(cert.status, 0);
  await writeFile(join(directory, "blog.conf"), renderNginx(runtime, true));
  await writeFile(
    join(directory, "legacy.conf"),
    "server { listen 80; server_name api.mewcat.kidrue.top; location /health { return 200 'ok'; } }\n",
  );
  docker([
    "run",
    "--rm",
    "-v",
    `${join(directory, "blog.conf")}:/etc/nginx/conf.d/blog.conf:ro`,
    "-v",
    `${join(directory, "legacy.conf")}:/etc/nginx/conf.d/legacy.conf:ro`,
    "-v",
    `${join(directory, "certificates")}:/etc/letsencrypt/live:ro`,
    `kidrue-blog-web:${revision}`,
    "nginx",
    "-t",
  ]);
  console.log(
    "容器 smoke 通过：生产启动、迁移、鉴权、文章发布、媒体、重建持久化、备份恢复和多站点 Nginx。",
  );
} finally {
  // Generated isolated project only; never use the real deployment project name.
  if (!/^kidrue-blog-smoke-[a-f0-9]+$/.test(project))
    throw new Error("测试清理项目名无效");
  docker([...compose, "down", "--volumes", "--remove-orphans"]);
  if (
    !resolve(directory).startsWith(resolve(root, ".data") + "/") &&
    !resolve(directory).startsWith(resolve(root, ".data") + "\\")
  )
    throw new Error("测试清理路径越界");
  await rm(directory, { recursive: true, force: true });
}
