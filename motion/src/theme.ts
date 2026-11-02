import { staticFile } from "remotion";

export const COLORS = {
  bg: "#0B0A10",
  ink: "#F5F3FF",
  dim: "#8C88A3",
  accent: "#F2A72B", // saffron, the brand colour
  accentInk: "#1A1204",
  glowA: "#F2A72B",
  glowB: "#6B47EE",
};

export const FONT = "HarakaKufi";

let loaded: Promise<void> | null = null;

// Loads Noto Kufi Arabic (variable 100–900) from the project's own files.
export function loadFonts(): Promise<void> {
  if (loaded) return loaded;
  const faces = [
    new FontFace(FONT, `url(${staticFile("fonts/noto-kufi-arabic-arabic-wght-normal.woff2")}) format("woff2")`, {
      weight: "100 900",
      unicodeRange: "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC",
    }),
    new FontFace(FONT, `url(${staticFile("fonts/noto-kufi-arabic-latin-wght-normal.woff2")}) format("woff2")`, {
      weight: "100 900",
    }),
  ];
  loaded = Promise.all(faces.map((f) => f.load())).then((fs) => {
    fs.forEach((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f));
  });
  return loaded;
}
