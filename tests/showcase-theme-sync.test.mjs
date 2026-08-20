import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("the public showcase uses every production theme asset", async () => {
  const preview = await read("preview/preview.css");
  const manifests = await Promise.all([
    read("themes/diana-dark/codedrobe.json"),
    read("themes/diana-light/codedrobe.json")
  ]);

  for (const manifestSource of manifests) {
    const manifest = JSON.parse(manifestSource);
    for (const assetPath of Object.values(manifest.images)) {
      assert.match(preview, new RegExp(path.basename(assetPath).replaceAll(".", "\\.")));
    }
  }
});

test("the showcase preserves finalized Diana layout anchors", async () => {
  const preview = await read("preview/preview.css");
  assert.match(preview, /\.skin-corner-left[\s\S]*?width:\s*820px/);
  assert.match(preview, /\.skin-doodle-left[\s\S]*?bottom:\s*118px[\s\S]*?width:\s*340px/);
  assert.match(preview, /\.skin-character[\s\S]*?width:\s*440px[\s\S]*?height:\s*720px/);
  assert.match(preview, /--character-opacity:\s*\.66/);
  assert.match(preview, /:root\[data-theme="light"\][\s\S]*?--character-opacity:\s*\.72/);
});

test("the simulated interface contains no local user paths", async () => {
  const source = `${await read("preview/index.html")}\n${await read("preview/preview.js")}`;
  assert.doesNotMatch(source, /[A-Z]:\\Users\\/i);
  assert.doesNotMatch(source, /scrollIntoView/);
});
