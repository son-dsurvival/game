// @ts-check

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const root = process.cwd();
const prompt = "Run the runtime-smoke workflow and wait for its result.";
const sessionDir = mkdtempSync(resolve(tmpdir(), "ai-dm-runtime-smoke-"));

/** @param {string} directory */
function findSidecars(directory) {
  /** @type {string[]} */
  const found = [];
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) found.push(...findSidecars(path));
    else if (path.endsWith(".pi-agents.jsonl")) found.push(path);
  }
  return found;
}

function runPi() {
  const commonArgs = [
    "-p",
    "--approve",
    "--session-dir",
    sessionDir,
    "--name",
    "runtime-smoke-verification",
    prompt
  ];
  let command = "pi";
  let args = commonArgs;
  if (process.platform === "win32") {
    const where = spawnSync("where.exe", ["pi.cmd"], { encoding: "utf8" });
    if (where.status !== 0) throw new Error("Cannot locate the Pi Windows launcher");
    const launcher = where.stdout.split(/\r?\n/).find(Boolean);
    if (!launcher) throw new Error("Cannot resolve the Pi Windows launcher path");
    const cliPath = resolve(
      dirname(launcher),
      "node_modules/@earendil-works/pi-coding-agent/dist/cli.js"
    );
    if (!existsSync(cliPath)) throw new Error(`Cannot locate the Pi CLI at ${cliPath}`);
    command = process.execPath;
    args = [cliPath, ...commonArgs];
  }
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      PI_OFFLINE: "1",
      PI_SKIP_VERSION_CHECK: "1",
      PI_TELEMETRY: "0"
    },
    timeout: 360_000
  });
}

try {
  const result = runPi();
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Pi smoke process failed");
  }

  const events = findSidecars(sessionDir)
    .flatMap((path) => readFileSync(path, "utf8").trim().split(/\r?\n/))
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const createdRunIds = new Set(
    events
      .filter((event) => event.type === "run_created" && event.run?.flow?.name === "runtime-smoke")
      .map((event) => event.run.id)
  );
  const completion = events.find(
    (event) => event.type === "run_completed" && createdRunIds.has(event.runId)
  );
  if (!completion) throw new Error("runtime-smoke emitted no completion event");
  if (completion.status !== "completed") {
    throw new Error(completion.error || `runtime-smoke ended with ${completion.status}`);
  }

  const workflow = JSON.parse(readFileSync(resolve(root, ".pi/workflows/runtime-smoke.json"), "utf8"));
  const requireFromPi = createRequire(resolve(root, ".pi/npm/package.json"));
  const Ajv = requireFromPi("ajv").default;
  const validate = new Ajv({ strict: false }).compile(workflow.json);
  if (!validate(completion.value)) {
    throw new Error(`runtime-smoke returned an invalid handoff: ${JSON.stringify(validate.errors)}`);
  }

  process.stdout.write("Campaign runtime smoke passed.\n");
  process.stdout.write(`${JSON.stringify({ runId: completion.runId, handoff: completion.value }, null, 2)}\n`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Campaign runtime smoke failed: ${message}\n`);
  process.exitCode = 1;
} finally {
  rmSync(sessionDir, { recursive: true, force: true });
}
