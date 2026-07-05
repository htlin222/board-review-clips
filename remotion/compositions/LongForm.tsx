import { AbsoluteFill, Html5Audio as Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Header } from "../components/Header";
import { GridBackground } from "../components/GridBackground";
import { GrainOverlay } from "../components/GrainOverlay";
import { ProgressBar } from "../components/ProgressBar";
import { KaraokeText } from "../components/KaraokeText";
import { buildTimeline } from "../lib/useCardTimeline";
import { currentPhaseIndex } from "../lib/progress";
import { easeInCubic, easeOutCubic } from "../lib/easing";
import { openingEffect } from "../lib/opening";
import { answerFontFor } from "../lib/answerFonts";
import type { CardTiming } from "../lib/types";

const CONTENT_LEFT = 170;
const CONTENT_WIDTH = 1920 - CONTENT_LEFT * 2;
const DETAIL_INDENT = 52;

// Fixed y-anchors so the yellow answer box never shifts when a detail line's
// height changes. The detail lives in its own band and centers within it.
const TITLE_TOP = 120;
const ANSWER_TOP = 400;
const DETAIL_BAND_TOP = 660;
const DETAIL_BAND_BOTTOM = 1080 - theme.layout.headerMargin - 40;

export function LongForm({
  timing,
  main,
  section,
  topic,
  author,
}: {
  cardId: string;
  timing: CardTiming;
  main: string;
  section: string;
  topic: string;
  author: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { phases, totalFrames } = buildTimeline(timing);
  const byKey = Object.fromEntries(timing.segments.map((s) => [s.key, s]));
  const phaseByKey = Object.fromEntries(phases.map((p) => [p.key, p]));

  const detailPhases = phases.filter((p) => p.key.startsWith("detail-"));

  const titlePhase = phaseByKey["title"];
  const answerPhase = phaseByKey["answer"];
  const titleDone = frame >= titlePhase.endFrame;

  const progressIndex = currentPhaseIndex(phases, frame);
  const progressPhaseStart = phases[progressIndex]?.startFrame ?? 0;

  // Answer re-letters each time a detail is revealed (the progress pushes on).
  const detailsRevealed = detailPhases.filter((p) => p.startFrame <= frame).length;
  const answerFont = answerFontFor(detailsRevealed);

  const fadeOpacity = interpolate(frame, [totalFrames - theme.timing.endFadeFrames, totalFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const open = openingEffect(frame, theme);

  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      <AbsoluteFill style={{ transform: `scale(${open.scale})`, filter: open.blurPx ? `blur(${open.blurPx}px)` : undefined }}>
        <GridBackground />

        <AbsoluteFill style={{ opacity: fadeOpacity }}>
          <Header main={main} section={section} topic={topic} author={author} position="top" />

          <Sequence from={0} layout="none">
            <div style={{ position: "absolute", top: TITLE_TOP, left: CONTENT_LEFT, width: CONTENT_WIDTH }}>
              <KaraokeText
                words={byKey["title"].words}
                currentMs={(frame / fps) * 1000}
                frame={frame}
                fontSize={theme.fonts.titleSize}
                bold
                boil
              />
            </div>
          </Sequence>

          {titleDone && (
            <Sequence from={answerPhase.startFrame} layout="none">
              <div style={{ position: "absolute", top: ANSWER_TOP, left: CONTENT_LEFT, width: CONTENT_WIDTH }}>
                <div style={{ position: "relative", display: "inline-block", maxWidth: "100%", background: theme.colors.answerBg, borderRadius: 12, padding: "24px 32px", overflow: "hidden" }}>
                  <GrainOverlay frame={frame} id="grain-answer-lf" opacity={0.35} radius={12} />
                  <KaraokeText
                    words={byKey["answer"].words}
                    currentMs={((frame - answerPhase.startFrame) / fps) * 1000}
                    frame={frame}
                    fontSize={theme.fonts.answerSize}
                    boil
                    fontFamily={answerFont}
                  />
                </div>
              </div>
            </Sequence>
          )}

          <div
            style={{
              position: "absolute",
              top: DETAIL_BAND_TOP,
              left: CONTENT_LEFT + DETAIL_INDENT,
              width: CONTENT_WIDTH - DETAIL_INDENT,
              height: DETAIL_BAND_BOTTOM - DETAIL_BAND_TOP,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {timing.segments
              .filter((s) => s.key.startsWith("detail-"))
              .map((seg, i) => {
                const p = phaseByKey[seg.key];
                const nextDetailPhase = detailPhases[i + 1];
                const durationInFrames = (nextDetailPhase ? nextDetailPhase.startFrame : totalFrames) - p.startFrame;
                const localFrame = frame - p.startFrame;
                const enterY = interpolate(localFrame, [0, theme.transition.scrollFrames], [theme.transition.scrollDistance, 0], {
                  easing: easeOutCubic,
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                const exitStart = durationInFrames - theme.transition.scrollFrames;
                const exitY = interpolate(localFrame, [exitStart, durationInFrames], [0, -theme.transition.scrollDistance], {
                  easing: easeInCubic,
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                const exitOpacity = interpolate(localFrame, [exitStart, durationInFrames], [1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <Sequence key={seg.key} from={p.startFrame} durationInFrames={durationInFrames} layout="none">
                    <div style={{ transform: `translateY(${enterY + exitY}px)`, opacity: exitOpacity }}>
                      <KaraokeText
                        words={seg.words}
                        currentMs={((frame - p.startFrame) / fps) * 1000}
                        frame={frame}
                        fontSize={theme.fonts.detailSize}
                      />
                    </div>
                  </Sequence>
                );
              })}
          </div>

          <div style={{ position: "absolute", bottom: theme.layout.headerMargin, left: CONTENT_LEFT }}>
            <ProgressBar current={progressIndex} total={timing.segments.length} frame={frame} currentPhaseStart={progressPhaseStart} />
          </div>

          <Audio src={staticFile(theme.sfx.begin)} />
          {titleDone && <Sequence from={titlePhase.endFrame} durationInFrames={5}><Audio src={staticFile(theme.sfx.click)} /></Sequence>}
          {detailPhases.map((p) => (
            <Sequence key={p.key} from={p.startFrame} durationInFrames={5}>
              <Audio src={staticFile(theme.sfx.click)} />
            </Sequence>
          ))}

          {timing.segments.map((seg) => {
            const p = phaseByKey[seg.key];
            return (
              <Sequence key={seg.key} from={p.startFrame}>
                <Audio src={staticFile(seg.audioPath.replace(/^remotion\//, ""))} />
              </Sequence>
            );
          })}
        </AbsoluteFill>

        <GrainOverlay frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
