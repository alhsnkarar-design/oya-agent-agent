import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bannaa — Build websites & apps by describing them",
  description:
    "Bannaa is an AI builder that turns a plain-language description into a polished, working website or web app. Describe it, watch it build live, refine it in chat and publish in one click.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%238b5cf6'/><stop offset='.55' stop-color='%23d946ef'/><stop offset='1' stop-color='%23f97316'/></linearGradient></defs><rect width='32' height='32' rx='8' fill='url(%23g)'/><path d='M9 22V10h7a4 4 0 010 8H9m7 0a4 4 0 010 8' transform='translate(0 -3)' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  },
  openGraph: {
    title: "Bannaa — Build websites & apps by describing them",
    description: "Describe it. Watch it build. Publish in one click.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#07060b", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
