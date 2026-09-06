import assert from "node:assert/strict";
import { test } from "node:test";

import { assessCombatDanger, createCombatMutations, lockCombatCalculation, routeCombatTurn, validateCombatNarration } from "../src/combat-orchestra.mjs";

test("combat routing requires Mechanics, State, Character, and Combat findings before rolling", () => {
  assert.deepEqual(
    routeCombatTurn({ namedCharacters: ["Seris"], opposition: ["raider"] }),
    {
      requiredSpecialists: ["mechanics", "state", "character", "combat"],
      requiredFindings: ["tactics", "opposition", "character-behavior", "state"],
    },
  );
});

test("combat narration requires visible, faithful, structured, bounded prose", () => {
  assert.deepEqual(validateCombatNarration({
    prose: "Seris braces the doorway. The raider's blow leaves you wounded, and the corridor falls quiet.",
    declaredAdditions: ["Seris braces the doorway", "leaves you wounded"],
    visibleFacts: ["Seris", "raider", "wounded", "corridor"],
    maximumLength: 200,
  }), { valid: true, reasons: [] });
  assert.deepEqual(validateCombatNarration({
    prose: "A hidden army arrives.", declaredAdditions: [], visibleFacts: ["raider"], maximumLength: 200,
  }).valid, false);
});

test("combat consequences produce exact atomic mutations for damage, conditions, time, consumables, and autonomy", () => {
  assert.deepEqual(createCombatMutations({
    before: { health: 10, condition: "clear", phase: "morning", rations: 2, autonomyStatus: "active" },
    after: { health: 7, condition: "wounded", phase: "afternoon", rations: 1, autonomyStatus: "interrupted" },
  }), [{
    path: "state/combat-status.md",
    expectedBefore: "Health: 10\nCondition: clear\nPhase: morning\nRations: 2\nAutonomy: active\n",
    after: "Health: 7\nCondition: wounded\nPhase: afternoon\nRations: 1\nAutonomy: interrupted\n",
  }]);
});

test("combat danger signals and risk-proportional consequences agree on the resolved threat", () => {
  assert.deepEqual(assessCombatDanger({ threat: "severe", outcome: "failure" }), {
    dangerSignal: "Severe: serious harm or loss is imminent.",
    consequenceLevel: "severe",
  });
});

test("combat calculation locks tactical orders, opposition, equipment, skills, factors, and exclusions", () => {
  const locked = lockCombatCalculation({
    tacticalOrder: "hold the doorway", oppositionCapabilities: ["axe", "shield"],
    equipment: ["spear"], skills: [{ name: "Guard", value: 3 }],
    situationalFactors: ["narrow corridor"], exclusions: ["mounted combat"],
  });
  assert.equal(Object.isFrozen(locked), true);
  assert.deepEqual(locked.exclusions, ["mounted combat"]);
  assert.match(locked.calculationHash, /^[a-f0-9]{64}$/);
});
