# Security policy

## Current security boundary

Repository and release components in `v0.2.2` and later must not:

- launch Codex with a remote debugging flag;
- expose or connect to a CDP endpoint;
- run a theme watcher or background listener;
- create a scheduled task, login item, or other theme persistence;
- patch `WindowsApps`, MSIX files, `app.asar`, a macOS `.app`, or signatures;
- load remote CSS, images, scripts, or telemetry.

The desktop deliverable is a native color recipe plus artwork, CSS blueprints, and an agent decision procedure. The release itself applies full corner artwork only through a documented, reversible user-space interface exposed by the installed Codex version; a separately approved user-authored experiment is described below. Windows Terminal support is independent and uses only a local static PNG.

## User-authored experimental adapter

The ordinary installation request targets the complete Diana composition, but it does not silently authorize CDP or persistence. When no documented artwork hook exists, the standalone skill may help a user's Codex inspect and propose a machine-local adapter. Before opening a debugging endpoint, Codex must notify the user of the same-machine attack surface and list the exact process, port, file, log, persistence, resource, and restore plan, then obtain separate approval.

An approved adapter must remain outside this repository and release archives, use exact loopback only, avoid remote content and sensitive logs, start without persistence, and prove full process exit plus normal Codex relaunch during restore. Automatic mounting requires another explicit approval after a successful manual enable/disable/restore cycle. These controls reduce risk but do not authenticate CDP.

## Affected legacy versions

Versions `0.1.0` through `0.2.1` used an unauthenticated loopback Chrome DevTools Protocol endpoint. It was not reachable directly from the LAN or Internet, and no telemetry or external upload was found, but another process on the same machine could connect to the privileged debugger. These versions should no longer be used for desktop injection.

To remove the legacy runtime:

```powershell
npm run security:remove-legacy
```

Then fully exit every Codex process, reopen Codex normally, and run:

```powershell
npm run security:audit
```

The expected result is `Diana security audit: SAFE`.

## Reporting

Please use GitHub private vulnerability reporting for findings that could expose local files, tokens, task content, application sessions, or install persistence. Include the affected release, operating system, reproduction steps, process command line with secrets removed, and the output of `npm run security:audit`.
