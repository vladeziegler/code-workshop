import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Muse Console",
  description: "One console, any agent — swap the socket at the URL.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
