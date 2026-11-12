---
description: Plan a feature, have a Cursor agent review the plan, then implement it
argument-hint: <feature description>
---

Build this feature with the double-check workflow:

$ARGUMENTS

1. Enter plan mode if you are not in it already.
2. Investigate the codebase and write a complete implementation plan: the approach, the files to change, edge cases, and how it will be tested.
3. Call ExitPlanMode with the plan. A hook sends it to an independent Cursor agent for review and returns the findings to you; follow the instructions that come with them.
4. Once the user approves the final plan, implement it.
