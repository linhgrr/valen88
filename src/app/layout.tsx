import type { Metadata, Viewport } from "next";
import { Dancing_Script, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  variable: "--font-dancing-script",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});

const sloop = localFont({
  src: [
    {
      path: "../../public/fonts/sloop.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-sloop",
  display: "swap",
});

// Using <link> tag for Kapakana as a reliable fallback for now, 
// as it might not be in the @next/font/google package depending on the version.
// This ensures the font works across all browsers as requested.

export const metadata: Metadata = {
  title: "Valentine Letter 💕",
  description: "A special Valentine's Day greeting for you",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${dancingScript.variable} ${sloop.variable} ${playfair.variable}`}>
      <head>
        {/* We can keep the link for other fonts or replace them all with next/font/google */}
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Playwrite+AU+NSW:wght@100..400&family=Kapakana:wght@400;700&family=Unna:ital,wght@0,400;0,700;1,400;1,700&family=Pinyon+Script&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
