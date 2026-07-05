import { AbsoluteFill, Html5Audio as Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Header } from "../components/Header";
import { GridBackground } from "../components/GridBackground";
import { ProgressBar } from "../components/ProgressBar";
import { KaraokeText } from "../components/KaraokeText";
import { baseZoom, pushBump } from "../lib/camera";
import { buildTimeline } from "../lib/useCardTimeline";
import { currentPhaseIndex } from "../lib/progress";
import type { CardTiming } from "../lib/types";

export function LongForm({ timing, topic, author }: { cardId: string; timing: CardTiming; topic: string; author: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { phases, totalFrames } = buildTimeline(timing);
  const byKey = Object.fromEntries(timing.segments.map((s) => [s.key, s]));
  const phaseByKey = Object.fromEntries(phases.map((p) => [p.key, p]));

  const detailPhases = phases.filter((p) => p.key.startsWith("detail-"));
  const nearestSwitch = detailPhases.reduce(
    (best, p) => (Math.abs(p.startFrame - frame) < Math.abs(best - frame) ? p.startFrame : best),
    -Infinity
  );

  const zoom = baseZoom(frame, totalFrames, theme) + pushBump(frame, nearestSwitch, theme);
  const titlePhase = phaseByKey["title"];
  const answerPhase = phaseByKey["answer"];
  const titleDone = frame >= titlePhase.endFrame;

  const progressIndex = currentPhaseIndex(phases, frame);
  const progressPhaseStart = phases[progressIndex]?.startFrame ?? 0;

  const fadeOpacity = interpolate(frame, [totalFrames - theme.timing.endFadeFrames, totalFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      <GridBackground />

      <AbsoluteFill style={{ opacity: fadeOpacity }}>
        <Header topic={topic} author={author} position="top" />

        <Sequence from={0}>
          <div style={{ position: "absolute", top: 120, left: 120, width: 1680 }}>
            <KaraokeText
              words={byKey["title"].words}
              currentMs={(frame / fps) * 1000}
              frame={frame}
              fontSize={theme.fonts.titleSize}
              variant="boil"
              bold
            />
          </div>
        </Sequence>

        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          {titleDone && (
            <Sequence from={answerPhase.startFrame}>
              <div style={{ position: "absolute", top: 400, left: 120, width: 1680 }}>
                <div style={{ display: "inline-block", maxWidth: "100%", background: theme.colors.answerBg, borderRadius: 12, padding: "24px 32px" }}>
                  <KaraokeText
                    words={byKey["answer"].words}
                    currentMs={((frame - answerPhase.startFrame) / fps) * 1000}
                    frame={frame}
                    fontSize={theme.fonts.answerSize}
                    variant="boil"
                  />
                </div>
              </div>
            </Sequence>
          )}

          {timing.segments
            .filter((s) => s.key.startsWith("detail-"))
            .map((seg, i) => {
              const p = phaseByKey[seg.key];
              const nextDetailPhase = detailPhases[i + 1];
              const durationInFrames = (nextDetailPhase ? nextDetailPhase.startFrame : totalFrames) - p.startFrame;
              return (
                <Sequence key={seg.key} from={p.startFrame} durationInFrames={durationInFrames}>
                  <div style={{ position: "absolute", top: 620, left: 120, width: 1680, display: "flex", alignItems: "flex-start", gap: 20 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: theme.colors.ink, marginTop: 26, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <KaraokeText
                        words={seg.words}
                        currentMs={((frame - p.startFrame) / fps) * 1000}
                        frame={frame}
                        fontSize={theme.fonts.detailSize}
                      />
                    </div>
                  </div>
                </Sequence>
              );
            })}
        </AbsoluteFill>

        <div style={{ position: "absolute", bottom: theme.layout.headerMargin, left: 120 }}>
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
    </AbsoluteFill>
  );
}
