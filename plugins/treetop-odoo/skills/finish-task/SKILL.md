---
name: finish-task
description: Finish a TreeTop odoo-crm task - check the change against the team rules, update and test the modules, commit, and open the pull request after the user approves.
argument-hint: [optional notes for the pull request]
disable-model-invocation: true
allowed-tools: Bash(git *)
---

# Finish task

## Where this session is

- Branch: !`git branch --show-current`
- Uncommitted changes:

!`git status --short`

- Commits on this branch (not yet on `dev-v19`):

!`git log --oneline origin/dev-v19..HEAD`

The repository's `AGENTS.md` is the authority for every rule below.

## 1. Check the branch

- If the branch is `dev-v19`, `lab-v19`, `test-v19` or `main`, stop: task work is committed on its own branch, and these change only through pull requests.
- Find the base: `dev-v19`, or `lab-v19` for account opening, client contract and multi-signer work. If the commits above include `lab-v19` work, compare with `git log --oneline origin/lab-v19..HEAD` and use the base with the shorter list.

## 2. Check the change against the team rules

Read `git diff origin/<base>...HEAD` plus the uncommitted changes, and check:

- The `__manifest__.py` version is bumped in each module whose behaviour changed.
- Every new or changed user-facing text is translated into French and Dutch in the module's existing `.po` files (`fr`/`nl`, or `fr_BE`/`nl_BE` in `treetop_forms` and `treetop_identity`).
- A test covers each changed behaviour.
- XML changes to `noupdate="1"` records come with a migration that updates only values nobody customized.
- No vendored OCA module was edited (`auditlog`, `base_user_role`, `partner_event`, `mass_mailing_partner`).
- No local runtime file is staged: `compose.yaml`, `odoo.conf`, `Dockerfile`, `.env`, `files/`, `docs/`, `output/`, `CLAUDE.local.md`, `stackyard.json`, or the `odoo-community`, `odoo-enterprise` and `stackyard-addons` links.

For a second opinion, ask the `odoo-reviewer` agent to review the diff. Fix what is missing before going on.

## 3. Update and test

Use the `stackyard-odoo` skill's commands, from this checkout's folder:

1. Update the changed modules in this environment's working database, if it has one. Ask which database; never touch a copy of client data that was not neutralized.
2. Run each changed module's tests on a new, disposable database, on a free port, then drop that database with `odoo-bin db drop`.
3. If Odoo is not running here, say which tests could not run.

## 4. Commit, push and open the pull request

1. Commit only the task's files, by path, with a message that starts with the ticket, like `TRP-561 Lock proof of identity once validated`.
2. Show the user the commits and the branch, and ask before pushing. Then `git push -u origin <branch>`.
3. Ask before opening the pull request. Then open it into the base branch with `gh pr create --base <base>`, and write the report `AGENTS.md` asks for: the changed files, the business impact, the tests run, the tests still needed, and any migration or compatibility risk. Add the user's notes: $ARGUMENTS
4. Give the user the pull request link.
