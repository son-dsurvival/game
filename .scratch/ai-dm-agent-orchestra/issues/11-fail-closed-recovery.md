# 11 — Fail closed across evidence, agents, and narration

**What to build:** Ensure incomplete evidence, missing specialists, failed agents, contradictory narration, stale snapshots, and invalid persistence stop safely with bounded recovery and never create partial fictional or mechanical effects.

**Blocked by:** 04 — Resolve a complete non-roll character scene; 05 — Resolve a rolled state-changing action.

**Status:** ready-for-agent
**Completion:** implemented

- [x] Evidence Requests and late specialist expansion stop after two rounds and then apply the missing-information protocol.
- [x] A required specialist receives one retry and a second failure stops the turn with the failed role identified.
- [x] Specialist disagreements remain visible in the Resolution Conflict Trace and are decided only by the Lead Resolver.
- [x] Narration receives at most two revisions after its initial attempt, without changing the Resolution Record or roll.
- [x] Exhausted narration creates a reusable Pending Resolution, while stale evidence invalidates it explicitly.
- [x] Persistence rejection writes nothing, explains the exact conflict, and produces no game effect or automatic re-resolution.
