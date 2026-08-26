# 03 — Prove Atomic Turn Persistence with a transaction tracer

**What to build:** Provide a demonstrable synthetic turn that either persists an audited multi-document change completely as one turn commit or leaves the campaign exactly unchanged with a precise rejection.

**Blocked by:** 01 — Bootstrap the Pi-native campaign runtime.

**Status:** ready-for-agent

- [ ] A synthetic Resolution Record becomes an exact mutation plan and passes independent State Auditor validation.
- [ ] Only deterministic Recorder code can apply the approved mutation plan.
- [ ] Success creates synchronized state, a Turn Audit Record, a Turn Presentation Archive, and one Git commit linked by Turn ID.
- [ ] Any invalid precondition or interrupted mutation restores the original state and reports why persistence stopped.
- [ ] The working tree is clean after both successful and rejected tracer runs.
