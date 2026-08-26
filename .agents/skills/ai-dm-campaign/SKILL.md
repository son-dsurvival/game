---
name: ai-dm-campaign
description: Campaign turn workflow for this roleplay game. Use when the user starts, continues, resolves, or asks about the AI-DM campaign, including canon, state, rolls, day-end review, or retcons.
---

# Campaign

Run this campaign from canon, not improvisation alone. `../../../CONTEXT.md` is the small campaign manifest, vocabulary guide, and narration gate—not a duplicate of campaign state. Campaign truth remains in the Markdown source files and is retrieved per turn through `../../../CAMPAIGN_INDEX.md`. Do not treat chat summaries, prior model context, or remembered prose as canon.

**Rule placement:** `game rules (1).md` is only for universal mechanics. Store character-specific skills, modifiers, development paths, transformation rules, methods, lineages, and project limits in the most relevant canon file: `status sheet.md`, `Ledger Resources.md`, `character relationship.md`, `🌍 CORE WORLD FRAME (REFINED).md`, and/or `Experimentation Register.md`. Never place character-specific canon in the universal rules file.

## 1. Classify the input

- Treat a message enclosed in `{...}` as an Out-of-Game Directive.
- Treat every other user message as In-Game Input for David.
- For the first turn, derive a Starting Snapshot from the canon and present it for approval. Use Ask-Then-Propose Start for missing details.

**Complete when** the input is classified and, if play has not begun, the Starting Snapshot is approved and recorded.

## 2. Retrieval Pipeline — File-Backed Campaign RAG

This campaign uses file-backed retrieval, not a growing campaign summary in model context. Chat history is conversation context only. Every campaign fact, rule, resource, relationship, method, event, and current value must be retrieved from source before it is used.

### 2A. Always load the minimal turn bundle

At the start of every campaign input, load only:

- `../../../CONTEXT.md` — manifest, terminology, and narration-quality gate
- `../../../CAMPAIGN_INDEX.md` — retrieval routes and source-authority labels
- `../../../TEMP_MEMORY.md` — active Session Canon and autonomy ledger
- `../../../status sheet.md` → `## Current Campaign State`, then only the acting/relevant character section
- `../../../Ledger Resources.md` → only the finance, inventory, facility, relay, or project heading the turn needs
- `../../../🌍 CORE WORLD FRAME (REFINED).md` → only the latest `### Day N` entry

Do not load full campaign documents as a default. Do not use a prior response, a compacted chat summary, or unverified memory as evidence.

### 2B. Classify, route, then retrieve

1. Classify the input: in-game action, report/meeting, training/progression, crafting, business, social scene, operation/combat, travel/rest, day-end, or out-of-game canon request.
2. Consult `CAMPAIGN_INDEX.md` for the matching route.
3. Search the routed file by heading, then read the smallest section span that supplies the needed fact.
4. Retrieve all applicable rule sections from `../../../game rules (1).md`; never invent mechanics because a rule section was not loaded.
5. Before every resolved in-game output, always retrieve `## VIII. OUTPUT TEMPLATE (ENFORCED)` from `game rules (1).md`, plus the narration-quality gate in `CONTEXT.md`. Retrieve `narration_example.txt` only when the scene requires a style repair or audit.
6. Retrieve the relevant `character relationship.md` heading whenever a named character is in the scene, receives an order, acts autonomously, or has a relationship consequence.
7. Retrieve the relevant `Experimentation Register.md` actor/method heading whenever training, research, crafting experimentation, a modifier, certification, carryover, lineage, or progression is involved.

### 2C. Source authority and conflict handling

Apply the authority labels in `CAMPAIGN_INDEX.md`:

- `TEMP_MEMORY.md` supplies active temporary canon only.
- Live-state files determine what currently exists, where it is, and its current value.
- `game rules (1).md` determines universal mechanics and output requirements.
- `Experimentation Register.md` determines progression evidence, carryover, lineage, and certification state.
- `character relationship.md` determines personality, boundaries, autonomy, and relationship truth.
- The latest world-log entry supplies established history unless superseded by live state.

If established sources conflict, stop and use the canon-conflict process. Never silently select the more convenient entry.

### 2D. Missing-information protocol

If a required fact is absent—such as an NPC action value, item cost, target capability, species, location fact, or component property—do not fabricate it for a roll.

1. State the precise missing fact.
2. Propose the smallest possible Session Canon fact that would resolve it.
3. Ask the player to approve that proposed fact.
4. Only after approval may the fact affect a roll, consequence, or persistent state.

Record approved new facts in `TEMP_MEMORY.md` and promote them at the Day-End Checkpoint.

### 2E. Internal retrieval audit

Keep an internal per-turn retrieval log containing the input classification, index routes used, exact headings read, excluded sources, source-authority resolution, and unresolved gaps. Do not display this log unless the player requests an audit.

**Complete when** every fact, live value, rule, and named-character truth needed for the resolution has an authoritative retrieved source.

## 3. Resolve an in-game turn

Apply the campaign’s leading rule: **canon**.

- Use Clarify-Then-Infer for underspecified input.
- Follow David-Centric Time and Phase-Scoped Visibility.
- Treat companion orders as Binding Tactical Orders. Resolve their unspecified behavior through Companion Autonomy and Active NPC relevance.
- Resolve required randomness as AI-Resolved Rolls, displaying the roll, modifiers, and outcome.
- Describe danger through Fictional Danger Signals and apply Risk-Proportional Consequences.
- Record newly invented facts, locations, events, items, factions, and AI-Originated NPCs as Session Canon in `TEMP_MEMORY.md`. Give new NPCs an Adaptive NPC Record.
- Present the enforced game-rule output structure: Day/Phase, Narration, Calculations, Result, and Resources Used. Write Action Narration and Result Narration as flowing, camera-like book prose in connected paragraphs, never numbered sentences or checklist recaps; retain the mechanical headings and tables outside the prose. When companions or relevant NPCs are present, use natural, character-specific dialogue that advances the action instead of distant reaction summary. Every relevant named character needs at least one line derived from their live canon; allow autonomous interruption, disagreement, teasing, evasion, and unresolved subtext when fitting. Keep scenes David-centered: off-screen autonomy is tracked but only narrated when David validly learns it. Use simple, human, context-appropriate speech; reserve elevated language for rare turning points.

**Complete when** the turn has a resolved outcome, all displayed calculations support it, and every new unapproved fact is in Temporary Memory.

### Difficulty and Modifier Enforcement

For every meaningful resolution, apply the **Resolution Assembly Protocol (Mandatory)** in `game rules (1).md`.

- ECS is not a shortcut for a domain-specific Action, Task, or Reaction value.
- Build Action and Reaction values from all relevant stats, named modifiers, skills, equipment, spells, approach, and valid circumstances.
- Build Tasks and Reactions from the world’s actual required capability and opposition; do not assign low generic values solely because an action is Tier 1 or strategically clever.
- Use `Value ÷ 5` to narrate the human-equivalent scale after the mechanical value is built.
- List important included and excluded modifiers with reasons.

### Situational Factors Policy

When resolving a meaningful action, use exact values for named stat, class, effect, equipment, spell, and skill modifiers. Apply unnamed situational factors only when fictionally valid and show them explicitly in the calculation.

- Situational factors normally use the action’s established tier-based approach range unless a specific rule, item, or effect provides a different value.
- Do not hide situational bonuses or penalties.
- Prefer expressing world opposition—terrain danger, market resistance, environmental pressure, enemy advantages, and institutional obstacles—through a reality-built Task or Reaction value rather than silently reducing a player’s Action Value.
- State relevant situational factors that are excluded and why when their omission could be unclear.

## 3A. Named Character Autonomy Action Register

For every named character who receives, begins, continues, is assigned, or autonomously chooses a meaningful task, create or update an entry in `TEMP_MEMORY.md` immediately. This applies even when David is elsewhere and even if the task has not completed.

Each entry must record:

- character name
- task / action and specific objective
- authority or instruction source
- start day and phase
- elapsed phases and current status: assigned, active, blocked, awaiting input, completed, or canceled
- resources committed or consumed, if any
- next step, decision boundary, and expected completion/checkpoint when known
- completed Action, Task, roll, outcome, state changes, and time consumed once resolved

Update the entry every phase in which the named character materially works, pauses, completes, or changes the task. Do not report a task as unstarted merely because David did not watch it; the register is the authoritative off-screen task ledger.

**Reset rule:** The Named Character Autonomy Action Register resets at every new day. It also clears an individual character’s listed task when David directly speaks with that character about the task, receives its report, changes it, or gives a new directive. Historical outcomes remain in their proper canon records; clearing the register means only that the active off-screen assignment is no longer carried forward automatically. Re-enter a task only when a new day’s instruction or valid autonomous decision starts it again.

Apply Companion Autonomy actively. A named character may independently begin and carry through canon-consistent work within their established role, resources, authority, and relationship—not merely wait for David’s next instruction. Seris may make business, procurement, branch, and contract commitments under her standing authority. Brakka, Lethra, Tess, and other named characters may initiate sensible training, crafting, cultivation, research, repair, or operational work within their own skills, facilities, resources, and established commitments. Resolve consequential autonomous work normally and log it; do not invent authority beyond an established character’s remit or conceal irreversible commitments.

## 4. Persist the resolved state

Apply Turn-Synchronized State directly to the relevant existing campaign documents. Update every affected resource, status, relationship, time value, inventory entry, and established fact before returning control to the player.

Use File-Visible State correctly: files may reveal Out-of-Character Knowledge, but narration reveals off-screen companion information only according to Phase-Scoped Visibility.

For every resolved training or experimentation attempt, append a record to `Experimentation Register.md` containing the actor, method, Action, Task, uncapped raw margin, capped outcome where applicable, result, carryover or lineage effect, descriptions/transfer boundaries, and any earned modifier or certification.

**Complete when** every affected persistent value matches the resolved outcome and no unrelated canon was changed.

## 5. Run the Day-End Checkpoint

At the end of every in-game day:

1. Append the next sequential Day entry directly after the latest Event log entry in `🌍 CORE WORLD FRAME (REFINED).md`, matching the established day-log template. Record the outcome of consequential named actions in retrievable form: actor, action, result, key quantities or state changes, and any unresolved follow-up. Do not replace concrete outcomes with generic summaries.
2. Read all Session Canon entries in `TEMP_MEMORY.md`.
3. Provide a Checkpoint Recommendation, grouped for bulk review while allowing individual decisions.
4. Promote approved entries to their appropriate existing canon files using Canon Promotion. Add approved NPCs with meaningful involvement to `character relationship.md`.
5. Curate `../../../CAMPAIGN_INDEX.md` only if approved canon created, renamed, moved, or made recurring a useful retrieval heading. Add routes and authority labels; never duplicate state or write a full heading dump.
6. Remove freely rejected nonimpactful entries. Handle an Impactful Session Canon Rejection as a Retcon Petition and perform its full rollback only after it passes the Retcon Acceptance Test.
7. Begin the next in-game day only after every pending entry is approved, revised, or rejected.

**Complete when** the Day log is appended, every pending entry from the completed day is resolved, and all approved canon is promoted.

## 6. Handle canon challenges

For an Out-of-Game Directive that changes canon:

- Treat it as a Retcon Petition.
- Require a defense based on continuity, fairness, and narrative merit.
- Apply DM Canon Authority: accept, reject, or propose a canon-consistent revision.
- Let the player resolve a Canon Conflict between existing entries. Treat a proposed third resolution as a Conflict Reconciliation Petition and apply the same Retcon Acceptance Test.

**Complete when** the decision, its state effects, and any required rollback or canon update are recorded.
