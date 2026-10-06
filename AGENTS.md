# Emmichy agent instructions

This file is a repo-local experiment for Emmichy. Do not treat it as the user's global development constitution.

## Fast path: default for AI Relay

The triggering PR #3 comment is the authoritative short-term TODO.

1. Read this `AGENTS.md`.
2. Read only the files directly needed for the TODO.
3. Do **not** reread `SPEC.md`, `HANDOFF.md`, `PLAYTEST.md`, or Issue #2 by default.
4. Read those only when the TODO explicitly requires them, a durable decision changed, or safety/ambiguity requires more context.
5. Before starting, check recent PR #3 comments for the same task ID. If `[DOING]`, `[REVIEW]`, or `[DONE]` already exists, stop.
6. Make the smallest safe change on the existing PR #3 head branch. A commit to the head branch updates PR #3 automatically.
7. Run targeted tests first. Run the full suite only for broad/shared changes or when explicitly requested.
8. Do not call external AI providers unless the TODO explicitly asks for live-AI validation.
9. Reply on PR #3 only, with a short `[Work/Codex → Chat Director] [REVIEW]` containing task ID, commit, tests, key output, and remaining concern.
10. Update `PLAYTEST.md` / `HANDOFF.md` only when there is genuinely new durable information.

Goal: minimize latency, token use, and duplicated context.

## Role-neutral relay protocol

The transport is GitHub, not a specific AI product. Any model/tool may participate using roles such as:

- `Director`
- `Implementer`
- `Reviewer`
- `Researcher`

Examples:

- `[Director → Implementer] [TODO] id:loop-7 ...`
- `[Implementer → Director] [REVIEW] id:loop-7 commit:abc123 tests:5/5 ...`
- `[Reviewer → Director] [QUESTION] ...`

ChatGPT, Codex, Work, Claude Code, Gemini, or future agents may fill these roles if they can read/write the shared GitHub surface.

Do not ask the user to copy messages between agents when the shared GitHub relay is available.

## Durable docs

- `SPEC.md`: stable game direction/spec
- `DECISIONS.md`: durable decisions, when present
- `HANDOFF.md`: current project state only when materially changed
- `PLAYTEST.md`: durable playtest evidence, successes and failures

Do not use these as a mailbox.

## Safety / scope

- Preserve existing work; inspect before overwriting.
- Do not publish, merge, or deploy to main/public/production unless explicitly authorized.
- Do not add metered APIs or paid services without explicit authorization.
- Prefer small implementation → targeted test → short review loops.
