import type { Metadata } from "next";
import { Suspense } from "react";
import { Manrope, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/components/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MINISO Retail OS",
  description:
    "Centralized retail inventory, store operations, and intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <Providers>
          <AuthProvider>
            <Suspense
              fallback={
                <div className="min-h-screen bg-[var(--background)]" />
              }
            >
              <AppShell>{children}</AppShell>
            </Suspense>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
