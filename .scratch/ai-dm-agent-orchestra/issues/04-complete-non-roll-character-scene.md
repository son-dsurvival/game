# 04 — Resolve a complete non-roll character scene

**What to build:** Let the player complete a real dialogue-focused turn in which evidence, rules, current state, character truth, resolution, narration, Session Canon, persistence, and final presentation all agree.

**Blocked by:** 02 — Add the Campaign Mode turn envelope; 03 — Prove Atomic Turn Persistence with a transaction tracer.

**Status:** ready-for-agent
**Completion:** implemented

- [x] The turn uses one immutable Turn Evidence Bundle with source citations and snapshot hashes.
- [x] Deterministic and model routing jointly select the required core and Character Specialists.
- [x] The Lead Resolver issues the sole binding Resolution Record and a visibility-filtered Narration Brief.
- [x] The Narrative Validator rejects contradictions, visibility leaks, and undeclared Narrative Additions.
- [x] The persisted turn is displayed only after state, audit, and presentation records commit successfully.

## Comments

- The end-to-end dialogue fixture verifies state and Session Canon persistence, Turn Audit Record and Turn Presentation Archive creation, one Turn-ID commit, clean Git state, and post-commit presentation release.
