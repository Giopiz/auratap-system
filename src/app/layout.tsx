import type { Metadata } from "next";
import { Geist, Geist_Mono, Major_Mono_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const majorMono = Major_Mono_Display({
  weight: "400",
  variable: "--font-major-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuraTap | Premium Wi-Fi Access",
  description: "Dynamic Wi-Fi landing pages with one-tap connection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${majorMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
