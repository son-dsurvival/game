// @ts-check

/** @param {{ seed: string, rolls: { proof: string }[], reproduce: (seed: string, roll: { proof: string }) => boolean }} input */
export function revealDaySeed(input) {
  return { revealedSeed: input.seed, verified: input.rolls.every((roll) => input.reproduce(input.seed, roll)) };
}

/** @param {{ pushed: boolean, cause?: string }} input */
export function handleCheckpointPush(input) {
  return input.pushed
    ? { synchronized: true, nextDayBlocked: false, forcePush: false }
    : { synchronized: false, nextDayBlocked: true, forcePush: false, cause: input.cause };
}

/** @param {{ canon: string, worldLog: string, index: string, temporaryMemory: string }} input */
export function createDayEndPlan(input) {
  return [
    { path: "state/session-canon.md", after: input.canon },
    { path: "state/world-log.md", after: input.worldLog },
    { path: "state/retrieval-index.md", after: input.index },
    { path: "state/temporary-memory.md", after: input.temporaryMemory },
  ];
}

/** @param {{ pending: string[], dispositions: Record<string, "approve" | "revise" | "reject"> }} input */
export function validateCanonDispositions(input) {
  const missing = input.pending.filter((entry) => input.dispositions[entry] === undefined);
  return { valid: missing.length === 0, missing };
}
