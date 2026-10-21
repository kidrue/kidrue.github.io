import { readFile, writeFile, chmod } from "node:fs/promises";
import { join } from "node:path";
import { validateRuntime, runtimeCompose, renderNginx } from "./config.mjs";

const [directory, gateway = "127.0.0.1", previousDirectory] =
  process.argv.slice(2);
try {
  if (!directory) throw new Error("缺少发布配置目录");
  let previous;
  if (previousDirectory) {
    previous = JSON.parse(
      await readFile(join(previousDirectory, "runtime.json"), "utf8"),
    );
  }
  const runtime = validateRuntime(
    JSON.parse(await readFile(join(directory, "runtime.json"), "utf8")),
    previous,
  );
  if (
    !/^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
      runtime.CERTBOT_EMAIL,
    )
  )
    throw new Error("CERTBOT_EMAIL 格式无效");
  const files = {
    "runtime.json": JSON.stringify(runtime),
    "runtime.compose.json": JSON.stringify(runtimeCompose(runtime, gateway)),
    "http.conf": renderNginx(runtime, false),
    "https.conf": renderNginx(runtime, true),
    "settings.env": `BLOG_WEB_PORT=${runtime.BLOG_WEB_PORT}\nBLOG_API_PORT=${runtime.BLOG_API_PORT}\nBLOG_DOMAIN=${runtime.BLOG_DOMAIN}\nCERTBOT_EMAIL=${runtime.CERTBOT_EMAIL}\n`,
  };
  for (const [name, value] of Object.entries(files)) {
    await writeFile(join(directory, name), value, { mode: 0o600 });
    await chmod(join(directory, name), 0o600);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
