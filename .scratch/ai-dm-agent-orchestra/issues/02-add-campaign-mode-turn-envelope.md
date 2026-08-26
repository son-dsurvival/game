# 02 — Add the Campaign Mode turn envelope

**What to build:** Let the player safely enter and leave Campaign Mode while every intercepted input receives a serialized, clean-baseline turn envelope before any campaign reasoning begins.

**Blocked by:** 01 — Bootstrap the Pi-native campaign runtime.

**Status:** ready-for-agent

- [ ] `/campaign off` and `/campaign shadow` transition predictably and the active mode is visible.
- [ ] Braced input is classified as an Out-of-Game Directive while eligible unbraced input enters the campaign flow.
- [ ] A dirty working tree stops the turn with the changed items identified.
- [ ] Campaign Turn Lock and unique Turn ID prevent overlapping turn pipelines.
- [ ] Shadow execution cannot modify authoritative campaign state.
