import { AbsoluteFill, Html5Audio as Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Header } from "../components/Header";
import { GridBackground } from "../components/GridBackground";
import { ProgressBar } from "../components/ProgressBar";
import { KaraokeText } from "../components/KaraokeText";
import { RollingCaption } from "../components/RollingCaption";
import { baseZoom, pushBump } from "../lib/camera";
import { buildTimeline } from "../lib/useCardTimeline";
import { currentPhaseIndex } from "../lib/progress";
import type { CardTiming } from "../lib/types";

const SAFE_TOP = (1920 - theme.safeZone.shorts.h) / 2;
const SAFE_LEFT = (1080 - theme.safeZone.shorts.w) / 2;

export function Shorts({ timing, topic, author }: { cardId: string; timing: CardTiming; topic: string; author: string }) {
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
          <div style={{ position: "absolute", top: SAFE_TOP, left: SAFE_LEFT, width: theme.safeZone.shorts.w }}>
            <KaraokeText
              words={byKey["title"].words}
              currentMs={(frame / fps) * 1000}
              frame={frame}
              fontSize={theme.fonts.shortsTitleSize}
              variant="boil"
              bold
            />
          </div>
        </Sequence>

        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          {titleDone && (
            <Sequence from={answerPhase.startFrame}>
              <div style={{ position: "absolute", top: SAFE_TOP + 300, left: SAFE_LEFT, width: theme.safeZone.shorts.w }}>
                <div style={{ display: "inline-block", maxWidth: "100%", background: theme.colors.answerBg, borderRadius: 10, padding: "18px 24px" }}>
                  <RollingCaption
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
                  <div
                    style={{
                      position: "absolute",
                      top: SAFE_TOP + 600,
                      left: SAFE_LEFT,
                      width: theme.safeZone.shorts.w,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: theme.colors.ink, marginTop: 28, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <RollingCaption
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

        <div style={{ position: "absolute", bottom: theme.layout.headerMargin, left: SAFE_LEFT }}>
          <ProgressBar current={progressIndex} total={timing.segments.length} frame={frame} currentPhaseStart={progressPhaseStart} />
        </div>

        <Audio src={staticFile(theme.sfx.begin)} />
        {titleDone && (
          <Sequence from={titlePhase.endFrame} durationInFrames={5}>
            <Audio src={staticFile(theme.sfx.click)} />
          </Sequence>
        )}
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
