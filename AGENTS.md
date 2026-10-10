# Emmichy agent instructions

This file is a repo-local experiment for Emmichy. Do not treat it as the user's global development constitution.

## Single-session development (2026-10-07)

The user designated the current Emmichy development session as the sole Director, Implementer and Tester. The automated Relay experiment is ended; its tasks are paused. Do not create another session, post TODOs to wake an agent, or wait for another Director.

- Use the current user's request as the work authority. PR #3 preserves reviewable changes and earlier recovery records.
- Read necessary files and recent relevant changes only. Do not routinely reload Issue #2 or entire document histories.
- Preserve existing work. Implement, test and review the result in this session, then continue clear improvements toward a finished game.
- Record concrete completed work, remaining limitations and next actions in HANDOFF; keep successful and failed dialogue examples in PLAYTEST.
- Do not use external AI for a change that can be verified locally. Any live quality check must be small and stop on 429.
- Maintain GitHub as the source of truth. Keep work on PR #3's head branch until public integration is explicitly authorized.

## Durable docs

ユーザーが2026-10-10に手動の仮想プレイヤー試遊を許可した。サブエージェントはこのセッション内の限定試遊に使い、Director・実装・最終判断はここで行う。自動Relayや別Workは再開しない。トークン節約希望も受けたため、既知の問題は機械的に再現し、新しい主観評価だけ短い設定を渡した1〜2人・各6〜8送信を目安に使う。必要な時だけ追加し、報告は実例と重要3点に絞る。実LLMと模擬試遊、人間評価を区別し、使ったモデルの指定有無を説明する。

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
