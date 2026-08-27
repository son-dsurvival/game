import assert from "node:assert/strict";
import { test } from "node:test";

import campaignModeExtension, {
  installCampaignModeExtension,
} from "../.pi/extensions/campaign-mode.ts";

function createHostHarness(options = {}) {
  const commands = new Map();
  const handlers = new Map();
  const statuses = [];
  const notifications = [];
  const emitted = [];
  const execCalls = [];
  const pi = {
    registerCommand(name, options) {
      commands.set(name, options);
    },
    on(event, handler) {
      handlers.set(event, handler);
    },
    events: {
      emit(name, payload) {
        emitted.push({ name, payload });
      },
    },
    exec: async (command, args) => {
      execCalls.push({ command, args });
      return options.exec
        ? options.exec(command, args)
        : { code: 0, stdout: "", stderr: "" };
    },
  };
  const ctx = {
    cwd: process.cwd(),
    hasUI: true,
    ui: {
      setStatus(key, value) {
        statuses.push({ key, value });
      },
      notify(message, level) {
        notifications.push({ message, level });
      },
    },
  };
  return {
    pi,
    ctx,
    commands,
    handlers,
    statuses,
    notifications,
    emitted,
    execCalls,
  };
}

test("/campaign transitions mode and keeps the active mode visible", async () => {
  const host = createHostHarness();
  campaignModeExtension(host.pi);

  await host.handlers.get("session_start")({}, host.ctx);
  assert.deepEqual(host.statuses.at(-1), {
    key: "campaign-mode",
    value: "campaign: off",
  });

  await host.commands.get("campaign").handler("shadow", host.ctx);
  assert.deepEqual(host.statuses.at(-1), {
    key: "campaign-mode",
    value: "campaign: shadow",
  });
  assert.deepEqual(host.notifications.at(-1), {
    message: "Campaign Mode: shadow",
    level: "info",
  });

  await host.commands.get("campaign").handler("off", host.ctx);
  assert.deepEqual(host.statuses.at(-1), {
    key: "campaign-mode",
    value: "campaign: off",
  });
});

test("Campaign Mode routes directives outside fiction and emits admitted Turn Envelopes", async () => {
  const host = createHostHarness({
    exec: async (_command, args) => {
      if (args[0] === "rev-parse") {
        return { code: 0, stdout: "abc123\n", stderr: "" };
      }
      return { code: 0, stdout: "", stderr: "" };
    },
  });
  campaignModeExtension(host.pi);
  await host.commands.get("campaign").handler("shadow", host.ctx);

  const directive = await host.handlers.get("input")(
    { text: "{Check Seris's canon.}", source: "interactive" },
    host.ctx,
  );
  assert.equal(directive.action, "transform");
  assert.match(directive.text, /Out-of-Game Directive/);
  assert.match(directive.text, /"classification":"out-of-game-directive"/);
  assert.match(directive.text, /"commit":"abc123"/);
  assert.match(directive.text, /\{Check Seris's canon\.\}/);
  await host.handlers.get("agent_settled")({}, host.ctx);

  const action = await host.handlers.get("input")(
    { text: "I enter the workshop.", source: "interactive" },
    host.ctx,
  );
  assert.deepEqual(action, { action: "handled" });
  const admission = host.emitted.find(
    (event) => event.name === "campaign:turn-envelope",
  );
  assert.equal(admission.payload.classification, "in-game-input");
  assert.equal(admission.payload.input, "I enter the workshop.");
  assert.equal(admission.payload.mode, "shadow");
  assert.deepEqual(admission.payload.baseline, { commit: "abc123" });
  assert.match(admission.payload.turnId, /^turn-[0-9a-f-]{36}$/);
});

test("braced directives retain shadow protection through full agent settlement", async () => {
  const host = createHostHarness({
    exec: async (_command, args) =>
      args[0] === "rev-parse"
        ? { code: 0, stdout: "abc123\n", stderr: "" }
        : { code: 0, stdout: "", stderr: "" },
  });
  campaignModeExtension(host.pi);
  await host.commands.get("campaign").handler("shadow", host.ctx);
  await host.handlers.get("input")(
    { text: "{Review the current state.}", source: "interactive" },
    host.ctx,
  );

  const turnEndHandler = host.handlers.get("turn_end");
  if (turnEndHandler) await turnEndHandler({}, host.ctx);
  await host.commands.get("campaign").handler("off", host.ctx);
  assert.deepEqual(
    await host.handlers.get("tool_call")(
      { toolName: "edit", input: { path: "status sheet.md" } },
      host.ctx,
    ),
    {
      block: true,
      reason: "Shadow Validation cannot modify authoritative campaign state: status sheet.md",
    },
  );

  await host.handlers.get("agent_settled")({}, host.ctx);
  assert.equal(
    await host.handlers.get("tool_call")(
      { toolName: "edit", input: { path: "status sheet.md" } },
      host.ctx,
    ),
    undefined,
  );
});

test("shadow Campaign Mode blocks authoritative mutation tools", async () => {
  const host = createHostHarness();
  campaignModeExtension(host.pi);
  await host.commands.get("campaign").handler("shadow", host.ctx);

  assert.deepEqual(
    await host.handlers.get("tool_call")(
      { toolName: "edit", input: { path: "status sheet.md" } },
      host.ctx,
    ),
    {
      block: true,
      reason: "Shadow Validation cannot modify authoritative campaign state: status sheet.md",
    },
  );
  assert.deepEqual(
    await host.handlers.get("tool_call")(
      { toolName: "bash", input: { command: "echo changed >> TEMP_MEMORY.md" } },
      host.ctx,
    ),
    {
      block: true,
      reason: "Shadow Validation blocks shell execution during Campaign Mode",
    },
  );
});

test("dirty Git admission identifies changed items to the player", async () => {
  const host = createHostHarness({
    exec: async (_command, args) => {
      if (args[0] === "rev-parse") {
        return { code: 0, stdout: "abc123\n", stderr: "" };
      }
      return {
        code: 0,
        stdout: " M status sheet.md\n?? TEMP_MEMORY.md\n",
        stderr: "",
      };
    },
  });
  campaignModeExtension(host.pi);
  await host.commands.get("campaign").handler("shadow", host.ctx);

  assert.deepEqual(
    await host.handlers.get("input")(
      { text: "Ask Seris for a report.", source: "interactive" },
      host.ctx,
    ),
    { action: "handled" },
  );
  assert.deepEqual(host.notifications.at(-1), {
    message:
      "Campaign turn stopped: dirty-baseline. Changed items: status sheet.md, TEMP_MEMORY.md.",
    level: "warning",
  });
  assert.equal(host.emitted.length, 0);
});

test("the extension holds the Campaign Turn Lock until its runner stops", async () => {
  let markStarted;
  const started = new Promise((resolve) => {
    markStarted = resolve;
  });
  let finishRun;
  const runGate = new Promise((resolve) => {
    finishRun = resolve;
  });
  const host = createHostHarness({
    exec: async (_command, args) =>
      args[0] === "rev-parse"
        ? { code: 0, stdout: "abc123\n", stderr: "" }
        : { code: 0, stdout: "", stderr: "" },
  });
  installCampaignModeExtension(host.pi, {
    runTurn: async () => {
      markStarted();
      await runGate;
    },
  });
  await host.commands.get("campaign").handler("shadow", host.ctx);

  const first = host.handlers.get("input")(
    { text: "Begin the first action.", source: "interactive" },
    host.ctx,
  );
  await started;
  const overlap = await host.handlers.get("input")(
    { text: "Begin an overlapping action.", source: "interactive" },
    host.ctx,
  );

  assert.deepEqual(overlap, { action: "handled" });
  assert.match(host.notifications.at(-1).message, /turn-locked/);

  await host.commands.get("campaign").handler("off", host.ctx);
  assert.deepEqual(
    await host.handlers.get("tool_call")(
      { toolName: "edit", input: { path: "status sheet.md" } },
      host.ctx,
    ),
    {
      block: true,
      reason: "Shadow Validation cannot modify authoritative campaign state: status sheet.md",
    },
  );

  finishRun();
  assert.deepEqual(await first, { action: "handled" });
});
