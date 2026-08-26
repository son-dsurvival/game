# 04 — Resolve a complete non-roll character scene

**What to build:** Let the player complete a real dialogue-focused turn in which evidence, rules, current state, character truth, resolution, narration, Session Canon, persistence, and final presentation all agree.

**Blocked by:** 02 — Add the Campaign Mode turn envelope; 03 — Prove Atomic Turn Persistence with a transaction tracer.

**Status:** ready-for-agent

- [ ] The turn uses one immutable Turn Evidence Bundle with source citations and snapshot hashes.
- [ ] Deterministic and model routing jointly select the required core and Character Specialists.
- [ ] The Lead Resolver issues the sole binding Resolution Record and a visibility-filtered Narration Brief.
- [ ] The Narrative Validator rejects contradictions, visibility leaks, and undeclared Narrative Additions.
- [ ] The persisted turn is displayed only after state, audit, and presentation records commit successfully.
