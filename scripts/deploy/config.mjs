import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { isIP } from "node:net";
import { parse } from "dotenv";

export const defaults = {
  BLOG_DOMAIN: "kidrue.top",
  BLOG_WEB_PORT: "18080",
  BLOG_API_PORT: "13001",
  ALIYUN_SSH_PORT: "22",
  ALIYUN_DEPLOY_PATH: "/opt/kidrue-blog",
  ALIYUN_COMPOSE_PROJECT: "kidrue-blog",
  ALIYUN_PLATFORM: "linux/amd64",
  MAX_IMAGE_BYTES: "10485760",
  MAX_VIDEO_BYTES: "104857600",
};
export const variableKeys = [
  "ALIYUN_SSH_PORT",
  "ALIYUN_DEPLOY_PATH",
  "ALIYUN_COMPOSE_PROJECT",
  "ALIYUN_PLATFORM",
  "BLOG_DOMAIN",
  "BLOG_WEB_PORT",
  "BLOG_API_PORT",
  "ALIYUN_PUBLIC_IPV4",
  "CERTBOT_EMAIL",
  "MAX_IMAGE_BYTES",
  "MAX_VIDEO_BYTES",
];
export const secretKeys = [
  "ALIYUN_HOST",
  "ALIYUN_USER",
  "POSTGRES_PASSWORD",
  "ADMIN_PASSWORD",
  "SESSION_SECRET",
  "IMGUR_CLIENT_ID",
  "IMGUR_ACCESS_TOKEN",
  "ALIYUN_DNS_ACCESS_KEY_ID",
  "ALIYUN_DNS_ACCESS_KEY_SECRET",
  "ALIYUN_DNS_SECURITY_TOKEN",
];
export const runtimeKeys = [
  "BLOG_DOMAIN",
  "BLOG_WEB_PORT",
  "BLOG_API_PORT",
  "POSTGRES_PASSWORD",
  "ADMIN_PASSWORD",
  "SESSION_SECRET",
  "IMGUR_CLIENT_ID",
  "IMGUR_ACCESS_TOKEN",
  "CERTBOT_EMAIL",
  "MAX_IMAGE_BYTES",
  "MAX_VIDEO_BYTES",
];
const fail = (key, reason) => {
  throw new Error(`${key}：${reason}`);
};
function scalar(config, key, minimum = 0) {
  const value = config[key] ?? "";
  if (
    typeof value !== "string" ||
    /[\r\n\0]/.test(value) ||
    value.length < minimum
  )
    fail(key, `必须为单行配置，长度至少 ${minimum}`);
  return value;
}
function port(config, key, minimum = 1024) {
  const value = scalar(config, key, 1);
  if (
    !/^\d+$/.test(value) ||
    Number(value) < minimum ||
    Number(value) > 65535 ||
    Number(value) === 3000
  )
    fail(key, "端口无效或占用现有 mewCat 端口");
}
export function validateRuntime(input, previous) {
  const source = { ...defaults, ...input };
  const config = Object.fromEntries(
    runtimeKeys.map((key) => [key, scalar(source, key)]),
  );
  if (config.BLOG_DOMAIN !== "kidrue.top")
    fail("BLOG_DOMAIN", "此部署仅管理 kidrue.top");
  port(config, "BLOG_WEB_PORT");
  port(config, "BLOG_API_PORT");
  config.BLOG_WEB_PORT = String(Number(config.BLOG_WEB_PORT));
  config.BLOG_API_PORT = String(Number(config.BLOG_API_PORT));
  if (config.BLOG_WEB_PORT === config.BLOG_API_PORT)
    fail("端口", "前端与 API 不能相同");
  scalar(config, "POSTGRES_PASSWORD", 16);
  scalar(config, "ADMIN_PASSWORD", 12);
  scalar(config, "SESSION_SECRET", 32);
  if (config.ADMIN_PASSWORD === "kidrue-local")
    fail("ADMIN_PASSWORD", "生产环境不可使用开发默认密码");
  for (const key of ["MAX_IMAGE_BYTES", "MAX_VIDEO_BYTES"])
    if (
      !/^\d+$/.test(config[key]) ||
      Number(config[key]) < 1 ||
      Number(config[key]) > 104857600
    )
      fail(key, "大小必须在 1 到 104857600 字节之间");
  if (previous && previous.POSTGRES_PASSWORD !== config.POSTGRES_PASSWORD)
    fail("POSTGRES_PASSWORD", "现有数据库密码需单独轮换，不能仅修改部署变量");
  return config;
}
export function validateDeployment(input) {
  const config = { ...defaults, ...input, ...validateRuntime(input) };
  const match = (key, pattern) => {
    if (!pattern.test(scalar(config, key, 1))) fail(key, "格式无效");
  };
  match("GITHUB_REPOSITORY", /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
  if (
    config.GITHUB_REPOSITORY.split("/").some(
      (part) => part === "." || part === "..",
    )
  )
    fail("GITHUB_REPOSITORY", "仓库标识无效");
  match("ALIYUN_HOST", /^[a-zA-Z0-9][a-zA-Z0-9.-]*$/);
  match("ALIYUN_USER", /^[a-z_][a-z0-9_-]*$/);
  port(config, "ALIYUN_SSH_PORT", 1);
  match("ALIYUN_DEPLOY_PATH", /^\/[A-Za-z0-9_/-]+$/);
  if (
    config.ALIYUN_DEPLOY_PATH === "/" ||
    config.ALIYUN_DEPLOY_PATH.includes("//") ||
    config.ALIYUN_DEPLOY_PATH.split("/").filter(Boolean).length < 2 ||
    /mewcat/i.test(config.ALIYUN_DEPLOY_PATH)
  )
    fail("ALIYUN_DEPLOY_PATH", "必须使用独立的博客目录");
  match("ALIYUN_COMPOSE_PROJECT", /^kidrue-blog[a-z0-9_-]*$/);
  match("ALIYUN_PLATFORM", /^linux\/(amd64|arm64)$/);
  if (
    isIP(scalar(config, "ALIYUN_PUBLIC_IPV4", 1)) !== 4 ||
    /^(127\.|0\.|10\.|192\.168\.|198\.(18|19)\.)/.test(
      config.ALIYUN_PUBLIC_IPV4,
    )
  )
    fail("ALIYUN_PUBLIC_IPV4", "需填写真实公网 IPv4");
  match("CERTBOT_EMAIL", /^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/);
  for (const key of [
    "ALIYUN_DNS_ACCESS_KEY_ID",
    "ALIYUN_DNS_ACCESS_KEY_SECRET",
  ])
    scalar(config, key, 1);
  return config;
}
export async function loadLocal(file = "env.local") {
  try {
    return parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT")
      throw new Error("请先填写项目根目录 env.local");
    throw error;
  }
}
export async function githubConfiguration(input, directory = process.cwd()) {
  const config = validateDeployment(input);
  const variables = Object.fromEntries(
    variableKeys.map((key) => [key, config[key] ?? ""]),
  );
  const secrets = Object.fromEntries(
    secretKeys.map((key) => [key, config[key] ?? ""]),
  );
  for (const [key, field] of [
    ["ALIYUN_SSH_PRIVATE_KEY", "ALIYUN_SSH_PRIVATE_KEY_PATH"],
    ["ALIYUN_SSH_KNOWN_HOSTS", "ALIYUN_SSH_KNOWN_HOSTS_PATH"],
  ]) {
    scalar(config, field, 1);
    try {
      secrets[key] = await readFile(resolve(directory, config[field]), "utf8");
    } catch {
      fail(field, "无法读取文件");
    }
  }
  if (
    !/-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]+-----END OPENSSH PRIVATE KEY-----/.test(
      secrets.ALIYUN_SSH_PRIVATE_KEY,
    )
  )
    fail("ALIYUN_SSH_PRIVATE_KEY_PATH", "需要无口令 OpenSSH 私钥文件");
  if (
    !/\S+\s+(ssh-ed25519|ssh-rsa|ecdsa-sha2-\S+)\s+\S+/.test(
      secrets.ALIYUN_SSH_KNOWN_HOSTS,
    )
  )
    fail("ALIYUN_SSH_KNOWN_HOSTS_PATH", "需要已核验的 known_hosts 完整记录");
  return {
    variables,
    secrets,
    status: Object.fromEntries(
      [...Object.entries(variables), ...Object.entries(secrets)].map(
        ([key, value]) => [key, value ? "已配置" : "未配置（可选）"],
      ),
    ),
  };
}
export function runtimeCompose(config, gateway) {
  if (!isIP(gateway)) fail("TRUST_PROXY", "Docker 网关地址无效");
  const escape = (values) =>
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        String(value).replaceAll("$", "$$"),
      ]),
    );
  const databaseUrl = `postgresql://kidrue_blog:${encodeURIComponent(config.POSTGRES_PASSWORD)}@postgres:5432/kidrue_blog?connection_limit=5`;
  return {
    services: {
      postgres: {
        environment: escape({
          POSTGRES_DB: "kidrue_blog",
          POSTGRES_USER: "kidrue_blog",
          POSTGRES_PASSWORD: config.POSTGRES_PASSWORD,
        }),
      },
      api: {
        environment: escape({
          NODE_ENV: "production",
          HOST: "0.0.0.0",
          PORT: "3001",
          DATABASE_URL: databaseUrl,
          ADMIN_PASSWORD: config.ADMIN_PASSWORD,
          SESSION_SECRET: config.SESSION_SECRET,
          PUBLIC_ORIGIN: `https://${config.BLOG_DOMAIN}`,
          TRUST_PROXY: `127.0.0.1,::1,${gateway}`,
          MEDIA_DIRECTORY: "/app/.data/videos",
          IMGUR_CLIENT_ID: config.IMGUR_CLIENT_ID,
          IMGUR_ACCESS_TOKEN: config.IMGUR_ACCESS_TOKEN,
          MAX_IMAGE_BYTES: config.MAX_IMAGE_BYTES,
          MAX_VIDEO_BYTES: config.MAX_VIDEO_BYTES,
        }),
      },
      migrate: {
        environment: escape({
          DATABASE_URL: databaseUrl,
          NODE_ENV: "production",
        }),
      },
    },
  };
}
export function renderNginx(config, tls) {
  const domain = config.BLOG_DOMAIN;
  const marker = "# Managed by kidrue-blog.\n";
  const challenge =
    "location ^~ /.well-known/acme-challenge/ { root /var/lib/kidrue-blog/acme; }";
  const http = `server {\n    listen 80;\n    server_name ${domain};\n    ${challenge}\n    location / { ${tls ? "return 301 https://$host$request_uri;" : "return 503;"} }\n}\n`;
  if (!tls) return marker + http;
  const headers =
    "proxy_set_header Host $host;\n        proxy_set_header X-Forwarded-Proto $scheme;\n        proxy_set_header X-Forwarded-For $remote_addr;\n        proxy_set_header X-Real-IP $remote_addr;";
  return (
    marker +
    http +
    `server {
    listen 443 ssl;
    server_name ${domain};
    ssl_certificate /etc/letsencrypt/live/kidrue-blog-${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kidrue-blog-${domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    client_max_body_size 110m;
    location / { proxy_pass http://127.0.0.1:${config.BLOG_WEB_PORT}; ${headers} }
    location /api/ { proxy_pass http://127.0.0.1:${config.BLOG_API_PORT};
        ${headers}
        proxy_read_timeout 200s; proxy_send_timeout 200s;
    }
    location /uploads/ { proxy_pass http://127.0.0.1:${config.BLOG_API_PORT};
        ${headers}
        proxy_read_timeout 200s; proxy_send_timeout 200s;
    }
}
`
  );
}
