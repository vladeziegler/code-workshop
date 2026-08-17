import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aria · Leads",
  description: "Inbound lead qualification console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
