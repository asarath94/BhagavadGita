import type { Metadata, Viewport } from "next";
import { Noto_Sans_Telugu } from "next/font/google";
import "./globals.css";
import RegisterSW from "./RegisterSW";

const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600"],
  variable: "--font-telugu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bhagavad Gita",
  description: "Read the Bhagavad Gita in Telugu, chapter by chapter.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#a9531f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoTelugu.variable}>
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
