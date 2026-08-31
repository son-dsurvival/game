# 03 — Prove Atomic Turn Persistence with a transaction tracer

**What to build:** Provide a demonstrable synthetic turn that either persists an audited multi-document change completely as one turn commit or leaves the campaign exactly unchanged with a precise rejection.

**Blocked by:** 01 — Bootstrap the Pi-native campaign runtime.

**Status:** ready-for-agent
**Completion:** implemented

- [x] A synthetic Resolution Record becomes an exact mutation plan and passes independent State Auditor validation.
- [x] Only deterministic Recorder code can apply the approved mutation plan.
- [x] Success creates synchronized state, a Turn Audit Record, a Turn Presentation Archive, and one Git commit linked by Turn ID.
- [x] Any invalid precondition or interrupted mutation restores the original state and reports why persistence stopped.
- [x] The working tree is clean after both successful and rejected tracer runs.

## Comments

- `npm run trace:persistence` runs isolated temporary Git repositories and reports a successful one-commit trace plus an injected rollback trace.
- Focused tests cover exact plans, auditor rejections, Recorder authority, post-audit tampering, complete multi-file commit traces, interrupted rollback, and clean rejected runs.
