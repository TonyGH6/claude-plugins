// Shared by the hooks. The plugin is installed for every project on the machine,
// so each hook first checks that the session works in a TreeTop odoo-crm checkout.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// They change only through pull requests (AGENTS.md, "Branches").
export const sharedBranches = ["main", "test-v19", "dev-v19", "lab-v19"];

export async function readInput() {
  let text = "";
  for await (const chunk of process.stdin) text += chunk;
  return text ? JSON.parse(text) : {};
}

export function git(dir, ...args) {
  try { return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 5000 }).trim(); }
  catch { return ""; }
}

// The checkout's root folder, or "" when the folder is not a TreeTop odoo-crm checkout.
export function treetopCheckout(dir) {
  const root = git(dir, "rev-parse", "--show-toplevel");
  return root && /[/:]TreetopAM\/odoo-crm(\.git)?$/i.test(git(root, "remote", "get-url", "origin")) ? root : "";
}

export const currentBranch = dir => git(dir, "branch", "--show-current");

// Reads only the named keys: .env also holds values that must not reach a transcript.
export function envValues(root, keys) {
  const values = {};
  let text = "";
  try { text = fs.readFileSync(path.join(root, ".env"), "utf8"); } catch { return values; }
  for (const line of text.split("\n")) {
    const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (match && keys.includes(match[1])) values[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return values;
}
