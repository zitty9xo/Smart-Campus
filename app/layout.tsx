import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Campus Lost & Found — Gemini AI Match & Explain",
  description: "Multimodal AI matching and free-text search for campus lost and found items. Powered by Gemini 2.5 Flash.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
