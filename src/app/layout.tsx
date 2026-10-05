import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Header } from "@/components/layout/header";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DRIPCASES — Открой свой стиль",
  description: "Кейсы с одеждой. Открой кейс — получи уникальный образ.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" data-theme="dark" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans min-h-screen dc-noise">
        <Providers>
          <Header />
          <main>{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#111",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.08)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
