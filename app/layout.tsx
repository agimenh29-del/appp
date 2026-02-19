import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVELI Portfolio Shop",
  description: "Headless Shopify storefront",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
