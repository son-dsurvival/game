# 05 — Resolve a rolled state-changing action

**What to build:** Let the player attempt a meaningful action whose complete calculation is locked before an auditable dice result and whose resulting time, resources, and consequences are persisted exactly.

**Blocked by:** 04 — Resolve a complete non-roll character scene.

**Status:** ready-for-agent
**Completion:** implemented

- [x] Applicable and excluded rules, modifiers, Task or Reaction values, and roll expression are visible and locked before rolling.
- [x] The Dice Service derives a reproducible result from the hidden day seed and immutable roll request.
- [x] No role can change the Locked Roll Assembly after seeing the result except through an explicitly cited post-roll rule.
- [x] The consequence pass produces exact before-and-after values for every affected state.
- [x] The Turn Audit Record contains the calculation, roll proof, outcome, and committed mutations.
