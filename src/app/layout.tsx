import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmSpirit Leadership Conference Registration",
  description: "AmSpirit Leadership Conference registration form"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
