import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function preparePages(directory) {
  const html = await readFile(join(directory, "index.html"), "utf8");
  for (const route of ["blog", "diary", "interests"]) {
    await mkdir(join(directory, route), { recursive: true });
    await writeFile(join(directory, route, "index.html"), html);
  }
  await writeFile(join(directory, "404.html"), html);
  await writeFile(join(directory, ".nojekyll"), "");
}
