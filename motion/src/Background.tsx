import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "./theme";

// Two soft light pools drifting slowly, plus a fine grain, so the frame never sits dead still.
export const Background: React.FC<{ flash?: number }> = ({ flash = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  const ax = 70 + Math.sin(t * 0.5) * 12;
  const ay = 22 + Math.cos(t * 0.4) * 8;
  const bx = 25 + Math.cos(t * 0.35) * 14;
  const by = 80 + Math.sin(t * 0.45) * 8;
  const size = Math.max(width, height);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(${size * 0.45}px circle at ${ax}% ${ay}%, ${COLORS.glowA}33, transparent 70%),
                       radial-gradient(${size * 0.5}px circle at ${bx}% ${by}%, ${COLORS.glowB}33, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.06,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(255,255,255,.35) 0 1px, transparent 1px 4px)",
          transform: `translate(${(frame % 3) - 1}px, ${((frame * 2) % 3) - 1}px)`,
        }}
      />
      {flash > 0 && (
        <AbsoluteFill style={{ backgroundColor: COLORS.accent, opacity: interpolate(flash, [0, 1], [0, 0.9]) }} />
      )}
    </AbsoluteFill>
  );
};
