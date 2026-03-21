"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/UIComponents";

const MOCK_TXS = [
  { id: 1, type: "Deposit", amount: "10.00 ETH", validator: "Auto-Optimize", status: "Completed", time: "2 min ago", hash: "0xabc1...ef90", risk: "low" },
  { id: 2, type: "Allocation", amount: "2.19 ETH", validator: "Validator Epsilon", status: "Completed", time: "2 min ago", hash: "0xdef2...ab12", risk: "medium" },
  { id: 3, type: "Allocation", amount: "2.16 ETH", validator: "Validator Beta", status: "Completed", time: "2 min ago", hash: "0xghi3...cd34", risk: "low" },
  { id: 4, type: "Reward", amount: "+0.042 ETH", validator: "Validator Alpha", status: "Confirmed", time: "1 hour ago", hash: "0xjkl4...ef56", risk: "low" },
  { id: 5, type: "Deposit", amount: "25.00 ETH", validator: "Auto-Optimize", status: "Confirmed", time: "3 hours ago", hash: "0xmno5...gh78", risk: "low" },
  { id: 6, type: "Allocation", amount: "5.10 ETH", validator: "Validator Gamma", status: "Confirmed", time: "3 hours ago", hash: "0xpqr6...ij90", risk: "medium" },
  { id: 7, type: "Reward", amount: "+0.15 ETH", validator: "Validator Beta", status: "Completed", time: "1 day ago", hash: "0xstu7...kl12", risk: "low" },
  { id: 8, type: "Withdrawal", amount: "-5.00 ETH", validator: "Validator Delta", status: "Completed", time: "2 days ago", hash: "0xvwx8...mn34", risk: "low" },
];

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  Deposit: { icon: "💎", color: "var(--neon-green)", bg: "var(--neon-green-dim)" },
  Allocation: { icon: "🧠", color: "var(--purple)", bg: "var(--purple-dim)" },
  Reward: { icon: "🎁", color: "var(--cyan)", bg: "var(--cyan-dim)" },
  Withdrawal: { icon: "📤", color: "var(--amber)", bg: "var(--amber-dim)" },
};

const statusConfig: Record<string, { badge: string; label: string }> = {
  Pending: { badge: "badge-amber", label: "⏳ Pending" },
  Confirmed: { badge: "badge-purple", label: "✓ Confirmed" },
  Completed: { badge: "badge-green", label: "✅ Completed" },
};

export default function TransactionsPage() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All"
    ? MOCK_TXS
    : MOCK_TXS.filter((tx) => tx.type === filter);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>📋 Transactions</h1>
          <p>Live transaction feed & staking history</p>
        </div>
        <div className="topbar-right">
          <div className="tabs">
            {["All", "Deposit", "Allocation", "Reward", "Withdrawal"].map((f) => (
              <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <StaggerContainer className="grid-4 section">
        {[
          { label: "Total Deposits", value: "35.00 ETH", icon: "💎", color: "var(--neon-green)" },
          { label: "Total Rewards", value: "0.192 ETH", icon: "🎁", color: "var(--cyan)" },
          { label: "Transactions", value: "8", icon: "📜", color: "var(--purple)" },
          { label: "Avg Gas", value: "0.002 ETH", icon: "⛽", color: "var(--amber)" },
        ].map((s, i) => (
          <StaggerItem key={i}>
            <div className="card stat-card">
              <div className="stat-icon" style={{ background: `${s.color}15`, fontSize: "1.2rem" }}>
                {s.icon}
              </div>
              <span className="stat-label">{s.label}</span>
              <span className="mono" style={{ fontSize: "1.3rem", fontWeight: 700, color: s.color }}>
                {s.value}
              </span>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Transaction Feed */}
      <motion.div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-card)" }}>
          <h3 className="section-title">Transaction Feed</h3>
        </div>

        <AnimatePresence>
          {filtered.map((tx, i) => {
            const config = typeConfig[tx.type] || typeConfig.Deposit;
            const status = statusConfig[tx.status] || statusConfig.Completed;

            return (
              <motion.div
                key={tx.id}
                className="tx-card"
                style={{
                  margin: "8px 12px",
                  borderRadius: "var(--radius-md)",
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                whileHover={{ x: 4 }}
              >
                <div className="tx-icon" style={{ background: config.bg }}>
                  {config.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{tx.type}</span>
                    <span className={`badge ${status.badge}`} style={{ fontSize: "0.65rem" }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: "3px", width: "60%", marginBottom: "4px" }}>
                    <motion.div
                      className="progress-fill"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: tx.status === "Pending" ? "50%" : tx.status === "Confirmed" ? "80%" : "100%" 
                      }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      style={{ background: tx.status === "Completed" ? "var(--neon-green)" : "var(--cyan)" }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {tx.hash}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                      {tx.validator}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: tx.type === "Reward" ? "var(--cyan)" : tx.type === "Withdrawal" ? "var(--amber)" : config.color,
                  }}>
                    {tx.amount}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    {tx.time}
                  </div>
                </div>

                <motion.a
                  href="#"
                  className="btn btn-ghost btn-sm"
                  whileHover={{ scale: 1.1 }}
                  style={{ fontSize: "0.75rem", padding: "6px 10px" }}
                  title="View on Blockchain"
                >
                  🔗
                </motion.a>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
