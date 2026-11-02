import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NusaKasir POS · Solusi Kasir dan Inventori F&B UMKM",
  description:
    "Sistem kasir dan manajemen inventori terintegrasi untuk bisnis F&B oleh StackPlus Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased bg-brand-background text-brand-ink selection:bg-brand-primary-soft selection:text-brand-primary-dark`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--brand-surface)",
              color: "var(--brand-ink-dark)",
              border: "1px solid var(--brand-line)",
              borderRadius: "12px",
              boxShadow: "var(--shadow-md)",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "var(--success)",
                secondary: "var(--success-soft)",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--danger)",
                secondary: "var(--danger-soft)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
