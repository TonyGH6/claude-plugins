---
name: start-task
description: Start a TreeTop odoo-crm task from a TRP ticket - pick the base branch, create the task branch, gather context, and propose a plan before editing.
argument-hint: [TRP-ticket] [what the task is about]
disable-model-invocation: true
allowed-tools: Bash(git *)
---

# Start task: $ARGUMENTS

## Where this session is

- Branch: !`git branch --show-current`
- Last commit: !`git log --oneline -1`
- Uncommitted changes:

!`git status --short`

The repository's `AGENTS.md` is the authority for every rule below. Where they differ, follow `AGENTS.md`.

## 1. Check the starting point

- If the changes listed above are not empty, stop. Show them and ask whether to commit, set aside or discard them; never discard on your own.
- If the branch is `dev-v19`, `lab-v19`, `test-v19` or `main`, this is one of the long-lived StackYard environments. Say that task work belongs in a StackYard case environment (dashboard, **Case environments**), and continue here only if the user confirms.
- A branch named `case/odoo-crm-<n>` is a StackYard case environment: it is the right place for this task.

## 2. Choose the base branch

- `dev-v19` for features and fixes.
- `lab-v19` for account opening, client contract and multi-signer work.
- `test-v19` and `main` are never a base: they change only through pull requests.

If the ticket does not make the choice clear, ask.

## 3. Create the task branch

1. `git fetch origin`
2. Name it `feature/<TICKET>-<short-slug>`, or `fix/<TICKET>-<short-slug>` for a bug, in lowercase words with hyphens, like `feature/TRP-561-proof-identity-lock`.
3. In a case environment, check the case branch starts from the chosen base (`git merge-base --is-ancestor origin/<base> HEAD`), then rename it with `git branch -m <name>`. If it started from another base, say so before going further.
4. Anywhere else, run `git switch -c <name> origin/<base>`.

## 4. Gather context

- The ticket text: if the arguments only give a ticket number, ask the user to paste the ticket. No ticket tracker is connected.
- `readme.md` (module map, menus), then the README and `__manifest__.py` of each module the task touches.
- Related code: search for the models, fields and views the ticket names. Read the Odoo 19 sources in `./odoo-community` for framework behaviour; never edit them.
- The traps in `AGENTS.md` that apply: `noupdate` data, bank imports, change requests on portfolio fields, case document rights, report language.

## 5. Propose a plan, then wait

Present, in this order, and wait for approval before editing any file:

1. The base branch and task branch.
2. The modules and files to change, and why.
3. The tests to add or update.
4. The French and Dutch translations to add (`fr`/`nl`, or `fr_BE`/`nl_BE` in `treetop_forms` and `treetop_identity`).
5. The manifest versions to bump, and whether a migration is needed for `noupdate` records.
6. Open questions for the user.
