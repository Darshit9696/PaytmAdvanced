import type { Metadata } from "next";
import { Providers } from "./provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paytm Merchant Portal",
  description: "Merchant Dashboard & Payment Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
