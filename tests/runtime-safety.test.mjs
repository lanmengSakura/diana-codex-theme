import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const runtimeThemes = [
  "themes/diana-dark/theme.css",
  "themes/diana-light/theme.css",
  "skills/diana-codex-theme/assets/theme-blueprint/themes/diana-dark/theme.css",
  "skills/diana-codex-theme/assets/theme-blueprint/themes/diana-light/theme.css",
];

test("Codex compact and auxiliary windows retain native transparency", async () => {
  for (const relativePath of runtimeThemes) {
    const css = await read(relativePath);
    assert.match(css, /html\.diana-theme-host:is\(\.compact-window, \.diana-auxiliary-window\)/);
    assert.match(css, /\.diana-auxiliary-window\) #root[\s\S]*?background: transparent !important/);
    assert.match(css, /\.diana-auxiliary-window\) \.diana-skin-surface[\s\S]*?background-color: transparent !important/);
    assert.match(css, /\.compact-window, \.diana-auxiliary-window\) #diana-theme-chrome\s*\{\s*display: none;/);
  }
});
