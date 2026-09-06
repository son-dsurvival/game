import assert from "node:assert/strict";
import { test } from "node:test";

import { createCraftingMutation, reconcileCraftingInventory, recordExperiment, routeCraftingTurn, validateCraftingNarration } from "../src/crafting-progression.mjs";

test("crafting routes separate Crafting and Progression findings from relevant evidence", () => {
  assert.deepEqual(routeCraftingTurn({
    evidence: ["materials-ledger", "workshop-facility", "recipe-method", "progression-record"],
  }), {
    requiredSpecialists: ["crafting", "progression", "mechanics", "state"],
    requiredFindings: ["materials", "facilities", "method", "quality", "progression"],
  });
});

test("experiments retain uncapped margin, capped outcome, transfer boundaries, and earned progression", () => {
  assert.deepEqual(recordExperiment({ uncappedMargin: 8, outcomeCap: 5, transferBoundary: "no cross-discipline transfer", earnedProgression: 3 }), {
    uncappedMargin: 8, cappedOutcome: 5, transferBoundary: "no cross-discipline transfer", earnedProgression: 3,
  });
});

test("crafting result creates one exact persistent mutation and faithful narration", () => {
  const result = { inventory: { iron: 1, dagger: 1 }, progression: 3 };
  assert.deepEqual(createCraftingMutation({ before: "", result }), {
    path: "state/crafting-progress.md", expectedBefore: "", after: `${JSON.stringify(result)}\n`,
  });
  assert.deepEqual(validateCraftingNarration({ prose: "You forge a dagger and gain 3 progression.", visibleFacts: ["dagger", "3 progression"] }), { valid: true, reasons: [] });
});

test("crafting consumption reconciles materials with products without negative or duplicate inventory", () => {
  assert.deepEqual(reconcileCraftingInventory({
    inventory: { iron: 3, coal: 2, dagger: 0 },
    consume: { iron: 2, coal: 1 },
    produce: { dagger: 1 },
  }), { iron: 1, coal: 1, dagger: 1 });
  assert.throws(() => reconcileCraftingInventory({
    inventory: { iron: 1 }, consume: { iron: 2 }, produce: {},
  }), /negative/);
});
