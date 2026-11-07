import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "dist");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const item of ["index.html", "manifest.webmanifest", "icon.svg", "sw.js", "src", "assets"]) {
  await cp(resolve(root, item), resolve(output, item), { recursive: true });
}
console.log("Production app built in dist/");
