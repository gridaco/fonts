import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FontListProvider } from "@/contexts/font-list-context";
import { getInitialFontsData } from "@/lib/fonts-actions";
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
  title: "Grida Fonts",
  description: "Grida Fonts",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialData = await getInitialFontsData();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FontListProvider
          initialFonts={initialData.fonts}
          initialTotal={initialData.total}
          initialFontlistCount={initialData.fontlist_count}
        >
          {children}
        </FontListProvider>
      </body>
    </html>
  );
}
