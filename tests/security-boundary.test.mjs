import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("the public package has no CDP launcher or watcher dependency", async () => {
  const packageSource = await read("package.json");
  const packageJson = JSON.parse(packageSource);

  assert.equal(packageJson.dependencies, undefined);
  assert.doesNotMatch(packageSource, /@codedrobe\/core/);
  assert.doesNotMatch(packageSource, /theme:(dark|light|autostart|pack|switch)/);

  for (const relativePath of [
    "tools/diana-runtime.mjs",
    "tools/enable-diana-theme.ps1",
    "tools/install-diana-autostart.ps1",
    "tools/pack-themes.ps1",
  ]) {
    await assert.rejects(access(path.join(root, relativePath)));
  }
});

test("release packaging contains only the safe terminal and blueprint skill", async () => {
  const packageSource = await read("package.json");
  const sanitizer = await read("tools/prepare-safe-release.ps1");
  assert.match(packageSource, /terminal:pack/);
  assert.match(packageSource, /skill:pack/);
  assert.doesNotMatch(packageSource, /codedrobe-theme/);
  assert.match(sanitizer, /\*\.codedrobe-theme/);
  assert.match(sanitizer, /removedLegacyArtifacts/);
});

test("legacy cleanup removes persistence without reconnecting to CDP", async () => {
  const cleanup = await read("tools/remove-legacy-cdp.ps1");
  const audit = await read("tools/audit-legacy-cdp.ps1");

  assert.match(cleanup, /Unregister-ScheduledTask/);
  assert.match(cleanup, /diana-runtime/);
  assert.match(cleanup, /remote-debugging-port/);
  assert.doesNotMatch(cleanup, /Invoke-RestMethod|\/json\/list|WebSocket/);
  assert.doesNotMatch(audit, /Invoke-RestMethod|\/json\/list|WebSocket/);
});

test("Windows Terminal profiles are static local fragments with no listener or persistence", async () => {
  const fragmentSource = await read("terminal/diana-terminal/diana-terminal.json");
  const fragment = JSON.parse(fragmentSource);
  const terminalSources = await Promise.all([
    read("terminal/install-diana-terminal.ps1"),
    read("terminal/set-diana-terminal-default.ps1"),
    read("terminal/new-diana-terminal-shortcut.ps1"),
    read("terminal/uninstall-diana-terminal.ps1"),
  ]);
  const combined = `${fragmentSource}\n${terminalSources.join("\n")}`;

  assert.deepEqual(
    fragment.profiles.map((profile) => profile.commandline),
    ["pwsh.exe -NoLogo", "cmd.exe"],
  );
  assert.ok(fragment.profiles.every((profile) => profile.backgroundImage === "diana-terminal-bg-v2.png"));
  assert.doesNotMatch(combined, /https?:\/\//i);
  assert.doesNotMatch(
    combined,
    /remote-debugging|DevTools|WebSocket|HttpListener|TcpListener|Register-ScheduledTask|schtasks|Start-Job|codedrobe|9336/i,
  );
});

test("both visual blueprints keep the environment star and non-interactive decoration", async () => {
  for (const relativePath of [
    "themes/diana-dark/theme.css",
    "themes/diana-light/theme.css",
  ]) {
    const source = await read(relativePath);
    assert.match(source, /\.diana-environment-heading-star/);
    assert.match(source, /--diana-image-hand-star/);
    assert.match(source, /pointer-events:\s*none/);
    assert.match(source, /html\.diana-theme-host/);
  }
});
