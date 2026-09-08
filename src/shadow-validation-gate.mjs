// @ts-check

const REQUIRED_FIXTURES = ["dialogue", "autonomy", "combat", "crafting", "progression", "economy", "time", "world-events", "missing-evidence", "narration-rejection", "stale-state", "rollback", "day-end"];

/** @param {{ roles: string[], executionCount: number, failures: string[], unresolvedRisks: string[], invariants: Record<string, boolean>, playerApproved: boolean }} input */
export function createReadinessReport(input) {
  const invariantsPass = Object.values(input.invariants).every(Boolean);
  const ready = invariantsPass && input.failures.length === 0 && input.unresolvedRisks.length === 0;
  return {
    ready,
    roles: input.roles,
    executionCount: input.executionCount,
    failures: input.failures,
    unresolvedRisks: input.unresolvedRisks,
    livePersistenceUnlocked: ready && input.playerApproved,
  };
}

/** @param {{ fixtures: string[] }} input */
export function validateShadowCoverage(input) {
  const missing = REQUIRED_FIXTURES.filter((fixture) => !input.fixtures.includes(fixture));
  return { ready: missing.length === 0, missing };
}
