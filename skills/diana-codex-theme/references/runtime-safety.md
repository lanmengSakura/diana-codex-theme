# Runtime safety

## Known baseline

The repository was initialized against Codex for Windows version `26.810.7004.0`. Treat this as a historical baseline, not a permanent compatibility promise.

## Before applying

1. Record the current Codex version and distribution.
2. Capture read-only DOM and computed-style snapshots for the target states.
3. Confirm every selector is scoped below `html.codedrobe-host-codex` or the adapter's equivalent host marker.
4. Confirm all assets resolve inside the repository.
5. Prepare disable and restore commands.

## Application boundary

Use a loopback-only debugging connection and CSS-only enhancement. Do not alter installed files, signatures, packages, or application resources. Do not expose a debugging port to the network.

Restarting the user's app or changing its launch flags requires explicit approval.

## Verification

Test home, conversation, settings, diff, approval, long scrolling, narrow width, theme switching, restart persistence, disable, and restore. A browser mockup is visual design evidence only; it is not runtime compatibility evidence.
