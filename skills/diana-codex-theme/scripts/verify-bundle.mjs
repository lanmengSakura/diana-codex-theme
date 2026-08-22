import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = "assets/theme-blueprint/assets/diana-brand/derived";
const themeRoot = "assets/theme-blueprint/themes";

const required = [
  "acao-cheer-v1.png",
  "acao-heart-v3.png",
  "diana-candy-lollipop-v1.png",
  "diana-candy-wrapped-v1.png",
  "diana-corner-cutout-v2.png",
  "diana-doodle-chalk-v2-approved.png",
  "diana-hand-star-reference-v2.png",
  "diana-left-top-detailed-corner-mask-v7.png",
  "diana-line-art-approved-upper.png",
  "diana-night-v3.png"
].map((name) => `${assetRoot}/${name}`);

for (const variant of ["diana-dark", "diana-light"]) {
  for (const name of ["theme.css", "theme.json"]) {
    required.push(`${themeRoot}/${variant}/${name}`);
  }
}

const missing = [];
for (const relativePath of required) {
  try {
    await access(path.join(skillRoot, relativePath));
  } catch {
    missing.push(relativePath);
  }
}

if (missing.length > 0) {
  console.error(JSON.stringify({ status: "error", missing }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ status: "ok", files: required.length }, null, 2));
}
