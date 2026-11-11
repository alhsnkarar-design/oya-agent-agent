// Line icons drawn in one stroke weight.
const P: Record<string, string> = {
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
  send: "M4 12 20 4l-5 16-3-7-8-1z",
  clip: "M21 12.5 12.6 21a5.5 5.5 0 0 1-7.8-7.8L13.6 4.4a3.7 3.7 0 0 1 5.2 5.2l-8.8 8.8a1.8 1.8 0 0 1-2.6-2.6l8.2-8.2",
  x: "M6 6l12 12M18 6 6 18",
  film: "M4 5h16v14H4zM4 9h16M8 5v4M12 5v4M16 5v4",
  dub: "M4 5h7M7.5 5c0 5-2 8-4 9M5 9c1 3 3 4 6 5M13 19l4-9 4 9M14.5 16h5",
  frame: "M4 4h16v16H4z",
  check: "M5 12.5 9.5 17 19 7",
  undo: "M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
  redo: "M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3",
  dl: "M12 4v11M7 10l5 5 5-5M5 20h14",
  phone: "M8 3h8v18H8z",
  square: "M5 5h14v14H5z",
  wide: "M3 7h18v10H3z",
  play: "M8 5v14l11-7z",
  pause: "M8 5v14M16 5v14",
  vol: "M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11",
  cc: "M3 6h18v12H3zM10 10.5a2 2 0 1 0 0 3M16 10.5a2 2 0 1 0 0 3",
  full: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  cursor: "M5 3l14 8-6 2-2 6z",
  cut: "M6 7a3 3 0 1 0 0-.01M6 17a3 3 0 1 0 0 .01M8.5 8.5 20 18M8.5 15.5 20 6",
  layers: "M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5",
  wave: "M3 12h2M7 8v8M11 5v14M15 8v8M19 10v4",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  chev: "M6 9l6 6 6-6",
  tag: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01",
  stack: "M12 4 3 9l9 5 9-5zM3 14l9 5 9-5",
  stop: "M7 7h10v10H7z",
  plus: "M12 5v14M5 12h14",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
};
export function Icon({ n, size }: { n: keyof typeof P | string; size?: number }) {
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" style={size ? { width: size, height: size } : undefined}>
      <path d={P[n] ?? ""} />
    </svg>
  );
}
