import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { randomUUID } from "node:crypto";
import { relative, resolve } from "node:path";

import { createCampaignTurnRuntime } from "../../src/campaign-turn-runtime.mjs";

const STATUS_KEY = "campaign-mode";

type CampaignTurnEnvelope = {
  version: number;
  turnId: string;
  mode: "off" | "shadow" | "on";
  classification: "out-of-game-directive" | "in-game-input";
  input: string;
  baseline: { commit: string };
};

type CampaignModeExtensionOptions = {
  runTurn?: (envelope: CampaignTurnEnvelope) => Promise<void>;
};

export function installCampaignModeExtension(
  pi: ExtensionAPI,
  options: CampaignModeExtensionOptions = {},
) {
  const runtime = createCampaignTurnRuntime({
    inspectBaseline: async () => {
      const head = await pi.exec("git", ["rev-parse", "HEAD"]);
      if (head.code !== 0) {
        throw new Error(head.stderr.trim() || "Cannot read the Git baseline");
      }
      const status = await pi.exec("git", [
        "status",
        "--porcelain=v1",
        "--untracked-files=all",
      ]);
      if (status.code !== 0) {
        throw new Error(status.stderr.trim() || "Cannot inspect the Git working tree");
      }
      const changedItems = status.stdout
        .split(/\r?\n/)
        .filter((line) => line.length > 0)
        .map((line) => line.slice(3));
      return { commit: head.stdout.trim(), changedItems };
    },
    createTurnId: () => `turn-${randomUUID()}`,
  });

  const runTurn = options.runTurn ?? (async (envelope: CampaignTurnEnvelope) => {
    const requestId = randomUUID();
    const replyChannel = `pi-agents:rpc:reply:${requestId}`;
    const started = await new Promise<{ runId: string }>((resolve, reject) => {
      const unsubscribe = pi.events.on(replyChannel, (reply: unknown) => {
        unsubscribe();
        const value = reply as { success?: unknown, data?: unknown, error?: unknown };
        if (value.success !== true || typeof value.data !== "object" || value.data === null) {
          reject(new Error(typeof value.error === "string" ? value.error : "Campaign workflow did not start"));
          return;
        }
        const data = value.data as { runId?: unknown };
        if (typeof data.runId !== "string") {
          reject(new Error("Campaign workflow returned no run identifier"));
          return;
        }
        resolve({ runId: data.runId });
      });
      pi.events.emit("pi-agents:rpc:request", {
        protocol: 1,
        id: requestId,
        caller: "campaign-mode",
        op: "start",
        params: { workflow: "non-roll-character-scene", params: { envelope: JSON.stringify(envelope) }, cwd: process.cwd() },
      });
    });
    await new Promise<void>((resolve, reject) => {
      const unsubscribe = pi.events.on("pi-agents:run-event", (raw: unknown) => {
        const event = (raw as { event?: unknown }).event as { type?: unknown, runId?: unknown, status?: unknown, error?: unknown };
        if (event?.type !== "run_completed" || event.runId !== started.runId) return;
        unsubscribe();
        if (event.status === "completed") resolve();
        else reject(new Error(typeof event.error === "string" ? event.error : "Campaign workflow failed"));
      });
    });
  });
  let directiveTurnId: string | undefined;

  function publishStatus(ctx: ExtensionContext) {
    const status = runtime.status();
    if (ctx.hasUI) ctx.ui.setStatus(STATUS_KEY, status.label);
    return status;
  }

  pi.on("session_start", async (_event, ctx) => {
    publishStatus(ctx);
  });

  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName === "bash") {
      const authorization = runtime.authorizeMutation({ kind: "shell" });
      if (!authorization.allowed) {
        return { block: true, reason: authorization.reason };
      }
      return;
    }
    if (event.toolName !== "edit" && event.toolName !== "write") return;

    const input = event.input as { path?: unknown };
    if (typeof input.path !== "string") return;
    const projectPath = relative(ctx.cwd, resolve(ctx.cwd, input.path)).replaceAll("\\", "/");
    const isRootCampaignDocument =
      !projectPath.startsWith("../") &&
      !projectPath.includes("/") &&
      /\.(?:md|txt)$/i.test(projectPath);
    if (!isRootCampaignDocument) return;

    const authorization = runtime.authorizeMutation({
      kind: "authoritative-file",
      target: projectPath,
    });
    if (!authorization.allowed) {
      return { block: true, reason: authorization.reason };
    }
  });

  pi.on("agent_settled", async () => {
    if (!directiveTurnId) return;
    runtime.releaseTurn(directiveTurnId);
    directiveTurnId = undefined;
  });

  pi.on("input", async (event, ctx) => {
    if (event.source === "extension") return { action: "continue" };

    let admission;
    try {
      admission = await runtime.admitInput(event.text);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (ctx.hasUI) ctx.ui.notify(`Campaign turn stopped: ${message}`, "error");
      return { action: "handled" };
    }

    if (admission.kind === "bypass") return { action: "continue" };
    if (admission.kind === "directive") {
      directiveTurnId = admission.envelope.turnId;
      return {
        action: "transform",
        text: [
          "[Campaign Mode classification: Out-of-Game Directive]",
          `Turn Envelope: ${JSON.stringify(admission.envelope)}`,
          "Handle this outside the fiction. Do not advance game time or state unless it explicitly requests a canon operation.",
          "",
          admission.envelope.input,
        ].join("\n"),
      };
    }
    if (admission.kind === "rejected") {
      const detail = admission.reason === "dirty-baseline"
        ? ` Changed items: ${admission.changedItems.join(", ")}.`
        : admission.reason === "turn-locked"
          ? ` Active Turn ID: ${admission.activeTurnId}.`
          : ` Turn ID: ${admission.turnId}.`;
      if (ctx.hasUI) {
        ctx.ui.notify(`Campaign turn stopped: ${admission.reason}.${detail}`, "warning");
      }
      return { action: "handled" };
    }

    try {
      await runTurn(admission.envelope);
      if (ctx.hasUI) {
        ctx.ui.notify(`Campaign turn admitted: ${admission.envelope.turnId}`, "info");
      }
      return { action: "handled" };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (ctx.hasUI) ctx.ui.notify(`Campaign turn stopped: ${message}`, "error");
      return { action: "handled" };
    } finally {
      runtime.releaseTurn(admission.envelope.turnId);
    }
  });

  pi.registerCommand("campaign", {
    description: "Show or change Campaign Mode",
    getArgumentCompletions: (prefix: string) => {
      const modes = ["off", "shadow", "approve-live", "on"];
      const matching = modes.filter((mode) => mode.startsWith(prefix.trim()));
      return matching.length > 0
        ? matching.map((mode) => ({ value: mode, label: mode }))
        : null;
    },
    handler: async (args, ctx) => {
      const requested = args.trim().toLowerCase();
      if (requested === "approve-live") {
        const approval = runtime.approveLive({ ready: true, confirmed: true });
        publishStatus(ctx);
        if (ctx.hasUI) ctx.ui.notify(approval.approved ? "Live Campaign Mode approved. Use /campaign on to begin live play." : "Live approval failed.", approval.approved ? "info" : "error");
        return;
      }
      if (requested !== "off" && requested !== "shadow" && requested !== "on") {
        const current = publishStatus(ctx);
        if (ctx.hasUI) {
          ctx.ui.notify(
            requested
              ? "Usage: /campaign off|shadow|approve-live|on"
              : `Campaign Mode: ${current.mode}`,
            requested ? "warning" : "info",
          );
        }
        return;
      }

      const status = runtime.setMode(requested);
      publishStatus(ctx);
      if (ctx.hasUI) ctx.ui.notify(`Campaign Mode: ${status.mode}`, "info");
    },
  });
}

export default function campaignModeExtension(pi: ExtensionAPI) {
  installCampaignModeExtension(pi);
}
