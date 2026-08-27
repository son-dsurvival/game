import assert from "node:assert/strict";
import { test } from "node:test";

import { createCampaignTurnRuntime } from "../src/campaign-turn-runtime.mjs";

test("player can predictably enter and leave visible Campaign Mode", () => {
  const runtime = createCampaignTurnRuntime();

  assert.deepEqual(runtime.status(), { mode: "off", label: "campaign: off" });
  assert.deepEqual(runtime.setMode("shadow"), {
    mode: "shadow",
    label: "campaign: shadow",
  });
  assert.deepEqual(runtime.setMode("off"), { mode: "off", label: "campaign: off" });
});

test("braced input stays out of game while unbraced input receives a Turn Envelope", async () => {
  let baselineInspections = 0;
  const turnIds = ["turn-directive", "turn-action"];
  const runtime = createCampaignTurnRuntime({
    inspectBaseline: async () => {
      baselineInspections += 1;
      return { commit: "abc123", changedItems: [] };
    },
    createTurnId: () => turnIds.shift(),
  });
  runtime.setMode("shadow");

  assert.deepEqual(await runtime.admitInput("  {Check Seris's canon.}  "), {
    kind: "directive",
    envelope: {
      version: 1,
      turnId: "turn-directive",
      mode: "shadow",
      classification: "out-of-game-directive",
      input: "{Check Seris's canon.}",
      baseline: { commit: "abc123" },
    },
  });
  assert.equal(baselineInspections, 1);
  assert.equal(runtime.releaseTurn("turn-directive"), true);

  assert.deepEqual(await runtime.admitInput("I open the workshop door."), {
    kind: "admitted",
    envelope: {
      version: 1,
      turnId: "turn-action",
      mode: "shadow",
      classification: "in-game-input",
      input: "I open the workshop door.",
      baseline: { commit: "abc123" },
    },
  });
});

test("dirty campaign state stops admission and identifies every changed item", async () => {
  let turnIdsCreated = 0;
  const runtime = createCampaignTurnRuntime({
    inspectBaseline: async () => ({
      commit: "abc123",
      changedItems: ["status sheet.md", "TEMP_MEMORY.md"],
    }),
    createTurnId: () => {
      turnIdsCreated += 1;
      return "unreachable";
    },
  });
  runtime.setMode("shadow");

  assert.deepEqual(await runtime.admitInput("Ask Seris for a report."), {
    kind: "rejected",
    reason: "dirty-baseline",
    changedItems: ["status sheet.md", "TEMP_MEMORY.md"],
  });
  assert.equal(turnIdsCreated, 0);
});

test("Campaign Turn Lock rejects overlap and Turn IDs cannot be reused", async () => {
  const candidates = ["turn-001", "turn-001", "turn-002"];
  const runtime = createCampaignTurnRuntime({
    inspectBaseline: async () => ({ commit: "abc123", changedItems: [] }),
    createTurnId: () => candidates.shift(),
  });
  runtime.setMode("shadow");

  const first = await runtime.admitInput("Begin the first action.");
  assert.equal(first.kind, "admitted");
  assert.equal(first.envelope.turnId, "turn-001");

  assert.deepEqual(await runtime.admitInput("Overlap the first action."), {
    kind: "rejected",
    reason: "turn-locked",
    activeTurnId: "turn-001",
  });
  assert.equal(runtime.releaseTurn("another-turn"), false);
  assert.equal(runtime.releaseTurn("turn-001"), true);

  assert.deepEqual(await runtime.admitInput("Reuse the first identifier."), {
    kind: "rejected",
    reason: "duplicate-turn-id",
    turnId: "turn-001",
  });
  const next = await runtime.admitInput("Begin the next action.");
  assert.equal(next.kind, "admitted");
  assert.equal(next.envelope.turnId, "turn-002");
});

test("shadow write authorization remains pinned to the admitted turn", async () => {
  const runtime = createCampaignTurnRuntime({
    inspectBaseline: async () => ({ commit: "abc123", changedItems: [] }),
    createTurnId: () => "turn-shadow",
  });
  runtime.setMode("shadow");
  const admitted = await runtime.admitInput("Spend one gold sovereign.");

  assert.equal(admitted.kind, "admitted");
  runtime.setMode("off");
  assert.deepEqual(
    runtime.authorizeMutation({
      kind: "authoritative-file",
      target: "status sheet.md",
    }),
    {
      allowed: false,
      reason:
        "Shadow Validation cannot modify authoritative campaign state: status sheet.md",
    },
  );
});

test("Campaign Turn Lock serializes concurrent baseline admission", async () => {
  let inspections = 0;
  let finishInspection;
  const inspection = new Promise((resolve) => {
    finishInspection = resolve;
  });
  const runtime = createCampaignTurnRuntime({
    inspectBaseline: async () => {
      inspections += 1;
      return inspection;
    },
    createTurnId: () => "turn-concurrent",
  });
  runtime.setMode("shadow");

  const firstPromise = runtime.admitInput("First concurrent action.");
  const overlapPromise = runtime.admitInput("Second concurrent action.");
  finishInspection({ commit: "abc123", changedItems: [] });

  const [first, overlap] = await Promise.all([firstPromise, overlapPromise]);
  assert.equal(first.kind, "admitted");
  assert.deepEqual(overlap, {
    kind: "rejected",
    reason: "turn-locked",
    activeTurnId: null,
  });
  assert.equal(inspections, 1);
});
