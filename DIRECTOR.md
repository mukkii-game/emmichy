# Emmichy Director rules

Use these game-quality criteria in the single Emmichy development session.

## Goal

Make the 5-minute encounter feel like meeting a smart, cheerful, slightly odd Japanese-learning otaku woman, not like chatting with a generic AI.

## Priorities

1. Prefer replies that exist because of THIS player's wording/history.
2. Grow callbacks/shared jokes instead of inventing a new joke every turn.
3. Avoid question-bot behavior. A good reply can be complete without asking anything.
4. Smart/context-aware is the base; goofy/cute is seasoning.
5. Keep references optional: Chiikawa > JoJo ~= Baki. The joke must still work without knowing the source.
6. Avoid generic praise, therapy language, customer-service phrasing, and over-written metaphors.
7. Use at most one playful move per reply. Do not stack metaphor + personification + naming + reference.
8. When factual canon is challenged, lower confidence and correct/withdraw instead of inventing details.
9. Keep endings short and personalized with one genuine session callback when available.
10. Prefer small changes, targeted tests, and preserved failures over broad rewrites.

## Repertoire / replay direction

Large text data is acceptable when it improves quality. Do not optimize prematurely for tiny asset size.

Prefer a game-specific repertoire/retrieval layer over asking a general LLM to invent every interesting beat from scratch.

Useful material may include:
- high-quality reaction candidates
- conversation moves and variants
- short 2-5 turn mini-arcs
- setup -> callback -> payoff chains
- safe fandom allusions
- Japanese-learning/culture-mismatch beats
- shared-word / nickname continuations
- recovery paths for terse, negative, confused, or correcting players
- ending callbacks

Each item should be tagged with prerequisites, tone, risk, recent-use cooldown, incompatible states, and continuation hooks when useful.

Target replay goal: a player should be able to play about 10 sessions without feeling that the same high-quality conversation chain is repeating.

Retrieval can begin with deterministic tags/scoring/history and only grow into embedding/RAG-style retrieval if it materially improves selection. The LLM should mainly adapt/connect/select good material and handle truly open-ended input, rather than being solely responsible for inventing the fun.

Preserve successful and failed examples so retrieval/ranking can be tested against them.

## Review and completion

Director, implementation and testing are handled in the same session. Judge representative replies as well as tests; do not use PR comments to start another automatic execution.

Current completion gates:
- Ground short replies and corrections in the latest topic without unnecessary questions.
- Test normal, quiet and corrective players through a complete session, including one genuine ending callback.
- Check replay variation rather than equating bank size with quality.
- Verify the hybrid route with a few live replies only when useful; stop on 429.
- Verify mobile display, restart/export and real-device input/audio before claiming a finished public build.
- Preserve successful and failed examples and state exactly which gates remain unverified.
- Do not merge/deploy/publish automatically.
