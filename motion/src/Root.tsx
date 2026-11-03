import React, { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, CalculateMetadataFunction, Composition, continueRender, delayRender } from "remotion";
import { Build, Punch, Reveal } from "./styles";
import { FPS, parse, Ratio, SIZES, Style, totalFrames } from "./text";
import { COLORS, FONT, loadFonts } from "./theme";
import { Promo, PROMO_FRAMES } from "./promo/Promo";
import { Ep0, EP0_FRAMES } from "./ep0/Ep0";
import { Promo3D, PROMO3D_FRAMES } from "./promo3d/Promo3D";

export type KineticProps = {
  sentence: string;
  style: Style;
  ratio: Ratio;
  handle: string;
};

const STYLES = { build: Build, punch: Punch, reveal: Reveal };

const Kinetic: React.FC<KineticProps> = ({ sentence, style, ratio, handle }) => {
  const [handleId] = useState(() => delayRender("Loading Arabic font"));
  useEffect(() => {
    loadFonts().then(() => continueRender(handleId)).catch((e) => cancelRender(e));
  }, [handleId]);

  const words = parse(sentence);
  const Comp = STYLES[style] ?? Build;
  return (
    <AbsoluteFill>
      <Comp words={words} ratio={ratio} />
      {handle && (
        <div
          style={{
            position: "absolute",
            bottom: ratio === "9:16" ? "6%" : "5%",
            width: "100%",
            textAlign: "center",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 34,
            color: COLORS.dim,
            direction: "ltr",
          }}
        >
          {handle}
        </div>
      )}
    </AbsoluteFill>
  );
};

const calculateMetadata: CalculateMetadataFunction<KineticProps> = ({ props }) => {
  const size = SIZES[props.ratio] ?? SIZES["9:16"];
  return { durationInFrames: totalFrames(parse(props.sentence)), width: size.width, height: size.height };
};

export const Root: React.FC = () => (
  <>
  <Composition id="Promo" component={Promo} fps={FPS} width={1080} height={1920} durationInFrames={PROMO_FRAMES} />
  <Composition id="Ep0" component={Ep0} fps={FPS} width={1080} height={1920} durationInFrames={EP0_FRAMES} />
  <Composition id="Promo3D" component={Promo3D} fps={FPS} width={1080} height={1920} durationInFrames={PROMO3D_FRAMES} />
  <Composition
    id="Kinetic"
    component={Kinetic}
    fps={FPS}
    width={1080}
    height={1920}
    durationInFrames={120}
    defaultProps={{
      sentence: "المونتاج الحلو *محدش* بياخد باله منه",
      style: "build",
      ratio: "9:16",
      handle: "",
    }}
    calculateMetadata={calculateMetadata}
  />
  </>
);
