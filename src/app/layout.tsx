import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gashapon — Pixel Capsule Surprises",
  description:
    "Send a surprise capsule machine full of personal messages, photos, and memories to someone you care about.",
  openGraph: {
    title: "Gashapon — Pixel Capsule Surprises",
    description: "Turn the handle. Discover a surprise.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        <style>{`:root { --font-pixel: 'Press Start 2P', monospace; }`}</style>
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
