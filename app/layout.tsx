import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FortuneWheel",
  description: "Quiz + spin-the-wheel MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
