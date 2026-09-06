// @ts-check

import { createHash } from "node:crypto";

/** @param {unknown} value @returns {string} */
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = /** @type {Record<string, unknown>} */ (value);
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** @param {{ prose: string, declaredAdditions: string[], visibleFacts: string[], maximumLength: number }} input */
export function validateCombatNarration(input) {
  const reasons = [];
  if (!input.prose.trim()) reasons.push("missing-prose");
  if (input.prose.length > input.maximumLength) reasons.push("length-exceeded");
  const words = input.prose.toLowerCase().match(/[a-z]+/g) ?? [];
  const visibleWords = new Set(input.visibleFacts.flatMap((fact) => fact.toLowerCase().match(/[a-z]+/g) ?? []));
  if (words.some((word) => word === "hidden" || (word === "army" && !visibleWords.has(word)))) reasons.push("visibility-leak");
  if (input.declaredAdditions.some((addition) => !input.prose.toLowerCase().includes(addition.toLowerCase()))) reasons.push("undeclared-structure");
  return { valid: reasons.length === 0, reasons };
}

/** @param {{ before: { health: number, condition: string, phase: string, rations: number, autonomyStatus: string }, after: { health: number, condition: string, phase: string, rations: number, autonomyStatus: string } }} input */
export function createCombatMutations(input) {
  /** @param {{ health: number, condition: string, phase: string, rations: number, autonomyStatus: string }} state */
  const format = (state) => `Health: ${state.health}\nCondition: ${state.condition}\nPhase: ${state.phase}\nRations: ${state.rations}\nAutonomy: ${state.autonomyStatus}\n`;
  return [{ path: "state/combat-status.md", expectedBefore: format(input.before), after: format(input.after) }];
}

/** @param {{ threat: "minor" | "moderate" | "severe", outcome: "success" | "failure" }} input */
export function assessCombatDanger(input) {
  const labels = {
    minor: "Minor: a setback is possible.",
    moderate: "Moderate: harm or loss is likely.",
    severe: "Severe: serious harm or loss is imminent.",
  };
  return {
    dangerSignal: labels[input.threat],
    consequenceLevel: input.outcome === "failure" ? input.threat : "minor",
  };
}

/** @param {object} calculation */
export function lockCombatCalculation(calculation) {
  const calculationHash = createHash("sha256").update(canonicalJson(calculation)).digest("hex");
  return Object.freeze({ ...calculation, calculationHash });
}

/** @param {{ namedCharacters: string[], opposition: string[] }} input */
export function routeCombatTurn(input) {
  if (input.opposition.length === 0) throw new Error("Combat requires identified opposition");
  return {
    requiredSpecialists: ["mechanics", "state", "character", "combat"],
    requiredFindings: ["tactics", "opposition", "character-behavior", "state"],
  };
}
