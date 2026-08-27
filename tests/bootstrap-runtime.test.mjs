import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

let cachedRuntimeReport;

function runRuntimeCheck() {
  if (cachedRuntimeReport) return cachedRuntimeReport;

  const result = spawnSync(process.execPath, ["scripts/check-runtime.mjs", "--json"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  cachedRuntimeReport = JSON.parse(result.stdout);
  return cachedRuntimeReport;
}

test("clean checkout discovers the pinned project-local campaign runtime", () => {
  const report = runRuntimeCheck();

  assert.deepEqual(report.package, {
    name: "pi-agents",
    version: "0.16.1",
    scope: "project",
    delegatedPiSpawnCompatible: true,
  });
  assert.equal(report.agent.name, "runtime-smoke");
  assert.equal(report.agent.inheritsActiveModel, true);
  assert.equal(report.workflow.name, "runtime-smoke");
  assert.equal(report.workflow.structuredHandoff, true);
  assert.equal(report.workflow.executableSmoke, true);
  assert.equal(report.workflow.optionalExplanation, true);
  assert.equal(report.workflow.requiresTrust, true);
});

test("runtime smoke role exposes read-only browsing tools", () => {
  const report = runRuntimeCheck();

  assert.deepEqual(report.agent.tools, ["read", "grep", "find", "ls"]);
  assert.equal(report.agent.hasMutationTool, false);
});

test("remote campaign history remains archived without replacing main", () => {
  const report = runRuntimeCheck();
  const originalRemoteMain = "31fd25d77bb91fa746feafa42675dfb8c47bc5fe";

  assert.equal(report.git.remoteMain, originalRemoteMain);
  assert.equal(report.git.archivePreOrchestra, originalRemoteMain);
  assert.equal(report.git.remoteMainReplaced, false);
});
