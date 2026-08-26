# 01 — Bootstrap the Pi-native campaign runtime

**What to build:** Establish a trusted, reproducible Pi runtime that can execute one isolated read-only campaign role with a schema-validated result while preserving the current remote history for later cutover.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The project-local runtime loads only after Pi project trust and uses the approved pinned `pi-agents` version.
- [ ] The existing remote `main` commit is preserved on `archive/pre-orchestra` without replacing `main` yet.
- [ ] A smoke flow runs one read-only role and returns a valid Structured Agent Handoff.
- [ ] Dependency and runtime checks are repeatable from a clean checkout.
