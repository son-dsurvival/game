import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { persistSyntheticTurn } from "../src/turn-persistence.mjs";

import {
  createTurnEvidenceBundle,
  selectRequiredSpecialists,
  validateNarration,
  issueResolution,
  persistThenPresent,
  requireSpecialistCoverage,
  completeNonRollCharacterScene,
} from "../src/non-roll-character-scene.mjs";

test("dialogue fixture creates an immutable source-cited Turn Evidence Bundle", () => {
  const bundle = createTurnEvidenceBundle({
    turnId: "turn-dialogue-001",
    files: {
      "state/status.md": "Day: 3\nPhase: morning\nDavid is in the workshop.\n",
      "canon/seris.md": "Seris values frank accounting and refuses to conceal a loss.\n",
    },
    citations: [
      { source: "state/status.md", heading: "Current Campaign State" },
      { source: "canon/seris.md", heading: "Seris" },
    ],
  });

  assert.equal(bundle.turnId, "turn-dialogue-001");
  assert.equal(bundle.snapshot["state/status.md"].content.includes("workshop"), true);
  assert.match(bundle.snapshot["state/status.md"].hash, /^[a-f0-9]{64}$/);
  assert.deepEqual(bundle.citations, [
    { source: "state/status.md", heading: "Current Campaign State" },
    { source: "canon/seris.md", heading: "Seris" },
  ]);
  assert.equal(Object.isFrozen(bundle.snapshot), true);
});

test("dialogue routing unions deterministic and Router-selected Character Specialist coverage", () => {
  assert.deepEqual(
    selectRequiredSpecialists({
      input: "I ask Seris whether she hid the loss.",
      router: { requiredDomains: ["character"] },
    }),
    ["canon-retriever", "mechanics", "state", "character"],
  );
});

test("missing required specialist handoff fails closed before resolution", () => {
  assert.throws(
    () => requireSpecialistCoverage(["canon-retriever", "mechanics", "state", "character"], [
      { role: "canon-retriever" },
      { role: "mechanics" },
      { role: "state" },
    ]),
    /Missing required specialist handoffs: character/,
  );
});

test("only Lead Resolver may issue the binding Resolution Record and visibility-filtered Narration Brief", () => {
  const leadHandoff = {
    role: "lead-resolver",
    turnId: "turn-dialogue-001",
    outcome: "Seris admits the loss and refuses concealment.",
    playerVisibleFacts: ["Seris admits the loss."],
    sessionCanon: ["The workshop ledger records a one-gold loss."],
  };

  assert.throws(
    () => issueResolution({ ...leadHandoff, role: "character" }),
    /Lead Resolver/,
  );
  assert.deepEqual(issueResolution(leadHandoff), {
    resolutionRecord: {
      turnId: "turn-dialogue-001",
      outcome: "Seris admits the loss and refuses concealment.",
      sessionCanon: ["The workshop ledger records a one-gold loss."],
    },
    narrationBrief: {
      turnId: "turn-dialogue-001",
      visibleFacts: ["Seris admits the loss."],
    },
  });
});

test("player presentation is released only after successful persistence", () => {
  let rendered = 0;
  assert.deepEqual(
    persistThenPresent({
      persist: () => ({ persisted: false, rejection: { reason: "precondition-failed" } }),
      render: () => {
        rendered += 1;
        return "unreachable";
      },
    }),
    { displayed: false, rejection: { reason: "precondition-failed" } },
  );
  assert.equal(rendered, 0);

  assert.deepEqual(
    persistThenPresent({
      persist: () => ({ persisted: true, turnId: "turn-dialogue-001", commit: "abc123" }),
      render: () => "Seris meets David's eyes and admits the loss.",
    }),
    {
      displayed: true,
      turnId: "turn-dialogue-001",
      commit: "abc123",
      presentation: "Seris meets David's eyes and admits the loss.",
    },
  );
});

test("complete non-roll character scene persists Session Canon before releasing dialogue", () => {
  let persistedInput;
  const result = completeNonRollCharacterScene({
    requiredRoles: ["canon-retriever", "mechanics", "state", "character"],
    handoffs: [
      { role: "canon-retriever" },
      { role: "mechanics" },
      { role: "state" },
      { role: "character" },
    ],
    leadHandoff: {
      role: "lead-resolver",
      turnId: "turn-dialogue-001",
      outcome: "Seris admits the loss and refuses concealment.",
      playerVisibleFacts: ["Seris admits the loss."],
      sessionCanon: ["The workshop ledger records a one-gold loss."],
      stateChanges: [{ path: "state/status.md", expectedBefore: "Gold: 10\n", after: "Gold: 9\n" }],
    },
    narration: "Seris admits the loss.",
    additions: [],
    persist: (input) => {
      persistedInput = input;
      return { persisted: true, turnId: input.resolutionRecord.turnId, commit: "abc123" };
    },
  });

  assert.deepEqual(persistedInput, {
    resolutionRecord: {
      turnId: "turn-dialogue-001",
      outcome: "Seris admits the loss and refuses concealment.",
      sessionCanon: ["The workshop ledger records a one-gold loss."],
      stateChanges: [{ path: "state/status.md", expectedBefore: "Gold: 10\n", after: "Gold: 9\n" }],
    },
    presentation: "Seris admits the loss.",
  });
  assert.deepEqual(result, {
    displayed: true,
    turnId: "turn-dialogue-001",
    commit: "abc123",
    presentation: "Seris admits the loss.",
  });
});

test("complete dialogue fixture commits state, Session Canon, audit, archive, then releases presentation", () => {
  const repository = mkdtempSync(join(tmpdir(), "ai-dm-dialogue-"));
  const git = (...args) => execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
  try {
    mkdirSync(join(repository, "state"));
    writeFileSync(join(repository, "state/status.md"), "Gold: 10\n");
    writeFileSync(join(repository, "state/session-canon.md"), "");
    git("init"); git("config", "user.name", "Fixture"); git("config", "user.email", "fixture@example.test");
    git("add", "."); git("commit", "-m", "fixture");
    const baselineCommit = git("rev-parse", "HEAD");
    const result = completeNonRollCharacterScene({
      requiredRoles: ["character"], handoffs: [{ role: "character" }],
      leadHandoff: {
        role: "lead-resolver", turnId: "turn-dialogue-001", baselineCommit,
        outcome: "Seris admits the loss.", playerVisibleFacts: ["Seris admits the loss."],
        sessionCanon: ["Seris recorded the one-gold loss."],
        stateChanges: [
          { path: "state/status.md", expectedBefore: "Gold: 10\n", after: "Gold: 9\n" },
          { path: "state/session-canon.md", expectedBefore: "", after: "Seris recorded the one-gold loss.\n" },
        ],
      }, narration: "Seris admits the loss.", additions: [],
      persist: (input) => persistSyntheticTurn({ repository, ...input }),
    });
    assert.equal(result.displayed, true);
    assert.equal(readFileSync(join(repository, "state/status.md"), "utf8"), "Gold: 9\n");
    assert.equal(readFileSync(join(repository, "state/session-canon.md"), "utf8"), "Seris recorded the one-gold loss.\n");
    assert.equal(readFileSync(join(repository, "turn-presentation/turn-dialogue-001.md"), "utf8"), "Seris admits the loss.\n");
    assert.match(readFileSync(join(repository, "turn-audit/turn-dialogue-001.json"), "utf8"), /turn-dialogue-001/);
    assert.match(git("log", "-1", "--format=%B"), /turn-dialogue-001/);
    assert.equal(git("status", "--porcelain"), "");
  } finally { rmSync(repository, { recursive: true, force: true }); }
});

test("invalid narration stops before persistence", () => {
  let persisted = false;
  const result = completeNonRollCharacterScene({
    requiredRoles: ["character"],
    handoffs: [{ role: "character" }],
    leadHandoff: {
      role: "lead-resolver",
      turnId: "turn-dialogue-001",
      outcome: "Seris admits the loss.",
      playerVisibleFacts: ["Seris admits the loss."],
      sessionCanon: [],
      stateChanges: [],
    },
    narration: "Seris admits the loss. The rain starts outside.",
    additions: [],
    persist: () => {
      persisted = true;
      return { persisted: true };
    },
  });
  assert.deepEqual(result, {
    displayed: false,
    rejection: { accepted: false, reason: "undeclared-addition", fact: "The rain starts outside." },
  });
  assert.equal(persisted, false);
});

test("Narrative Validator rejects contradictions, visibility leaks, and undeclared additions", () => {
  const brief = { turnId: "turn-dialogue-001", visibleFacts: ["Seris admits the loss."] };

  assert.deepEqual(
    validateNarration({
      brief,
      narration: "Seris admits the loss. Her hidden courier has already fled town.",
      additions: [],
    }),
    { accepted: false, reason: "visibility-leak", fact: "Her hidden courier has already fled town." },
  );
  assert.deepEqual(
    validateNarration({
      brief,
      narration: "Seris admits the loss. The rain starts outside.",
      additions: [],
    }),
    { accepted: false, reason: "undeclared-addition", fact: "The rain starts outside." },
  );
});
