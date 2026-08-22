# Security policy

## Current security boundary

Release `v0.2.2` and later must not:

- launch Codex with a remote debugging flag;
- expose or connect to a CDP endpoint;
- run a theme watcher or background listener;
- create a scheduled task, login item, or other theme persistence;
- patch `WindowsApps`, MSIX files, `app.asar`, a macOS `.app`, or signatures;
- load remote CSS, images, scripts, or telemetry.

The desktop deliverable is a native color recipe plus artwork and CSS blueprints. The full corner artwork may be applied only through a documented, reversible user-space interface exposed by the installed Codex version. Windows Terminal support is independent and uses only a local static PNG.

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
