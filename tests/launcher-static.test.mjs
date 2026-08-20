import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("the Diana runtime does not respawn Codex App Manager", async () => {
  const source = await read("tools/diana-runtime.mjs");
  assert.doesNotMatch(source, /resumeCodexAppManager/);
  assert.doesNotMatch(source, /spawn\(managerPath/);
  assert.match(source, /tasklist\.exe/);
  assert.match(source, /quiesceCodexAppManager/);
});

test("Windows launch scripts use the project CDP port", async () => {
  const enable = await read("tools/enable-diana-theme.ps1");
  const autostart = await read("tools/install-diana-autostart.ps1");
  const restore = await read("tools/restore-diana-theme.ps1");
  for (const source of [enable, autostart, restore]) {
    assert.match(source, /\[int\]\$Port = 9336/);
  }
});

test("all launch paths derive stable package names from package.json", async () => {
  const enable = await read("tools/enable-diana-theme.ps1");
  const autostart = await read("tools/install-diana-autostart.ps1");
  const pack = await read("tools/pack-themes.ps1");
  for (const source of [enable, autostart, pack]) {
    assert.match(source, /projectVersion/);
    assert.doesNotMatch(source, /runtime\.1\.codedrobe-theme/);
  }
});

test("restore stops the watcher before restoring native appearance", async () => {
  const restore = await read("tools/restore-diana-theme.ps1");
  assert.match(restore, /Stop-Process/);
  assert.match(restore, /diana-runtime\.mjs/);
  assert.match(restore, /restore --port \$Port/);
});
