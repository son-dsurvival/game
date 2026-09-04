// @ts-check

/** @param {{ before: string, entry: object }} input */
export function createAutonomyMutation(input) {
  return {
    path: "state/autonomy-register.md",
    expectedBefore: input.before,
    after: `${JSON.stringify(input.entry)}\n`,
  };
}

/** @param {{ result: { character: string, outcome: string, phase: string }, davidPhase: string, reported: boolean }} input */
export function presentAutonomyResult(input) {
  const visible = input.reported || input.result.phase === input.davidPhase;
  return visible
    ? { visible: true, presentation: `${input.result.character} reports: ${input.result.outcome}`, persistedResult: input.result }
    : { visible: false, persistedResult: input.result };
}

/** @param {{ character: string, objective: string, authority: string, status: string, resourcesCommitted: string[], checkpoint: string, startDay: number, startPhase: string }} input */
export function createAutonomyEntry(input) {
  if (!input.authority) throw new Error("Autonomy work requires authority");
  if (!input.checkpoint) throw new Error("Autonomy work requires a checkpoint");
  return { ...input, elapsedPhases: 0 };
}

/** @param {{ character: string, objective: string, instructionSource: string, prohibitedPlayerControls: string[] }} input */
export function createBindingTacticalOrder(input) {
  return {
    character: input.character,
    objective: input.objective,
    instructionSource: input.instructionSource,
    executionAuthority: "character-specialist-and-lead-resolver",
    prohibitedPlayerControls: input.prohibitedPlayerControls,
  };
}

/** @param {{ namedCharacters: string[], relationshipCitations: { source: string, heading: string }[] }} input */
export function routeCharacterTurn(input) {
  if (input.namedCharacters.length === 0 || input.relationshipCitations.length === 0) {
    throw new Error("Named-character turns require cited relationship canon");
  }
  return {
    requiredSpecialists: ["canon-retriever", "mechanics", "state", "character"],
    characterCitations: input.relationshipCitations,
  };
}
