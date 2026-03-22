"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnection, WalletConnectionFallback } from "./WalletConnection";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "📊", href: "/", badge: null },
  { label: "Deposit Stake", icon: "💎", href: "/deposit", badge: null },
  { label: "Allocation", icon: "🧠", href: "/allocation", badge: "AI" },
  { label: "Withdraw", icon: "💸", href: "/withdraw", badge: null },
  { label: "Rewards", icon: "🎁", href: "/rewards", badge: "NEW" },
  { label: "Transactions", icon: "📋", href: "/transactions", badge: null },
  { label: "Analytics", icon: "📈", href: "/analytics", badge: null },
];

const BOTTOM_ITEMS = [
  { label: "Settings", icon: "⚙️", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar glass-card" style={{ 
      position: "fixed", 
      top: "12px", 
      left: "12px", 
      bottom: "12px", 
      width: "260px", 
      zIndex: 100,
      margin: 0,
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid var(--glass-border)",
      borderRadius: "var(--radius-lg)"
    }}>
      {/* 3D Glow Mesh */}
      <div className="glow-mesh" style={{ opacity: 0.15 }} />

      {/* Logo */}
      <div className="sidebar-logo" style={{ marginBottom: "40px", padding: "0 8px" }}>
        <div className="sidebar-logo-icon" style={{ 
          width: "40px", 
          height: "40px", 
          background: "var(--gradient-primary)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "800",
          fontSize: "1.2rem",
          color: "var(--bg-primary)",
          boxShadow: "0 0 20px var(--neon-green-glow)"
        }}>SF</div>
        <span className="sidebar-logo-text gradient-text" style={{ fontSize: "1.5rem", fontWeight: "800", marginLeft: "12px" }}>StakeFlow</span>
      </div>

      {/* Main Nav */}
      <div className="sidebar-section">
        <div className="sidebar-section-title" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-dark)", marginBottom: "16px", paddingLeft: "12px", fontWeight: "700" }}>Platform</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: "12px",
                transition: "all 0.2s ease",
                color: pathname === item.href ? "var(--neon-green)" : "var(--text-dim)",
                background: pathname === item.href ? "rgba(202, 255, 51, 0.05)" : "transparent",
                fontWeight: pathname === item.href ? "700" : "500",
                textDecoration: "none"
              }}
            >
              <span className="icon" style={{ fontSize: "1.2rem", marginRight: "16px", opacity: pathname === item.href ? 1 : 0.6 }}>{item.icon}</span>
              <span style={{ fontSize: "0.95rem" }}>{item.label}</span>
              {item.badge && (
                <span className="badge-neon" style={{ 
                  marginLeft: "auto", 
                  fontSize: "0.6rem", 
                  padding: "2px 6px", 
                  borderRadius: "4px",
                  fontWeight: "800"
                }}>{item.badge}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom Nav */}
      <div className="sidebar-section" style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "24px", marginTop: "24px" }}>
        {BOTTOM_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              borderRadius: "12px",
              color: "var(--text-dim)",
              textDecoration: "none"
            }}
          >
            <span className="icon" style={{ fontSize: "1.2rem", marginRight: "16px" }}>{item.icon}</span>
            <span style={{ fontSize: "0.95rem" }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Wallet Connection */}
      <div style={{ marginTop: "20px" }}>
        <WalletConnection />
      </div>
    </aside>
  );
}
