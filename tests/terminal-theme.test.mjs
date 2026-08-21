import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const fragmentUrl = new URL('../terminal/diana-terminal/diana-terminal.json', import.meta.url);
const terminalImageUrl = new URL('../terminal/diana-terminal/diana-terminal-bg-v2.png', import.meta.url);

test('terminal fragment defines isolated Diana profiles', async () => {
  const fragment = JSON.parse(await readFile(fragmentUrl, 'utf8'));
  assert.deepEqual(
    fragment.profiles.map((profile) => profile.name),
    ['Diana PowerShell', 'Diana CMD'],
  );
  assert.equal(fragment.schemes.length, 1);
  assert.equal(fragment.schemes[0].name, 'Diana Night');
  assert.equal(new Set(fragment.profiles.map((profile) => profile.guid)).size, 2);
});

test('terminal theme uses only a static local background', async () => {
  const fragmentText = await readFile(fragmentUrl, 'utf8');
  const fragment = JSON.parse(fragmentText);

  assert.doesNotMatch(fragmentText, /https?:\/\//);
  for (const profile of fragment.profiles) {
    assert.equal(profile.backgroundImage, 'diana-terminal-bg-v2.png');
    assert.equal(profile.backgroundImageAlignment, 'bottomRight');
    assert.equal(profile.backgroundImageStretchMode, 'uniform');
    assert.equal(profile.backgroundImageOpacity, 1);
    assert.equal(profile.opacity, 100);
    assert.equal(profile.useAcrylic, false);
    assert.equal(profile.colorScheme, 'Diana Night');
  }
});

test('terminal package carries a composed transparent background', async () => {
  const terminalImage = await readFile(terminalImageUrl);
  assert.ok(terminalImage.length > 100_000);
  assert.deepEqual([...terminalImage.subarray(1, 4)], [0x50, 0x4e, 0x47]);
});

test('terminal default-profile support is reversible and avoids registry changes', async () => {
  const script = await readFile(new URL('../terminal/set-diana-terminal-default.ps1', import.meta.url), 'utf8');
  assert.match(script, /PreviousDefaultProfile/);
  assert.match(script, /settings\.json/);
  assert.match(script, /\[switch\]\$Restore/);
  assert.doesNotMatch(script, /Set-ItemProperty|New-ItemProperty|HKCU:|HKLM:/);
});

test('terminal script shortcuts explicitly select a Diana profile', async () => {
  const [shortcutScript, packageScript] = await Promise.all([
    readFile(new URL('../terminal/new-diana-terminal-shortcut.ps1', import.meta.url), 'utf8'),
    readFile(new URL('../terminal/pack-terminal-release.ps1', import.meta.url), 'utf8'),
  ]);

  assert.match(shortcutScript, /Diana CMD/);
  assert.match(shortcutScript, /Diana PowerShell/);
  assert.match(shortcutScript, /WScript\.Shell/);
  assert.match(shortcutScript, /wt\.exe/);
  assert.match(shortcutScript, /\.cmd.*\.bat.*\.ps1/s);
  assert.doesNotMatch(shortcutScript, /Set-ItemProperty|New-ItemProperty|HKCU:|HKLM:/);
  assert.match(packageScript, /new-diana-terminal-shortcut\.ps1/);
});

test('terminal release documents both install routes and uses a simulated screenshot', async () => {
  const [rootReadme, terminalReadme, showcase, screenshot] = await Promise.all([
    readFile(new URL('../README.md', import.meta.url), 'utf8'),
    readFile(new URL('../terminal/README.md', import.meta.url), 'utf8'),
    readFile(new URL('../terminal/showcase.html', import.meta.url), 'utf8'),
    readFile(new URL('../terminal/qa/terminal-readme-1600x900.png', import.meta.url)),
  ]);

  assert.match(rootReadme, /terminal\/qa\/terminal-readme-1600x900\.png/);
  assert.match(rootReadme, /install-independent\.cmd/);
  assert.match(rootReadme, /install-as-default\.cmd/);
  assert.match(terminalReadme, /独立保留/);
  assert.match(terminalReadme, /设为默认/);
  assert.match(rootReadme, /terminal:shortcut/);
  assert.match(terminalReadme, /new-diana-terminal-shortcut\.ps1/);
  assert.match(showcase, /C:\\Projects\\diana-codex-theme/);
  assert.doesNotMatch(showcase, /C:\\Users\\|AppData|\.codex/);
  assert.ok(screenshot.length > 100_000);
});
