// @ts-check

/** @param {{ issuer: string, findings: string[] }} input */
export function reconcileConflict(input) {
  if (input.issuer !== "lead-resolver") throw new Error("Only Lead Resolver may decide conflicts");
  return { decision: "lead-resolver", conflictTrace: input.findings };
}

/** @param {{ attempts: number, resolutionId: string, stale: boolean }} input */
export function handleNarrationFailure(input) {
  if (input.stale) return { action: "invalid-pending-resolution", resolutionId: input.resolutionId, reason: "stale-evidence" };
  return input.attempts < 3 ? { action: "retry", nextAttempt: input.attempts + 1 } : { action: "pending-resolution", resolutionId: input.resolutionId };
}

/** @param {{ conflict: string }} input */
export function handlePersistenceRejection(input) {
  return { action: "stop", gameEffect: false, retry: false, conflict: input.conflict };
}

/** @param {{ role: string, failures: number }} input */
export function handleSpecialistFailure(input) {
  return input.failures === 0
    ? { action: "retry", role: input.role }
    : { action: "stop", reason: "specialist-failed", role: input.role };
}

/** @param {{ round: number, unresolved: string[] }} input */
export function expandEvidence(input) {
  return input.round >= 2
    ? { action: "missing-information", unresolved: input.unresolved }
    : { action: "expand", nextRound: input.round + 1 };
}
