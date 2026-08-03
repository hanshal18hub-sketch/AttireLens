import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://drape-private-dressing-room.soulavenger18.chatgpt.site"),
  title: "AttireLens - Private virtual try-on across Asia",
  description: "Private virtual try-on for occasion wear and home wear across South, Southeast, East, Central and West Asia and the wider Middle East.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "AttireLens",
    description: "Every layer. Your whole story.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "AttireLens - Every layer. Your whole story." }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
