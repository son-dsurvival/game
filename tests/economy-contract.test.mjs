import assert from "node:assert/strict";
import { test } from "node:test";

import { assessCommercialAuthority, createCommercialMutation, reconcileCommercialTransfer, routeEconomyTurn, presentCommercialCommitment } from "../src/economy-contract.mjs";

test("economy routing retrieves money, stock, authority, contract, relationship, and history evidence", () => {
  assert.deepEqual(routeEconomyTurn({ action: "buy supplies" }), {
    requiredSpecialists: ["economy", "state", "character", "canon-retriever"],
    requiredEvidence: ["money", "stock", "authority", "contract", "relationship", "history"],
  });
});

test("commercial transfer exactly reconciles price, quantity, ledgers, and obligations", () => {
  assert.deepEqual(reconcileCommercialTransfer({ buyerMoney: 10, sellerMoney: 4, buyerStock: 1, sellerStock: 3, price: 3, quantity: 1, obligation: "deliver tomorrow" }), {
    buyerMoney: 7, sellerMoney: 7, buyerStock: 2, sellerStock: 2, obligation: "deliver tomorrow",
  });
});

test("autonomous commercial commitments stay within remit and remain hidden until reported", () => {
  assert.deepEqual(presentCommercialCommitment({ withinRemit: true, reported: false, result: "Seris reserved iron" }), { visible: false, persistedResult: "Seris reserved iron" });
  assert.throws(() => presentCommercialCommitment({ withinRemit: false, reported: true, result: "Seris sold the shop" }), /remit/);
});

test("commercial result creates an exact audited persistence mutation", () => {
  assert.deepEqual(createCommercialMutation({ before: "Gold: 10\n", after: "Gold: 7\n" }), { path: "state/economy-ledger.md", expectedBefore: "Gold: 10\n", after: "Gold: 7\n" });
});

test("commercial permission is distinct from character willingness and authority to commit", () => {
  assert.deepEqual(assessCommercialAuthority({
    mechanicallyPermitted: true, characterWilling: false, commitmentAuthority: false,
  }), {
    permitted: true,
    mayCommit: false,
    rejection: "character-unwilling-or-unauthorized",
  });
});
