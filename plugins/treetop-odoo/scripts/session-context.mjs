// SessionStart: tells Claude where it works, as plain facts. Silent outside odoo-crm checkouts.
import { currentBranch, envValues, git, readInput, sharedBranches, treetopCheckout } from "./treetop.mjs";

try {
  const input = await readInput();
  const root = treetopCheckout(input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd());
  if (root) {
    const branch = currentBranch(root), changed = git(root, "status", "--porcelain").split("\n").filter(Boolean).length;
    const env = envValues(root, ["STACKYARD_ENVIRONMENT", "ODOO_HOST", "MAILPIT_HOST"]);
    const facts = [`This session works in the TreeTop odoo-crm checkout ${root}, on ${branch ? `branch ${branch}` : "a detached HEAD"}, with ${changed} uncommitted file(s).`];
    if (env.STACKYARD_ENVIRONMENT && env.ODOO_HOST) {
      facts.push(`It is the StackYard environment "${env.STACKYARD_ENVIRONMENT}": Odoo at http://${env.ODOO_HOST}${env.MAILPIT_HOST ? `, Mailpit at http://${env.MAILPIT_HOST}` : ""}.`);
    }
    if (sharedBranches.includes(branch)) {
      facts.push(`${branch} is a shared branch that changes only through pull requests. Task work happens on a feature/ or fix/ branch from dev-v19 (lab-v19 for account opening, client contract and multi-signer work), preferably in a StackYard case environment.`);
    } else if (branch.startsWith("case/")) {
      facts.push("This is a StackYard case environment: its branch, Odoo and database belong to one task and are disposable. Its branch gets a feature/<TRP-ticket>-<slug> name before its pull request.");
    }
    facts.push("The treetop-odoo plugin provides /treetop-odoo:start-task and /treetop-odoo:finish-task, the stackyard-odoo skill for Odoo commands, and the odoo-reviewer agent.");
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: facts.join(" ") } }));
  }
} catch { /* Context is a convenience: a failure never blocks the session. */ }
