# Current checkpoint — Nordic bust / verified eight-color tile, 2026-10-08

User supplied the braided Nordic woman and explicitly preferred the older naturalistic portrait over modern manga proportions. Three built-in imagegen drawing iterations; first and second drafts retained anime tendencies, second measured352,470 colors and cannot be called an8-color asset. Selected third drawing uses the approved earlier close portrait as the main style input. Preserve the old red-sweater asset.

Final build is a real indexed PNG,248×336 native pixels, exactly8 digital RGB colors, opaque. Dependency-free scripts/build-portrait.mjs area-averages the bust crop then applies ordered dithering; no generated intermediate colors survive. This tile fits the initial PC-9801's640×400/8-color limit confirmed by NEC. The HTML interface and CRT signal/pixel aspect are not a full hardware emulation. App renders the already-constrained tile at2× without smoothing or double dithering. Social metadata points at this same final PNG.

103 tests pass, including shipped-image palette/dimensions/index data/CRC; independent Pillow read confirms mode P and8 colors. Local desktop screenshot docs/portrait-20261008-local.png confirms head, bust and costume. Final source and full prompt/provenance/limitations are in docs/portrait-20261008.md. No live AI test or subjective-quality guarantee. Published: PR #10 merged asbbb61c1234348293ee3745d1930e1a999fbc6074 into pilot-audio-readable-retro. Pages run37787996559 success. Actual public browser loaded app.js?v=20261008-portrait1 and displayed the Nordic portrait; docs/portrait-20261008-public.png (portrait crop to preserve player-history privacy). Public PNG bytes equal the checked local indexed PNG, SHA2560acb00f942a5f01c398f0569fad28d00da0fc4284576727fe2380c97dfadccdb. Main unchanged. This post-release report commit updates evidence only, not runtime.

---

# Earlier checkpoint — user humor feedback, 2026-10-08

User explicitly rejected「半額王」as unfunny: NG, including future canned callbacks. This was an invented pilot nickname, not an established popular phrase. Removed its authored moves, both king/strongman memory IDs (including restored saves), and related royal endings. Also stopped the invented strongman/決戦 and pudding流派 series as fixed highlights. Ordinary pudding/spoon/chopstick context remains. The player-requested humor rule is durable in SPEC: established expressions/verified short fandom patterns first; spontaneous LLM or arrangement oddities allowed; do not promote an invention merely because recall works.

Client rejects provider outputs containing the banned nickname across kana/width/spacing variants without retrying. Local and public relay directions use this policy; stale assistant nickname lines are excluded from model history, user feedback retained. Prior on-screen saved history is preserved.102 tests and16 offline through-plays pass. Live provider fun is not verified. Review candidates and provenance caveats: docs/humor-review-20261008.md. The previously missing Nordic reference was subsequently attached; see the current portrait checkpoint above.

Published: Emmichy PR #9 merged as150c157, Pages run37785838813 success. Relay PR #3 merged as6d06589, deploy run37785849157 success (Worker version95c0a1c4-4a13-4b59-afc2-30d96c849d62). Main in Emmichy remains unchanged.

---

# Earlier checkpoint — departure reasons in idle farewells, 2026-10-08

Player found the fixed idle goodbye boring and reasonless. Idle farewell bypassed the existing100 reasons and grounded callback while still consuming their state. Removed that override: timed, idle and player-requested departures now use the same100 authored fictional reasons, five departure/farewell voices and at most one existing shared-joke or actually spoken daily callback. Nickname refusal is respected. No extra LLM request or new character biography. Existing five-minute/IME/visibility/save guards remain intact; release IDs updated through the app/session/endings imports.

100 tests pass, including100 nonrepeating idle reasons across serialize/restore, full saved farewell under160 characters, shared callback consumption, refusal and spoken-only music callback.16 offline through-plays finish. The old offline driver initially failed the automatic scenario because it simulated no elapsed time after the five-minute floor was introduced; repaired its fixture to advance17s per exchange,306s at18 turns. Successful and failed examples are recorded in PLAYTEST. Evidence docs/playtest-20261008-farewell.json and docs/playtest-20261008-farewell-through.json. Browser verification uses the shared renderer with explicit goodbye; idle timing is verified by the DOM/fake-clock test. Live provider and phone verification remain open. Follow-up publication targets the previously authorized Pages branch; main unchanged.

---

# Earlier checkpoint — continuous conversation layout, 2026-10-08

Player reported a large gap after ウンウン and a jump upward when the eventual AI/authored reply finished. The animated reply was a separate flex sibling below the scrollable history, then copied into history on completion. It now sits at the end of that same history with identical message typography, speaker label and spacing. Completion clears the transient row before adding the final text, and existing message DOM nodes are reused. The terminal note is visually hidden while busy without shrinking its layout space. App and stylesheet release IDs updated together.

97 tests pass, including animation inside history, retained preceding nodes, no duplicate final row, existing dictionary/IME/save-resume/end checks. Actual local desktop browser: delayed synthetic success at3s and failure at9s (two gestures plus authored waiting line then local fallback); visible message gaps22px and history height465px both busy and complete. Screenshot and measurements: docs/playtest-20261008-layout.png/json. Zero live AI calls; provider quality and physical-phone checks remain open. PR #7 merged as743fe44 into pilot-audio-readable-retro; Pages run37781500332 succeeded and the public browser loaded layout1. Main unchanged.

---

# Earlier checkpoint — Japanese-learning listening gestures, 2026-10-08

Supersedes first1s/second4s/long7s below: first2s, second5s, authored long line8s. Keep at most two short gestures plus one long line, cancellation, and300ms final-reply breath. Neutral first reactions are affirmative ウンウン／ソウネー／フムフム, with ニホンゴデ、ナンテイウンダッケ and short word-search hesitation in the pool. The ordinary longer database line also uses the Japanese-learning persona.

Local conservative lexical tone hints require clear joy for ワオ／エヘヘ／フフッ; setbacks can use エエッ, distress uses gentle listening. Uncertain/quoted/negated positive words do not imply joy, negative signals win mixed input. Topic and player-sound echoes remain available. No Jev dependency, AI classification call, or paid API. This is approximate tone detection, not general sentiment understanding.

97 tests pass, including2s/5s/8s timing, cap/cancellation/breath, neutral affirmative variation, Japanese hesitation, joy/setback/distress, mixed/quoted/negated/ambiguous language. Five-minute minimum and save/resume behavior remain covered. Live tone/latency naturalness, error1010 provider access, and physical-phone verification remain open. Authorized public follow-up targets pilot-audio-readable-retro; main stays unchanged.

---

# Earlier checkpoint — five-minute minimum and bounded fillers, 2026-10-08

Published follow-up PR #5 merged as 55148eb06c7da185886fe1f5a7ba4590a62f9bf9 into pilot-audio-readable-retro. Pages run37760470598 completed successfully (build/deploy/report all success). No new live-browser or provider naturalness claim.

Supersedes the 30s idle farewell and repeating 2s fillers below. Automatic endings cannot occur before five minutes of visible played time, including the former 18-turn cutoff. Explicit player goodbye remains immediate. Idle asides occur at 10s and 20s; the third stage waits silently until both five minutes have elapsed and the final 10s idle window has elapsed. New input/IME/activity resets the sequence, hidden/choosing/busy pauses it. The timer starts when initial input becomes available, not only after first submission; saved/resumed time excludes absence.

Hidden dictionary preparation text. Waiting uses a first short gesture at 1s, a different second at 4s, one authored medium line at 7s if still unresolved, then waits for the original bounded request. No additional requests. The final answer remains at least 300ms after the last gesture. New local waiting database has 14 lines across seven topic groups, with serious/negative handling and recent-line avoidance. Short gestures can echo a recognized topic or a player sound (ドッギャーン！ → えっ、ドッギャーン！？), or react with ！？ to surprise; distress stays gentle.

95 tests pass: five-minute boundary through app DOM/fake time, typing reset, hidden preparation, normal 18-turn minimum, two short gestures and one longer line, topic/repetition/surprise/distress. Public follow-up is within prior explicit publication authorization and targets pilot-audio-readable-retro, not main. Live latency/naturalness, provider access error1010 and physical phone checks remain unverified. No paid APIs.

---

# Earlier checkpoint — waiting and inactivity pacing, 2026-10-08

Follow-up PR #4 merged into the already-authorized Pages branch, merge 6eddcf8ee275a10234c8dc0f8fe220fe2ae25849. Pages run 37746456285 succeeded. Subsequent live browser reload verification could not complete: computer-use transport disconnected and recovery timed out. Do not claim visual confirmation for this change; deterministic timing and DOM behavior have the test evidence below. Public instructions now mention the 30s inactive farewell exception to the usual session length.

User playtest requested repeated waiting gestures and a resume chooser at the input location. AI waiting: first filler after 1s, then a different short filler every 2s while unresolved; cancel queued fillers before the answer and reserve at least 300ms after the last shown filler. Existing 300–800ms reply pause also satisfies that spacing. No extra AI calls.

Inactivity: first aside 10s after last input/action or completed reply, another distinct aside after another 10s, then 「そろそろ帰るね。バイバイ！」 after a third 10s. Input, keydown, IME start/end and pointer actions reset the sequence. While composing, busy, hidden or choosing resume, it cannot advance. A stopped nonempty draft also counts down; idle farewell does not erase it. Returning to the visible page restarts the countdown. Old 8s time-end polling was removed; normal ending still follows completed turns. This requested idle farewell can occur before ten turns. Finish state saves before typing animation.

Continue/restart chooser occupies the usual input slot beneath conversation. Input form is hidden until a choice, focus goes to Continue then back to Entry. 93 tests pass, including fake-clock filler repetition/cancellation/spacing and DOM-level IME pause, draft inactivity, three stages, saved farewell and chooser visibility. Browser/live-provider timing and physical-phone verification remain to be checked. Follow-up public reflection is within the authorized candidate scope.

---

# Earlier checkpoint — authorized public candidate, 2026-10-08

User explicitly approved reflecting this completion candidate into the public game after being told the former public version lacked these changes. PR #3 merged into the existing Pages source branch pilot-audio-readable-retro, merge 4a2dcf87360b213f5f1c1e3ea6cf5af3a71c8120. Main need not change: Pages already publishes this branch. Pages build/deploy run 37745240905 succeeded. Game tests rerun before release: 92/92 pass.

Actual published browser https://mukkii-game.github.io/emmichy/ loads src/app.js?v=20261008-ready1 and enables input. Synthetic input 「漫画ではなく音楽の話がしたい。ピアノが好きです」 received the authored music reply about learning humming before all lyrics, without unsolicited fandom. Reload displayed the continue/restart chooser; Continue restored both input and response and enabled further input. This verifies latest public startup, one authored exchange and saved-history restoration, not a full new browser through-play. No live AI calls in this check. The earlier latest-module preview delivery blocker is superseded for these checked public paths.

Remaining: live AI quality/access rejection diagnosis, full latest-browser through-play, physical smartphone IME/keyboard/audio and subjective fun. No paid API added or protection settings weakened. The candidate is available for the user's playtest; do not call it a fully validated final release. Earlier checkpoints below are historical and their no-public-integration wording is superseded by this authorization and release.

---

# Earlier checkpoint — server diagnosis and rate-limit restoration, 2026-10-08

User asked us to investigate rather than delegate technical health checks back to them. Read-only Cloudflare control-plane run 37743437929 confirmed the public Worker enabled and the repaired version deployed. AI/provider-key bindings existed, but RL was absent; deployment logs explicitly warned that old Wrangler ignored `ratelimits`.

Fixed relay deployment in game-llm PR #2: pinned project/lockfile and deployment action to Wrangler 4.36.0, the documented minimum supporting ratelimits. 25 relay tests and dry-run passed; dry-run includes RL at 20 requests/60s. Authorized relay merge fa64617 deployed in successful run 37743729349. Read-only verification run 37743902011 confirms RL/AI/both provider keys present, workers.dev enabled, and version d0458ac3-23c7-4ccd-b820-26ad9fd0fbf0 active at 100%. Evidence docs/playtest-20261008-control-plane.json. No public chat calls or paid API additions.

Public-client error 1010 remains unresolved and live AI quality remains unverified. Official Cloudflare docs identify 1010 as client/browser-signature access denial; this does not establish ordinary-player accessibility. Management browser reaches sign-in but verification fails after one reload; no authenticated session or security-event detail is available. No security settings changed, no fingerprint/route workarounds. Do not ask the user to interpret technical health results again. Remaining decision: retain live AI/latest-screen checks as explicit candidate limitations, or arrange authenticated Cloudflare administration for deeper access diagnosis. Smartphone verification stays deferred. Game main/public unchanged; PR #3 remains the candidate.

---

# Earlier checkpoint — bounded completion goal, 2026-10-08

Relay follow-up authorized and saved separately: https://github.com/mukkii-game/game-llm/pull/1, code d08bdaa. PR merged and deployed on 2026-10-08 with user authorization, merge 6ddf822. Per-provider 5s Emmichy waits, bounded Workers AI wait and message-context validation of unsolicited fandom redirects. Shared defaults/models/keys/CORS/deploy workflow preserved. 25 relay tests pass.

Local client→worker contract verification passed valid answer, rejected redirect→next valid provider, client-side 429 stop and 502 cooldown. Mocked providers, zero live requests; docs/playtest-20261008-relay-contract.json. Container health probe still times out. A direct POST without Origin or raw.githack Origin would be rejected if it reaches the current allow-list; this does not prove production endpoint failure.

Relay deployed successfully by run 37741421196, Worker version 01c35ad6-6eeb-41d0-91ed-bcd8f417eaff. Game candidate remains on PR #3; its public version is unchanged. User authorized relay integration/deployment in the latest instruction; do not ask again. Smartphone checks remain deferred.

Bounded live smoke run 37741701113 stopped on non-JSON HTTP403 health. One diagnostic run 37741811205 captured `error code: 1010`. Both stopped before any AI call (chatRequests0). Browser direct health navigation was also blocked by client; container HTTP health returned403. No conclusion about live AI answer quality. No security-setting changes or fingerprint/route workaround. Superseded by the later control-plane checkpoint; do not delegate technical health interpretation back to the user. Do not repeat blocked probes. Evidence docs/playtest-20261008-deployed-relay.json.

User supplied /goal to finish the candidate, verify dialogue/hybrid/save-resume, preserve PR #3 and defer mobile verification. This tool session cannot inspect or activate the platform Goal lifecycle; no persistent background run is claimed.

- AI-unavailable fallback recognizes rain, walks and drawing with nine authored reactions and recent-history avoidance. It runs after, not before, the live-AI opportunity. Unsupported questions admit uncertainty without a new question; acknowledgement of that boundary does not trigger a generic follow-up.
- Protected authored/personal/emotional/math/ending replies remain untouched. Negative/unsafe topic statements are excluded. Truly unmatched inputs still use legacy fallback; these nine lines are not general language understanding.
- Final resolved state now saves before typing animation, closing a reload window where turns were saved but the reply was not. DOM test checks persisted rain reply during animation scheduling. Save/resume preserves chatHealth and dialogueUse; new play clears those session counters.
- Verification: 92/92 tests, sixteen offline complete sessions including disconnected daily/open-question flow, no live AI calls this step. Evidence docs/playtest-20261008-finish-offline.json. Syntax/whitespace checks pass. Physical smartphone verification is deferred.

Candidate 48c29ed browser verification was attempted. HTML/CSS load, but module URL src/app.js?v=20261008-ready1 returns a site-served HTTP429 page when inspected directly. Submit clicks did not add dialogue or save history. This is a preview delivery blocker, not a successful browser through-play or evidence of an application syntax error. No visual certification for these newest changes. Prior candidate browser evidence remains historical only.

Live provider quality remains unverified since the last network attempt failed. Smartphone verification is deferred. Relay diagnosis and release were subsequently authorized; game public deployment remains prohibited. No persistent background execution claimed.

---

# Current checkpoint — suitability-first routing, 2026-10-08

User explicitly deferred smartphone real-device verification; it is a remaining issue, not a reason to suspend accessible development.

- Removed AI/bank minimum-per-play quota. Existing authored suitability decides routing independently of usage counts; open questions remain AI candidates, but accurate prepared replies no longer incur calls just to satisfy a ratio.
- Covered factual questions reuse an accurate fact after reply-family exhaustion. Twenty repeated gum-property questions stay local and accurate; unknown weaknesses/analysis still have no canned answer.
- Removed unconditional knowledgeFallback from the screen and offline driver: previous fandom memory alone must not overwrite an unrelated new input.
- Regression checks cover denied purchases/preferences, loss, unfamiliar daily observations, explicit topic switches and technical explanation requests. Actual DOM submit test also checks switching away from manga without unsolicited bank content.
- Verification: 88/88 tests; 15 offline through-plays finish with nonfan guards and ten fixture sequences distinct; syntax and whitespace checks pass. Evidence docs/playtest-20261008-routing-offline.json. Real AI calls 0 this step; no workflows, deployment or public integration.

Remaining work: improve natural fallback on truly unfamiliar inputs when the relay is unavailable; verify live response quality when reachable. Physical IME/keyboard/audio remain deferred. No artificial AI quota, universal replay-quality claim, or background-running promise.

---

# Current checkpoint — hybrid routing audit, 2026-10-08

Actual implementation resumed in the single authorized development session.
- Separate session.chatHealth counters track network attempts, accepted responses, quality rejection, failures and AI-to-authored replacement. dialogueUse.ai remains displayed AI replies, not communication count.
- HTTP429 disables further requests for the current play, including reload/continue; a genuinely new play resets it. Other transport failures pause requests for 60 seconds. Authored/rule play remains available, with no provider retry.
- Through-play exposed a LOCAL fandom redirection after music repertoire exhaustion, despite earlier variation claims. Exhausted everyday topics now reuse on-topic material rather than falling through to unrelated bank content; polishing cannot substitute unwanted fan candidates after an explicit topic switch.
- Full tests 86/86; 15 offline through-plays end, ten reply sequences differ, and every non-ending reply passes the explicit nonfan redirect assertion. Variation is fixture-limited; after exhaustion some authored lines repeat deliberately.
- One live open-input attempt returned no response (transport/timeout failure). No successful live quality evidence or free-account billing verification. Raw evidence: docs/playtest-20261008-hybrid-live.json and docs/playtest-20261008-hybrid-offline.json.

Remaining completion blockers: reachable live AI quality verification; physical mobile IME/keyboard/audio. Neither is certified by mocks. Public/main untouched; work remains on PR #3. No background execution or Director wait is implied by this checkpoint.

---

# Current checkpoint — release candidate hardening, 2026-10-08

Continue in the single Web Work session; do not resume Director Relay. PR #3 remains the review branch; main/public integration is not authorized.

Completed:
- The game no longer locks input when the reading dictionary fails. Existing reading fallback displays original kanji with kana and preserves input/log/export text. Missing or throwing dictionary setup resolves safely.
- Explicit nonfan/topic-switch requests reject unsolicited Chiikawa/JoJo/Baki name injections from the model, using the last eight user messages until a new explicit fandom topic. No retry or additional provider call. This is a conservative response guard, not a claim that general AI quality is fixed.
- Sound OFF now mutes already scheduled tones immediately; re-enabling restores gain and keeps one BGM timer. Audio-start errors are surfaced without leaving a false ON label.
- Offline driver now checks normal/quiet/corrective/music/automatic endings plus ten serialized/restarted plays of the same 12-input scenario. All ten complete reply sequences differ. This proves variation for that four-topic fixture only, not universal uniqueness or subjective fun.

Verification: 83/83 tests, including screen submit after dictionary failure, IME composition suppression, audio mute/timer lifecycle, and the captured nonfan failure response. Fifteen offline through-plays all end; raw evidence docs/playtest-20261008-offline.json. Syntax and whitespace checks passed. Real AI calls 0, workflow runs 0.

Browser limitation this turn: commit-pinned raw.githack preview returned HTTP429; the cloud browser cannot reach the local server (ERR_CONNECTION_REFUSED). Previously verified desktop preview evidence still applies to the preceding candidate; these new screen changes have DOM test evidence, not new visual certification.

Remaining gates: physical smartphone Japanese IME, keyboard-visible layout and audible BGM/SE; a small live open-ended conversation quality check; public integration approval. Physical-device observations cannot be replaced with mocks. Human playtest candidate is READY; final public release is not certified. Ask only for a short final device check and explicit publication approval after the remaining accessible checks.

---

# Current checkpoint — playable completion candidate, 2026-10-07

Candidate f57c46e is saved on PR #3's head branch. Actual desktop browser through-play is now verified via the commit-pinned raw.githack preview (not main/production). The earlier local-browser access blocker was resolved by using this reachable public source preview.

Verified in the actual screen: dictionary readiness, kanji/hiragana entry, 12 exchanges, nonfan music kept on-topic, music farewell callback, reload/continue preserving ended history, readable original-log restoration, export, restart and a different second computer arc. A proxy-image canvas taint was detected and fixed with anonymous CORS loading. Saved evidence: docs/playtest-20261007-browser.json, browser-export.txt, candidate-ui-20261007.jpg.

All 79 tests passed; five offline through-play scenarios and ten distinct two-beat arcs per everyday topic passed. No provider/deploy configuration changed. One direct AI probe was a quality failure; candidate recognized music entrance uses authored material instead. Human through-play candidate READY, but full hybrid quality, physical mobile IME/audio and ten fully distinct whole-game chains remain unverified. Do not claim a final public release or provider-wide quality fix.

Single-session development, Relay paused. Main/public unchanged. This is the concrete candidate to assess/play; the remaining work is quality verification of open-ended AI and physical devices, not another Director handoff.

---

# Latest checkpoint — completion candidate, 2026-10-07

Candidate work completed locally and prepared for PR #3 storage:
- 80 original everyday beats: 4 topics (computer, meal, book, music), 10 two-beat arcs each. User statements receive a specific authored reaction; short acknowledgements continue only a premise that was actually spoken. Questions, denial, distress and teaching remain outside these arcs.
- Usage IDs are preserved via existing bounded repertoire state through save/restart. Tests verified 10 distinct two-beat arcs per topic after serialization/restart; this is limited-topic evidence, not a guarantee of 10 wholly different full games.
- A genuine everyday topic can appear at farewell only when an associated authored line was actually spoken. Existing shared-joke callbacks take precedence.
- All changed module cache identifiers updated to avoid mixing old/new state cleaners.

Evidence: full tests 78/78; 5 offline scenarios end successfully (four 12-exchange sessions and one 18-exchange automatic ending). Actual raw results in docs/playtest-20261007-offline.json. One live provider request succeeded technically but FAILED quality by returning to chiikawa after a nonfan music preference. Full probe recorded in docs/playtest-20261007-live-probe.json. The candidate handles that recognized music entrance locally without invoking the model. General model quality is still not verified.

Concrete environment blocker: CUA browser cannot reach the local server (connection refused), and local Playwright has no browser binary; download returns invalid archives. Mobile IME/audio and candidate visual/hybrid through-play cannot be certified here yet. Do not call the game fully finished or the live-AI failure fixed at its provider.

Development remains single-session, automated Relay paused, no Director wait. Main/public unchanged. Next verification must inspect the exact candidate via a reachable preview if available, and keep physical-device checks explicit.

---

# Latest checkpoint — 2026-10-07 autonomous development

Loop6 recovery saved to PR #3 at 6e26db6. Git CLI has no GitHub credential in this environment; the authorized GitHub connector can save commits safely using an expected-head check.

Follow-up quality work:
- The screen and offline simulations now share preparedReply in src/routing.js. Grounded conversation moves win over unrelated bank/gap candidates and AI-use balancing.
- Shared-name consent/correction/refusal are explicit beats. 「その呼び方はやめて」 removes nickname consent so the ending cannot use the rejected name.
- Short replies inspect player distress rather than treating Emmichy's 「失敗じゃなくて」 as distress. 「まあ」 does not invent player disappointment.
- Explicit question fatigue is acknowledged even when the immediately preceding reply was not a question.

Validation: full suite 74/74; offline simulation normal / quiet / corrective players, 12 exchanges each, all reached farewell. Successful ending callback in normal, corrected nickname refusal in corrective. Full raw results: docs/playtest-20261007-offline.json; rerun with node scripts/playtest-offline.mjs. These are offline simulations sharing the screen selection function, not browser UI or live AI.

Remaining: quiet scenario still exposes generic rule replies on open inputs such as パソコン買った before the short answer. True hybrid quality, visual/mobile IME/audio and replay variety remain unverified. Chromium installation was attempted but download returned invalid archives; no repeat attempts needed unless environment access changes.

Next: improve ordinary open-input fallback/repertoire using these failures, then verify a browser-capable candidate. Do not restart Relay or require another Chat Director.

---

# Current development state — 2026-10-07

The user designated one session for Director, implementation and tests. All three existing Relay/watch automations were confirmed paused. No new autonomous Relay sessions are needed.

## Loop6 recovery completed

PR #3 head was bf23a02; it had DOING 6027119860 but no loop6 implementation commit or REVIEW. The local checkout contained uncommitted loop6 work on an older, divergent loop5 commit. That work was preserved in /tmp/emmichy-loop6.patch and recovered on the current PR head rather than discarding or replaying the stale local commit.

Short acknowledgements (うん/そう/まあ/まあね/へえ) now prefer authored non-question reactions to the nearest substantive user topic. Consecutive short answers retain that topic. Food requires an explicit eating/drinking context; school, fandom and computer-purchase replies have separate conditions. Distress does not get food/fandom jokes. Used variants are skipped; exhausted short-answer variants remain a short acknowledgement instead of handing control back to an AI interview. Existing SELF_CORRECT / half-price-king callbacks preserved.

Browser module version identifiers updated in the candidate only. main/public unchanged. No live AI calls, paid API or workflow runs.

Validation: targeted 11/11; full game suite 67/67; diff/syntax checks. Headless mobile UI attempt could not run because the installed Playwright package has no Chromium binary. No visual, real-device, audio or live-AI quality claim is made.

## Next completion work

1. Run the actual candidate UI through normal / quiet / corrective 12–18-turn sessions and examine ending callbacks and selection priority.
2. Improve multi-turn repertoire variation based on those logs; the 1,200-candidate bank alone does not prove ten-session variety.
3. Small hybrid-AI check only when it adds evidence, stop at 429; then verify mobile IME/audio.
4. Prepare a reviewable completion candidate; public integration remains separate from development.

HUMAN PLAYTEST READY: NOT YET for a verified hybrid completion candidate; local short-reply recovery is tested.

---

# 2026-10-04 共通AI中継への移行

- 本体: pilot-audio-readable-retro / Draft PR #1。main未統合。Pagesの配信元をこの試作ブランチへ変更し、公開試遊できるようにした。
- CHAT_API_URLは https://game-llm.mucky-totoro.workers.dev/api/chat/emmichy 。鍵・system promptはブラウザにない。旧worker/削除、server.mjs維持。
- AIサービスへの送信表示、応答元表示、読みやすい会話ログを追加。人物248×168・8色と絵柄は維持。
- 通常会話はAI優先。ルール時の全話題ちいかわ変換を撤去。名前・記憶・計算・終了はゲームで確定。
- performanceにtrust/curiosity/chiikawaPressure/hype/speechLeak/shisaWorry、speechStyleに固定6種を送る。サーバー側で数値範囲と列挙値を検証。
- 18往復/5分。興奮時は最大2往復・1分延長。入力・IME・返答中を避けて終了。再開時に演技状態をリセット。固定開始/映画10回目の固定終了を維持。
- Pagesで古いJSが混在する問題が出たため、モジュールURLへリリース識別子を付けた。今後ブラウザコードを変える公開時も識別子を更新すること。

## 検証と試遊

- ゲーム20件、中継10件の自動テスト成功。通信例外・502・429・不正レスポンス・通信なし指定、記憶・通常話題・終了・延長を確認。
- game-llmへの書き込み権限ADMIN確認済み。games/emmichy.jsと作品テストのみ変更し、main push、自動deploy成功。共通src/・client/は未変更。
- /healthで3プロバイダを確認。公開画面で「AI会話 / groq」と返答を確認。API実通信でGeminiのドラクエ返答も確認。
- 公開?nollm=1で18往復試遊し、固定エンディングまで到達。BGM+SEのON/OFF、390px幅の表示を確認。実端末の音の聴感・モバイルIMEは未検証。
- ブラウザ操作APIにネットワーク遮断機能はないため、物理的な回線遮断は実施していない。通信例外は自動テスト、公開画面では?nollm=1のルール動作を確認した。

## 悪かった例と修正

- 初期maxTokens=180でGeminiが「ドラ」「ワカル……！」等の断片を返した。作品だけ1024へ増やし、8文字未満を拒否。ドラクエの完結した返答を確認。
- Groqが「ヒトガ アシ リナイ」「マジ ツラツイ」など読みにくいカタカナを返した。temperature=.65、誤字・架空語は禁止、自然な文からカタカナへ変換する指示と短い会話例を追加。品質差は残るため継続試遊が必要。古い不自然なAI履歴がある場合、アソビカタ→記憶初期化で試す。
- ルールの「知らない」「以外」が漢字のまま残り開始/話題拒否を取りこぼした。読み変換へ追加。
- Groqで単語の間の空白がない長いカタカナも出た。25字以上連続するカタカナは読みにくさ判定で拒否し、次のプロバイダへ回す。意味・誤字すべてを機械的に保証するものではない。

## 次の判断

mainへはまだ統合しない。仕事/趣味/他作品から自然に会話が続くか、倒置や引用名詞が頻発しないか、AIとルールの品質差を試遊してから判断。LLMは事実検索をしないので新作・連載の具体的な最新展開を断定させない。


## 2026-10-06 読みやすい会話画面

- ユーザーの最新指示により厳密なPC88文字再現を緩和。肖像248×168／8色は維持、会話をDOMの全角等幅文字24px（モバイル21px）へ移行。会話履歴はスクロール可能。
- kuromoji 0.1.2／IPADIC辞書を同梱。入力の漢字・ひらがなはそのままAI／履歴に保存し、画面表示だけカタカナと単語間スペースに変換。未知語は原文を残し、?にはしない。辞書初回通信約18MB、第三者の著作権・ライセンスをassets/vendorに収録。
- GroqはxAIのGrokではない。表示名をGroq / Google Gemini / Cloudflare Workers AIへ明示。提供元の切替順は既存のまま。
- 23テスト通過（日本語入力保持・漢字読み・分かち書き・失敗時フォールバックを含む）。共通中継は変更していない。


## 2026-10-06 追記：画質・再開・ハイブリッド会話

- 肖像を同じ原稿から496×672／8色に拡張。会話書体はDotGothic16 24px。フォントのOFLはassets/fonts。
- 保存済み会話があると続きから／最初からを選択。最初からは会話・演技・タイマーをリセットし、名前／好みは維持。セッションをlocalStorageにも保存し、非表示・閉じていた時間は加算しない。5秒ごとのチェックポイント。
- src/curated.jsで短い定番話題に検証済みの台詞を選択。直前の同じ台詞を避ける。具体的な質問・説明や続きはAI。画面下で用意した会話／AIを区別。
- game-llm/games/emmichy.jsのみ、平易な通常日本語で生成する設定へ変更。クライアント側の同梱辞書でカタカナ表示するため、LLMに読み変換させない。意味不明な語・強引な名詞後置を演技にしない。Emmichyの順序だけGemini→Groq→Workers AI。共通src/clientは不変更。
- ニッチなオタク文化への興味、知識があと一歩足りない時の具体的な質問、教えられた内容を拾って喜ぶ性格を追加。説明らしい発言で好奇心と熱量を上げる。
- ゲーム29件／中継13件のテスト通過。AIの意味の正しさは完全な自動検証はできないため、公開試遊で確認する。

公開試遊：続きからで履歴保持、最初からで開幕へ戻る動作を確認。ストーリーの短い感想は「用意した会話」。FM音源の細かな話はGroqが知らない部分を質問し、教えるとGeminiが「それ知りたかった！」と説明の内容を拾って喜んだ。原文ログも自然な日本語で、カタカナはクライアントの変換。高解像度化で使う描画変換は毎フレームsave/restoreし、累積を防いだ。中継へpush前に他セッションの判定APIとGroq低推論設定を取り込み、どちらも保持。
## 2026-10-06 Facebookリンク画像

index.htmlにOGP／Twitterカードの静的メタ情報を追加。共有画像は既存assets/emmichy-portrait.png（1086×1448）を絶対URLで指定。画像・ゲーム挙動の変更なし。Facebook側で古いリンク情報が保存されている場合はSharing Debuggerで再取得が必要。実際のFacebook投稿は行っていない。

## 2026-10-06 会話ネタとファンの感情

- 出典付き120カード・27作品。ちいかわ32、ジョジョ20、ハンター20、ほか48。別にONE PIECEは薦めない好み設定。正本src/fandom.js、game-llm/games/emmichy-fandom.jsへ同一コピー。
- サーバーがinputと固定値のknowledgeから最大5件を選ぶ。ブラウザの自由な資料・プロンプトは採用しない。共通src/・client/は未変更。
- 明示作品と具体的なキャラを優先。映画は一般的なちいかわ話で連投しない。最近のカードを回避。ニュースには期限、重大なネタバレには許可。自動巡回・日々の最新話取得は未実装。
- 島二郎を虎のしまじろうと取り違える不具合対策。水流、素潜り、カレー、サパー、作者インタビューを根拠に、具体的な場面を思い出して熱くなるファンにする。
- 短いユーザー指定の改変フレーズと自作の会話。長い原作台詞を蓄積して再現する仕組みにはしない。出典と創作感想の一覧はdocs/fandom-sources.md。
- ゲーム35件・中継14件のテスト成功。具体作品、映画連投防止、島二郎の区別、ONE PIECEの扱い、報道期限・ネタバレ・不正stateを確認。
- 公開AI試遊で島二郎の水流を腹から出す誤描写を検出。資料と演技例を手を回す描写へ統一し、明示された水流への好意は確認済み3台詞から選ぶ合わせ技にした。具体的な質問はAIへ。ゲーム36件・中継14件成功。

## 2026-10-06 返答バンクと文化を教える楽しさ

- 出典付き事実120件とは別に、書き下ろし反応600件（既存120＋新規480）、事実を添えた回答600件、合計1,200候補。ちいかわ320、ジョジョ200、ハンター200、ほか480。docs/dialogue-bank.jsonに全件、docs/repertoire.mdに運用方針。
- 短い感想と確認済みの限定的な質問は用意した会話。分析・相談・教わる会話はAI。関連する事実と創作表現をサーバーから提示し、自由なブラウザ指示は受け取らない。
- 使用ID・同じオチのfamily・テキスト類似度で繰り返しを抑制。具体的な話題（水流など）を別話題に逸らさない。候補が尽きればAIへ。
- 日本文化を知らない人にも具体的な好奇心と、説明の内容を拾う喜びを表現。オフラインでは教わった説明を引用・帰属し、真偽を断定せず喜ぶ。
- ユーザー指定の短い漫画風改変を日常の無害な場面で時々使用。深刻な相談には使わず、同じネタは再利用しない。
- 演技・プロンプトはgame-llm/games/emmichy.jsのみ。scripts/sync-dialogue.mjsで所有データ4ファイルを同期。共通src/client不変更。
- ゲーム43件・中継15件、計58件のテスト成功。新たな有料サービスやAI呼び出しの増加なし。

公開試遊（mix1）：文化の説明にGroqが感謝の意味を拾ってお礼を返す。漫画は詳しくないと伝えて食べ物を教える申し出には、用意した会話で給食の好き嫌いについて質問。その学校の工夫を説明すると、AIが食べやすくなる点に反応。Geminiの能力説明も正常受信。Pagesと中継の自動公開成功。

## 2026-10-06 待ち時間の相づち

AIへの問い合わせが1秒を超えると、一時表示に短い相づちを一つ表示。直近4種類を避け、相談には穏やかな相づち。回答到着時にタイマーを取り消して表示を消し、本回答へ。履歴・AI入力・保存には入れず、追加のAI通信や音はなし。THINKINGと考えています表示を削除。ゲーム45件のテスト成功（待ち時間と取消競合も検証）。

## 2026-10-06 会話バランスと関心
1プレイの成功AI回答・用意した会話を各1回目標として計数。3往復以降AI未使用なら通常のバンク返答をAIへ。4往復以降バンク未使用なら適切な感想候補を優先。相談・未知の質問・教わる話は無理に差し替えず、AI障害では達成を要求しない。初期固定台詞は数えない。
作品名の言及は弱い関心、明示の好みは強い関心、苦手は負のスコアとして固定作品IDでブラウザに保存。中継に必要な状態として送り、サーバー所有の作品名と範囲内の数値のみ演技に使う。クラウドへの永続保存・ユーザー横断の共有は未実装。ゲーム47・中継15テスト成功。
フィラーをウ、ウン…／ヤハ…／エト、エト…／ンショ…／フムッ…／ウンッ…へ変更。作品を連想する短い声で、本人を名乗らず、相談時は普通の穏やかな相づちを維持。4件の関連テスト成功。

## 2026-10-06 長い待ち時間と終了
- AI待ち1秒の短い声に加え、10秒で一度「ちゃんと答えたいの。もう少しだけ」等へ。一つの問い合わせ内で話題を勝手に変更しない。回答到着で両タイマー取消、履歴不保存。
- 従来の5分または18往復の自動終了に最低10往復条件を追加。盛り上がりの猶予は既存通り。さようなら／バイバイ／またね／今日はここまで等で任意に早期終了。画面に常時ヒント。
- 自作のアニメ漫画関連終了理由100種類。任意終了にも使用。直近99種類をブラウザに保存して重複回避。放送予定などの実在予定を捏造せず、読書・鑑賞・グッズ・語学・友達との創作設定。
- ゲーム50テスト成功。10往復前に時間終了しない、100種類の一巡重複なし、引用質問では終了しない、10秒タイマー取消を確認。
入力なしで10秒空いた時にも一度だけ別話題の誘いを一時表示。入力中・変換中・非表示・終了後・AI待ちには出さず、入力再開で消す。相談直後は急かさない言葉。

## 2026-10-06 開幕のバリエーション
40種類の自作の今日の楽しみ・文化への疑問に、初対面／再会の挨拶各5種を合わせる。直近39の状況IDを保存し、初期画面・最初から・終了後の挨拶・通常の挨拶で使用。開幕本文も履歴へ入れ、次の話をAIが理解できるようにした。実在イベントの日程や入手経路の事実は主張せず、キャラの架空の予定とする。ゲーム51テスト成功。途中は返答family／類似度、待ち時間は直近フィラー、終了は直近99理由で繰り返しを抑制。LLM自由文の永久完全一致禁止は保証しない。

## 2026-10-06 起動時の未変換文字
辞書準備前の会話描画をカナの準備メッセージに置き換え、変換完了後に履歴・開幕を表示。ライブ表示も準備前は抑制し、送信は辞書完了まで待つ。辞書失敗時も漢字の原文を露出させず、カナで再読込を案内。入力欄と読みやすい履歴の通常日本語は従来どおり。構文検証成功。

## 2026-10-06 サモンの文脈と未知の名前
src/context.jsに公式TMS確認の左門豊作補助資料を追加し、巨人の星の直前の質問への短い回答を認識。検索は中継のEmmichy専用モジュールでWikipediaへ、対象は既知の作品文脈の未知の短い名前に限定。全文送信なし・検索失敗は確認質問。共通src/index.jsは非同期メッセージ待ちのawaitのみ、game-llm/HANDOFFに共有部分変更を記載。ゲーム52・中継18テスト成功。sync-dialogueにcontextを追加。

公開試遊で巨人の星→サモンが左門豊作として返ることを確認。名前のカナ表示にも左門／左門豊作、飛雄馬／星飛雄馬の指定読みを追加。

## 2026-10-06 分かち書き
箱根そば／はこねそば等をハコネソバに指定し「は＋こね」の誤分割を防止。接頭詞の次の語は結合してオミセ／オチャ等に。非自立の「の」＋「か」はノカに。通常の助詞の空白は維持。原文の意味・AIへの入力は変更せず表示のみ修正。実辞書を用いる4件の表示テスト成功。

## 2026-10-06 会話の重なり
返答途中の黄色い領域と履歴の間に18pxの余白と4pxの内余白。ライブ領域を縮ませず高さをパネル40%までに制限し、履歴側のスクロール領域を分ける。文字が増減してライブの高さが変わる時は履歴の末尾を追従させる。履歴下端にも6pxの余白。構文検証成功。
# 2026-10-06 フィラーも会話として保存

ユーザーの追記を優先し、1秒・10秒の待ち時間の声と、無入力10秒の一言は黄色い通常の発言として残す。返答後も消さず、再開・テキスト書き出しにも含める。待機中の保存には現在の質問と出たフィラーだけを含め、未確定の本回答は保存しない。確定時は質問→フィラー→本回答の順序を維持。既存の直近40発言の保存上限は維持する。旧記載の一時表示扱いはこの変更で撤回。ゲーム54テスト成功。
# 2026-10-06 Chatディレクション共同ループ1（レビュー待ち）

- 開始時に本体pilot-audio-readable-retro、relay mainと未コミット3ファイルを確認。fetch後もSPECが存在しないことをユーザー確認済み。未コミット変更を保持して本体codex/dialogue-loop-1、relay codex/emmichy-dialogue-loop-1へ分岐。公開版・mainには反映しない。
- SPEC.mdをユーザーの最新方針から新設。PLAYTEST.md、生ログJSON、再適用ログJSONを新設。最新のChiikawa＞JoJo≒Bakiを採用し、既存ハンターバンク・最低10往復・5分目安・フィラー保存は維持。
- 小変更：署名／話者ラベル除去、質問2連続時の優先指示と局所的な末尾質問削除、AI文脈最大24発言（受信した履歴の初期8＋最後16）、訂正時の確信抑制、会話の続き・日常と漫画の温度差への指示。普通の相づちを中心に変更。元の序盤演技の途中変更も保持。共通relay src/client変更なし。
- 検証：ゲーム56・relay21テスト成功。普通／無口／ツッコミ各12往復の実中継会話。33問い合わせ中22成功（Groq）、11null。bye3件はengine処理。UI全体・バンク選択・実時間・エンディングは試験ドライバの対象外。
- 代表例：「王はスプーンを忘れた」→後で「何を忘れた？」に思い出せない。無口12返答の9が質問を含む。半額の強者→財布と忍耐力は多少可能性があるが、ユーザーがネタを振り直した結果。詳細はPLAYTEST。
- 修正のログ再適用で質問は無口9→8のみ。署名・履歴・訂正の回帰チェックは通るが、新プロンプトの実AI品質比較はまだ行っていない。完成や面白さの改善を断定しない。
- 気になる点：履歴40発言上限にフィラーも入るため、長いプレイでは序盤が落ちる。質問削除だけでは新しい遊びが生まれない。通信失敗時のengineはプレイヤーの「元気出た」を誤解する。共有語専用の状態・UIの一回の事件・素になる瞬間・終幕回収は未実装。
- Chat側の判断待ち：共有語の記憶と小さな共同の行動を先に作るか、非AI返答を先に改善するか。新プロンプトの本番比較かテスト経路か。次ループで中盤の事件／終幕回収のどちらを先に試すか。今回のレビュー資料を渡す段階で止め、全面改修へ進まない。
# 2026-10-06 ループ1追記：無入力時の漫画への誤誘導

ユーザー報告「吉野家のチーズ牛丼の会話後、漫画じゃなくてもいいの」はLLMではなくappの無入力10秒の固定文。話題を見ない漫画への誘い・難しい質問だったという決めつけを撤去。filler.jsのidleAsideで直近ユーザー発言が食事なら食事の一言、それ以外は話題に中立の一言。相談は急がせない。ログ保存は維持。旧漫画→現在食事、一般話題、相談のテストを追加し57件成功。レビュー用codex/dialogue-loop-1へ追記、公開ブランチ未反映。
# 2026-10-06 分かち書き追記：ツクッ テタ

実辞書で「作ってた」の「て」が助詞ではなく非自立動詞と判定されることを確認。直前の動詞へ縮約のて／でを結合し、て＋補助動詞いるも結合。「ゲーム ヲ ツクッテタ」「ツクッテイタ」「タベテタ」「ミテイタ」へ。他の節「タベテ カラ カエッタ」「アルイテ イッタ」の空白は維持。表示のみ変更。レビュー用codex/dialogue-loop-1で保持。
# 2026-10-06 同名への本人としての反応

ユーザー報告「女の子の名前がEmmichy」に一般的なキャラ設定質問を返す件。context.jsで同名の紹介を検出し、自分と同じ名前への驚き・親近感・照れを3種の用意した会話で優先。相手キャラと同一人物とは断定しない。既出は回避、使い切りはAIへ。同じ気付きの補助指示をサーバーのcontextへ同期。名前の否定・別話題の誤反応をテスト。改善用ブランチ、公開未反映。
# 2026-10-06 本人のアイデンティティ

17歳・長い金髪の欧米人女性・日本語学習中をSPECとserver promptへ明記。話に合う一面のみ、本人の具体的な感想・立場・自己開示として混ぜ、毎回の自己紹介はしない。開幕の楽しみと教わったことから現在の関心を維持。仕事への反応で長年働いた経験を捏造しない。言葉を教わった時は使い所への気付きと会話中の試用を促す。国・都市・家族は勝手に設定追加しない。改善ブランチの未公開指示案であり、実AIの効果比較は次ループ。
# 2026-10-06 ループ2：Issue mailbox運用・レビュー待ち

- Issue #2のDirector TODO 6013762648を読み、SPEC/DECISIONSへEmmichy限定のmailbox運用を反映。AGENTSのf12909eを既存変更を保って取り込み。作業はcodex/dialogue-loop-1、relayはcodex/emmichy-dialogue-loop-1。公開pilot/mainは変更しない。
- 半額プリンの重点ケースを最大4個の固定IDで記憶し、保存・復元・否定・あだ名拒否・訂正・最初からに対応。サーバーは自前の固定文だけへ変換。自然な接続の指示と4往復の間隔を追加。一般の自由な共有語はまだ対象外。
- 終幕で成立した共有語を一度回収。例「半額王、次はスプーンも装備してね」。従来100種類の終了理由は維持。ルール側の「ちょっと元気出た」を本人の回復として扱い、否定・質問・他人と区別。
- ゲーム63・relay23テスト成功。新旧3タイプ×12往復、66実AI問い合わせを記録。ただし成功は旧14/新1で429多数、旧先行の偏りもあり、品質比較は成立しない。2問い合わせの診断は両方Groq成功だが両方まだ薄い。
- 追加4場面では3件制限で本文なし。無口場面はGroqが3連続質問、整形で削れたが本文は一般的。自発callbackや作品訂正の実AI品質は未確認。代表ログ・失敗・試験の限界はPLAYTESTとdocs/playtest-20261006-loop2-*.json。
- 実通信専用relay branch codex/emmichy-ab-runはdeploy.ymlをテスト専用に置換しているため、mainへ統合禁止。SecretsはActions内部だけ、ブラウザには渡していない。Workers bindingなしで未試験。共通src/client変更なし。
- 判断待ち：長くなったpromptを整理して制限条件を揃え再比較するか。重点ケース固定IDを他の共有語へ広げる前に、終幕の言い回しと質問以外の続けたくなる反応をレビューしてほしい。中盤UI事件・全面完成は未実施。Issue #2へREVIEWを返してこのループを止める。


## 2026-10-06 ループ3：非質問返答の重点修正

- Issue #2 TODO `dialogue-loop-3-20261006` をCloud Work 1回で実行。自動化累計2回（スモーク＋本ループ）。実AI問い合わせ0件。
- 既存PLAYTESTの3重点fixtureだけに、具体的な観察・軽いツッコミ・短い自己開示・共有ネタ化を各3候補追加。漫画を知らず仕事で疲れた場面、プリン後の短い「うん」、半額王のスプーン忘れと箸でプリンが対象。
- 終幕callbackは成立した固定ID一つを短く回収する方針を維持し、半額王＋スプーン、半額王のみ、半額の強者、箸でプリンを各3候補へ。セッション中一度だけの制約は維持。
- 一般共有語、UI中盤事件、main/public、共通relayは変更なし。64テスト成功。公開UIと実AIの自然さは未確認。
- 次の判断：PLAYTESTの前後9組と寒い可能性を人間レビューし、会話を続けたくなるか、仕事疲れへの比喩が作為的でないか、終幕3案の温度を決める。未知話題への一般化はまだ行わない。


## 2026-10-06 ループ4：会話ムーブ選択・レビュー待ち

- dialogue-loop-4-20261006 / TODO 6015038720。DOINGを先に記録。同識別子の先行実行なし。
- src/moves.jsで5ムーブを選択し、一返答一ムーブ。自己訂正は直前の質問がある場合だけ。深刻な場面で遊びを抑制、質問/否定/訂正は通常経路へ。永続状態・一般共有語は追加なし。
- contextのfixture候補群を小さな原則へ置換。プリン短答と王の装備忘れ、箸の流派一文は回帰確認。Directorが保留した比喩や永続記憶約束を撤去。
- 未知5入力と寒い例はPLAYTEST。65テスト成功、実AI0件、公開UI未試験。main/public/relay未変更。
- Cloud Work本ループ1回。重複受付を含む確認済み累計は少なくとも4回（旧累計2回を総数として撤回）。正確な利用枠・料金は未取得。
- 次は抽象的な「伝わる」「輪郭」をどう扱うか、軽い失敗の茶化しの許容範囲をDirectorが判断。未指示の拡張はせずレビュー待ち。


## 2026-10-06 ループ5：文体品質・レビュー待ち

- dialogue-loop-5-20261006 / TODO 6015216091。DOINGを先に記録。同識別子の先行実行なし。
- 5 moveと一返答一moveを維持。「伝わる」「輪郭」等の抽象評を、口が食べる準備をする、積読の下から本を抜く等の本人の具体反応へ置換。
- LIGHT_TEASEは笑い、軽い被害、代替手段、共有ネタのいずれかが本文・状態にある時だけ。文脈なしの「傘を忘れた」は通常経路へ戻す。半額王＋スプーンの既存共有ネタは維持。
- 上履きへ欧米人の小さな文化差を一面だけ返す例を追加。SELF_CORRECTと「ひと息」の日本語学習反応は維持。一般記憶・UI事件なし。
- rule-only代表6例と安全側nullをPLAYTESTへ記録。ゲーム65テスト、app構文、差分検査成功。
- 実AIは非公開のgame-llm/codex/emmichy-ab-runでloop5原則をsystemへ追加し、専用Actions run 37456682009だけを実行。短答は1件成功したが、ちいかわへの逸脱＋質問でAI臭い失敗。次の忘れ物ケースでGemini 429となり即停止。日本文化ケースは未実行。2ケース、provider呼出3回、成功1、timeout1、429 1。main/public/deployなし。テスト用workflowは手動実行専用へ戻した。
- Cloud Workは本ループ1回。コメントから確認できる累計は少なくとも5回。次は長いsystem指示を増やすより、AI短答の優先順位とrule-onlyの具体文をレビューする。
