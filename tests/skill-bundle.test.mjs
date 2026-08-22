import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const skillRoot = path.join(root, "skills", "diana-codex-theme");
const read = (base, relativePath) => readFile(path.join(base, relativePath));

test("the standalone skill carries byte-identical production themes and assets", async () => {
  const manifests = await Promise.all([
    readFile(path.join(root, "themes", "diana-dark", "theme.json"), "utf8"),
    readFile(path.join(root, "themes", "diana-light", "theme.json"), "utf8")
  ]);
  const assetNames = new Set();

  for (const source of manifests) {
    const manifest = JSON.parse(source);
    for (const assetPath of Object.values(manifest.assets)) {
      assetNames.add(path.basename(assetPath));
    }
  }

  for (const name of assetNames) {
    const production = await read(root, path.join("assets", "diana-brand", "derived", name));
    const bundled = await read(skillRoot, path.join("assets", "theme-blueprint", "assets", "diana-brand", "derived", name));
    assert.deepEqual(bundled, production, `${name} drifted from the production asset`);
  }

  for (const variant of ["diana-dark", "diana-light"]) {
    for (const name of ["theme.css", "theme.json"]) {
      const production = await read(root, path.join("themes", variant, name));
      const bundled = await read(skillRoot, path.join("assets", "theme-blueprint", "themes", variant, name));
      assert.deepEqual(bundled, production, `${variant}/${name} drifted from the production theme`);
    }
  }
});

test("the macOS route is explicitly experimental and refuses app-bundle patching", async () => {
  const source = await readFile(path.join(skillRoot, "references", "macos-deployment.md"), "utf8");
  assert.match(source, /experimental/i);
  assert.match(source, /has not been verified on real macOS hardware/i);
  assert.match(source, /Never write to or re-sign/);
  assert.match(source, /\/Applications\/\*\.app/);
  assert.match(source, /valid outcome/);
  assert.match(source, /Never use CDP/);
});

test("complete artwork is the default goal while experimental CDP remains informed opt-in", async () => {
  const skill = await readFile(path.join(skillRoot, "SKILL.md"), "utf8");
  const experiment = await readFile(
    path.join(skillRoot, "references", "experimental-full-visual.md"),
    "utf8",
  );

  assert.match(skill, /Complete artwork by default/);
  assert.match(skill, /does not by itself authorize opening CDP/);
  assert.match(experiment, /Stop and wait for explicit approval/);
  assert.match(experiment, /must not contain a ready-made CDP launcher/);
  assert.match(experiment, /Automatic mounting is a second, separate decision/);
});
