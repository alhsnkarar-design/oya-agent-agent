import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بنّاء — ابنِ موقعك وتطبيقك بالوصف",
  description: "منصة عربية لبناء المواقع والتطبيقات المتكاملة بالذكاء الاصطناعي: صِف فكرتك، وشاهدها تُبنى أمامك، ثم عدّلها بالمحادثة.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧱</text></svg>" },
};

export const viewport: Viewport = { themeColor: "#08070f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
