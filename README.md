# vox-styled-reels

Programmatic **Vox-style board-review flashcard videos**, rendered with [Remotion](https://remotion.dev). Drop a JSON flashcard into `cards/`, push to `main`, and CI ships a long-form video, a Shorts cut, the narration mix, and a reproducible render config to a GitHub Release.

## What a card becomes

Each card renders in two aspect ratios from the same timeline:

| Cut | Composition | Size | Use |
|---|---|---|---|
| `long.mp4` | `LongForm` | 1920×1080 | YouTube / lecture embeds |
| `short.mp4` | `Shorts` | 1080×1920 | YouTube Shorts / Reels (safe-zone aware) |

The look is a paper-collage documentary style:

- **TTS karaoke narration** (Edge TTS) — words light up as they're spoken, with per-word timings parsed from the synthesis metadata
- **Title opening** — the question plays centered and oversized (1.8×, weight 900), then settles into place with per-frame font-size reflow before the answer box fades in
- **Marker highlights** — `**word**` in card text draws a hand-wavy red marker stroke, boiling at 10 fps
- **Paper aesthetic** — Bauhaus primary palette, grid-paper background, static paper-fiber texture, film grain, soft vignette, print-misregistration shadow under the answer box
- **Camera life** — autofocus-style blur-in intro, imperceptible push-in across the video, mirrored defocus outro into a scramble-in author end card over the music tail

## Quickstart

Requirements: Node 22+, [pnpm](https://pnpm.io), [ffmpeg](https://ffmpeg.org) (for the audio mix extraction).

```bash
pnpm install
pnpm validate          # check card format
pnpm audio             # synthesize TTS + word timings (cached by text)
pnpm studio            # live-preview compositions in Remotion Studio
pnpm render            # render everything into out/<card-id>/
```

Narrow any step to specific cards: `pnpm audio my-card`, `pnpm render my-card`.

Render a single frame for a quick visual check:

```bash
pnpm still Shorts my-card 600 out/preview.png
```

## Writing a card

`cards/<id>.json` — the filename must match `id`:

```json
{
  "id": "scd-median-survival",
  "main": "Board Review",
  "section": "Hematology",
  "topic": "Sickle Cell Disease",
  "author": "Dr. Lizard",
  "title": "What is the median overall survival of a patient with SCD?",
  "answer": "The estimated median survival for SCD in developed nations is ~60 years.",
  "detail": [
    "Most deaths occur during a vaso-occlusive crisis.",
    "Elevated hemoglobin F levels are associated with **improved outcomes**."
  ]
}
```

- `title` → the opening question (karaoke, centered intro)
- `answer` → the yellow answer box
- `detail[]` → sequential supporting lines, one narration segment each
- `**text**` → red marker highlight, spoken as plain text
- Files starting with `_` are ignored (fixtures)

`pnpm validate` enforces the schema (kebab-case id matching the filename, non-empty fields, no extra keys) — the same check gates CI.

## Output layout

```
out/
  <card-id>/
    long.mp4       # LongForm render
    short.mp4      # Shorts render
    audio.mp3      # full narration + music + sfx mix (extracted from long.mp4)
    config.json    # reproducibility snapshot
```

`config.json` captures the git commit, Remotion version, card content, TTS word timings, and the full theme. To reproduce a render exactly: check out that commit, restore `timing` to `remotion/audio/<id>/timing.json`, and run `pnpm render <id>` — TTS output varies between runs, so the saved timings are what make it exact.

## CI / Releases

`.github/workflows/release-cards.yml` runs when card JSONs land on `main`:

1. Detect added/changed cards
2. `pnpm validate` — malformed cards fail the job before any build
3. `pnpm test`, then TTS + render for the changed cards only
4. Publish/refresh a GitHub Release per card (tag `card-<id>`) with all four artifacts

Manual runs: **Actions → Release cards → Run workflow** (optionally pass card ids; empty builds everything).

## Project structure

```
cards/            flashcard JSONs (the only thing you edit day-to-day)
remotion/
  compositions/   LongForm.tsx, Shorts.tsx
  components/     KaraokeText, MarkerText, ProgressBar, Outro, textures…
  lib/            timeline, karaoke timing, text fitting, easing (unit-tested)
  theme.ts        every visual/timing knob in one place
assets/           served statics: sfx + music (tracked), generated TTS (ignored)
scripts/          generate-audio, render, still, validate-cards, smoke-test
```

Tuning the look almost always means editing `remotion/theme.ts` — sizes, colors, timings, effect strengths all live there.

## Tests

```bash
pnpm test        # vitest — timeline, karaoke, fitting, easing, markers…
```
