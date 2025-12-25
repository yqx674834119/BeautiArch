import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skeleton+Skin",
  description: "AI-powered architectural sketch generation from simple drawings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

