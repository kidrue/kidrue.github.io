import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  validateDeployment,
  validateRuntime,
  runtimeCompose,
  githubConfiguration,
  renderNginx,
} from "./deploy/config.mjs";
import { ensureDnsRecord, waitForDns } from "./deploy/dns.mjs";
import { parse } from "yaml";

const runtime = {
  BLOG_DOMAIN: "kidrue.top",
  BLOG_WEB_PORT: "18080",
  BLOG_API_PORT: "13001",
  POSTGRES_PASSWORD: "postgres-$#'\"-secret",
  ADMIN_PASSWORD: "admin-$#'\"-secret",
  SESSION_SECRET: "01234567890123456789012345678901-$#'\"",
};
const deployment = {
  ...runtime,
  GITHUB_REPOSITORY: "kidrue/blog",
  ALIYUN_HOST: "203.0.113.7",
  ALIYUN_USER: "root",
  ALIYUN_PUBLIC_IPV4: "203.0.113.7",
  CERTBOT_EMAIL: "owner@example.com",
  ALIYUN_SSH_PRIVATE_KEY_PATH: "keys/deploy",
  ALIYUN_SSH_KNOWN_HOSTS_PATH: "keys/known_hosts",
  ALIYUN_DNS_ACCESS_KEY_ID: "test-id",
  ALIYUN_DNS_ACCESS_KEY_SECRET: "test-secret",
};

test("部署参数拒绝缺失值、其他项目目录、命令注入和错误端口", () => {
  assert.equal(
    validateDeployment(deployment).ALIYUN_DEPLOY_PATH,
    "/opt/kidrue-blog",
  );
  for (const value of [
    "/",
    "/opt/mewCat-service",
    "/opt/../mewCat-service",
    "/opt/blog;id",
  ]) {
    assert.throws(
      () => validateDeployment({ ...deployment, ALIYUN_DEPLOY_PATH: value }),
      /ALIYUN_DEPLOY_PATH/,
    );
  }
  assert.throws(
    () => validateDeployment({ ...deployment, BLOG_WEB_PORT: "3000" }),
    /BLOG_WEB_PORT/,
  );
  assert.throws(
    () => validateDeployment({ ...deployment, BLOG_API_PORT: "18080" }),
    /端口/,
  );
  assert.throws(
    () => validateDeployment({ ...deployment, ALIYUN_USER: "root;id" }),
    /ALIYUN_USER/,
  );
  assert.throws(
    () => validateRuntime({ ...runtime, ADMIN_PASSWORD: "short" }),
    /ADMIN_PASSWORD/,
  );
  assert.throws(
    () =>
      validateRuntime({ ...runtime, POSTGRES_PASSWORD: "secret\nINJECT=x" }),
    /POSTGRES_PASSWORD/,
  );
});

test("运行配置正确编码密码、转义 Compose 插值，凭据只进入对应服务", () => {
  const config = runtimeCompose(validateRuntime(runtime), "172.21.0.1");
  const env = config.services.api.environment;
  const decoded = env.DATABASE_URL.replaceAll("$$", "$");
  assert.equal(
    decodeURIComponent(new URL(decoded).password),
    runtime.POSTGRES_PASSWORD,
  );
  assert.equal(
    env.ADMIN_PASSWORD.replaceAll("$$", "$"),
    runtime.ADMIN_PASSWORD,
  );
  assert.equal(env.TRUST_PROXY, "127.0.0.1,::1,172.21.0.1");
  assert.equal(env.PUBLIC_ORIGIN, "https://kidrue.top");
  assert.equal(
    config.services.postgres.environment.POSTGRES_PASSWORD.replaceAll(
      "$$",
      "$",
    ),
    runtime.POSTGRES_PASSWORD,
  );
  assert.equal(config.services.web, undefined);
  assert.equal(config.services.migrate.environment.ADMIN_PASSWORD, undefined);
  assert.throws(
    () =>
      validateRuntime(
        { ...runtime, POSTGRES_PASSWORD: "changed-production-password" },
        runtime,
      ),
    /轮换/,
  );
});

test("GitHub 同步只使用白名单，私钥从文件读取，默认配置状态不显示秘密", async () => {
  const directory = await mkdtemp(join(tmpdir(), "kidrue-deploy-config-"));
  try {
    await writeFile(
      join(directory, "key"),
      "-----BEGIN OPENSSH PRIVATE KEY-----\nprivate-content\n-----END OPENSSH PRIVATE KEY-----\n",
    );
    await writeFile(join(directory, "known"), "host ssh-ed25519 AAAATEST\n");
    const config = await githubConfiguration(
      {
        ...deployment,
        ALIYUN_SSH_PRIVATE_KEY_PATH: "key",
        ALIYUN_SSH_KNOWN_HOSTS_PATH: "known",
        UNRELATED_SECRET: "never-sync",
      },
      directory,
    );
    assert.match(config.secrets.ALIYUN_SSH_PRIVATE_KEY, /private-content/);
    assert.equal(config.secrets.UNRELATED_SECRET, undefined);
    assert.equal(config.variables.GITHUB_REPOSITORY, undefined);
    assert.equal(config.variables.BLOG_DOMAIN, "kidrue.top");
    assert.ok(!JSON.stringify(config.status).includes("private-content"));
    assert.ok(!JSON.stringify(config.status).includes(runtime.ADMIN_PASSWORD));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

function dnsClient(records) {
  const writes = [];
  return {
    writes,
    describeDomainRecords: async () => ({
      body: { totalCount: records.length, domainRecords: { record: records } },
    }),
    addDomainRecord: async (request) => {
      writes.push(["add", request]);
      return { body: { recordId: "new" } };
    },
    updateDomainRecord: async (request) => {
      writes.push(["update", request]);
      return { body: { recordId: request.recordId } };
    },
  };
}
test("DNS 新增、更新与重复执行仅操作根域名 A 记录", async () => {
  for (const [records, action] of [
    [
      [
        {
          RR: "api.mewcat",
          type: "A",
          value: "203.0.113.1",
          recordId: "legacy",
        },
      ],
      "add",
    ],
    [
      [{ RR: "@", type: "A", value: "203.0.113.1", recordId: "root" }],
      "update",
    ],
    [
      [
        {
          RR: "@",
          type: "A",
          value: "203.0.113.7",
          recordId: "root",
          status: "ENABLE",
        },
      ],
      undefined,
    ],
  ]) {
    const client = dnsClient(records);
    await ensureDnsRecord(client, "kidrue.top", "203.0.113.7");
    assert.equal(client.writes[0]?.[0], action);
    if (action) {
      assert.equal(client.writes[0][1].RR, "@");
      assert.equal(client.writes[0][1].type, "A");
      assert.notEqual(client.writes[0][1].recordId, "legacy");
    }
  }
});
test("DNS 多个根 A 或根 CNAME/AAAA 冲突时拒绝改动", async () => {
  for (const records of [
    [
      { RR: "@", type: "A" },
      { RR: "@", type: "A" },
    ],
    [{ RR: "@", type: "CNAME" }],
    [{ RR: "@", type: "AAAA" }],
  ]) {
    const client = dnsClient(records);
    await assert.rejects(
      ensureDnsRecord(client, "kidrue.top", "203.0.113.7"),
      /冲突/,
    );
    assert.equal(client.writes.length, 0);
  }
});

test("签证前等待公共 DNS，不把旧地址或失败解析当成成功", async () => {
  await waitForDns("kidrue.top", "203.0.113.7", {
    timeout: 20,
    resolve4: async () => ["203.0.113.7"],
  });
  await assert.rejects(
    waitForDns("kidrue.top", "203.0.113.7", {
      timeout: 10,
      resolve4: async () => ["203.0.113.8"],
    }),
    /公共 DNS/,
  );
  const disabled = dnsClient([
    {
      RR: "@",
      type: "A",
      value: "203.0.113.7",
      recordId: "root",
      status: "DISABLE",
    },
  ]);
  await assert.rejects(
    ensureDnsRecord(disabled, "kidrue.top", "203.0.113.7"),
    /禁用/,
  );
  assert.equal(disabled.writes.length, 0);
});

test("服务器配置生成器只写受保护的运行字段，拒绝邮箱 shell 注入", async () => {
  const directory = await mkdtemp(join(tmpdir(), "kidrue-runtime-"));
  try {
    const input = {
      ...runtime,
      CERTBOT_EMAIL: "owner@example.com",
      ALIYUN_DNS_ACCESS_KEY_SECRET: "must-not-arrive-at-server",
    };
    await writeFile(join(directory, "runtime.json"), JSON.stringify(input));
    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL("./deploy/runtime.mjs", import.meta.url)),
        directory,
        "172.21.0.1",
      ],
      { encoding: "utf8", windowsHide: true },
    );
    assert.equal(result.status, 0, result.stderr);
    const output = await readFile(join(directory, "runtime.json"), "utf8");
    assert.ok(!output.includes("must-not-arrive-at-server"));
    assert.match(
      await readFile(join(directory, "settings.env"), "utf8"),
      /CERTBOT_EMAIL=owner@example.com/,
    );
    await writeFile(
      join(directory, "runtime.json"),
      JSON.stringify({
        ...input,
        CERTBOT_EMAIL: "$(touch injected)@example.com",
      }),
    );
    const rejected = spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL("./deploy/runtime.mjs", import.meta.url)),
        directory,
      ],
      { encoding: "utf8", windowsHide: true },
    );
    assert.equal(rejected.status, 1);
    assert.match(rejected.stderr, /CERTBOT_EMAIL/);
    assert.ok(!rejected.stderr.includes(runtime.ADMIN_PASSWORD));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("博客站点仅代理独立本机端口，生产 Compose 不公开数据库或其他服务端口", async () => {
  const nginx = renderNginx(validateRuntime(runtime), true);
  assert.match(nginx, /server_name kidrue\.top;/);
  assert.match(nginx, /127\.0\.0\.1:18080/);
  assert.match(nginx, /127\.0\.0\.1:13001/);
  assert.match(nginx, /X-Forwarded-For \$remote_addr/);
  assert.doesNotMatch(nginx, /api\.mewcat|:3000|default_server/);
  const compose = parse(
    await readFile(
      new URL("../deploy/compose.production.yaml", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(compose.services.postgres.ports, undefined);
  assert.equal(compose.services.api.ports[0].host_ip, "127.0.0.1");
  assert.equal(compose.services.web.ports[0].host_ip, "127.0.0.1");
  assert.equal(compose.services.postgres.pull_policy, "never");
});
