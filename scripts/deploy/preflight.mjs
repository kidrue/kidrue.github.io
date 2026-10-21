import { dirname, resolve } from "node:path";
import {
  validateDeployment,
  githubConfiguration,
  loadLocal,
} from "./config.mjs";
import { withSsh, shellQuote } from "./ssh.mjs";

try {
  const file = resolve("env.local");
  const input = await loadLocal(file);
  const config = validateDeployment(input);
  const { secrets } = await githubConfiguration(input, dirname(file));
  await withSsh({ ...config, ...secrets }, async ({ run }) => {
    const command = `set -eu
test "$(id -u)" = 0 || sudo -n true
docker compose version
docker info --format '{{.ServerVersion}}'
nginx -t
systemctl is-active --quiet nginx
uname -m
df -Pm ${shellQuote(config.ALIYUN_DEPLOY_PATH.startsWith("/srv/") ? "/srv" : "/opt")}
for tool in nginx certbot curl flock sha256sum ss tar gzip realpath du awk df; do command -v "$tool" >/dev/null || { echo "缺少工具：$tool"; exit 1; }; done
ss -lnt | grep -E ':(80|443|3000|${config.BLOG_WEB_PORT}|${config.BLOG_API_PORT})[[:space:]]' || true
curl -fsS --max-time 5 http://127.0.0.1:3000/health >/dev/null && echo 'mewCat 本机健康检查通过' || echo 'mewCat 本机健康检查未通过，请确认现有服务状态'
`;
    await run('if [ "$(id -u)" = 0 ]; then bash -s; else sudo -n bash -s; fi', {
      input: command,
    });
  });
  console.log("只读服务器预检完成。没有启动、停止或修改服务。");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
