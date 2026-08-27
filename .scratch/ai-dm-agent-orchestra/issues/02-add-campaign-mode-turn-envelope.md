# 02 — Add the Campaign Mode turn envelope

**What to build:** Let the player safely enter and leave Campaign Mode while every intercepted input receives a serialized, clean-baseline turn envelope before any campaign reasoning begins.

**Blocked by:** 01 — Bootstrap the Pi-native campaign runtime.

**Status:** ready-for-agent
**Completion:** implemented

- [x] `/campaign off` and `/campaign shadow` transition predictably and the active mode is visible.
- [x] Braced input is classified as an Out-of-Game Directive while eligible unbraced input enters the campaign flow.
- [x] A dirty working tree stops the turn with the changed items identified.
- [x] Campaign Turn Lock and unique Turn ID prevent overlapping turn pipelines.
- [x] Shadow execution cannot modify authoritative campaign state.

## Comments

- Added the trusted project-local Campaign Mode extension and deterministic Turn Envelope admission runtime.
- Focused tests cover mode visibility, input routing, dirty baselines, concurrent lock admission, unique Turn IDs, and the shadow write boundary.
