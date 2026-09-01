// @ts-check

import { createHash } from "node:crypto";

/** @param {string} content */
function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

/** @param {{ turnId: string, files: Record<string, string>, citations: { source: string, heading: string }[] }} input */
/**
 * @param {{
 *   requiredRoles: string[],
 *   handoffs: { role: string }[],
 *   leadHandoff: { role: string, turnId: string, baselineCommit?: string, outcome: string, playerVisibleFacts: string[], sessionCanon: string[], stateChanges: unknown[] },
 *   narration: string,
 *   additions: string[],
 *   persist: (input: { resolutionRecord: unknown, presentation: string }) => { persisted: boolean, rejection?: unknown, turnId?: string, commit?: string }
 * }} input
 */
export function completeNonRollCharacterScene(input) {
  requireSpecialistCoverage(input.requiredRoles, input.handoffs);
  const issued = issueResolution(input.leadHandoff);
  const validation = validateNarration({
    brief: issued.narrationBrief,
    narration: input.narration,
    additions: input.additions,
  });
  if (!validation.accepted) return { displayed: false, rejection: validation };
  const resolutionRecord = {
    ...issued.resolutionRecord,
    ...(input.leadHandoff.baselineCommit === undefined
      ? {}
      : { baselineCommit: input.leadHandoff.baselineCommit }),
    stateChanges: input.leadHandoff.stateChanges,
  };
  return persistThenPresent({
    persist: () => input.persist({ resolutionRecord, presentation: input.narration }),
    render: () => input.narration,
  });
}

/**
 * @param {{
 *   persist: () => { persisted: boolean, rejection?: unknown, turnId?: string, commit?: string },
 *   render: () => string
 * }} input
 */
export function persistThenPresent(input) {
  const result = input.persist();
  if (!result.persisted) return { displayed: false, rejection: result.rejection };
  return {
    displayed: true,
    turnId: result.turnId,
    commit: result.commit,
    presentation: input.render(),
  };
}

/** @param {{ role: string, turnId: string, outcome: string, playerVisibleFacts: string[], sessionCanon: string[] }} handoff */
export function issueResolution(handoff) {
  if (handoff.role !== "lead-resolver") {
    throw new Error("Only the Lead Resolver may issue a Resolution Record");
  }
  return {
    resolutionRecord: {
      turnId: handoff.turnId,
      outcome: handoff.outcome,
      sessionCanon: handoff.sessionCanon,
    },
    narrationBrief: { turnId: handoff.turnId, visibleFacts: handoff.playerVisibleFacts },
  };
}

/** @param {{ brief: { visibleFacts: string[] }, narration: string, additions: string[] }} input */
export function validateNarration(input) {
  const facts = input.narration.match(/[^.]+\./g)?.map((fact) => fact.trim()) ?? [];
  for (const fact of facts) {
    if (input.brief.visibleFacts.includes(fact)) continue;
    if (/\bhidden\b/i.test(fact)) {
      return { accepted: false, reason: "visibility-leak", fact };
    }
    if (!input.additions.includes(fact)) {
      return { accepted: false, reason: "undeclared-addition", fact };
    }
  }
  return { accepted: true };
}

/** @param {string[]} requiredRoles @param {{ role: string }[]} handoffs */
export function requireSpecialistCoverage(requiredRoles, handoffs) {
  const available = new Set(handoffs.map((handoff) => handoff.role));
  const missing = requiredRoles.filter((role) => !available.has(role));
  if (missing.length > 0) {
    throw new Error(`Missing required specialist handoffs: ${missing.join(", ")}`);
  }
}

/** @param {{ input: string, router: { requiredDomains: string[] } }} input */
export function selectRequiredSpecialists(input) {
  const required = new Set(["canon-retriever", "mechanics", "state"]);
  if (/\bSeris\b/i.test(input.input)) required.add("character");
  for (const domain of input.router.requiredDomains) required.add(domain);
  return [...required];
}

/** @param {{ turnId: string, files: Record<string, string>, citations: { source: string, heading: string }[] }} input */
export function createTurnEvidenceBundle(input) {
  const snapshot = Object.fromEntries(
    Object.entries(input.files).map(([path, content]) => [path, Object.freeze({ content, hash: hash(content) })]),
  );
  return Object.freeze({
    turnId: input.turnId,
    snapshot: Object.freeze(snapshot),
    citations: Object.freeze(input.citations.map((citation) => Object.freeze({ ...citation }))),
  });
}
