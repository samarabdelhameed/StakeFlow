import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StakeFlow — Intelligent Restaking Protocol",
  description:
    "Optimize your ETH staking rewards with AI-powered allocation across top validators. Built with Foundry + Bun.",
  keywords: [
    "ethereum",
    "staking",
    "restaking",
    "defi",
    "validators",
    "web3",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="navbar-inner">
            <a href="/" className="navbar-logo">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="32"
                  height="32"
                  rx="8"
                  fill="url(#logo-gradient)"
                />
                <path
                  d="M16 6L22 12L16 18L10 12L16 6Z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <path
                  d="M16 14L22 20L16 26L10 20L16 14Z"
                  fill="white"
                  fillOpacity="0.5"
                />
                <defs>
                  <linearGradient
                    id="logo-gradient"
                    x1="0"
                    y1="0"
                    x2="32"
                    y2="32"
                  >
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="gradient-text">StakeFlow</span>
            </a>

            <div className="navbar-links">
              <a href="/" className="navbar-link active">
                Dashboard
              </a>
              <a href="#validators" className="navbar-link">
                Validators
              </a>
              <a href="#allocation" className="navbar-link">
                Allocation
              </a>
              <button className="btn btn-primary btn-sm" id="connect-wallet">
                Connect Wallet
              </button>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
