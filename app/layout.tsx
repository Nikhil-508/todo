import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SimpleFlow | The Minimalist To-Do App",
  description: "A beautiful, distraction-free task manager designed for daily productivity. Fast, smooth, and locally persistent.",
  keywords: ["todo", "productivity", "minimalist", "task manager", "nextjs", "tailwind"],
  authors: [{ name: "SimpleFlow Team" }],
  openGraph: {
    title: "SimpleFlow | The Minimalist To-Do App",
    description: "Stay focused and productive with SimpleFlow.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SimpleFlow | The Minimalist To-Do App",
    description: "The cleanest to-do app for your daily flow.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
