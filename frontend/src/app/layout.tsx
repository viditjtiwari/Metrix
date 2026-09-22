import type { Metadata } from "next";
import { StoreProvider } from "@/store/StoreProvider";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { TopBanner } from "@/components/layout/TopBanner";
import { AppHeader } from "@/components/layout/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "METRIX | Legal Metrology Online Verification System",
  description:
    "National Metrological Surveillance Network • Online Verification & Digital Certification System (SIH26036)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-surface text-on-surface">
        <StoreProvider>
          <AuthInitializer>
            <TopBanner />
            <AppHeader />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <footer className="border-t border-surface-variant/40 bg-surface-container-lowest py-6 text-center text-xs text-on-surface-variant">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>
                  METRIX &copy; {new Date().getFullYear()} Directorate of Legal Metrology, Government of India.
                </span>
                <span className="font-mono text-[11px] text-tertiary font-medium">
                  Standard Weights &amp; Measures Enforcement Framework (SIH26036)
                </span>
              </div>
            </footer>
          </AuthInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}
