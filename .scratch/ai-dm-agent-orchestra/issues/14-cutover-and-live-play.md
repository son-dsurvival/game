# 14 — Cut over GitHub main and unlock live play

**What to build:** Replace the remote campaign baseline safely and let the player explicitly unlock the validated orchestra for its first authoritative live turn.

**Blocked by:** 13 — Pass the complete Shadow Validation gate.

**Status:** ready-for-agent

- [ ] `/campaign approve-live` presents the successful readiness report and requires explicit confirmation.
- [ ] The previously preserved `archive/pre-orchestra` branch still points to the original remote history.
- [ ] Remote `main` is replaced only with `--force-with-lease` and only after confirming the expected remote baseline.
- [ ] The resulting clean checkout loads the pinned runtime and retains the approved live gate.
- [ ] The first live turn persists, commits, archives, displays, and remains reproducible through its Turn Audit Record.
- [ ] Automatic force-push is unavailable after bootstrap.
