import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bank Simulation Gateway | PayPulse",
  description: "Simulated NetBanking gateway for deposit and payout webhook settlement",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-bg text-text font-sans">
        {children}
      </body>
    </html>
  );
}
