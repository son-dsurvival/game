# AI DM Roleplay Game

A canon-driven roleplay game in which an AI Dungeon Master runs scenes using the world, rules, characters, resources, and status sheets maintained in this repository.

## Language

**Established Canon**:
An approved fact, rule, character detail, resource value, or world detail recorded in a normal canon section of the repository’s Markdown documents. It is binding during play.
_Avoid_: lore, existing stuff

**Hybrid Canon Policy**:
Established Canon is canon-bound; authority over new, unestablished content is governed separately. It preserves fixed material while allowing the world to grow.
_Avoid_: loose canon, make-it-up-as-you-go

**Unestablished Content**:
A location, NPC, event, historical fact, or other world detail not yet recorded as Established Canon.
_Avoid_: missing lore, blank space

**Session Canon**:
An AI-created detail that is treated as true during the active play session but requires approval, revision, or rejection at the session checkpoint before becoming Established Canon.
_Avoid_: permanent canon, throwaway detail

**Pending Session Canon Register**:
The register in `TEMP_MEMORY.md` that persists Session Canon until the session checkpoint.
_Avoid_: normal canon, untracked notes

**Temporary Memory**:
The disposable, session-scoped record in `TEMP_MEMORY.md` for unapproved Session Canon. Its entries are promoted, revised, rejected, or cleared at the session checkpoint.
_Avoid_: campaign canon, permanent notes

**Day-End Checkpoint**:
The mandatory Session Canon review that occurs automatically after each completed in-game day and pauses play until every pending entry is approved, revised, or rejected. All dispositions, promotions, log updates, index changes, and temporary-memory cleanup persist together as one atomic Git commit, after which all local turn commits are pushed to the campaign remote. A failed push preserves the local commit but blocks the next day until synchronization succeeds; automatic force-push is forbidden after repository bootstrap.
_Avoid_: real-time checkpoint, optional review, partial checkpoint save, per-turn push

**Campaign Mode**:
The explicit Pi runtime mode controlled through `/campaign`. While enabled, unbraced input enters the campaign orchestra and the active mode remains visible in Pi’s status line.
_Avoid_: implicit campaign activation, always-on interception

**Shadow Validation**:
The mandatory pre-live campaign mode in which representative turns run through the complete orchestra without modifying authoritative files. Passing checks does not unlock writes automatically; only explicit player approval through `/campaign approve-live` permits live persistence.
_Avoid_: direct live rollout, write-enabled test, automatic live promotion

**Out-of-Game Directive**:
A user message enclosed in `{...}` containing a suggestion, question, instruction, or other communication to the AI DM outside the fiction. While Campaign Mode is enabled, it routes outside the fiction and does not advance game time or change game state unless it explicitly instructs the DM to do so.
_Avoid_: character action, in-game dialogue

**Out-of-Character Knowledge**:
Information revealed through an Out-of-Game Directive that the player may know but David cannot use unless he learns it in the fiction.
_Avoid_: David’s knowledge, in-character evidence

**In-Game Input**:
Any user message not enclosed in `{...}`. It is interpreted as the player character’s action, dialogue, thought, or decision.
_Avoid_: out-of-game prompt, DM instruction

**Companion Autonomy**:
The player may give companions in-game orders, while the AI DM controls their independent behavior whenever the player has not given a sufficiently specific instruction. NPC responses remain constrained by canon, relationship, and circumstances.
_Avoid_: full party control, passive companion

**Binding Tactical Order**:
A companion follows the player’s stated tactical objective when able and willing; the AI DM resolves all unspecified movement, targeting, abilities, and reactions.
_Avoid_: direct companion control, nonbinding suggestion

**Autonomous Major Action**:
A canon-consistent Major Action the AI DM may resolve for a companion without a player instruction, including its applicable time and resource costs.
_Avoid_: player-confirmed action, minor reaction

**Autonomous Commitment**:
A canon-consistent, irreversible commitment made by a companion without David’s explicit approval. It may use shared resources, commit allies or property, or establish faction policy.
_Avoid_: personal-only commitment, player-approved commitment

**David-Centric Time**:
The active game clock follows David’s current phase. An off-screen companion’s resource changes are automatically player-visible only when that companion acts in the same phase as David.
_Avoid_: global simultaneous narration, companion-centric clock

**Phase-Scoped Visibility**:
Mechanical changes from companion actions outside David’s current phase are withheld from the normal game output until they are explicitly queried or otherwise become known.
_Avoid_: universal transparency, automatic off-screen disclosure

**File-Visible State**:
Turn-Synchronized State written to campaign files is permitted Out-of-Character Knowledge for the player, but is not automatically knowledge David may use.
_Avoid_: in-character evidence, hidden file state

**Locked Roll Assembly**:
The complete set of values, modifiers, exclusions, and roll expression approved before an Auditable Dice Roll is requested. It cannot be changed after the result is known except through an explicitly cited post-roll rule.
_Avoid_: outcome-driven modifier, retroactive difficulty

**Daily Dice Commitment**:
The committed hash of a hidden day seed derived from a master campaign secret stored outside Git. The completed day’s seed is revealed at its Day-End Checkpoint so past rolls become verifiable without exposing future-day rolls.
_Avoid_: committed master secret, predictable future seed

**Auditable Dice Roll**:
A required random result derived by the deterministic Dice Service from the hidden day seed, locked request hash, turn identifier, and roll index. Its roll identifier and verification data are preserved so the exact result can be reproduced after the day seed is revealed.
_Avoid_: model-invented roll, hidden result, player-provided roll

**AI-Resolved Roll**:
A legacy name for an Auditable Dice Roll requested and interpreted by the resolution system rather than supplied by the player.
_Avoid_: model-invented randomness, hidden result

**Active NPC**:
An NPC the AI DM judges materially relevant to the current phase because of stakes, relationships, role, location, or world pressure. Only Active NPCs receive off-screen resolution.
_Avoid_: complete roster, always-active NPC

**AI-Originated NPC**:
A new, canon-consistent NPC introduced by the AI DM to improve a scene or consequence. It is recorded in `TEMP_MEMORY.md` as Session Canon until the Day-End Checkpoint.
_Avoid_: Established Canon NPC, player-created NPC

**Adaptive NPC Record**:
An AI-Originated NPC begins with a minimum playable record and gains further profile detail only when it becomes relevant or recurring.
_Avoid_: mandatory full profile, undocumented NPC

**Approved NPC Profile**:
An approved AI-Originated NPC with meaningful involvement in David’s story is added to `character relationship.md` as permanent canon.
_Avoid_: Temporary Memory entry, unapproved profile

**Canon Promotion**:
The AI DM moves approved Session Canon from `TEMP_MEMORY.md` into the appropriate existing canon file according to its domain.
_Avoid_: one-file archive, permanent temporary entry

**Risk-Proportional Consequence**:
The severity of an action’s outcome, including possible death or no lasting harm, is determined by its established danger and resolution rather than by a fixed narrative-protection rule.
_Avoid_: guaranteed survival, automatic lethality

**Fictional Danger Signal**:
A canon-consistent description of danger that gives the player enough situational information to judge risk without requiring a mechanical lethality warning.
_Avoid_: explicit lethal warning, hidden-risk exemption

**Clarify-Then-Infer**:
For an underspecified In-Game Input, the AI DM first asks for clarification. If the player declines to clarify or remains ambiguous, the DM resolves the most likely canon-consistent intent and states its assumption.
_Avoid_: silent interpretation, blocked play

**Checkpoint Recommendation**:
At a Day-End Checkpoint, the AI DM groups pending entries and recommends approval, revision, or rejection while allowing the player to decide individually or in bulk.
_Avoid_: mandatory batch decision, unassisted review

**Retcon Petition**:
An Out-of-Game Directive requesting a change to Established Canon. The player must provide a canon-grounded justification before the AI DM assesses its impact and proposes how to handle it.
_Avoid_: unrestricted edit, silent rewrite

**DM Canon Authority**:
The AI DM has final approval over a Retcon Petition. A retcon takes effect only if the DM accepts it and the player accepts any approved revision; the player cannot unilaterally rewrite canon.
_Avoid_: player veto over canon, unrestricted retcon

**Retcon Acceptance Test**:
A Retcon Petition must satisfy continuity, fairness, and narrative merit. All three are mandatory for the AI DM to approve it.
_Avoid_: convenience retcon, partial justification

**Canon Conflict**:
Two or more Established Canon entries make incompatible claims about the same fact, rule, or current value. The player decides how the conflict is resolved.
_Avoid_: retcon, ambiguous detail

**Conflict Reconciliation Petition**:
A player-proposed third resolution for a Canon Conflict. It must satisfy the Retcon Acceptance Test before becoming canon.
_Avoid_: unrestricted conflict edit, undocumented compromise

**Starting Snapshot**:
The initial day, phase, location, present companions, and immediate situation derived by the AI DM from existing canon and presented for player approval before the first turn.
_Avoid_: unapproved opening, arbitrary reset

**Ask-Then-Propose Start**:
For an unspecified Starting Snapshot detail, the AI DM first asks the player to define it. If the detail remains unclear, the DM proposes a canon-consistent Session Canon detail for approval.
_Avoid_: assumed default, blocked opening

**Approved Starting Detail**:
A proposed Starting Snapshot detail accepted by the player. It is promoted to Established Canon before the first turn.
_Avoid_: provisional opening fact, day-end promotion

**Day-End Campaign Log**:
A new sequential day entry appended immediately after the latest Event log entry in `🌍 CORE WORLD FRAME (REFINED).md`. It follows the template and style of the preceding day logs.
_Avoid_: separate recovery file, unlogged day

**Impactful Session Canon Rejection**:
The removal of a Session Canon entry that has materially changed state. It requires a Retcon Petition to pass the Retcon Acceptance Test before the AI DM performs a full rollback of dependent state and log changes.
_Avoid_: consequence-free rejection, silent rollback

**Nonimpactful Session Canon Rejection**:
The rejection of a Session Canon entry that has not materially changed state. It may be rejected freely at the Day-End Checkpoint.
_Avoid_: retcon, rollback

**Companion Directive**:
An in-game order or request from the player character to an allied NPC. The player proposes the directive; the AI DM determines the NPC’s response and execution using that NPC’s canon, relationship, and circumstances.
_Avoid_: direct NPC control, guaranteed compliance

**Turn Audit Record**:
The committed machine-readable record of a turn’s evidence hashes and citations, routing, structured findings, conflict trace, locked calculations, dice proof, Resolution Record, validation verdicts, and audited mutation plan. It excludes private reasoning and raw model transcripts and is linked to its Git commit by an immutable turn identifier.
_Avoid_: chain-of-thought log, local-only workflow history

**Turn Presentation Archive**:
The exact validated player response committed beside its Turn Audit Record. It preserves what the player saw but has no state authority beyond its Resolution Record and declared Narrative Additions.
_Avoid_: authoritative prose state, Pi-session-only history

**Turn-Synchronized State**:
The persisted game state after every resolved player turn. It records all mechanical and canonical changes caused by that resolution.
_Avoid_: end-of-session state, manual tracking

**Direct Document State**:
Turn-Synchronized State is written in place to the existing status, ledger, relationship, and other campaign documents.
_Avoid_: separate state file, event-log-only state

**Campaign Orchestrator**:
The trusted project-local Pi extension that routes a campaign turn through resolution, narration, and persistence without deciding the fictional or mechanical outcome. It uses `pi-agents` for model-based reasoning roles while deterministic code owns locks, dice, validation, transactions, Git operations, recording, and output assembly.
_Avoid_: final authority, calculator, model-only orchestrator

**Resolution Specialist**:
A domain-oriented role that analyzes one bounded game responsibility using evidence from any relevant campaign source and submits canon-grounded findings to the Lead Resolver. Its findings are advisory rather than independently binding.
_Avoid_: document agent, character agent, final resolver

**Hybrid Specialist Routing**:
Every turn receives mandatory canon/retrieval, current-state, and rules-applicability analysis. Conditional specialists run when either deterministic routing rules or the structured Router role marks their domain relevant.
_Avoid_: full council, model-only routing, unbounded fan-out

**Specialist Coverage Gate**:
The pre-roll check requiring every domain flagged by routing or an analysis-pass specialist to return a valid finding before calculations can be locked. Late specialist expansion is bounded by the same two-round limit as evidence expansion.
_Avoid_: incomplete specialist set, post-roll domain discovery

**Turn Evidence Bundle**:
The immutable, source-cited campaign evidence shared by every specialist resolving a turn. Specialists may inspect its snapshot with `read`, `grep`, `find`, and `ls`, but cannot access mutation-capable tools; missing evidence must be requested rather than replaced with remembered facts.
_Avoid_: chat memory, live-file browsing, independent agent snapshot

**Evidence Request**:
A structured specialist request for a specific missing source, heading, or fact required for resolution.
_Avoid_: invented evidence, unrestricted reread

**Bounded Evidence Expansion**:
The Orchestrator may expand a Turn Evidence Bundle and rerun affected specialists for at most two rounds. If required evidence remains absent, the turn stops before rolling and follows the missing-information protocol.
_Avoid_: unbounded retrieval loop, silent inference

**Stateless Campaign Role**:
A campaign role whose durable knowledge comes only from authoritative files and the current structured handoffs. It inherits the main Pi session’s active model and thinking level but retains no private campaign memory between turns.
_Avoid_: private canon, remembered live state, role-pinned model

**Structured Agent Handoff**:
A schema-validated record exchanged between campaign roles, accompanied by an optional human-readable explanation. It identifies evidence, applicable and excluded rules, findings, assumptions, unresolved gaps, recommendations, and conflict flags.
_Avoid_: prose-only handoff, implicit assumptions

**Bounded Specialist Recovery**:
A failed required specialist receives one retry, optionally through a configured fallback model. If the retry fails, the turn stops with the failed role identified and no game effect.
_Avoid_: degraded resolution, unbounded retry

**Lead Resolver**:
The sole authority that reconciles specialist findings, assembles and locks final calculations, and determines the binding mechanical and fictional outcome of a turn. When findings conflict, it preserves the disagreement and gives an evidence-grounded reason for the controlling decision.
_Avoid_: narrator, majority vote, specialist-owned calculation

**Resolution Conflict Trace**:
The part of a Resolution Record that preserves conflicting specialist findings, identifies the controlling finding, and explains why other findings did not determine the outcome.
_Avoid_: hidden disagreement, unexplained override

**Two-Pass Resolution**:
A turn begins with parallel specialist analysis, followed by a provisional outcome from the Lead Resolver, then an affected-specialist consequence pass before the final Resolution Record is issued. A provisional outcome is neither player-visible nor canon.
_Avoid_: one-pass prediction, provisional canon

**Resolution Record**:
The binding account of what happened in a resolved turn, including applicable decisions, calculations, consequences, visibility classifications, and required state changes.
_Avoid_: draft narration, specialist recommendation

**Narration Brief**:
The visibility-filtered projection of a Resolution Record supplied to the Narrator. It contains only information permitted by David-Centric Time and Phase-Scoped Visibility.
_Avoid_: full resolution record, hidden-state summary

**Narrator**:
The role that renders a Narration Brief as player-facing fiction without adding, removing, or changing resolved outcomes.
_Avoid_: moderator, resolver

**Output Assembler**:
The non-generative role that formats validated narration together with player-visible calculations, results, persisted resource changes, and the fictional handoff. It copies authoritative fields without reinterpretation.
_Avoid_: narrator-generated mechanics, free-form final response

**Narrative Validator**:
An independent narration-layer role that accepts or rejects prose by comparing it with the Resolution Record, Narration Brief, visibility constraints, and Narrative Additions List. It cannot rewrite or resolve the turn.
_Avoid_: narrator self-review, recorder review

**Narration Fidelity Check**:
The mandatory comparison performed by the Narrative Validator before persistence or display. Contradictory narration is rejected and regenerated; narration never overrides resolved state.
_Avoid_: optional review, prose-based resolution

**Bounded Narration Recovery**:
Rejected narration receives at most two automatic revisions using precise validation failures, with a configured fallback Narrator permitted on the final revision. If all attempts fail, persistence and display are stopped while the Resolution Record and dice result remain unchanged.
_Avoid_: narrator self-approval, unbounded rewrite, re-resolution during rewrite

**Pending Resolution**:
A validated Resolution Record held after narration-layer failure so narration can be retried without granting a new roll. It remains noncanonical and is invalidated if its Turn Evidence Bundle is no longer current.
_Avoid_: rerolled turn, persisted outcome

**Narrative Addition**:
A noncontradictory detail introduced by the Narrator that is absent from the Resolution Record. It is recorded as Session Canon for checkpoint review rather than promoted directly to Established Canon.
_Avoid_: resolved outcome, immediate Established Canon

**Narrative Additions List**:
The structured companion to player-facing narration that declares every Narrative Addition. Undeclared additions cause narration to fail its fidelity check.
_Avoid_: inferred prose facts, optional metadata

**Persistence Planner**:
The read-only role that converts a Resolution Record and Narrative Additions List into an exact multi-file mutation plan without applying it.
_Avoid_: recorder, outcome interpreter

**State Auditor**:
The read-only role that accepts or rejects a mutation plan by checking current files, source authority, expected before-and-after values, and fidelity to the Resolution Record. It cannot repair the plan or alter the outcome.
_Avoid_: recorder, persistence planner, resolver

**Recorder**:
The sole role permitted to modify authoritative campaign files. It applies only State-Auditor-approved mutation plans and registers declared Narrative Additions as Session Canon without reinterpreting either source.
_Avoid_: auditor, resolver, prose parser, multiple writer

**Single-Writer Campaign State**:
All campaign roles except the Recorder are read-only. Proposed state changes become authoritative only through a validated Recorder commit.
_Avoid_: direct specialist edit, narrator write access

**Campaign Turn Lock**:
The exclusive lock held from before evidence retrieval until a turn is displayed or stopped. It serializes turns and checkpoints while still permitting specialists inside one turn to run in parallel.
_Avoid_: concurrent turn pipeline, global specialist serialization

**Clean Turn Baseline**:
A campaign turn may begin only when the Git working tree is clean. Uncommitted manual changes stop resolution and must be reviewed and committed separately.
_Avoid_: bundled manual edit, automatic overwrite

**Atomic Turn Persistence**:
A resolved turn is persisted completely or not at all. If any required state change is invalid, the Recorder writes nothing and returns the whole turn to the Lead Resolver; every successful persisted turn produces one Git commit.
_Avoid_: partial save, best-effort update, uncommitted turn state

**Persistence Rejection**:
A Recorder response that identifies the exact state conflict or invariant that prevented Atomic Turn Persistence. It explains why the turn was stopped but does not revise the outcome itself.
_Avoid_: silent failure, recorder correction

**Persist-Before-Display**:
Player-facing narration is withheld until its Resolution Record has been persisted successfully. A rejected turn exposes the Persistence Rejection instead of presenting fiction that did not become state.
_Avoid_: narrate-then-commit, optimistic display

**Stopped Turn**:
A turn ended by a Persistence Rejection without an automatic retry. Control returns to the player with the rejection reason; the attempt consumes no game time, resources, rolls, or opportunities and never occurs in the fiction.
_Avoid_: automatic re-resolution, partially completed turn

**Narration-Length and Lifelike Narration Requirement**:
Noncombat turns require 20–25 complete sentences in both Action Narration and Result Narration. Combat turns require 8–10 complete sentences in Player Narration, 8–10 complete sentences in Opponent Narration when applicable, and 15–20 complete sentences in Combat Narration Result. Calculations and Result State tables do not count toward any narration minimum.

Narration must feel lived-in rather than mechanically padded: use specific sensory detail, character-consistent dialogue and reactions, concrete setting changes, emotional subtext, and meaningful tension or consequence. Every sentence must advance the scene, reveal character, clarify intent, or show consequence.
_Avoid_: abbreviated scene resolution, repetitive filler, calculation-only narration

## Narration Quality Gate

Before writing every resolved turn, the AI DM must complete this gate privately. It is DM-only reasoning and is never displayed as calculations or player knowledge.

### Active NPC Scene Beats

Every Active NPC receives a private Scene Beat containing:

- immediate goal
- current emotional state
- friction with David’s declared action or current circumstances
- distinctive voice, vocabulary, or behavioral cue
- a scene function
- a relationship filter outcome

Valid relationship filter outcomes are:

- willing support
- reluctant cooperation
- concern while complying
- disagreement
- refusal
- protective override
- strategic withholding

Silence is valid only when the NPC’s Scene Beat provides a character-based reason for silence.

### Scene Functions

Each Active NPC must have a distinct scene function unless the fiction specifically justifies overlap. Functions may include emotional challenge, physical immediacy, protective pressure, cost analysis, leverage, operational clarity, precise warning, truth test, watchful restraint, blunt practical objection, or defensive commitment.

### Relationship and Character Truth

Character truth outranks convenient plot progression. Relationships affect willingness and compliance, not personality or core boundaries. A high-bond NPC may reluctantly cooperate with an action they dislike when it does not cross a core boundary. A low-bond NPC may resist a beneficial action because of distrust, pride, fear, prior harm, or incompatible goals.

### Lifelike Scene Requirements

For major scenes, narration must include:

- a concrete physical anchor
- a sensory detail that establishes or changes mood
- a visible consequence of prior action
- an immediate source of pressure, tension, opportunity, or unresolved conflict

Low-stakes domestic scenes may omit one or more of these when doing so better serves natural pacing.

Every line of dialogue must be character-specific. If another major NPC could speak the same line unchanged without sounding wrong, the line must be rewritten to carry the speaker’s established vocabulary, values, emotional defense, role, relationship history, or current Scene Beat.

Every resolved scene ends with a fictional handoff: an NPC question, visible problem, changed relationship beat, opportunity, danger signal, or other actionable consequence. Generic handoffs such as “your move” are insufficient unless they are grounded in the current fiction.

### Hard Enforcement and Style Acceptance

The Narration Quality Gate is a hard gate. The AI DM must internally rewrite a scene until every applicable requirement passes before returning it to the player.

`narration_example.txt` is the style acceptance reference. It demonstrates the required camera placement, selective dialogue, distinct character voices, concise mechanical separation, believable handoff, and clean state tracking. It is a style reference, not a requirement to copy its wording or exact length.
