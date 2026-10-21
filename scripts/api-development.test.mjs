import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startApiDevelopment } from "./api-development.mjs";

async function waitFor(check, description) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`等待超时：${description}`);
}

test("后端仅在构建成功后串行重启，构建失败保留服务，退出释放端口", async () => {
  const root = await mkdtemp(join(tmpdir(), "kidrue-vite-watch-"));
  const source = join(root, "server.mjs");
  const contract = join(root, "contract.mjs");
  const configFile = join(root, "vite.config.mjs");
  const messages = [];
  const errors = [];
  let output = "";
  let controller;
  const server = (label) => `
    import { createServer } from 'node:http';
    import { value } from './contract.mjs';
    const server = createServer((req, res) => res.end('${label}:' + value));
    server.listen(0, '127.0.0.1', () => console.log(JSON.stringify({port: server.address().port, pid: process.pid})));
    process.on('message', message => {
      if (message.type === 'shutdown') server.close(() => process.exit(0));
    });
    process.on('disconnect', () => server.close(() => process.exit(0)));
  `;
  try {
    await writeFile(source, "const = broken initial build");
    await writeFile(contract, "export const value = 'shared-v1';");
    await writeFile(
      configFile,
      `export default {
      root: ${JSON.stringify(root)}, logLevel: 'silent',
      build: { ssr: 'server.mjs', outDir: '.dev', minify: false, watch: {},
        rollupOptions: { output: { entryFileNames: 'index.mjs' } } }
    }`,
    );
    controller = await startApiDevelopment({
      configFile,
      entry: join(root, ".dev/index.mjs"),
      cwd: root,
      onBuildError: (error) => errors.push(error),
      onOutput: (chunk) => {
        output += chunk;
        let end;
        while ((end = output.indexOf("\n")) >= 0) {
          const line = output.slice(0, end);
          output = output.slice(end + 1);
          if (line.trim()) messages.push(JSON.parse(line));
        }
      },
    });
    await waitFor(() => errors.length, "首次构建报错");
    assert.equal(messages.length, 0);
    await writeFile(source, server("v1"));
    await waitFor(() => messages[0], "首次成功构建启动");
    const first = messages[0];
    const firstUrl = `http://127.0.0.1:${first.port}`;
    assert.equal(await (await fetch(firstUrl)).text(), "v1:shared-v1");
    await writeFile(source, "const = broken rebuild");
    await waitFor(() => errors.length > 1, "重新构建报错");
    assert.equal(await (await fetch(firstUrl)).text(), "v1:shared-v1");
    assert.equal(messages.length, 1);
    await writeFile(source, server("v2"));
    await waitFor(() => messages[1], "修复后重启");
    assert.notEqual(first.pid, messages[1].pid);
    await assert.rejects(fetch(firstUrl));
    await writeFile(contract, "export const value = 'shared-v2';");
    await waitFor(() => messages[2], "共享模块更新后重启");
    const lastUrl = `http://127.0.0.1:${messages[2].port}`;
    assert.equal(await (await fetch(lastUrl)).text(), "v2:shared-v2");
    await controller.close();
    await assert.rejects(fetch(lastUrl));
  } finally {
    await controller?.close();
    await rm(root, { recursive: true, force: true });
  }
});
