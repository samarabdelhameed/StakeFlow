"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/UIComponents";
import { Card3D, StatsCard3D } from "@/components/3D/Card3D";

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
  Deposit: { icon: "💎", color: "var(--neon-green)", bg: "rgba(202, 255, 51, 0.1)" },
  Allocation: { icon: "🧠", color: "var(--neon-purple)", bg: "rgba(139, 92, 246, 0.1)" },
  Reward: { icon: "🎁", color: "var(--neon-cyan)", bg: "rgba(0, 245, 255, 0.1)" },
  Withdrawal: { icon: "📤", color: "var(--neon-amber)", bg: "rgba(255, 184, 0, 0.1)" },
};

export default function TransactionsPage() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All"
    ? MOCK_TXS
    : MOCK_TXS.filter((tx) => tx.type === filter);

  return (
    <>
      <div className="section-header" style={{ marginBottom: "48px" }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "3rem", marginBottom: "8px" }}>Transactions</h1>
          <p style={{ color: "var(--text-dim)", fontSize: "1rem" }}>Live transaction feed & staking history</p>
        </div>
        <div style={{ display: "flex", gap: "8px", background: "rgba(0,0,0,0.3)", padding: "6px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
          {["All", "Deposit", "Allocation", "Reward", "Withdrawal"].map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "rgba(255,255,255,0.1)" : "transparent",
                color: filter === f ? "white" : "var(--text-dim)",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <StaggerContainer className="grid-4 section">
        <StaggerItem>
          <StatsCard3D title="Total Deposits" value={35.00} suffix=" ETH" icon="💎" color="var(--neon-green)" />
        </StaggerItem>
        <StaggerItem>
          <StatsCard3D title="Total Rewards" value={0.192} suffix=" ETH" icon="🎁" color="var(--neon-cyan)" />
        </StaggerItem>
        <StaggerItem>
          <StatsCard3D title="Transactions" value={8} suffix="" icon="📜" color="var(--neon-purple)" />
        </StaggerItem>
        <StaggerItem>
          <StatsCard3D title="Avg Network Fee" value={0.002} suffix=" ETH" icon="⛽" color="var(--neon-amber)" />
        </StaggerItem>
      </StaggerContainer>

      <Card3D glowColor="var(--neon-blue)" style={{ height: "auto" }}>
        <div className="section-header" style={{ marginBottom: "24px", padding: "0 8px" }}>
          <h3 style={{ fontSize: "1.2rem" }}>Transaction Feed</h3>
          <span className="badge-neon" style={{ borderColor: "var(--neon-blue)", color: "var(--neon-blue)", background: "rgba(0, 245, 255, 0.1)" }}>Real-time</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((tx, i) => {
              const config = typeConfig[tx.type] || typeConfig.Deposit;

              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="glass-card"
                  style={{
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--glass-border)",
                    cursor: "pointer"
                  }}
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)", borderColor: config.color }}
                >
                  <div style={{ 
                    width: "48px", height: "48px", borderRadius: "12px", 
                    background: config.bg, display: "flex", alignItems: "center", 
                    justifyContent: "center", fontSize: "1.5rem", border: `1px solid ${config.color}30`,
                    boxShadow: `0 0 15px ${config.bg}`
                  }}>
                    {config.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 800, fontSize: "1rem", color: "white" }}>{tx.type}</span>
                      <span className="badge-neon" style={{ 
                        borderColor: tx.status === "Completed" ? "var(--neon-green)" : tx.status === "Confirmed" ? "var(--neon-purple)" : "var(--neon-amber)",
                        color: tx.status === "Completed" ? "var(--neon-green)" : tx.status === "Confirmed" ? "var(--neon-purple)" : "var(--neon-amber)",
                        background: "transparent",
                        fontSize: "0.65rem"
                      }}>
                        {tx.status}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span className="mono" style={{ fontSize: "0.85rem", color: "var(--text-dim)", display: "flex", gap: "6px", alignItems: "center" }}>
                        🔗 <span>{tx.hash}</span>
                      </span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-dim)", display: "flex", gap: "6px", alignItems: "center" }}>
                        🤖 <span>{tx.validator}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div className="mono" style={{ fontWeight: 800, fontSize: "1.1rem", color: config.color }}>
                      {tx.amount}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: "600" }}>
                      {tx.time}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filtered.length === 0 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "48px", textAlign: "center", color: "var(--text-dim)" }}>
               <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.5 }}>📭</div>
               No transactions found for filter: {filter}
             </motion.div>
          )}
        </div>
      </Card3D>
    </>
  );
}
