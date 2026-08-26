# 13 — Pass the complete Shadow Validation gate

**What to build:** Give the player a trustworthy readiness report proving that every campaign domain and failure boundary works without authoritative writes before live persistence can be approved.

**Blocked by:** 06 — Track named-character autonomy end to end; 07 — Resolve combat through the specialist orchestra; 08 — Resolve crafting and progression together; 09 — Resolve economy and contract actions; 10 — Resolve time and World Events; 11 — Fail closed across evidence, agents, and narration; 12 — Run the atomic Day-End Checkpoint.

**Status:** ready-for-agent

- [ ] Representative fixtures cover dialogue, autonomy, combat, crafting, progression, economy, time, World Events, missing evidence, narration rejection, stale state, rollback, and Day-End behavior.
- [ ] Critical mechanics, state, authority, visibility, transaction, dice, and rollback invariants pass repeatedly without changing campaign state.
- [ ] Exact prose is not golden-tested, but every output satisfies structural and fidelity gates.
- [ ] The readiness report identifies every role invoked, execution count, failure, and unresolved risk.
- [ ] Live persistence remains locked regardless of test success until explicit player approval.
