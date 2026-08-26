# Campaign Retrieval Index

A manually curated routing map for campaign retrieval. It contains retrieval keys and source locations only; it must not duplicate live state, rules, inventory, character sheets, or world facts.

**Maintenance:** Update only during a Day-End Checkpoint when an approved canon heading is created, renamed, moved, or becomes a recurring retrieval route.

## Authority Labels

| Label | Meaning | Conflict role |
| --- | --- | --- |
| `temporary-canon` | Unapproved current-session fact | Valid only for the active session; requires checkpoint disposition. |
| `live-state` | Current values, inventory, active tasks, current location/time | Controls current quantities and status. |
| `universal-mechanics` | General rules and enforced output requirements | Controls how actions resolve. |
| `progression-canon` | Experiment records, carryover, lineage, certification | Controls progression evidence and active method state. |
| `relationship-canon` | Character personality, goals, boundaries, bonds | Controls dialogue, autonomy, willingness, and relationship consequences. |
| `historical-canon` | Approved world log | Controls prior events and established historical facts when not superseded by live state. |
| `reference-style` | Style-only example or documentation | Never creates mechanics or canon. |

**Authority application:** Temporary canon is consulted first for active-session additions. Live state determines what currently exists. Universal mechanics determine resolution procedure. Progression and relationship sources govern their named domains. Historical canon supplies prior facts. If two established sources conflict, stop and apply the canon-conflict process; never silently choose one.

## Always-Loaded Routing

| Tags | Source | Exact section | Authority | Use condition |
| --- | --- | --- | --- | --- |
| manifest, terminology, narration gate | `CONTEXT.md` | Whole file | reference-style | Every campaign input; keep it a small manifest, never a live-state duplicate. |
| session, pending, autonomy | `TEMP_MEMORY.md` | Whole file | temporary-canon | Every campaign input. |
| current, day, phase, location, party | `status sheet.md` | `## Current Campaign State` and only relevant character section | live-state | Every campaign input; retrieve a character section only if they act or matter to the scene. |
| money, inventory, facilities, relay | `Ledger Resources.md` | Relevant finance, inventory, facility, or relay heading | live-state | Every campaign input; do not read unrelated ledger systems. |
| latest-day, current-event | `🌍 CORE WORLD FRAME (REFINED).md` | Latest `### Day N` entry only | historical-canon | Every campaign input. |
| output, narration, scene quality | `game rules (1).md`, `CONTEXT.md`, `narration_example.txt` | `## VIII. OUTPUT TEMPLATE (ENFORCED)`; `## Narration Quality Gate`; narration example as needed | universal-mechanics / reference-style | Every resolved in-game turn. |

## Action Routing

| Tags / action type | Source | Exact section | Authority | Use condition |
| --- | --- | --- | --- | --- |
| time, phases, travel, rest | `game rules (1).md` | `## ⏳ TIME SYSTEM`, `## Resting Rules` | universal-mechanics | Any time advance, travel, sleep, or day-end. |
| event, opening day, ticket | `game rules (1).md` | `## 🌍 Dynamic World Event Engine` | universal-mechanics | Opening a day or valid world-check point. |
| action, task, roll, modifier, carryover | `game rules (1).md` | `### 2A. Resolution Assembly Protocol`, `### 2C. Outcome-Based Practice Carryover and Derived Refinement`, task/outcome sections | universal-mechanics | Every meaningful resolution. |
| training, research, refinement, certification | `Experimentation Register.md` | Relevant actor/method heading; `## Carryover Rule` | progression-canon | Any progression, training, experiment, modifier, lineage, or carryover question. |
| David, alchemy, pills | `status sheet.md` | `## David`; `Pill Batchwork Library V0.2` | live-state | Pill production, David research, spells, or resources. |
| Tess, food, will | `status sheet.md`; `Experimentation Register.md` | `## Tess`; `Food Batchwork Library V1`; `Willbound Infusion`; `## Tess — Will Training` | live-state / progression-canon | Food work, will training, Tess scenes. |
| Seris, commerce, mana, conceptual contract | `status sheet.md`; `character relationship.md`; `Experimentation Register.md` | `## Seris Vale`; `#### Mana Covenant of Cause and Consequence V0.1`; `## Seris Vale`; `## Seris — Mana Foundations`; relevant Day 43 alignment records | live-state / relationship-canon / progression-canon | Business, contracts, mana work, conceptual-contract use or limits, Seris scenes. |
| Lethra, cultivation, garden | `status sheet.md`; `Ledger Resources.md`; `character relationship.md`; `Experimentation Register.md` | `## Lethra`; `### Tier 2 Herb Garden` and `#### Plant and Seed Register`; `## Lethra`; relevant transformation/cultivation records | live-state / relationship-canon / progression-canon | Planting, gathering, cultivation, Lethra scenes. |
| Brakka, forge, engineering, magitech | `status sheet.md`; `Ledger Resources.md`; `character relationship.md`; `Experimentation Register.md` | `## Brakka`; `### Smithing Site`; `## Brakka`; `## Brakka — Structural-Forge Apprenticeship` | live-state / relationship-canon / progression-canon | Forge, repair, engineering, magitech, Brakka scenes. |
| business, Vale, contracts, procurement | `Ledger Resources.md`; `status sheet.md`; `character relationship.md`; world log | `### Vale Triune Trade House`; relevant current inventory; `## Seris Vale`; latest day entry | live-state / relationship-canon / historical-canon | Purchases, contracts, branch work, Guild activity, stock transfers. |
| garden, plants, growth | `Ledger Resources.md`; `game rules (1).md` | `### Tier 2 Herb Garden`; `#### Plant and Seed Register`; relevant resolution rules | live-state / universal-mechanics | Any plant state, planting, harvest, growth, or garden modifier. |
| forest herbs, herb search, gathering availability | `Ledger Resources.md`; `game rules (1).md` | `#### Estate-Accessible Monster Forest Herb Search Baseline`; relevant gathering and resolution rules | live-state / universal-mechanics | Searching the estate-accessible Monster Forest for common, Tier 0, or possible Tier 1 herbs; distinguishing raw harvest from viable cultivation stock. |
| combat, operation, threat | `game rules (1).md`; status/relationship/world sources | `## ⚔️ COMBAT SYSTEM`; relevant participant sections; latest event/target evidence | universal-mechanics plus live/historical canon | Combat, scouting, recovery, bandit operations, danger. |
| social, dialogue, intimacy, conflict | `character relationship.md`; `CONTEXT.md`; `game rules (1).md` | Relevant named-character heading; `## Narration Quality Gate`; output/narration headings | relationship-canon / universal-mechanics | Any scene with a named character. |
| relay, database, Ava, spell computer | `Ledger Resources.md`; `status sheet.md` | `## Cognitive Relay Space`; `## Knowledge Database Rune V0.7`; relevant character skills | live-state | Any relay, cognitive support, or spell-computer action. |
| canon, retcon, file placement, conflict | `CONTEXT.md`; `docs/adr/0001-live-state-and-knowledge-boundaries.md`; `docs/adr/0002-canon-change-and-conflict-authority.md` | Whole short ADR files as needed | universal-mechanics | Out-of-game canon change, conflict, or source-boundary question. |

## Retrieval Rules

1. Search this index before searching large campaign files.
2. Read the smallest heading span that answers the turn’s factual or mechanical need.
3. Never load a full character roster, world corpus, relationship corpus, or rules corpus merely because it exists.
4. A source read is temporary working evidence, not persistent chat memory.
5. If a required fact is absent, propose precise Session Canon and ask the player to approve it before using it for a roll, consequence, or persistent state change.
6. Keep an internal per-turn retrieval log: input classification, index routes used, exact headings read, omitted sources, and unresolved gaps. Do not display it unless asked for an audit.
