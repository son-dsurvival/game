// @ts-check

/** @param {{ before: string, after: string }} input */
export function createTimeMutation(input) {
  return { path: "state/world-status.md", expectedBefore: input.before, after: input.after };
}

/** @param {{ established: boolean, detail: string }} input */
export function classifyEventDetail(input) {
  return { detail: input.detail, classification: input.established ? "resolved-fact" : "session-canon" };
}

/** @param {{ result: string, visible: boolean }} input */
export function presentWorldResult(input) {
  return input.visible ? { visible: true, presentation: input.result } : { visible: false };
}

/** @param {{ issuer: string, event: string }} input */
export function issueWorldEventOutcome(input) {
  if (input.issuer !== "lead-resolver") throw new Error("Only Lead Resolver may bind a World Event outcome");
  return { event: input.event, binding: true };
}

/** @param {{ action: "travel" | "rest" | "advance", crossesDayBoundary: boolean, eventEligible: boolean }} input */
export function routeTimeTurn(input) {
  const checks = [input.action === "travel" ? "travel" : input.action === "rest" ? "rest" : "phase-advance", "phase-advance"];
  if (input.crossesDayBoundary) checks.push("day-boundary");
  if (input.eventEligible) checks.push("world-event");
  return { requiredSpecialists: ["state", "world-event", "canon-retriever"], checks };
}
