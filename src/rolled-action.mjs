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

/** @param {object} assembly */
export function lockRollAssembly(assembly) {
  const requestHash = createHash("sha256").update(canonicalJson(assembly)).digest("hex");
  return Object.freeze({ ...assembly, requestHash });
}

/** @param {{ hiddenDaySeed: string, requestHash: string, turnId: string, rollIndex: number, sides: number }} request */
/** @param {{ assembly: object, roll: object, consequences: { outcome: string, mutations: unknown[] } }} input */
export function createRolledAuditDetails(input) {
  return {
    lockedRollAssembly: input.assembly,
    diceProof: input.roll,
    outcome: input.consequences.outcome,
    mutations: input.consequences.mutations,
  };
}

/** @param {{ assembly: { actionValue: number, taskValue: number }, roll: { result: number }, state: { gold: number, phase: string }, cost: number }} input */
export function resolveRollConsequences(input) {
  const success = input.assembly.actionValue + input.roll.result >= input.assembly.taskValue;
  const nextGold = input.state.gold - input.cost;
  const nextPhase = input.state.phase === "morning" ? "afternoon" : input.state.phase;
  return {
    outcome: success ? "success" : "failure",
    mutations: [{
      path: "state/status.md",
      expectedBefore: `Gold: ${input.state.gold}\nPhase: ${input.state.phase}\n`,
      after: `Gold: ${nextGold}\nPhase: ${nextPhase}\n`,
    }],
  };
}

/** @param {{ hiddenDaySeed: string, requestHash: string, turnId: string, rollIndex: number, sides: number }} request */
export function rollAuditableDie(request) {
  if (!Number.isInteger(request.sides) || request.sides < 2) {
    throw new Error("Auditable dice require at least two sides");
  }
  const proof = createHash("sha256")
    .update(canonicalJson(request))
    .digest("hex");
  const result = (Number.parseInt(proof.slice(0, 8), 16) % request.sides) + 1;
  return Object.freeze({ result, proof });
}
