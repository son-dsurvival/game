import assert from "node:assert/strict";
import { test } from "node:test";

import { createCampaignTurnRuntime } from "../src/campaign-turn-runtime.mjs";

test("live Campaign Mode remains locked until explicit readiness approval", () => {
  const runtime = createCampaignTurnRuntime();
  assert.throws(() => runtime.setMode("on"), /approval/);
  assert.deepEqual(runtime.approveLive({ ready: true, confirmed: true }), { approved: true });
  assert.equal(runtime.setMode("on").mode, "on");
});
