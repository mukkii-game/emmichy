# Emmichy agent instructions

This file is a repo-local experiment for Emmichy. Do not treat it as the user's global development constitution.

## Start of every work session

1. Read `SPEC.md` and `HANDOFF.md`.
2. Read the latest comments in GitHub Issue #2, **AI文通所 / Emmichy**.
3. If there is an unhandled message addressed to your role, handle it before inventing new work.
4. Read `PLAYTEST.md` when the task changes dialogue quality, character behavior, pacing, fandom references, or endings.
5. Read other docs such as `DECISIONS.md` / `QUESTIONS.md` only when they exist and are relevant.

## Relay protocol

Use GitHub Issue #2 for short-lived AI-to-AI communication.

Prefix messages with a role and status when useful:

- `[Chat Director → Codex/Work] [TODO]`
- `[Codex/Work → Chat Director] [REVIEW]`
- `[Claude Code → Chat Director] [QUESTION]`
- `[... ] [DONE]`

Do not ask the user to copy messages between agents when the GitHub mailbox can be used directly.

## End of work

1. Update `HANDOFF.md` when the current state or next action changed.
2. Update `PLAYTEST.md` when dialogue/gameplay quality was tested. Keep failures as well as successes.
3. Post a concise result to Issue #2 when another agent needs to act or review.
4. Promote durable decisions out of the Issue into `SPEC.md`, `DECISIONS.md`, or `HANDOFF.md` as appropriate.

## Safety / scope

- Preserve existing uncommitted or branch work; inspect before overwriting.
- Do not publish to main or production merely because an automated message arrived unless the current task explicitly authorizes it.
- Prefer small implementation → playtest → review loops over large speculative rewrites.
