# Conversation repair — 2026-10-13

## Problem and design

The human's actual transcript shows multiple systems speaking without listening: word matching wins over feedback, unanswered word activities capture unrelated words, idle cards cycle through the same biography/language jokes, and ungrounded scene lines can survive authored output. Browser display correctly splits a reply but that alone cannot repair meaning. The source of each old pasted line is unreported, so this is not attributed wholesale to the LLM.

Priority now: present question/correction/feedback → owned identity and known-word explanation → answer using substantive conversation history → enthusiastic but relevant fandom connection. Known repair acts are local; ordinary conversation still prioritizes the LLM. No fixed AI/bank ratio. Fandom refusal stays active until invited back. Dialogue memory excludes generic fillers; actual displayed reactions remain available to local recall. Reference data supplies facts; personal feelings and wishes do not become canon scenes.

## Completed iterations and evidence

- Two explicitly selected subagents: gpt-6-luna, medium. Fan and ordinary television/internet personas chose six sends each before the change, then replayed those plus two new follow-ups (eight each). Root remains GPT 6.1 Sol at the user's selected effort. No Claude/Gemini delegation or new Work.
- First repair: feedback takes priority, cancels stale activities, shortens future chunks, suppresses repeated owned topics across visits and stops unprompted monologues after criticism. Exact-name and fuzzy matching no longer pull short context items from ordinary prose.
- Second repair: answer the final question rather than earlier preference words; Shisa rereading/support reasons stay on topic; explain owned rain/footstep feelings; accept forgiveness/reassurance; stop gratitude for dropping fandom from generating another Chiikawa cue. The failed-meal example is framed as a personal hypothetical, never as a verified scene.
- Root mechanically replayed the same eight inputs for both personas after the second change, added a six-send otaku persona and replayed thirteen human-failure inputs with selected prior human lines as seeded state. No additional subagent generation for mechanical replays. The seed is marked as supplied human content, not a generated/live session.
- Actual-app offline simulated DOM/virtual pauses: docs/persona-{fan,general}-{before,after,after2}-20261013.json; docs/persona-otaku-root-20261013.json; docs/human-failure-{seed,replay}-20261013.json. Typing/IME draft stops continuation and idle speech. These do not measure physical phone/audio, real timing or human amusement.
- 201 frontend tests and 53 relay tests pass. Existing nickname integrity, factual corrections, topic memory, display pacing, typing interruption and late farewell checks remain.
- Real generation: CI38383844592, candidate relay24904f5, three total provider attempts. GPT OSS two responses at609/685ms; third returned429. Stopped immediately, no additional provider calls. Raw output in docs/conversation-repair-live-20261013.json. The generated reasons were usable but added repetitive catchphrases and broad follow-up questions. Client now preserves the reasons and removes those unnecessary tails; final voice-prompt refinement is locally tested, not a new live quality check.

## Representative changes

| Trigger | Before | After |
|---|---|---|
| 運行の話これで5回目 | unknown or activity answer | acknowledge the repeat, stop that example |
| ウンコウって何 | unknown / remember as favourite | explain trains/buses running a route |
| 許すよ | another interrogation | thanks and relief |
| シーサー、なぜ読み返す | repeat prior liking / unrelated Hachiware | want the feeling of encouragement again |
| どんな雨の匂い | unknown own utterance | personal impression of wet soil/road |
| ちいかわをやめてくれてありがとう | another Chiikawa cue | continue rainy-day conversation |
| ignored activity / feedback | captures words as answers | cancel pending activity |

## Publication and next human check

Frontend runtime20261013-talk1 targets main/Cloudflare. BackendPR18 merged main09751fc522862a77c18452f7c4fb79e6cd78df4c; provider order and CORS unchanged. No migration of old GitHub Pages player data needed by the user's latest instruction. No shared/server player database or paid service added.

A settings/help button now downloads emmichy-playtest.json with bounded reply routes, provider outcome and history. It is a user-triggered local download, not automatic upload. Existing plain conversation export remains.

Human check: call yourselfムッキー; discuss one character for three turns; correct a statement; request a different topic; ask about a word Emmichy used; start typing during a continuation. Confirm whether she is enjoyable, not merely whether checks pass. Remaining: free-provider quota/availability, general open-ended offline conversation limitations, physical phone interaction and subjective affection/amusement. A benchmark success does not establish those.
