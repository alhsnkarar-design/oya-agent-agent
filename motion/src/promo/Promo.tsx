import React, { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { iris } from "@remotion/transitions/iris";
import { loadFonts } from "../theme";
import { Captions, Cta, FromText, Hook, Montage, Platforms, Problem, Reveal, Voice } from "./scenes";

export const SCENES = [
  { C: Hook, d: 105 },
  { C: Problem, d: 105 },
  { C: Reveal, d: 90 },
  { C: Montage, d: 135 },
  { C: FromText, d: 150 },
  { C: Voice, d: 165 },
  { C: Captions, d: 135 },
  { C: Platforms, d: 105 },
  { C: Cta, d: 150 },
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
