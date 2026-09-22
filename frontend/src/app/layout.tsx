import type { Metadata } from "next";
import { StoreProvider } from "@/store/StoreProvider";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <StoreProvider>
          <AuthInitializer />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
