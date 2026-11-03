# Claude Code plugins

A private Claude Code plugin marketplace, named `treetop`.

## treetop-odoo

For work on the TreeTop odoo-crm repository (Odoo 19) in StackYard environments. It adds to what the repository's `AGENTS.md` already says; that file stays the authority for team rules.

| Part | Name | What it does |
| --- | --- | --- |
| Skill, run by you | `/treetop-odoo:start-task TRP-561 lock proof of identity` | Checks the starting point, picks the base branch (`dev-v19`, or `lab-v19` for account opening, client contract and multi-signer work), creates `feature/TRP-…` or `fix/TRP-…`, gathers context, and proposes a plan before any edit. |
| Skill, run by you | `/treetop-odoo:finish-task` | Checks the change against the team rules, updates and tests the modules, commits, then pushes and opens the pull request only after you approve. |
| Skill, used by Claude when relevant | `stackyard-odoo` | Commands for Odoo in a StackYard environment: module updates, tests on a disposable database, database list and drop, logs, neutralizing copied data. |
| Agent | `odoo-reviewer` | Read-only review of a branch against the team rules and known traps. Ask Claude to use it, or run `@agent-treetop-odoo:odoo-reviewer`. |
| Hook, at session start | `scripts/session-context.mjs` | Tells Claude which checkout, branch and StackYard environment the session is in, and whether the branch is shared. |
| Hook, before tool calls | `scripts/guard.mjs` | Blocks pushes to `main`, `test-v19`, `dev-v19` and `lab-v19`, force pushes, and edits inside `odoo-community`, `odoo-enterprise` and `stackyard-addons`. |

The hooks act only in checkouts whose `origin` is `TreetopAM/odoo-crm`; elsewhere they stay silent. They need `node` on the `PATH`.

## Install

The repository is private, so use the HTTPS form: Claude Code then clones with your `gh` login instead of trying SSH first.

```bash
claude plugin marketplace add https://github.com/TonyGH6/claude-plugins.git
claude plugin install treetop-odoo@treetop
```

That installs it for you in every project on this machine, including StackYard case environments.

## Update

Plugins don't update by themselves until you turn on auto-update for the marketplace in `/plugin` → **Marketplaces**. Otherwise:

```bash
claude plugin marketplace update treetop
claude plugin update treetop-odoo@treetop
```

`plugin.json` has no `version`, so each new commit is a new version.

## Change it

1. Edit the files under `plugins/treetop-odoo/`.
2. Check them: `claude plugin validate .`
3. Try them without installing: `claude --plugin-dir ./plugins/treetop-odoo`, then `/reload-plugins` after each edit.
4. Commit and push, then update as above.

Every skill's name and description sit in Claude's context on each turn, so keep descriptions short and the set of skills small.
