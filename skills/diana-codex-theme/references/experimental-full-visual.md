# Experimental complete visual deployment

## Status

The default Diana installation aims for the complete composition: day/night colors, corner character, line art, stars, candy, and Acao decorations. Use this route only when the installed Codex version exposes no documented artwork hook.

This is an informed local experiment, not a compatibility promise. The public Diana release must not contain a ready-made CDP launcher, listener, watcher, or startup task. The user's Codex may design a version-specific local adapter only after inspecting the machine, notifying the user of the exact plan, and receiving separate approval.

## Authorization boundary

The ordinary request “帮我安装并挂载这套 Diana Codex 主题” targets the complete visual result and authorizes inspection, native palette changes, and documented reversible user-space hooks. It does not by itself authorize CDP or persistence.

Before any debugging endpoint is opened, explain in plain language that:

- loopback prevents direct access from another machine, but it is not authentication;
- another process under the same computer account may discover the endpoint, inspect visible conversation or workspace content, execute renderer JavaScript, take screenshots, or act with renderer privileges;
- stopping the injector or hiding the theme does not close a debugging endpoint already attached to a running Codex process;
- the exposure ends only after every CDP-enabled Codex process exits and Codex is reopened normally without the experimental launcher;
- a watcher or login item adds resource use, update fragility, and persistent residue.

Present the exact proposed executable and Codex version, bind address and port selection, process tree, local files, logs, network behavior, startup behavior, stop procedure, restore procedure, and expected resource cost. Stop and wait for explicit approval of that plan.

## Decision order

1. Prefer Codex Appearance, theme import, plugin, pet, extension, or user-style interfaces that the inspected build actually exposes.
2. Prefer a reversible user-writable integration that does not alter the installed application.
3. Use the experimental CDP route only when no documented artwork hook exists and the user accepts the disclosed local risk.
4. Never patch `WindowsApps`, MSIX contents, `app.asar`, a macOS `.app`, signatures, entitlements, or application executables.

On macOS, keep CDP disabled because that route has not been verified on real hardware. Do not reinterpret this document as macOS approval.

## Requirements for an approved local adapter

- Generate it under a dedicated user-writable Diana experiment directory. Do not add it to this repository, a release archive, or the installed Codex package.
- Bind only to the exact loopback address. Refuse `0.0.0.0`, LAN addresses, port forwarding, proxying, tunneling, or firewall exposure.
- Prefer an operating-system-assigned or unpredictable high port where the inspected runtime supports it. Port unpredictability reduces casual discovery but is not authentication.
- Before every connection, verify the listener owner, executable identity, expected Codex package, renderer target, and visible native window. These checks reduce mistakes but do not protect against hostile same-user software.
- Load CSS and images only from the bundled local assets. Do not fetch remote code, CSS, images, telemetry, or update payloads.
- Scope selectors below a Diana host marker. Keep decoration non-interactive with `pointer-events: none`, below task content, and outside the composer.
- Do not log conversation text, task titles, DOM snapshots, screenshots, cookies, tokens, WebSocket URLs, or authentication data. Logs may contain timestamps, versions, PIDs, state transitions, and redacted errors only.
- Do not force-close Codex. Ask before the initial restart and warn about active tasks.
- Keep the first run foreground/manual with no scheduled task, service, login item, or hidden watcher.

## Verification and restore gate

Verify home, conversation, settings, diff, approval, error, long scroll, narrow width, secondary windows, day/night switching, pointer and keyboard interaction, and resource use. Then perform all of the following before calling the adapter usable:

1. disable the injected styles;
2. stop the adapter;
3. fully exit every CDP-enabled Codex process;
4. reopen Codex from its normal official entry point;
5. confirm no debugging launch argument, listener, watcher, or Diana startup item remains;
6. restore every modified user configuration and verify the original appearance.

Report the exact tested versions, created paths, process and port behavior, omitted states, disable command, uninstall command, and residual risk.

## Optional automatic mounting

Automatic mounting is a second, separate decision. Offer it only after the manual cycle above passes. Before creating persistence, disclose the precise login item or scheduled task, watcher lifetime, idle resource use, update failure mode, log location, and one-step removal command, then obtain explicit approval again.

Even with loopback binding, process validation, redacted logs, and a clean uninstaller, automatic CDP mounting remains less secure than native Appearance. State that clearly in the final report.
