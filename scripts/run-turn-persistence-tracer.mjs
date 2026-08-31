// @ts-check

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { persistSyntheticTurn } from "../src/turn-persistence.mjs";

/** @param {string} repository @param {string[]} args */
function git(repository, ...args) {
  return execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
}

function createRepository() {
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
  turnId: "turn-tracer-demo",
  stateChanges: [
    { path: "state/status.md", expectedBefore: "Gold: 10\n", after: "Gold: 9\n" },
    { path: "state/ledger.md", expectedBefore: "Supplies: 4\n", after: "Supplies: 3\n" },
  ],
};

const repository = createRepository();
try {
  const success = persistSyntheticTurn({
    repository,
    resolutionRecord: {
      ...resolutionRecord,
      baselineCommit: git(repository, "rev-parse", "HEAD"),
    },
    presentation: "Synthetic tracer presentation.",
  });
  assert.equal(success.persisted, true);
  assert.equal(git(repository, "status", "--porcelain"), "");

  const rollbackRepository = createRepository();
  try {
    const interruption = persistSyntheticTurn({
      repository: rollbackRepository,
      resolutionRecord: {
        ...resolutionRecord,
        turnId: "turn-tracer-rollback",
        baselineCommit: git(rollbackRepository, "rev-parse", "HEAD"),
      },
      presentation: "This presentation must not persist.",
      injectFailureAfterMutationPath: "state/status.md",
    });
    assert.equal(interruption.persisted, false);
    assert.equal(readFileSync(join(rollbackRepository, "state/status.md"), "utf8"), "Gold: 10\n");
    assert.equal(git(rollbackRepository, "status", "--porcelain"), "");

    process.stdout.write(`${JSON.stringify({ success, interruption }, null, 2)}\n`);
  } finally {
    rmSync(rollbackRepository, { recursive: true, force: true });
  }
} finally {
  rmSync(repository, { recursive: true, force: true });
}
