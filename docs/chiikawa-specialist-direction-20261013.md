# Adopted knowledge-first specialist direction — 2026-10-13

The human proposes committing the pilot to an unusually knowledgeable Chiikawa fan: manga/anime/movie, goods, foods, park/events and sourced fan analysis, with small excursions into other otaku topics, Japanese learning and current Japan, and an affinity for returning to the movie. The user subsequently adopted the knowledge-first design: build a precise specialist bot, then add limited-Japanese expression, otaku interests and the owned Nordic identity without reducing knowledge or dialogue accuracy. SPEC.md records this as the current design authority. This is an adopted design and gap list, not a claim that the specialist runtime or factual coverage is complete.

## Product

A friend who has lots to say about one world, not a generic chatbot or an official-sounding FAQ voice. Knowledge should be precise, reactions personal and lively. Remain on the player's current character/scene until their question/correction is resolved. The movie is her favourite destination; do not force that pivot midway through a grass-weeding examination discussion. Side topics need a real connection and must not become random biography/news announcements. Preserve her fixed Swedish/Japanese-learning identity, 半額王 rejection, free browser access and player refusal boundaries.

## Development and evaluation order

First test a neutral specialist conversation using the same verified evidence, then add Emmichy personality and compare the same questions/corrections. Knowledge, conversation state and personality are separately evaluated responsibilities; this does not require two model generations per player turn. Her limited Japanese affects wording, never basic comprehension or canon facts. Nordic individuality comes from the owned Swedish biography and concrete tastes, not assumptions about nationality/gender.

## Replace the conversation architecture

1. One speaker: the model produces the answer and reaction. The UI owns pacing and input interruption. The local DB provides evidence and a short, scoped failure path; it must not repeatedly replace otherwise valid answers with standard paragraphs.
2. Resolve the turn before retrieval: current work/character/scene, question, correction, repeated-material complaint, invitation and pending question. Numeric grades are not character names. A complaint about a repeated line is not rejection of all Chiikawa discussion.
3. Evidence schema: id, subject/action/object, media/arc/episode, aliases, related IDs, source URL, checkedAt, validFrom/validUntil, spoiler, status (official fact / sourced interpretation / personal opinion / unverified). Product dates/stock and events expire; manga and movie differences remain explicit.
4. Retrieve a few relevant records and adjacent angles. Keep scene IDs, corrections and previously delivered fact IDs/opinion angles. The fact of who speaks a catchphrase is useful as a constraint, not a new fact to recite every turn.
5. Deliver a specific answer, then a personal reason/reaction, optionally one continuation on the same subject. Full post-generation replacement is reserved for an invalid claim. Do not repair one false claim by silently inventing a different scene.
6. Knowledge refresh is separate from each player turn. Use small verified source snapshots and existing Claude/Gemini research; do not automatically ingest raw articles or unconfirmed CSV rows into canon. No automatic Relay/new research automation is created here.

## Priority scope

First build a few deep, verified conversation clusters (examination/encouragement, island/movie, favourite characters and food), each supporting question→follow-up→correction→opinion→related goods/events. Then expand coverage. Do not equate thousands of aliases or canned-line counts with specialist knowledge. Do not declare official-bot accuracy until event/product updates and scene assertions are validated.

Official source entry points verified during this turn:
- Movie news: https://chiikawa.toho-movie.jp/news/ (checked2026-10-13; includes2026-10-07 visual/benefit update).
- Movie characters: https://chiikawa.toho-movie.jp/atm/characters.html.
- Park news: https://chiikawapark-tokyo.jp/news/ (checked2026-10-13; latest announcements include upcoming seasonal events, availability changes and operational corrections).
These are research pointers, not newly imported runtime facts. Latest news must be read at its individual source, dated and checked for corrections before use.

Coverage audit from runtime exports:32 basic Chiikawa cards,182 name records,9 closed named notes and8 independently reviewed records. These counts overlap and are not a sum of distinct facts. There is no basic grass-weeding-examination card despite the term being recognized. This explains why name matching can succeed while precise follow-up knowledge is absent.

## Current human failure and confirmed mechanisms

The human pasted a new bad play transcript; model/provider/route are unreported. Reconstructed local tests confirm:
-5キュウ matches Hunter'sキュウ despite grass-weeding context.
-オナジコト、クリカエシテ、2ドモ and3カイモクリカエシテイルヨ miss feedback classification.
-A valid self-imitation after a Hachiware mention is falsely attributed to Hachiware and replaced with the same「ヤハはうさぎ」paragraph.
-Scene guard splits punctuation within quotes, can leave a closing bracket fragment, and treats a character's alleged imagination as the model's own hypothetical.
-A single reply can contain repeated sentences; delivery now collapses exact repeated sentences within that reply.

Immediate integrity fixes address those mechanisms and preserve phone layout.209 local tests pass. Shared name/feedback/attribution logic is synchronized to the relay. No new live generation, external AI/subagent or paid service. This does not establish natural/funny conversation quality or global factual accuracy. Cross-turn semantic repetition, remaining full-text fallback substitutions, grounded specialist dialogue generation and curated scene/product/event coverage remain substantive implementation work.

The term「アサキ コキュウ」was not identified from verified material in this turn. The human was asked what scene/line it refers to; do not assign it to another work or turn it into physiological training advice by guessing.

## Completion criteria for the redesign

A human should be able to stay with one scene for6–8 turns including two differently-worded follow-ups, a correction and a complaint about repetition. The answer must follow their last question, retain who did what, avoid repeating the same factual explanation and label interpretation. Unknown detail should be scoped; personality and enthusiasm should remain. Compare offline/retrieval behaviour, captured/live generation and human enjoyment separately. Provider429 still stops additional live attempts. Unit-test count alone is not the completion criterion.

公開確認: integrity1の緊急修正はフロントPR45/main96b5195・中継PR19/main6a660e2へ統合し、両Cloudflare公開成功。変更対象28ファイルが候補a8dcbacと一致。生成0回。記録docs/public-dialogue-integrity-20261013.json。専門版への大改修と人間の面白さ評価は完了していない。
