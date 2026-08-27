# 01 — Bootstrap the Pi-native campaign runtime

**What to build:** Establish a trusted, reproducible Pi runtime that can execute one isolated read-only campaign role with a schema-validated result while preserving the current remote history for later cutover.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent
**Completion:** implemented

- [x] The project-local runtime loads only after Pi project trust and uses the approved pinned `pi-agents` version.
- [x] The existing remote `main` commit is preserved on `archive/pre-orchestra` without replacing `main` yet.
- [x] A smoke flow runs one read-only role and returns a valid Structured Agent Handoff.
- [x] Dependency and runtime checks are repeatable from a clean checkout.

## Comments

- Preserved remote commit `31fd25d77bb91fa746feafa42675dfb8c47bc5fe` on `archive/pre-orchestra`; `origin/main` remains unchanged.
- Clean-install verification passed with root `npm ci` and project-extension `npm ci --prefix .pi/npm --legacy-peer-deps`.
- Clean-checkout runtime smoke run `13ffd3ce` completed with one schema-valid, read-only Structured Agent Handoff using the approved minimum contract.
