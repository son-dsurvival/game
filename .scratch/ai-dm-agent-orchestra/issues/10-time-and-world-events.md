# 10 — Resolve time and World Events

**What to build:** Let the player travel, rest, advance phases, or cross an event boundary while time, eligibility, world pressure, current location, historical consequences, and visibility remain synchronized.

**Blocked by:** 05 — Resolve a rolled state-changing action.

**Status:** ready-for-agent
**Completion:** implemented

- [x] Travel, rest, phase advancement, day boundaries, and World Event checks invoke only when their established eligibility rules apply.
- [x] The World Event Specialist cannot create a binding outcome independently of the Lead Resolver.
- [x] Location, party, elapsed time, off-screen activity, and world consequences receive exact synchronized updates.
- [x] New event details are classified correctly as resolved facts or Session Canon.
- [x] The player-facing scene and persisted world history do not leak hidden off-screen information.
