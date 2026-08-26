# AI DM Agent Orchestra

## Purpose

Replace single-model campaign handling with a Pi-native, schema-validated orchestra that reduces missed mechanics, incorrect live state, and out-of-character NPC behavior while preserving one authoritative outcome and one authoritative writer.

## Runtime

- Pi is the host runtime.
- `pi-agents@0.16.1` is installed project-locally and pinned in the lockfile.
- Project agent profiles live under `.pi/agents/` and saved flows under `.pi/workflows/`.
- A custom project-local Pi extension is the Campaign Orchestrator.
- Model roles inherit the main Pi session's active model and thinking level.
- Model roles are stateless and use only immutable turn evidence and structured handoffs.
- The custom extension, not a model, owns locks, deterministic dice, schema checks, transaction journaling, Git operations, recording, and final output assembly.

## Authority model

1. Resolution Specialists provide cited advisory findings.
2. The Lead Resolver is the sole outcome authority. It reconciles disagreements, assembles and locks calculations, interprets dice, and issues the final Resolution Record.
3. The Narrator may render and enrich the result but may not contradict it. Every new noncontradictory fact must appear in the Narrative Additions List and enters Session Canon.
4. The persistence stage may reject invalid changes but may not alter the resolved outcome.
5. Only deterministic Recorder code may modify authoritative campaign files.

## Roles

### Mandatory resolution roles

- **Router** — returns structured turn classifications. Its conditional selections are unioned with deterministic routing rules.
- **Canon Retriever** — builds the immutable, source-cited Turn Evidence Bundle and handles bounded Evidence Requests.
- **Mechanics Specialist** — identifies applicable and excluded universal rules, candidate modifiers, and required roll forms.
- **State Specialist** — checks inventory, money, time, facilities, resource feasibility, and candidate before/after values.
- **Lead Resolver** — owns calculations and outcomes.

### Conditional resolution roles

- **Character Specialist** — named-character truth, autonomy, willingness, relationships, dialogue constraints, and off-screen actions.
- **Combat Specialist** — tactical opposition, danger, combat timing, damage, and combat consequences.
- **Crafting Specialist** — methods, materials, facilities, quality branches, and production consequences.
- **Progression Specialist** — experimentation evidence, carryover, lineage, certification, and earned progression.
- **Economy Specialist** — prices, contracts, business authority, procurement, money, and market consequences.
- **World Event Specialist** — event eligibility, world pressure, travel/world continuity, and time-based events.

A conditional specialist runs when deterministic rules, the Router, or another analysis-pass specialist marks its domain relevant. The Specialist Coverage Gate must pass before a roll is requested.

### Narration roles

- **Narrator** — produces player-facing prose and a structured Narrative Additions List from the visibility-filtered Narration Brief.
- **Narrative Validator** — independently checks resolution fidelity, visibility, additions-list completeness, character constraints, and output requirements. It accepts or rejects but never rewrites an outcome.

### Persistence roles

- **Persistence Planner** — converts the Resolution Record and Narrative Additions List into an exact multi-file mutation plan.
- **State Auditor** — validates source placement, authority, preconditions, before/after values, completeness, and plan fidelity.
- **Recorder** — deterministic single writer that applies only an approved plan.
- **Output Assembler** — deterministic formatter that combines validated narration with authoritative player-visible mechanics after persistence succeeds.

## Turn pipeline

1. Acquire the Campaign Turn Lock.
2. Require a clean Git working tree.
3. Classify input under Campaign Mode. Braced messages remain Out-of-Game Directives.
4. Create a Turn ID and immutable snapshot baseline.
5. Run deterministic routing and the Router; union their conditional specialist selections.
6. Build the source-cited Turn Evidence Bundle.
7. Run mandatory and selected specialists in parallel for the analysis pass.
8. Satisfy Evidence Requests and late specialist requirements for at most two expansion rounds.
9. Require valid structured findings from every required specialist.
10. Lead Resolver reconciles findings, records conflicts, assembles the complete calculation, and locks the roll request.
11. Dice Service returns an Auditable Dice Roll from the hidden day seed and locked request data.
12. Lead Resolver creates a provisional outcome that is neither visible nor canon.
13. Run affected specialists for the consequence pass.
14. Lead Resolver reconciles consequences and issues the final Resolution Record and visibility-filtered Narration Brief.
15. Narrator produces prose and the Narrative Additions List.
16. Narrative Validator checks fidelity. Permit at most two revisions after the initial attempt; the final revision may use a fallback Narrator.
17. Persistence Planner creates the mutation plan.
18. State Auditor validates the plan against current authoritative files and the snapshot baseline.
19. Recorder applies the complete plan or nothing, writes the Turn Audit Record and Turn Presentation Archive, and creates one Git commit carrying the Turn ID.
20. Output Assembler releases the persisted turn to the player.
21. Release the Campaign Turn Lock.

No narration is displayed before persistence succeeds.

## Structured contracts

All model handoffs use validated JSON Schema records with optional human-readable explanations. At minimum they expose:

- Turn ID and role;
- evidence citations and snapshot hashes;
- applicable and excluded rules;
- findings and candidate values;
- assumptions and unresolved gaps;
- Evidence Requests and required-domain flags;
- conflict flags;
- recommendations and consequence branches.

The Resolution Record additionally contains:

- interpreted player intent;
- controlling findings and Resolution Conflict Trace;
- Locked Roll Assembly and dice proof;
- primary and derived outcomes;
- time and visibility classifications;
- exact state-change instructions with preconditions and before/after values;
- narrative constraints and handoff;
- required Session Canon entries.

The Narrator returns player-facing prose plus an exhaustive Narrative Additions List. An undeclared addition is a validation failure.

## Evidence and permissions

- All specialist roles are read-only.
- Permitted browsing tools are `read`, `grep`, `find`, and `ls`.
- `bash`, `edit`, and `write` are forbidden to model roles.
- Specialists browse an immutable per-turn snapshot rather than live campaign files.
- Missing facts trigger Evidence Requests; remembered chat facts are never evidence.
- The live files are checked against snapshot preconditions immediately before commit.

## Failure behavior

- A required specialist receives one retry, optionally through a configured fallback. A second failure stops the turn with no game effect.
- Unresolved evidence after two expansion rounds stops before rolling and invokes the existing missing-information protocol.
- Specialist disagreements are preserved in the Resolution Conflict Trace; the Lead Resolver decides.
- Narration rejection keeps the Resolution Record and dice unchanged. If all narration attempts fail, the result becomes a Pending Resolution so narration can be retried without rerolling while the snapshot remains current.
- A persistence conflict writes nothing, explains the exact rejection, and returns control to the player without automatic re-resolution.
- A stopped turn consumes no time, resources, rolls, or opportunities and never occurs in the fiction.

## Dice integrity

- At the start of an in-game day, derive a hidden day seed from a master campaign secret stored outside Git.
- Commit the Daily Dice Commitment before any roll that day.
- Derive each result from the day seed, locked request hash, Turn ID, and roll index.
- Reveal the completed day's seed at the Day-End Checkpoint so all past rolls can be reproduced.
- Never commit the master campaign secret.

## Persistence and Git

- A turn begins only from a clean working tree.
- Campaign turns and checkpoints are serialized.
- Each successful turn produces one local Git commit.
- Each turn commits a machine-readable Turn Audit Record and exact Turn Presentation Archive alongside campaign state changes.
- Audit records exclude chain-of-thought and raw model transcripts.
- Audit records contain the Turn ID and parent baseline commit; commit messages contain the same Turn ID, avoiding a self-referential commit hash.
- The Day-End Checkpoint is one atomic commit covering log append, Session Canon dispositions and promotions, index changes, and temporary-memory cleanup.
- Push accumulated commits after the Day-End Checkpoint.
- A failed push preserves local commits but blocks the next day until synchronization succeeds.
- Automatic force-push is forbidden after initial repository bootstrap.

### Repository bootstrap

1. Preserve remote `main` commit `31fd25d77bb91fa746feafa42675dfb8c47bc5fe` as `archive/pre-orchestra`.
2. Initialize this directory as the replacement campaign repository.
3. Commit the completed architecture and initial implementation baseline.
4. Replace remote `main` using `--force-with-lease`, never a blind force-push.

## Campaign modes

- `/campaign off` — normal Pi assistance; no campaign interception.
- `/campaign shadow` — run the full orchestra without authoritative writes.
- `/campaign approve-live` — present shadow results and require explicit player confirmation before unlocking writes.
- `/campaign on` — live campaign orchestration, available only after approval.

The active mode appears in Pi's status line.

## Execution limits

Default structural limits per turn:

- 40 model-agent executions;
- 6 concurrent agents;
- 2 evidence or specialist-coverage expansion rounds;
- 3 total narration attempts;
- no unbounded loops.

Token and dollar limits remain configurable but unset until the player chooses them.

## Shadow-validation gate

Live persistence remains unavailable until representative fixtures pass for:

- ordinary character dialogue;
- companion directive and off-screen autonomy;
- combat and danger;
- crafting with material and facility constraints;
- progression and experimentation carryover;
- economy and contract consequences;
- world-event and time eligibility;
- missing evidence and Session Canon proposal;
- narration contradiction and undeclared Narrative Addition;
- stale state and persistence rejection;
- atomic rollback and Git recovery;
- Day-End promotion, dice reveal, and remote synchronization behavior.

Critical mechanics, state, authority, visibility, transaction, and rollback invariants must pass. Exact prose is not golden-tested; it is checked against structural and fidelity requirements.
