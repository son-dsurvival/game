import assert from "node:assert/strict";
import { test } from "node:test";

import { classifyEventDetail, createTimeMutation, issueWorldEventOutcome, presentWorldResult, routeTimeTurn } from "../src/time-world-events.mjs";

test("travel, rest, phase, day, and event checks run only when eligibility applies", () => {
  assert.deepEqual(routeTimeTurn({ action: "travel", crossesDayBoundary: false, eventEligible: true }), {
    requiredSpecialists: ["state", "world-event", "canon-retriever"],
    checks: ["travel", "phase-advance", "world-event"],
  });
  assert.deepEqual(routeTimeTurn({ action: "rest", crossesDayBoundary: true, eventEligible: false }).checks, ["rest", "phase-advance", "day-boundary"]);
});

test("time resolution synchronizes location, party, elapsed time, off-screen work, and world consequences", () => {
  assert.deepEqual(createTimeMutation({ before: "Location: Camp\nPhase: morning\n", after: "Location: Road\nPhase: afternoon\n" }), {
    path: "state/world-status.md", expectedBefore: "Location: Camp\nPhase: morning\n", after: "Location: Road\nPhase: afternoon\n",
  });
});

test("event details classify resolved facts separately from Session Canon and hide off-screen results", () => {
  assert.equal(classifyEventDetail({ established: true, detail: "storm arrived" }).classification, "resolved-fact");
  assert.equal(classifyEventDetail({ established: false, detail: "storm herald" }).classification, "session-canon");
  assert.deepEqual(presentWorldResult({ result: "Bandits regrouped", visible: false }), { visible: false });
});

test("World Event findings require Lead Resolver authority to bind", () => {
  assert.throws(() => issueWorldEventOutcome({ issuer: "world-event", event: "storm arrives" }), /Lead Resolver/);
  assert.deepEqual(issueWorldEventOutcome({ issuer: "lead-resolver", event: "storm arrives" }), { event: "storm arrives", binding: true });
});
