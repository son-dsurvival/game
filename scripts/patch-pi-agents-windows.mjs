// @ts-check

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const sourcePath = resolve(
  process.cwd(),
  "node_modules/pi-agents/src/engine/subprocess.ts"
);
const spawnMarker = "AI_DM_WINDOWS_PI_SPAWN_COMPAT";
const timeoutMarker = "AI_DM_WINDOWS_RPC_STARTUP_COMPAT";
const originalSpawn = `      try {
        proc = spawnProcess("pi", args, {
          cwd: spec.cwd,`;
const compatibleSpawn = `      try {
        // ${spawnMarker}: npm's Windows launcher is a .cmd file, which Node cannot
        // execute with shell:false. Re-enter the current Pi CLI through Node.
        const piCommand =
          process.platform === "win32" && process.argv[1]
            ? { command: process.execPath, args: [process.argv[1], ...args] }
            : { command: "pi", args };
        proc = spawnProcess(piCommand.command, piCommand.args, {
          cwd: spec.cwd,`;
const originalTimeout = "const CONTROL_RESPONSE_TIMEOUT_MS = 30_000;";
const compatibleTimeout = `// ${timeoutMarker}: cold project-package discovery can exceed 30s on Windows.
const CONTROL_RESPONSE_TIMEOUT_MS =
  process.platform === "win32" ? 180_000 : 30_000;`;

let source = readFileSync(sourcePath, "utf8");
let changed = false;

/**
 * @param {string} marker
 * @param {string} original
 * @param {string} replacement
 * @param {string} sourceLabel
 */
function applyPatch(marker, original, replacement, sourceLabel) {
  if (source.includes(marker)) return false;
  if (!source.includes(original)) {
    throw new Error(
      `pi-agents ${sourceLabel} source changed; review the Windows compatibility patch before installing`
    );
  }
  source = source.replace(original, replacement);
  return true;
}

changed = applyPatch(spawnMarker, originalSpawn, compatibleSpawn, "subprocess spawn") || changed;
changed = applyPatch(timeoutMarker, originalTimeout, compatibleTimeout, "RPC timeout") || changed;

if (changed) {
  writeFileSync(sourcePath, source, "utf8");
  process.stdout.write("Applied pi-agents Windows runtime compatibility.\n");
} else {
  process.stdout.write("pi-agents Windows runtime compatibility already applied.\n");
}
