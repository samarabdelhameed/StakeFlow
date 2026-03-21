import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "StakeFlow — Risk-Aware Restaking Protocol",
  description:
    "Intelligent capital allocation for secure and optimized restaking. Maximize ETH rewards with AI-powered allocation.",
  keywords: ["ethereum", "staking", "restaking", "defi", "validators", "web3", "risk-aware"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content" style={{ position: "relative", zIndex: 1 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
