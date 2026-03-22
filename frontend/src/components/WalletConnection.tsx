"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export function WalletConnection() {
  try {
    const { isConnected } = useAccount();

    return (
      <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </div>
    );
  } catch (error) {
    console.warn("WalletConnection error:", error);
    return <WalletConnectionFallback />;
  }
}

// Fallback component for when Wagmi is not available
export function WalletConnectionFallback() {
  return (
    <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
      <button 
        className="btn btn-outline btn-sm"
        style={{ 
          padding: "8px 16px", 
          fontSize: "0.8rem",
          opacity: 0.7,
          cursor: "not-allowed"
        }}
        disabled
      >
        Connect Wallet
      </button>
    </div>
  );
}