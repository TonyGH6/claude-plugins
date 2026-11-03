// PreToolUse guard rails for odoo-crm checkouts (AGENTS.md, "Branches" and "Layout"):
// - no push to a shared branch, and no force push;
// - no edit inside the Odoo sources or StackYard's add-ons, which every environment shares.
// Anything else gets no decision, so Claude Code's normal permissions apply.
import fs from "node:fs";
import path from "node:path";
import { currentBranch, readInput, sharedBranches, treetopCheckout } from "./treetop.mjs";

function deny(reason) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason } }));
  process.exit(0);
}

const inside = (file, dir) => file === dir || file.startsWith(dir + path.sep);

// The real path of a file that may not exist yet, through its nearest existing parent.
function realPath(file) {
  const rest = [];
  for (let dir = file; ; dir = path.dirname(dir)) {
    try { return path.join(fs.realpathSync(dir), ...rest); }
    catch { if (dir === path.dirname(dir)) return file; rest.unshift(path.basename(dir)); }
  }
}

function checkPush(command, cwd) {
  for (const segment of command.split(/&&|\|\||[;|\n]/)) {
    const words = (segment.match(/"[^"]*"|'[^']*'|\S+/g) || []).map(word => word.replace(/^(["'])(.*)\1$/, "$2"));
    const start = words.indexOf("git");
    if (start < 0) continue;
    // git [-C <dir>] [-c <name>=<value>] push …
    let at = start + 1, dir = cwd;
    while (at < words.length && words[at].startsWith("-")) {
      if (words[at] === "-C") dir = path.resolve(cwd, words[at + 1] || ".");
      at += ["-C", "-c"].includes(words[at]) ? 2 : 1;
    }
    if (words[at] !== "push") continue;
    const options = words.slice(at + 1).filter(word => word.startsWith("-")), [, ...refspecs] = words.slice(at + 1).filter(word => !word.startsWith("-"));
    if (options.some(option => ["-f", "--force", "--mirror", "--all"].includes(option))) {
      deny("Force, mirror and all-branch pushes are blocked by the treetop-odoo plugin. Push the task branch alone; after a rebase, use --force-with-lease on the task branch.");
    }
    for (const spec of refspecs.length ? refspecs : ["HEAD"]) {
      if (spec.startsWith("+")) deny("Force pushes (a refspec starting with +) are blocked by the treetop-odoo plugin.");
      let target = (spec.includes(":") ? spec.slice(spec.indexOf(":") + 1) : spec).replace(/^refs\/heads\//, "");
      if (target === "HEAD") target = currentBranch(dir);
      if (sharedBranches.includes(target)) {
        deny(`Pushing to ${target} is blocked by the treetop-odoo plugin: shared branches change only through pull requests (AGENTS.md, "Branches"). Push a feature/ or fix/ branch and open a pull request instead.`);
      }
    }
  }
}

function checkEdit(file, cwd, root) {
  if (typeof file !== "string" || !file) return;
  const target = path.resolve(cwd, file), real = realPath(target);
  for (const name of ["odoo-community", "odoo-enterprise", "stackyard-addons"]) {
    const link = path.join(root, name);
    let source;
    try { source = fs.realpathSync(link); } catch { continue; }
    if (inside(target, link) || inside(real, source)) {
      deny(`${file} is in ${name}, which links to ${source}: sources every StackYard environment shares. Read them for reference, never modify them (AGENTS.md, "Layout"); change the behaviour from a project module instead.`);
    }
  }
}

try {
  const input = await readInput(), cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const root = treetopCheckout(cwd);
  if (root) {
    if (input.tool_name === "Bash") checkPush(String(input.tool_input?.command || ""), cwd);
    else checkEdit(input.tool_input?.file_path || input.tool_input?.notebook_path, cwd, root);
  }
} catch { /* A broken guard allows rather than blocks; Claude Code's own permissions still apply. */ }
