import type { Metadata } from "next";
import { StoreProvider } from "@/store/StoreProvider";
import { HeaderNav } from "@/components/layout/HeaderNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "METRIX | Legal Metrology Online Verification System",
  description: "Online Verification and Digital Certification System for Weighing and Measuring Instruments (SIH26036)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <StoreProvider>
          <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  M
                </div>
                <div>
                  <span className="font-bold text-xl tracking-tight text-slate-900">METRIX</span>
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    SIH26036
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-xs text-slate-500 hidden md:block">
                  Legal Metrology Verification Platform
                </div>
                <HeaderNav />
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
            <div className="max-w-7xl mx-auto px-4">
              METRIX &copy; {new Date().getFullYear()} - Online Verification System for Weighing & Measuring Instruments
            </div>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
