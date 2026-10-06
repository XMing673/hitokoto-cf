import { cp, mkdir, rm } from "node:fs/promises";

const files = [
  "404.html",
  "_headers",
  "_redirects",
  "categories.json",
  "robots.txt",
  "version.json",
];

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

for (const file of files) {
  await cp(file, `dist/${file}`);
}
