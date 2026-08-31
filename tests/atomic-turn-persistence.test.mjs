import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  auditMutationPlan,
  createMutationPlan,
  createRecorder,
  persistSyntheticTurn,
} from "../src/turn-persistence.mjs";

/** @param {string} repository */
function git(repository, ...args) {
  return execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
}

function createTracerRepository() {
  const repository = mkdtempSync(join(tmpdir(), "ai-dm-turn-tracer-"));
  mkdirSync(join(repository, "state"));
  writeFileSync(join(repository, "state/status.md"), "Gold: 10\n");
  writeFileSync(join(repository, "state/ledger.md"), "Supplies: 4\n");
  git(repository, "init");
  git(repository, "config", "user.name", "Turn Tracer");
  git(repository, "config", "user.email", "turn-tracer@example.test");
  git(repository, "add", ".");
  git(repository, "commit", "-m", "fixture: initial state");
  return repository;
}

const resolutionRecord = {
  turnId: "turn-tracer-001",
  stateChanges: [
    {
      path: "state/status.md",
      expectedBefore: "Gold: 10\n",
      after: "Gold: 9\n",
    },
    {
      path: "state/ledger.md",
      expectedBefore: "Supplies: 4\n",
      after: "Supplies: 3\n",
    },
  ],
};

test("synthetic Resolution Record becomes an independently audited exact mutation plan", () => {
  const plan = createMutationPlan(resolutionRecord);

  assert.deepEqual(plan, {
    version: 1,
    turnId: "turn-tracer-001",
    mutations: resolutionRecord.stateChanges,
  });
  assert.deepEqual(
    auditMutationPlan(plan, {
      readFile: (path) => ({
        "state/status.md": "Gold: 10\n",
        "state/ledger.md": "Supplies: 4\n",
      })[path],
    }),
    { accepted: true, plan },
  );
});

test("only a State-Auditor-approved plan reaches the deterministic Recorder", () => {
  const writes = [];
  const recorder = createRecorder({
    writeFile: (path, content) => writes.push({ path, content }),
  });
  const plan = createMutationPlan(resolutionRecord);
  const approval = auditMutationPlan(plan, {
    readFile: (path) => ({
      "state/status.md": "Gold: 10\n",
      "state/ledger.md": "Supplies: 4\n",
    })[path],
  });

  assert.throws(
    () => recorder.apply({ accepted: true, plan }),
    /State Auditor-approved mutation plan/,
  );
  assert.equal(writes.length, 0);

  assert.deepEqual(recorder.apply(approval), {
    applied: true,
    turnId: "turn-tracer-001",
  });
  assert.deepEqual(writes, [
    { path: "state/status.md", content: "Gold: 9\n" },
    { path: "state/ledger.md", content: "Supplies: 3\n" },
  ]);
});

test("Recorder rejects an auditor-approved plan altered after validation", () => {
  const writes = [];
  const plan = createMutationPlan(resolutionRecord);
  const approval = auditMutationPlan(plan, {
    readFile: (path) => ({
      "state/status.md": "Gold: 10\n",
      "state/ledger.md": "Supplies: 4\n",
    })[path],
  });
  plan.mutations[0].after = "Gold: 999\n";
  const recorder = createRecorder({
    writeFile: (path, content) => writes.push({ path, content }),
  });

  assert.throws(() => recorder.apply(approval), /plan changed after State Auditor validation/);
  assert.deepEqual(writes, []);
});

test("synthetic turn persists every state change, audit, and presentation in one clean commit", () => {
  const repository = createTracerRepository();
  const parentBaselineCommit = git(repository, "rev-parse", "HEAD");
  try {
    const result = persistSyntheticTurn({
      repository,
      resolutionRecord: { ...resolutionRecord, baselineCommit: parentBaselineCommit },
      presentation: "David spends one gold sovereign on supplies.",
    });

    assert.deepEqual(result, {
      persisted: true,
      turnId: "turn-tracer-001",
      commit: git(repository, "rev-parse", "HEAD"),
    });
    assert.equal(readFileSync(join(repository, "state/status.md"), "utf8"), "Gold: 9\n");
    assert.equal(readFileSync(join(repository, "state/ledger.md"), "utf8"), "Supplies: 3\n");
    assert.deepEqual(
      JSON.parse(readFileSync(join(repository, "turn-audit/turn-tracer-001.json"), "utf8")),
      {
        turnId: "turn-tracer-001",
        parentBaselineCommit,
        mutationPlan: createMutationPlan(resolutionRecord),
      },
    );
    assert.equal(
      readFileSync(join(repository, "turn-presentation/turn-tracer-001.md"), "utf8"),
      "David spends one gold sovereign on supplies.\n",
    );
    assert.match(git(repository, "log", "-1", "--format=%B"), /turn-tracer-001/);
    assert.equal(git(repository, "status", "--porcelain"), "");
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
});

test("interrupted mutation restores every original file and reports its failed operation", () => {
  const repository = createTracerRepository();
  const originalCommit = git(repository, "rev-parse", "HEAD");
  try {
    const result = persistSyntheticTurn({
      repository,
      resolutionRecord: { ...resolutionRecord, baselineCommit: originalCommit },
      presentation: "This presentation must not persist.",
      injectFailureAfterMutationPath: "state/status.md",
    });

    assert.deepEqual(result, {
      persisted: false,
      rejection: {
        reason: "recorder-interrupted",
        operation: "write",
        path: "state/status.md",
        message: "injected interruption",
      },
    });
    assert.equal(readFileSync(join(repository, "state/status.md"), "utf8"), "Gold: 10\n");
    assert.equal(readFileSync(join(repository, "state/ledger.md"), "utf8"), "Supplies: 4\n");
    assert.equal(existsSync(join(repository, "turn-audit/turn-tracer-001.json")), false);
    assert.equal(existsSync(join(repository, "turn-presentation/turn-tracer-001.md")), false);
    assert.equal(git(repository, "rev-parse", "HEAD"), originalCommit);
    assert.equal(git(repository, "status", "--porcelain"), "");
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
});

test("stale precondition rejects without changing state, commit, or working tree", () => {
  const repository = createTracerRepository();
  try {
    writeFileSync(join(repository, "state/status.md"), "Gold: 8\n");
    git(repository, "add", "state/status.md");
    git(repository, "commit", "-m", "fixture: concurrent update");
    const concurrentCommit = git(repository, "rev-parse", "HEAD");

    assert.deepEqual(
      persistSyntheticTurn({
        repository,
        resolutionRecord: { ...resolutionRecord, baselineCommit: concurrentCommit },
        presentation: "This presentation must not persist.",
      }),
      {
        persisted: false,
        rejection: {
          reason: "precondition-failed",
          path: "state/status.md",
          expectedBefore: "Gold: 10\n",
          actualBefore: "Gold: 8\n",
        },
      },
    );
    assert.equal(readFileSync(join(repository, "state/status.md"), "utf8"), "Gold: 8\n");
    assert.equal(git(repository, "rev-parse", "HEAD"), concurrentCommit);
    assert.equal(git(repository, "status", "--porcelain"), "");
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
});

test("State Auditor rejects a mutation path that escapes the campaign repository", () => {
  const plan = createMutationPlan({
    turnId: "turn-tracer-path",
    stateChanges: [
      {
        path: "../outside.md",
        expectedBefore: "before\n",
        after: "after\n",
      },
    ],
  });

  assert.deepEqual(
    auditMutationPlan(plan, { readFile: () => "before\n" }),
    {
      accepted: false,
      reason: "invalid-path",
      path: "../outside.md",
    },
  );
});

test("State Auditor precisely rejects a stale mutation precondition", () => {
  const plan = createMutationPlan(resolutionRecord);

  assert.deepEqual(
    auditMutationPlan(plan, {
      readFile: (path) => ({
        "state/status.md": "Gold: 8\n",
        "state/ledger.md": "Supplies: 4\n",
      })[path],
    }),
    {
      accepted: false,
      reason: "precondition-failed",
      path: "state/status.md",
      expectedBefore: "Gold: 10\n",
      actualBefore: "Gold: 8\n",
    },
  );
});
