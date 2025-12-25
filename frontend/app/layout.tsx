import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 使用 Next.js 内置字体优化 - 自动本地托管字体文件
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  // 预加载字体以提高性能
  preload: true,
});

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
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
