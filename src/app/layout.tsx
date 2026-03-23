import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const runtime = 'edge';

export const metadata: Metadata = {
  title: "야외방탈출 미션",
  description: "숨겨진 단서를 찾아 다음 체크포인트로 이동하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
