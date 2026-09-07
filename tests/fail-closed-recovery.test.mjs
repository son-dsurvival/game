import assert from "node:assert/strict";
import { test } from "node:test";

import { expandEvidence, handleNarrationFailure, handlePersistenceRejection, handleSpecialistFailure, reconcileConflict } from "../src/fail-closed-recovery.mjs";

test("evidence expansion stops after two rounds and invokes missing-information protocol", () => {
  assert.deepEqual(expandEvidence({ round: 0, unresolved: ["facility"] }), { action: "expand", nextRound: 1 });
  assert.deepEqual(expandEvidence({ round: 2, unresolved: ["facility"] }), {
    action: "missing-information", unresolved: ["facility"],
  });
});

test("specialist disagreements are preserved for Lead Resolver decision", () => {
  assert.throws(() => reconcileConflict({ issuer: "combat", findings: ["advance", "hold"] }), /Lead Resolver/);
  assert.deepEqual(reconcileConflict({ issuer: "lead-resolver", findings: ["advance", "hold"] }), { decision: "lead-resolver", conflictTrace: ["advance", "hold"] });
});

test("narration retries are bounded and exhaustion creates stale-invalidatable Pending Resolution", () => {
  assert.deepEqual(handleNarrationFailure({ attempts: 2, resolutionId: "r1", stale: false }), { action: "retry", nextAttempt: 3 });
  assert.deepEqual(handleNarrationFailure({ attempts: 3, resolutionId: "r1", stale: false }), { action: "pending-resolution", resolutionId: "r1" });
  assert.deepEqual(handleNarrationFailure({ attempts: 3, resolutionId: "r1", stale: true }), { action: "invalid-pending-resolution", resolutionId: "r1", reason: "stale-evidence" });
});

test("persistence rejection has no game effect or automatic re-resolution", () => {
  assert.deepEqual(handlePersistenceRejection({ conflict: "stale precondition" }), { action: "stop", gameEffect: false, retry: false, conflict: "stale precondition" });
});

test("a required specialist receives one retry; the second failure stops with its role", () => {
  assert.deepEqual(handleSpecialistFailure({ role: "combat", failures: 0 }), { action: "retry", role: "combat" });
  assert.deepEqual(handleSpecialistFailure({ role: "combat", failures: 1 }), { action: "stop", reason: "specialist-failed", role: "combat" });
});
