import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateDeployment, runtimeKeys } from "./config.mjs";
import { withSsh, shellQuote } from "./ssh.mjs";
import { configureDns, waitForDns } from "./dns.mjs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function verifyPublic(config, revision) {
  const origin = `https://${config.BLOG_DOMAIN}`;
  const deadline = Date.now() + 600000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/blog-release.json`, {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      const version = await response.json();
      if (!response.ok || version.revision !== revision)
        throw new Error("版本尚未生效");
      const health = await fetch(`${origin}/api/health`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!health.ok || !(await health.json()).ok)
        throw new Error("API 健康检查失败");
      for (const path of ["/blog", "/editor"]) {
        const page = await fetch(`${origin}${path}`, {
          signal: AbortSignal.timeout(15000),
        });
        if (!page.ok || !(await page.text()).includes('id="root"'))
          throw new Error("页面不可用");
      }
      return;
    } catch {
      await delay(5000);
    }
  }
  throw new Error(
    "公网 HTTPS 验证超时；请检查 DNS、备案、80/443 防火墙及证书。",
  );
}
async function currentMain(config) {
  const response = await fetch(
    `https://api.github.com/repos/${config.GITHUB_REPOSITORY}/git/ref/heads/main`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(20000),
    },
  );
  if (!response.ok)
    throw new Error("无法核对 GitHub main 当前版本，已停止部署");
  return (await response.json()).object.sha;
}
async function main() {
  const config = validateDeployment(process.env);
  const revision = process.env.GITHUB_SHA;
  const runId = `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`;
  if (!/^[a-f0-9]{40}$/.test(revision ?? "") || !/^\d+-\d+$/.test(runId))
    throw new Error("发布任务标识无效");
  if ((await currentMain(config)) !== revision) {
    console.log("此提交已不是 main 最新版本，跳过发布。");
    return;
  }
  if (!config.ALIYUN_SSH_PRIVATE_KEY || !config.ALIYUN_SSH_KNOWN_HOSTS)
    throw new Error("缺少部署 SSH Secrets");
  const incoming = `/tmp/kidrue-blog-${runId}`;
  await withSsh(config, async ({ run, upload }) => {
    await run(`umask 077; mkdir ${shellQuote(incoming)}`);
    await upload(
      resolve("bundle/release.tar.gz"),
      `${incoming}/release.tar.gz`,
    );
    await upload(
      resolve("bundle/release.sha256"),
      `${incoming}/release.sha256`,
    );
    if ((await currentMain(config)) !== revision) {
      console.log("上传期间 main 已更新，跳过部署；临时包可后续清理。");
      return;
    }
    await run(
      `cd ${shellQuote(incoming)} && sha256sum -c release.sha256 && tar -xzf release.tar.gz && ${["bash", `${incoming}/deploy.sh`, config.ALIYUN_DEPLOY_PATH, config.ALIYUN_COMPOSE_PROJECT, revision, incoming, config.ALIYUN_PLATFORM].map(shellQuote).join(" ")}`,
      {
        input: `${JSON.stringify(Object.fromEntries(runtimeKeys.map((key) => [key, config[key] ?? ""])))}\n`,
        onLine: async (line) => {
          if (line === "::kidrue::dns") {
            const result = await configureDns(config);
            console.log(`kidrue.top DNS 配置：${result.action}`);
            console.log("等待公共 DNS 生效后再申请证书，最长等待 15 分钟。");
            await waitForDns(config.BLOG_DOMAIN, config.ALIYUN_PUBLIC_IPV4);
            return "DNS_OK";
          }
          if (line === "::kidrue::verify") {
            await verifyPublic(config, revision);
            console.log("公网 HTTPS、前端版本和 API 验证通过。");
            return "VERIFY_OK";
          }
        },
      },
    );
  });
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
