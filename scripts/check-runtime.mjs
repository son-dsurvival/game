// @ts-check

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const root = process.cwd();
const expectedVersion = "0.16.1";
const originalRemoteMain = "31fd25d77bb91fa746feafa42675dfb8c47bc5fe";
const mutationTools = new Set(["bash", "edit", "write"]);

/** @param {string} relativePath */
function readJson(relativePath) {
  return JSON.parse(readFileSync(resolve(root, relativePath), "utf8"));
}

/** @param {string} relativePath */
function readText(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

/** @param {string} content */
function parseAgentFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error("runtime-smoke agent has no frontmatter");

  /** @type {Record<string, string>} */
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  const tools = (values.tools?.match(/^\[(.*)]$/)?.[1] ?? "")
    .split(",")
    .map((tool) => tool.trim())
    .filter(Boolean);

  return {
    name: values.name,
    tools,
    inheritsActiveModel: !("model" in values) && !("thinking" in values)
  };
}

/** @param {string[]} args */
function git(...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

/** @param {boolean} approved */
function listPiPackages(approved) {
  const trustFlag = approved ? "--approve" : "--no-approve";
  const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "pi";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", `pi list ${trustFlag}`]
    : ["list", trustFlag];
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      PI_OFFLINE: "1",
      PI_SKIP_VERSION_CHECK: "1",
      PI_TELEMETRY: "0"
    }
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "pi list failed");
  return result.stdout;
}

function buildReport() {
  const settings = readJson(".pi/settings.json");
  const rootManifest = readJson("package.json");
  const extensionManifest = readJson(".pi/npm/package.json");
  const extensionLock = readJson(".pi/npm/package-lock.json");
  const delegatedProcessSource = readText(".pi/npm/node_modules/pi-agents/src/engine/subprocess.ts");
  const agent = parseAgentFrontmatter(readText(".pi/agents/runtime-smoke.md"));
  const workflow = readJson(".pi/workflows/runtime-smoke.json");
  const trustedPackageList = listPiPackages(true);
  const untrustedPackageList = listPiPackages(false);
  const installedVersion = extensionLock.packages?.["node_modules/pi-agents"]?.version;
  const configuredPackages = /** @type {string[]} */ (settings.packages ?? []);
  const configuredPackage = configuredPackages.find((entry) => entry.startsWith("npm:pi-agents@"));
  const requiredFields = new Set(workflow.json?.required ?? []);
  const handoffFields = [
    "turnId",
    "role",
    "evidenceCitations",
    "snapshotHashes",
    "applicableRules",
    "excludedRules",
    "findings",
    "candidateValues",
    "assumptions",
    "unresolvedGaps",
    "evidenceRequests",
    "requiredDomainFlags",
    "conflictFlags",
    "recommendations",
    "consequenceBranches"
  ];
  const remoteMain = git("rev-parse", "refs/remotes/origin/main");
  const archivePreOrchestra = git("rev-parse", "refs/remotes/origin/archive/pre-orchestra");

  if (configuredPackage !== `npm:pi-agents@${expectedVersion}`) {
    throw new Error(`expected exact project package pi-agents@${expectedVersion}`);
  }
  if (extensionManifest.dependencies?.["pi-agents"] !== expectedVersion || installedVersion !== expectedVersion) {
    throw new Error(`pi-agents dependency and lockfile must both pin ${expectedVersion}`);
  }
  const packageId = `npm:pi-agents@${expectedVersion}`;
  if (!trustedPackageList.includes(packageId)) {
    throw new Error("Pi did not list the project-local pi-agents package after explicit trust");
  }
  if (untrustedPackageList.includes(packageId)) {
    throw new Error("Pi loaded the project-local pi-agents package without trust");
  }

  const delegatedPiSpawnCompatible =
    delegatedProcessSource.includes("AI_DM_WINDOWS_PI_SPAWN_COMPAT") &&
    delegatedProcessSource.includes("AI_DM_WINDOWS_RPC_STARTUP_COMPAT");
  const hasMutationTool = agent.tools.some((tool) => mutationTools.has(tool));
  const structuredHandoff =
    workflow.json?.type === "object" && handoffFields.every((field) => requiredFields.has(field));
  const executableSmoke = rootManifest.scripts?.["smoke:runtime"] === "node scripts/run-runtime-smoke.mjs";
  const optionalExplanation =
    !requiredFields.has("explanation") && workflow.json?.properties?.explanation?.type === "string";

  if (!delegatedPiSpawnCompatible) throw new Error("pi-agents compatibility patch is missing");
  if (agent.name !== "runtime-smoke" || hasMutationTool || !agent.inheritsActiveModel) {
    throw new Error("runtime-smoke agent must be read-only and inherit the active Pi model");
  }
  if (
    workflow.name !== "runtime-smoke" ||
    !structuredHandoff ||
    !executableSmoke ||
    !optionalExplanation
  ) {
    throw new Error("runtime-smoke workflow is not executable with the minimum handoff contract");
  }
  if (remoteMain !== originalRemoteMain || archivePreOrchestra !== originalRemoteMain) {
    throw new Error("remote main or archive/pre-orchestra does not preserve the bootstrap baseline");
  }

  return {
    package: {
      name: "pi-agents",
      version: installedVersion,
      scope: "project",
      delegatedPiSpawnCompatible
    },
    agent: {
      name: agent.name,
      tools: agent.tools,
      inheritsActiveModel: agent.inheritsActiveModel,
      hasMutationTool
    },
    workflow: {
      name: workflow.name,
      structuredHandoff,
      executableSmoke,
      optionalExplanation,
      requiresTrust: !untrustedPackageList.includes(packageId) && trustedPackageList.includes(packageId)
    },
    git: {
      remoteMain,
      archivePreOrchestra,
      remoteMainReplaced: remoteMain !== originalRemoteMain
    }
  };
}

try {
  const report = buildReport();
  if (process.argv.includes("--json")) {
    process.stdout.write(`${JSON.stringify(report)}\n`);
  } else {
    process.stdout.write("Campaign runtime check passed.\n");
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Campaign runtime check failed: ${message}\n`);
  process.exitCode = 1;
}
