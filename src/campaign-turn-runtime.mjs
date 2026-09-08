// @ts-check

const campaignModes = new Set(["off", "shadow", "on"]);

/** @typedef {"off" | "shadow" | "on"} CampaignMode */
/** @typedef {{ commit: string, changedItems: string[] }} BaselineInspection */
/** @typedef {{ kind: "shell" } | { kind: "authoritative-file", target: string }} MutationRequest */
/**
 * @typedef CampaignTurnRuntimeOptions
 * @property {CampaignMode} [initialMode]
 * @property {() => Promise<BaselineInspection>} [inspectBaseline]
 * @property {() => string} [createTurnId]
 */

/** @param {CampaignTurnRuntimeOptions} [options] */
export function createCampaignTurnRuntime(options = {}) {
  /** @type {CampaignMode} */
  let mode = options.initialMode ?? "off";
  /** @type {string | undefined} */
  let activeTurnId;
  /** @type {CampaignMode | undefined} */
  let activeTurnMode;
  let admissionPending = false;
  let liveApproved = false;
  const usedTurnIds = new Set();

  function status() {
    return { mode, label: `campaign: ${mode}` };
  }

  /** @param {CampaignMode} nextMode */
  function setMode(nextMode) {
    if (!campaignModes.has(nextMode)) {
      throw new Error(`Unsupported Campaign Mode: ${nextMode}`);
    }
    if (nextMode === "on" && !liveApproved) {
      throw new Error("Live Campaign Mode requires explicit readiness approval");
    }
    mode = nextMode;
    return status();
  }

  /** @param {{ ready: boolean, confirmed: boolean }} approval */
  function approveLive(approval) {
    liveApproved = approval.ready && approval.confirmed;
    return { approved: liveApproved };
  }

  /** @param {string} rawInput */
  async function admitInput(rawInput) {
    const input = rawInput.trim();
    if (mode === "off") return { kind: "bypass", input };
    if (activeTurnId || admissionPending) {
      return {
        kind: "rejected",
        reason: "turn-locked",
        activeTurnId: activeTurnId ?? null,
      };
    }

    if (!options.inspectBaseline || !options.createTurnId) {
      throw new Error("Campaign Turn admission is not configured");
    }
    admissionPending = true;
    try {
      const inspection = await options.inspectBaseline();
      if (inspection.changedItems.length > 0) {
        return {
          kind: "rejected",
          reason: "dirty-baseline",
          changedItems: inspection.changedItems,
        };
      }
      const turnId = options.createTurnId();
      if (!turnId) throw new Error("Campaign Turn ID factory returned no identifier");
      if (usedTurnIds.has(turnId)) {
        return { kind: "rejected", reason: "duplicate-turn-id", turnId };
      }
      usedTurnIds.add(turnId);
      activeTurnId = turnId;
      activeTurnMode = mode;
      const classification = /^\{[\s\S]*\}$/.test(input)
        ? "out-of-game-directive"
        : "in-game-input";
      const envelope = {
        version: 1,
        turnId,
        mode,
        classification,
        input,
        baseline: { commit: inspection.commit },
      };
      return classification === "out-of-game-directive"
        ? { kind: "directive", envelope }
        : { kind: "admitted", envelope };
    } finally {
      admissionPending = false;
    }
  }

  /** @param {MutationRequest} request */
  function authorizeMutation(request) {
    const shadowProtected =
      activeTurnMode === "shadow" || (!activeTurnId && mode === "shadow");
    if (!shadowProtected) return { allowed: true };
    if (request.kind === "shell") {
      return {
        allowed: false,
        reason: "Shadow Validation blocks shell execution during Campaign Mode",
      };
    }
    return {
      allowed: false,
      reason: `Shadow Validation cannot modify authoritative campaign state: ${request.target}`,
    };
  }

  /** @param {string} turnId */
  function releaseTurn(turnId) {
    if (activeTurnId !== turnId) return false;
    activeTurnId = undefined;
    activeTurnMode = undefined;
    return true;
  }

  return {
    status,
    setMode,
    approveLive,
    admitInput,
    authorizeMutation,
    releaseTurn,
  };
}
