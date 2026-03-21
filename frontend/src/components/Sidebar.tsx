"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "📊", href: "/", badge: null },
  { label: "Deposit Stake", icon: "💎", href: "/deposit", badge: null },
  { label: "Allocation", icon: "🧠", href: "/allocation", badge: "AI" },
  { label: "Transactions", icon: "📋", href: "/transactions", badge: null },
  { label: "Analytics", icon: "📈", href: "/analytics", badge: null },
];

const BOTTOM_ITEMS = [
  { label: "Settings", icon: "⚙️", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">SF</div>
        <span className="sidebar-logo-text gradient-text">StakeFlow</span>
      </div>

      {/* Main Nav */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Main</div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="sidebar-badge">{item.badge}</span>}
          </Link>
        ))}
      </div>

      {/* Protocol Info */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Protocol</div>
        <Link href="#" className="sidebar-link">
          <span className="icon">🔗</span>
          <span>Contracts</span>
        </Link>
        <Link href="#" className="sidebar-link">
          <span className="icon">📄</span>
          <span>Documentation</span>
        </Link>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom Nav */}
      <div className="sidebar-section">
        {BOTTOM_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Wallet Status */}
      <div
        className="card"
        style={{
          padding: "14px 16px",
          background: "var(--neon-green-dim)",
          border: "1px solid rgba(202, 255, 51, 0.1)",
          marginTop: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span className="status-dot active"></span>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--neon-green)" }}>
            Connected
          </span>
        </div>
        <div className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          0x1a2B...9cD4
        </div>
      </div>
    </aside>
  );
}
