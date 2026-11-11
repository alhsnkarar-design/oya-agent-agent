import React, { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { iris } from "@remotion/transitions/iris";
import { loadFonts } from "../theme";
import { Captions, Cta, FromText, Hook, Montage, Platforms, Problem, Reveal, Voice } from "./scenes";

// Scene lengths are timed to the Egyptian voiceover (public/voiceover.wav):
// each scene starts ~0.35s before its line; transitions overlap by T_LEN frames.
export const SCENES = [
  { C: Hook, d: 153 },
  { C: Problem, d: 176 },
  { C: Reveal, d: 158 },
  { C: Montage, d: 152 },
  { C: FromText, d: 144 },
  { C: Voice, d: 173 },
  { C: Captions, d: 191 },
  { C: Platforms, d: 125 },
  { C: Cta, d: 159 },
];
export const T_LEN = 12;
export const PROMO_FRAMES = SCENES.reduce((n, s) => n + s.d, 0) - T_LEN * (SCENES.length - 1);

export const Promo: React.FC = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => { loadFonts().then(() => continueRender(h)).catch((e) => cancelRender(e)); }, [h]);
  const transitions = [
    wipe({ direction: "from-right" }),
    iris({ width: 1080, height: 1920 }),
    slide({ direction: "from-bottom" }),
    wipe({ direction: "from-left" }),
    slide({ direction: "from-right" }),
    fade(),
    slide({ direction: "from-left" }),
    iris({ width: 1080, height: 1920 }),
  ];
  return (
    <AbsoluteFill style={{ background: "#0B0A12" }}>
      <TransitionSeries>
        {SCENES.map(({ C, d }, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={d}>
              <C />
            </TransitionSeries.Sequence>
            {i < SCENES.length - 1 && (
              <TransitionSeries.Transition presentation={transitions[i] as never} timing={linearTiming({ durationInFrames: T_LEN })} />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily: "HarakaKufi", fontSize: 26, color: "#8C88A3", direction: "ltr" }}>@zifidit</div>
    </AbsoluteFill>
  );
};
