# double-check

A Claude Code plugin that gets a second opinion from Cursor before a feature is implemented.

1. You ask Claude Code for a feature in **plan mode** (or with `/double-check <feature>`).
2. When Claude finishes the plan and asks to leave plan mode, a hook sends the plan to a **read-only Cursor agent**, which reads the relevant code and reviews it.
3. The review comes back to Claude. Claude marks each finding ACCEPTED or REJECTED with a reason, shows you the table, and revises the plan.
4. You approve the revised plan in the usual plan-approval prompt, and Claude implements it.

Small fixes don't trigger anything: the review only runs when a plan leaves plan mode.

## Requirements

- Claude Code with plugin support
- Python 3.8+ available as `python3`
- The Cursor CLI installed and logged in: `cursor-agent --version` should work

## Install

This plugin is listed in the `treetop` marketplace (`TonyGH6/claude-plugins`). The repository is private, so add it with the HTTPS URL. On any machine, run in Claude Code:

```
/plugin marketplace add https://github.com/TonyGH6/claude-plugins.git
/plugin install double-check@treetop
```

Restart Claude Code afterwards; `/hooks` should list a `PreToolUse` hook on `ExitPlanMode`.

To get updates after changes are pushed: `/plugin marketplace update treetop`. Bump `version` in `.claude-plugin/plugin.json` whenever you change the plugin.

To try a local checkout for one session without installing: `claude --plugin-dir <path-to-checkout>/plugins/double-check`

## Use

- Switch to plan mode (Shift+Tab) and describe the feature, or
- run `/double-check add CSV export to the reports page`.

The Cursor review usually takes one to a few minutes.

## Settings

Set these in the `env` block of `~/.claude/settings.json` (or a project's `.claude/settings.json`):

```json
{
  "env": {
    "DOUBLE_CHECK_CURSOR_MODEL": "<a non-Claude model from `cursor-agent models`>",
    "DOUBLE_CHECK_MAX_ROUNDS": "1"
  }
}
```

| Variable | Default | What it does |
|---|---|---|
| `DOUBLE_CHECK_CURSOR_MODEL` | Cursor account default | Model the reviewer uses. Pick a non-Claude model so the second opinion has different blind spots. |
| `DOUBLE_CHECK_MAX_ROUNDS` | `1` | Review rounds per plan. `2` reviews the revised plan once more. |
| `DOUBLE_CHECK_TIMEOUT` | `600` | Seconds before a review is abandoned. Keep it under the hook timeout (900 s, in `hooks/hooks.json`). |
| `DOUBLE_CHECK_CURSOR_BIN` | `cursor-agent` on PATH, then `~/.local/bin/cursor-agent` | Full path to the Cursor CLI. |
| `DOUBLE_CHECK_DISABLE` | unset | `1` turns reviews off. |

To change what the reviewer looks for, edit `prompts/review-prompt.md`. Keep the `{{PLAN}}` placeholder.

## How it behaves

- **Read-only reviewer.** Cursor runs with `--mode ask` and never with `--force`, so it can read the repository but not change it.
- **You always decide.** The hook either blocks the exit with a review or stays silent; it never approves a plan for you.
- **No loops.** After the configured rounds, the revised plan goes straight to you. If you reject a plan and ask for changes, the new version is reviewed again.
- **Fails safely.** If Cursor is missing, errors or times out, Claude tells you why and asks whether to continue without a review.
- **Log.** Each run is logged to `double-check.log` in the plugin's data folder, or in `<temp dir>/claude-double-check/` if Claude Code doesn't provide one.

## Troubleshooting

- **Nothing happens when the plan is ready:** check `/hooks`, then restart Claude Code.
- **"cursor-agent was not found":** hooks can run with a shorter PATH than your terminal. Set `DOUBLE_CHECK_CURSOR_BIN` to the output of `which cursor-agent`.
- **Unknown flag errors from cursor-agent:** update it with `cursor-agent update`.
- **Windows (native):** if `python3` doesn't exist, change `python3` to `python` in `hooks/hooks.json`.
