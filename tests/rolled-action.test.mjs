import assert from "node:assert/strict";
import { test } from "node:test";

import { createRolledAuditDetails, lockRollAssembly, rollAuditableDie, resolveRollConsequences } from "../src/rolled-action.mjs";

test("cited calculation becomes an immutable Locked Roll Assembly before rolling", () => {
  const locked = lockRollAssembly({
    turnId: "turn-roll-001",
    applicableRules: ["game rules (1).md#Resolution Assembly Protocol"],
    excludedRules: ["game rules (1).md#Combat"],
    modifiers: [{ name: "Workshop tools", value: 2 }],
    actionValue: 12,
    taskValue: 10,
    expression: "1d20 + 2",
  });

  assert.equal(locked.turnId, "turn-roll-001");
  assert.match(locked.requestHash, /^[a-f0-9]{64}$/);
  assert.equal(Object.isFrozen(locked), true);
  assert.throws(() => {
    locked.expression = "1d20 + 99";
  }, /read only|Cannot assign/);
});

test("Dice Service deterministically proves a result from seed, lock, Turn ID, and roll index", () => {
  const requestHash = "a".repeat(64);
  const first = rollAuditableDie({
    hiddenDaySeed: "day-secret",
    requestHash,
    turnId: "turn-roll-001",
    rollIndex: 0,
    sides: 20,
  });
  assert.deepEqual(first, rollAuditableDie({
    hiddenDaySeed: "day-secret",
    requestHash,
    turnId: "turn-roll-001",
    rollIndex: 0,
    sides: 20,
  }));
  assert.match(first.proof, /^[a-f0-9]{64}$/);
  assert.ok(first.result >= 1 && first.result <= 20);
  assert.notEqual(first.proof, rollAuditableDie({
    hiddenDaySeed: "day-secret",
    requestHash,
    turnId: "turn-roll-001",
    rollIndex: 1,
    sides: 20,
  }).proof);
});

test("consequence pass produces exact resource and time before-and-after values", () => {
  assert.deepEqual(
    resolveRollConsequences({
      assembly: { actionValue: 12, taskValue: 10 },
      roll: { result: 14, proof: "proof" },
      state: { gold: 10, phase: "morning" },
      cost: 2,
    }),
    {
      outcome: "success",
      mutations: [
        { path: "state/status.md", expectedBefore: "Gold: 10\nPhase: morning\n", after: "Gold: 8\nPhase: afternoon\n" },
      ],
    },
  );
});

test("rolled audit details preserve the lock, dice proof, outcome, and committed mutations", () => {
  const assembly = lockRollAssembly({ turnId: "turn-roll-001", expression: "1d20 + 2" });
  const roll = rollAuditableDie({ hiddenDaySeed: "seed", requestHash: assembly.requestHash, turnId: assembly.turnId, rollIndex: 0, sides: 20 });
  const consequences = { outcome: "success", mutations: [{ path: "state/status.md", expectedBefore: "before", after: "after" }] };
  assert.deepEqual(createRolledAuditDetails({ assembly, roll, consequences }), {
    lockedRollAssembly: assembly,
    diceProof: roll,
    outcome: "success",
    mutations: consequences.mutations,
  });
});
