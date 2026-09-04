// @ts-check

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

const approvedAudits = new WeakSet();
const approvalPlanSignatures = new WeakMap();

/**
 * @typedef Mutation
 * @property {string} path
 * @property {string} expectedBefore
 * @property {string} after
 */
/**
 * @typedef ResolutionRecord
 * @property {string} turnId
 * @property {string} [baselineCommit]
 * @property {Mutation[]} stateChanges
 */
/**
 * @typedef MutationPlan
 * @property {number} version
 * @property {string} turnId
 * @property {Mutation[]} mutations
 */

/** @param {ResolutionRecord} resolutionRecord */
export function createMutationPlan(resolutionRecord) {
  return {
    version: 1,
    turnId: resolutionRecord.turnId,
    mutations: resolutionRecord.stateChanges.map((mutation) => ({
      path: mutation.path,
      expectedBefore: mutation.expectedBefore,
      after: mutation.after,
    })),
  };
}

/**
 * @param {MutationPlan} plan
 * @param {{ readFile: (path: string) => string | undefined }} files
 */
export function auditMutationPlan(plan, files) {
  const plannedPaths = new Set();
  for (const mutation of plan.mutations) {
    const normalizedPath =
      typeof mutation.path === "string" ? mutation.path.replaceAll("\\", "/") : "";
    const invalidPath =
      normalizedPath.length === 0 ||
      normalizedPath.startsWith("/") ||
      /^[A-Za-z]:\//.test(normalizedPath) ||
      normalizedPath.split("/").includes("..") ||
      !normalizedPath.startsWith("state/");
    if (invalidPath) {
      return { accepted: false, reason: "invalid-path", path: mutation.path };
    }
    if (plannedPaths.has(normalizedPath)) {
      return { accepted: false, reason: "duplicate-path", path: mutation.path };
    }
    plannedPaths.add(normalizedPath);
    const actual = files.readFile(mutation.path);
    if (actual !== mutation.expectedBefore) {
      return {
        accepted: false,
        reason: "precondition-failed",
        path: mutation.path,
        expectedBefore: mutation.expectedBefore,
        actualBefore: actual,
      };
    }
  }
  const approval = { accepted: true, plan };
  approvedAudits.add(approval);
  approvalPlanSignatures.set(approval, JSON.stringify(plan));
  return approval;
}

/** @param {string} repository @param {string[]} args */
function git(repository, ...args) {
  return execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
}

/**
 * @param {{
 *   repository: string,
 *   resolutionRecord: ResolutionRecord,
 *   presentation: string,
 *   auditDetails?: Record<string, unknown>,
 *   injectFailureAfterMutationPath?: string
 * }} input
 */
export function persistSyntheticTurn(input) {
  const dirtyItems = git(input.repository, "status", "--porcelain", "--untracked-files=all")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3));
  if (dirtyItems.length > 0) {
    return { persisted: false, rejection: { reason: "dirty-baseline", changedItems: dirtyItems } };
  }
  const parentBaselineCommit = git(input.repository, "rev-parse", "HEAD");
  if (input.resolutionRecord.baselineCommit !== parentBaselineCommit) {
    return {
      persisted: false,
      rejection: {
        reason: "baseline-mismatch",
        expectedBaseline: input.resolutionRecord.baselineCommit ?? "missing",
        actualBaseline: parentBaselineCommit,
      },
    };
  }
  const plan = createMutationPlan(input.resolutionRecord);
  if (!/^turn-[A-Za-z0-9-]+$/.test(plan.turnId)) {
    return { persisted: false, rejection: { reason: "invalid-turn-id", turnId: plan.turnId } };
  }
  const approval = auditMutationPlan(plan, {
    readFile: (path) => {
      try {
        return readFileSync(join(input.repository, path), "utf8");
      } catch {
        return undefined;
      }
    },
  });
  if (!approval.accepted) {
    const { accepted: _accepted, ...rejection } = approval;
    return { persisted: false, rejection };
  }

  const auditPath = `turn-audit/${plan.turnId}.json`;
  const presentationPath = `turn-presentation/${plan.turnId}.md`;
  const paths = [...plan.mutations.map((mutation) => mutation.path), auditPath, presentationPath];
  const snapshots = new Map(
    paths.map((path) => {
      const destination = join(input.repository, path);
      return [path, existsSync(destination) ? readFileSync(destination, "utf8") : undefined];
    }),
  );
  /** @type {Mutation | undefined} */
  let activeMutation;

  try {
    const recorder = createRecorder({
      writeFile: (path, content) => {
        const destination = join(input.repository, path);
        mkdirSync(dirname(destination), { recursive: true });
        writeFileSync(destination, content, "utf8");
      },
      afterWrite: (mutation) => {
        activeMutation = mutation;
        if (input.injectFailureAfterMutationPath === mutation.path) {
          throw new Error("injected interruption");
        }
      },
    });
    recorder.apply(approval, [
      {
        path: auditPath,
        content: `${JSON.stringify({
          turnId: plan.turnId,
          parentBaselineCommit,
          mutationPlan: plan,
          ...(input.auditDetails === undefined ? {} : { auditDetails: input.auditDetails }),
        }, null, 2)}\n`,
      },
      { path: presentationPath, content: `${input.presentation}\n` },
    ]);

    git(input.repository, "add", "--", ...paths);
    git(input.repository, "commit", "-m", `campaign turn ${plan.turnId}`);
    return {
      persisted: true,
      turnId: plan.turnId,
      commit: git(input.repository, "rev-parse", "HEAD"),
    };
  } catch (error) {
    for (const [path, content] of snapshots) {
      const destination = join(input.repository, path);
      if (content === undefined) rmSync(destination, { force: true });
      else writeFileSync(destination, content, "utf8");
    }
    git(input.repository, "reset", "--quiet");
    const message = error instanceof Error ? error.message : String(error);
    return {
      persisted: false,
      rejection: {
        reason: "recorder-interrupted",
        operation: "write",
        path: activeMutation?.path ?? "unknown",
        message,
      },
    };
  }
}

/**
 * @param {{
 *   writeFile: (path: string, content: string) => void,
 *   afterWrite?: (mutation: Mutation) => void
 * }} files
 */
export function createRecorder(files) {
  return {
    /**
     * @param {unknown} approval
     * @param {{ path: string, content: string }[]} [artifacts]
     */
    apply(approval, artifacts = []) {
      if (
        typeof approval !== "object" ||
        approval === null ||
        !approvedAudits.has(approval)
      ) {
        throw new Error("Recorder requires a State Auditor-approved mutation plan");
      }
      const acceptedApproval = /** @type {{ accepted: true, plan: MutationPlan }} */ (approval);
      if (approvalPlanSignatures.get(acceptedApproval) !== JSON.stringify(acceptedApproval.plan)) {
        throw new Error("Recorder rejected a plan changed after State Auditor validation");
      }
      for (const mutation of acceptedApproval.plan.mutations) {
        files.writeFile(mutation.path, mutation.after);
        files.afterWrite?.(mutation);
      }
      for (const artifact of artifacts) files.writeFile(artifact.path, artifact.content);
      return { applied: true, turnId: acceptedApproval.plan.turnId };
    },
  };
}
