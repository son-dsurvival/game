import assert from "node:assert/strict";
import { test } from "node:test";

import { createReadinessReport, validateShadowCoverage } from "../src/shadow-validation-gate.mjs";

const required = ["dialogue", "autonomy", "combat", "crafting", "progression", "economy", "time", "world-events", "missing-evidence", "narration-rejection", "stale-state", "rollback", "day-end"];

test("Shadow gate requires representative fixtures for every domain and failure boundary", () => {
  assert.deepEqual(validateShadowCoverage({ fixtures: required }), { ready: true, missing: [] });
  assert.deepEqual(validateShadowCoverage({ fixtures: required.slice(0, -1) }), { ready: false, missing: ["day-end"] });
});

test("readiness reports roles, executions, failures, risks, invariants, and retains live lock", () => {
  assert.deepEqual(createReadinessReport({
    roles: ["combat", "state"], executionCount: 2, failures: [], unresolvedRisks: [],
    invariants: { mechanics: true, state: true, authority: true, visibility: true, transaction: true, dice: true, rollback: true },
    playerApproved: false,
  }), {
    ready: true, roles: ["combat", "state"], executionCount: 2, failures: [], unresolvedRisks: [], livePersistenceUnlocked: false,
  });
});
