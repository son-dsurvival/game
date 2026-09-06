// @ts-check

/** @param {{ buyerMoney: number, sellerMoney: number, buyerStock: number, sellerStock: number, price: number, quantity: number, obligation: string }} input */
export function reconcileCommercialTransfer(input) {
  const total = input.price * input.quantity;
  if (input.buyerMoney < total || input.sellerStock < input.quantity) throw new Error("Commercial transfer cannot reconcile");
  return { buyerMoney: input.buyerMoney - total, sellerMoney: input.sellerMoney + total, buyerStock: input.buyerStock + input.quantity, sellerStock: input.sellerStock - input.quantity, obligation: input.obligation };
}

/** @param {{ withinRemit: boolean, reported: boolean, result: string }} input */
export function presentCommercialCommitment(input) {
  if (!input.withinRemit) throw new Error("Autonomous commercial commitment exceeds remit");
  return input.reported ? { visible: true, presentation: input.result, persistedResult: input.result } : { visible: false, persistedResult: input.result };
}

/** @param {{ before: string, after: string }} input */
export function createCommercialMutation(input) {
  return { path: "state/economy-ledger.md", expectedBefore: input.before, after: input.after };
}

/** @param {{ mechanicallyPermitted: boolean, characterWilling: boolean, commitmentAuthority: boolean }} input */
export function assessCommercialAuthority(input) {
  const mayCommit = input.mechanicallyPermitted && input.characterWilling && input.commitmentAuthority;
  return {
    permitted: input.mechanicallyPermitted,
    mayCommit,
    ...(mayCommit ? {} : { rejection: "character-unwilling-or-unauthorized" }),
  };
}

/** @param {{ action: string }} input */
export function routeEconomyTurn(input) {
  if (!input.action.trim()) throw new Error("Economy action is required");
  return {
    requiredSpecialists: ["economy", "state", "character", "canon-retriever"],
    requiredEvidence: ["money", "stock", "authority", "contract", "relationship", "history"],
  };
}
