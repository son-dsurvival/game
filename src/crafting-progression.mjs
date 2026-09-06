// @ts-check

/** @param {{ uncappedMargin: number, outcomeCap: number, transferBoundary: string, earnedProgression: number }} input */
export function recordExperiment(input) {
  return { uncappedMargin: input.uncappedMargin, cappedOutcome: Math.min(input.uncappedMargin, input.outcomeCap), transferBoundary: input.transferBoundary, earnedProgression: input.earnedProgression };
}

/** @param {{ before: string, result: object }} input */
export function createCraftingMutation(input) {
  return { path: "state/crafting-progress.md", expectedBefore: input.before, after: `${JSON.stringify(input.result)}\n` };
}

/** @param {{ prose: string, visibleFacts: string[] }} input */
export function validateCraftingNarration(input) {
  const reasons = input.visibleFacts.filter((fact) => !input.prose.toLowerCase().includes(fact.toLowerCase())).map(() => "fidelity-failure");
  return { valid: reasons.length === 0, reasons };
}

/** @param {{ inventory: Record<string, number>, consume: Record<string, number>, produce: Record<string, number> }} input */
export function reconcileCraftingInventory(input) {
  const result = { ...input.inventory };
  for (const [item, amount] of Object.entries(input.consume)) {
    result[item] = (result[item] ?? 0) - amount;
    if (result[item] < 0) throw new Error(`Inventory cannot become negative: ${item}`);
  }
  for (const [item, amount] of Object.entries(input.produce)) {
    result[item] = (result[item] ?? 0) + amount;
  }
  return result;
}

/** @param {{ evidence: string[] }} input */
export function routeCraftingTurn(input) {
  if (input.evidence.length === 0) throw new Error("Crafting requires source evidence");
  return {
    requiredSpecialists: ["crafting", "progression", "mechanics", "state"],
    requiredFindings: ["materials", "facilities", "method", "quality", "progression"],
  };
}
