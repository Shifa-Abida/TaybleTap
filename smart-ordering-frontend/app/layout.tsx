/*
  ============================================================
  LAYOUT.TSX — Root Layout (wraps every page)
  ============================================================

  WHY THIS FILE EXISTS:
  In Next.js App Router, layout.tsx is the shell that wraps
  ALL pages. Things like fonts, metadata, and global components
  (e.g., analytics, toast notifications) go here.

  WHY WE LOAD FONTS HERE (not in CSS):
  Next.js has a built-in `next/font` system that downloads
  fonts at BUILD TIME and self-hosts them — no external request
  to Google's servers at runtime. This is:
  - Faster (no network round-trip)
  - Better privacy (no Google tracking)
  - Avoids CSS @import ordering issues with Tailwind v4
  ============================================================
*/

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import ClientLayout from "@/context/ClientLayout";
import "./globals.css";

/* Load Inter font — used for all body text */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* Load Playfair Display — used for headings (elegant, premium feel) */
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

/* Page metadata — appears in browser tab and search results */
export const metadata: Metadata = {
  title: "TaybleTap — Smart Restaurant Menu",
  description:
    "Scan, browse, and order your favourite dishes at TaybleTap. Powered by AI recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      /* Apply font CSS variables to the whole document */
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
