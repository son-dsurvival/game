import assert from "node:assert/strict";
import { test } from "node:test";

import { createAutonomyEntry, createBindingTacticalOrder, createAutonomyMutation, presentAutonomyResult, routeCharacterTurn } from "../src/named-character-autonomy.mjs";

test("named-character directives require Character Specialist coverage and relationship citations", () => {
  assert.deepEqual(
    routeCharacterTurn({
      input: "Seris, secure supplies for the workshop.",
      namedCharacters: ["Seris"],
      relationshipCitations: [{ source: "character relationship.md", heading: "Seris" }],
    }),
    {
      requiredSpecialists: ["canon-retriever", "mechanics", "state", "character"],
      characterCitations: [{ source: "character relationship.md", heading: "Seris" }],
    },
  );
});

test("meaningful autonomous work creates a durable authority, resource, and checkpoint register entry", () => {
  assert.deepEqual(
    createAutonomyEntry({
      character: "Seris", objective: "secure supplies", authority: "David's Binding Tactical Order",
      status: "active", resourcesCommitted: ["2 gold"], checkpoint: "afternoon report",
      startDay: 3, startPhase: "morning",
    }),
    {
      character: "Seris", objective: "secure supplies", authority: "David's Binding Tactical Order",
      status: "active", resourcesCommitted: ["2 gold"], checkpoint: "afternoon report",
      startDay: 3, startPhase: "morning", elapsedPhases: 0,
    },
  );
});

test("autonomy register entry becomes an exact persistent mutation", () => {
  const entry = createAutonomyEntry({
    character: "Seris", objective: "secure supplies", authority: "David's Binding Tactical Order",
    status: "active", resourcesCommitted: ["2 gold"], checkpoint: "afternoon report",
    startDay: 3, startPhase: "morning",
  });
  assert.deepEqual(createAutonomyMutation({ before: "", entry }), {
    path: "state/autonomy-register.md",
    expectedBefore: "",
    after: `${JSON.stringify(entry)}\n`,
  });
});

test("off-screen autonomy persists but stays hidden until David receives a report", () => {
  const result = { character: "Seris", outcome: "supplies secured", phase: "afternoon" };
  assert.deepEqual(presentAutonomyResult({ result, davidPhase: "morning", reported: false }), {
    visible: false,
    persistedResult: result,
  });
  assert.deepEqual(presentAutonomyResult({ result, davidPhase: "afternoon", reported: true }), {
    visible: true,
    presentation: "Seris reports: supplies secured",
    persistedResult: result,
  });
});

test("Binding Tactical Order locks the objective without giving direct NPC control", () => {
  assert.deepEqual(
    createBindingTacticalOrder({
      character: "Seris",
      objective: "secure supplies for the workshop",
      instructionSource: "David",
      prohibitedPlayerControls: ["choose the exact merchant", "script Seris's dialogue"],
    }),
    {
      character: "Seris",
      objective: "secure supplies for the workshop",
      instructionSource: "David",
      executionAuthority: "character-specialist-and-lead-resolver",
      prohibitedPlayerControls: ["choose the exact merchant", "script Seris's dialogue"],
    },
  );
});
