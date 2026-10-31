import type { SVGProps } from "react";

/** Minimal stroke icon set (24px grid, 1.75 stroke) so the UI never depends on emoji rendering. */
type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconArrowUp = (p: P) => <Svg {...p}><path d="M12 19V5M5 12l7-7 7 7" /></Svg>;
export const IconArrowRight = (p: P) => <Svg {...p}><path d="M5 12h14M13 5l7 7-7 7" /></Svg>;
export const IconSparkles = (p: P) => (
  <Svg {...p}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
  </Svg>
);
export const IconImage = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="9" cy="9" r="2" />
    <path d="M21 15l-5-5L5 21" />
  </Svg>
);
export const IconPaperclip = (p: P) => (
  <Svg {...p}><path d="M21.4 11.1l-9.2 9.2a6 6 0 01-8.5-8.5l9.2-9.2a4 4 0 015.7 5.7l-9.2 9.2a2 2 0 01-2.8-2.8l8.5-8.5" /></Svg>
);
export const IconStop = (p: P) => <Svg {...p}><rect x="6" y="6" width="12" height="12" rx="2" /></Svg>;
export const IconEye = (p: P) => (
  <Svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Svg>
);
export const IconCode = (p: P) => <Svg {...p}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></Svg>;
export const IconMonitor = (p: P) => <Svg {...p}><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></Svg>;
export const IconTablet = (p: P) => <Svg {...p}><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M11 18h2" /></Svg>;
export const IconPhone = (p: P) => <Svg {...p}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></Svg>;
export const IconExternal = (p: P) => <Svg {...p}><path d="M14 3h7v7M10 14L21 3M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h5" /></Svg>;
export const IconDownload = (p: P) => <Svg {...p}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></Svg>;
export const IconRocket = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 00-2.9-.1z" />
    <path d="M12 15l-3-3a22 22 0 012-3.9A12.9 12.9 0 0122 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 01-4 2z" />
    <path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5" />
  </Svg>
);
export const IconHistory = (p: P) => <Svg {...p}><path d="M3 12a9 9 0 109-9 9.7 9.7 0 00-6.7 2.8L3 8" /><path d="M3 3v5h5M12 7v5l4 2" /></Svg>;
export const IconPlus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const IconX = (p: P) => <Svg {...p}><path d="M18 6L6 18M6 6l12 12" /></Svg>;
export const IconCheck = (p: P) => <Svg {...p}><path d="M20 6L9 17l-5-5" /></Svg>;
export const IconCloud = (p: P) => <Svg {...p}><path d="M17.5 19H9a7 7 0 116.7-9h1.8a4.5 4.5 0 010 9z" /></Svg>;
export const IconLoader = (p: P) => <Svg {...p} className={`animate-spin ${p.className ?? ""}`}><path d="M21 12a9 9 0 11-6.2-8.6" /></Svg>;
export const IconAlert = (p: P) => <Svg {...p}><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /><path d="M12 9v4M12 17h.01" /></Svg>;
export const IconWand = (p: P) => (
  <Svg {...p}><path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M15 9h.01M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" /></Svg>
);
export const IconLayers = (p: P) => <Svg {...p}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></Svg>;
export const IconZap = (p: P) => <Svg {...p}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></Svg>;
export const IconGlobe = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></Svg>
);
export const IconShield = (p: P) => <Svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></Svg>;
export const IconMessage = (p: P) => <Svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></Svg>;
export const IconFile = (p: P) => <Svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></Svg>;
export const IconUser = (p: P) => <Svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>;
export const IconLogout = (p: P) => <Svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></Svg>;
export const IconFolder = (p: P) => <Svg {...p}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></Svg>;
export const IconTrash = (p: P) => <Svg {...p}><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></Svg>;
export const IconCopy = (p: P) => <Svg {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></Svg>;
export const IconStethoscope = (p: P) => (
  <Svg {...p}><path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 0012 0V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3" /><path d="M8 15v1a6 6 0 006 6 6 6 0 006-6v-4" /><circle cx="20" cy="10" r="2" /></Svg>
);
export const IconChevronDown = (p: P) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>;
export const IconGithub = (p: P) => (
  <Svg {...p}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 00-.9-2.6c3.1-.4 6.4-1.5 6.4-7A5.4 5.4 0 0020 4.8 5 5 0 0019.9 1S18.7.7 16 2.5a13.4 13.4 0 00-7 0C6.3.7 5.1 1 5.1 1A5 5 0 005 4.8a5.4 5.4 0 00-1.5 3.8c0 5.4 3.3 6.6 6.4 7a3.4 3.4 0 00-.9 2.6V22" /></Svg>
);
export const IconMenu = (p: P) => <Svg {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Svg>;
