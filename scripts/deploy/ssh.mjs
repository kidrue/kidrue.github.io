import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const shellQuote = (value) =>
  `'${String(value).replaceAll("'", "'\\''")}'`;
export async function withSsh(config, callback) {
  const directory = await mkdtemp(join(tmpdir(), "kidrue-ssh-"));
  try {
    const privateKey = join(directory, "id_ed25519");
    const knownHosts = join(directory, "known_hosts");
    await writeFile(
      privateKey,
      config.ALIYUN_SSH_PRIVATE_KEY.replaceAll("\r\n", "\n"),
      { mode: 0o600 },
    );
    await writeFile(knownHosts, config.ALIYUN_SSH_KNOWN_HOSTS, { mode: 0o600 });
    await chmod(privateKey, 0o600);
    const common = [
      "-i",
      privateKey,
      "-o",
      `UserKnownHostsFile=${knownHosts}`,
      "-o",
      "StrictHostKeyChecking=yes",
      "-o",
      "BatchMode=yes",
      "-o",
      "IdentitiesOnly=yes",
      "-o",
      "ConnectTimeout=20",
      "-o",
      "ServerAliveInterval=30",
      "-o",
      "ServerAliveCountMax=6",
    ];
    const remote = `${config.ALIYUN_USER}@${config.ALIYUN_HOST}`;
    const run = (command, { input = "", onLine, quiet = false } = {}) =>
      new Promise((resolve, reject) => {
        const child = spawn(
          "ssh",
          ["-T", "-p", config.ALIYUN_SSH_PORT, ...common, remote, command],
          { stdio: ["pipe", "pipe", "pipe"], windowsHide: true },
        );
        let buffer = "";
        let failure;
        let pending = Promise.resolve();
        child.stdout.setEncoding("utf8");
        child.stderr.setEncoding("utf8");
        child.stdout.on("data", (chunk) => {
          buffer += chunk;
          let end;
          while ((end = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, end).replace(/\r$/, "");
            buffer = buffer.slice(end + 1);
            if (!quiet && !line.startsWith("::kidrue::")) console.log(line);
            if (onLine)
              pending = pending
                .then(async () => {
                  if (failure) return;
                  const response = await onLine(line);
                  if (response !== undefined && !child.stdin.destroyed)
                    child.stdin.write(`${response}\n`);
                })
                .catch((error) => {
                  failure = error;
                  child.stdin.end("FAILED\n");
                });
          }
        });
        child.stderr.on("data", (chunk) => {
          if (!quiet) process.stderr.write(chunk);
        });
        child.stdin.on("error", () => {});
        child.once("error", reject);
        child.once("close", async (code) => {
          await pending;
          if (failure) reject(failure);
          else if (code !== 0)
            reject(
              new Error(
                `SSH 远程操作失败（退出码 ${code}），请查看上方诊断；未输出部署凭据。`,
              ),
            );
          else resolve();
        });
        if (onLine) child.stdin.write(input);
        else child.stdin.end(input);
      });
    const upload = (source, destination) =>
      new Promise((resolve, reject) => {
        const child = spawn(
          "scp",
          [
            "-P",
            config.ALIYUN_SSH_PORT,
            ...common,
            source,
            `${remote}:${destination}`,
          ],
          { stdio: "inherit", windowsHide: true },
        );
        child.once("error", reject);
        child.once("close", (code) =>
          code === 0 ? resolve() : reject(new Error("发布包上传失败")),
        );
      });
    return await callback({ run, upload });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
