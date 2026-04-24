import type { Metadata } from "next";
import { Suspense } from "react";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { SiteNavbar } from "@/components/site-navbar";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ProfitResearch",
  description:
    "Research product profitability, compare competitor pricing, and decide whether a product is worth launching before you buy stock.",
};

const pageTheme = {
  colorScheme: "light",
};

export const viewport = pageTheme;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem('stockpilot-theme');
                  var theme = stored === 'dark' ? 'dark' : 'light';
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <Suspense
          fallback={
            <div className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface-strong)]">
              <div className="mx-auto h-[73px] w-full max-w-7xl px-4 sm:h-[81px] sm:px-8 lg:px-10" />
            </div>
          }
        >
          <SiteNavbar />
        </Suspense>
        <div className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
