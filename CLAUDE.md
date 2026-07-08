# CLAUDE.md

Vox-styled board-review flashcard videos rendered with Remotion. Cards in `cards/*.json` → Edge TTS narration with word timings → two compositions (LongForm 1920×1080, Shorts 1080×1920) → `out/<card-id>/{long.mp4, short.mp4, audio.mp3, config.json}`.

## Commands

```bash
pnpm sync-config                   # config.toml -> remotion/config.generated.json (theme overrides)
pnpm test                          # vitest unit tests (lib/ logic)
pnpm exec tsc --noEmit             # typecheck
pnpm validate [cardId...]          # zod format check for cards/*.json
pnpm audio [cardId...]             # TTS + timing.json (cached by segment text)
pnpm render [cardId...]            # render all cuts into out/<id>/
pnpm still <Comp> <cardId> <frame> <out.png>   # single-frame visual check
pnpm studio                        # Remotion Studio live preview
```

Verify visual changes with `pnpm still` at a few key frames (renders are the real test — a 404'd asset or layout overflow shows up there, not in vitest).

## Architecture

- **Data flow**: `cards/<id>.json` → `scripts/generate-audio.ts` (msedge-tts, one segment per title/answer/detail-N) → `remotion/audio/<id>/timing.json` (word-level timings) → copied to `assets/audio/` → compositions read it via `staticFile`.
- **Timeline**: `lib/useCardTimeline.ts` `buildTimeline()` lays segments back-to-back with `detailGapMs` gaps, plus an extra hold after the title (title settle + answer-box fade) and an end hold + music tail. All frame positions derive from `timing.json` durations — never hardcode frame numbers.
- **Theme**: `remotion/theme.defaults.ts` holds every size, color, timing, and effect strength; `config.toml` (repo root) overrides any subset of them. `pnpm sync-config` bakes `config.toml` into `remotion/config.generated.json`, which `theme.ts` deep-merges over the defaults and re-exports as `theme` (consumers still `import { theme }`). Change behavior via `config.toml` (each key documents its default); add brand-new knobs in `theme.defaults.ts`. Never edit `config.generated.json` by hand.
- **Text fitting**: `lib/fitText.ts` deterministically shrinks title/answer to fit fixed layout bands (estimates width as chars × ratio, deliberately over-estimating). The yellow answer box must never shift position; text shrinks instead.
- **Title intro**: title karaoke plays centered at `titleIntro.sizeBoost`× size, then font-size/top/weight tween into the anchor (per-frame reflow moves line breaks). Answer box fades in only after it lands.

## Conventions & gotchas

- **`assets/` is the Remotion public dir**, not `public/`. `remotion.config.ts` covers Studio, but `bundle()` in `scripts/render.ts` / `still.ts` needs `publicDir: "assets"` passed explicitly — it does not read the config file. Keep the two in sync.
- **`scanHoldIndex` ignores `endMs` on purpose** — holding an item until the next item's `startMs` is what makes karaoke survive gaps. Do not "fix" it to check endMs (see comment in `lib/scanHoldIndex.ts`).
- **TTS caching**: a segment re-synthesizes only when its `source.txt` no longer matches the spoken text. TTS output varies run-to-run, which is why `out/<id>/config.json` snapshots `timing` — restoring it to `remotion/audio/<id>/timing.json` at the recorded commit reproduces a render exactly.
- **Edge TTS is flaky from CI IPs**: `generate-audio.ts` pre-creates `metadata.json` (so the library's failure cleanup doesn't crash the process) and retries each segment 3× with backoff. Keep both defenses if refactoring.
- **`**word**` markers** in card text are parsed by `lib/markers.ts` — spoken as plain text, drawn as red marker strokes on screen.
- Generated audio (`remotion/audio/**`, `assets/audio/`) and `out/` are gitignored; `assets/sfx/` (music + sfx) is tracked.
- deterministic randomness only: use `remotion`'s `random(seed)`, never `Math.random()`.

## LLM card generation

`scripts/issue-to-cards.ts` turns a GitHub issue into card JSON via any **OpenAI-compatible** chat endpoint. Provider is env-driven: `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` (legacy `GROQ_API_KEY` / `GROQ_MODEL` still honored). Defaults to Groq `llama-3.1-8b-instant`. `parseJsonLoose` tolerates ```json fences / prose, so non-strict backends work. `max_tokens` is capped at 2000 (one card) to stay under free-tier per-minute token caps.

**Cloudflare Workers AI** (`worker/`) is an OpenAI-shim over the account's AI binding, to dodge Groq's free-tier token/day limits. Deploy with `pnpm worker:deploy`, set its shared secret with `pnpm worker:secret` (Worker env `AUTH_TOKEN`). CI uses it automatically when repo secrets `LLM_WORKER_URL` + `LLM_WORKER_TOKEN` (and var `LLM_MODEL`, a `@cf/...` id) are set; otherwise falls back to Groq. Model id must be a current `@cf/...` (they get deprecated — check `wrangler ai models`).

## CI

`.github/workflows/release-cards.yml`: card JSON changes on `main` → validate → test → build changed cards only → per-card GitHub Release (tag `card-<id>`, assets clobbered on re-push). `workflow_dispatch` accepts card ids (empty = all).

`.github/workflows/issue-to-card.yml`: `card`-labelled issue (author htlin222) → generate card → PR → auto-merge on `validate`. A single live progress comment (`scripts/issue-progress.ts`) ticks generate→pr→merge→audio→render→release across both workflows (✅/💪/⏳, then 🎉 + release link + elapsed), and the issue auto-closes on release success.
