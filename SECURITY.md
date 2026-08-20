# Security policy

## Scope

Security reports are welcome for the launcher, loopback CDP handling, package validation, restore path, and accidental inclusion of sensitive local data.

The theme must never expose its debugging endpoint beyond `127.0.0.1`, modify signed Codex files, execute remote theme content, or collect telemetry.

## Reporting

Please do not open a public issue for a vulnerability that could expose local files, tokens, task content, or the debugging endpoint. Use GitHub's private vulnerability reporting for this repository when available.

Include the affected Codex version, Windows version, reproduction steps, observed listener address, and whether `npm run theme:uninstall` fully restores the original state.
