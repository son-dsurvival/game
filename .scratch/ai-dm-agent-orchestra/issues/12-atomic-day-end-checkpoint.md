# 12 — Run the atomic Day-End Checkpoint

**What to build:** Let the player review all pending Session Canon and complete the day through one indivisible checkpoint that promotes approved facts, records history, reveals dice proof, cleans temporary state, and synchronizes the remote history.

**Blocked by:** 05 — Resolve a rolled state-changing action; 11 — Fail closed across evidence, agents, and narration.

**Status:** ready-for-agent
**Completion:** implemented

- [x] Every pending Session Canon entry receives an explicit approval, revision, or rejection before the checkpoint can commit.
- [x] Canon promotion, world-log append, retrieval-index maintenance, and temporary-memory cleanup succeed together or not at all.
- [x] The completed day's hidden seed is revealed and every recorded roll can be reproduced against its prior commitment.
- [x] The checkpoint creates one Git commit and pushes all accumulated local turn commits.
- [x] Push failure preserves local state, forbids automatic force-push, reports the cause, and blocks the next day.
