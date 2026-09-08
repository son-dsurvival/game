import assert from "node:assert/strict";
import { test } from "node:test";

import { createDayEndPlan, revealDaySeed, validateCanonDispositions, handleCheckpointPush } from "../src/day-end-checkpoint.mjs";

test("every pending Session Canon entry needs an explicit disposition before checkpoint", () => {
  assert.deepEqual(validateCanonDispositions({ pending: ["fact-a", "fact-b"], dispositions: { "fact-a": "approve", "fact-b": "revise" } }), { valid: true, missing: [] });
  assert.deepEqual(validateCanonDispositions({ pending: ["fact-a", "fact-b"], dispositions: { "fact-a": "approve" } }), { valid: false, missing: ["fact-b"] });
});

test("Day-End reveals the seed and verifies each roll against its prior proof", () => {
  assert.deepEqual(revealDaySeed({ seed: "seed", rolls: [{ proof: "p1" }], reproduce: (seed, roll) => seed === "seed" && roll.proof === "p1" }), { revealedSeed: "seed", verified: true });
});

test("push failure preserves local state, avoids force-push, and blocks the next day", () => {
  assert.deepEqual(handleCheckpointPush({ pushed: false, cause: "remote rejected" }), { synchronized: false, nextDayBlocked: true, forcePush: false, cause: "remote rejected" });
});

test("Day-End promotion, history, index maintenance, and temporary cleanup form one plan", () => {
  assert.deepEqual(createDayEndPlan({ canon: "approved", worldLog: "day complete", index: "updated", temporaryMemory: "" }), [
    { path: "state/session-canon.md", after: "approved" },
    { path: "state/world-log.md", after: "day complete" },
    { path: "state/retrieval-index.md", after: "updated" },
    { path: "state/temporary-memory.md", after: "" },
  ]);
});
