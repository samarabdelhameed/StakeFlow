"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TiltCard, AnimatedCounter, StaggerContainer, StaggerItem } from "@/components/UIComponents";
import { ConfettiButton } from "@/components/ConfettiButton";
import { Card3D, Button3D } from "@/components/3D/Card3D";

const VALIDATORS = [
  { name: "Validator Alpha", score: 8900, commission: "5%", risk: "Low", color: "#CAFF33" },
  { name: "Validator Beta", score: 9400, commission: "3%", risk: "Low", color: "#8B5CF6" },
  { name: "Validator Gamma", score: 7920, commission: "7%", risk: "Medium", color: "#06D6A0" },
  { name: "Validator Delta", score: 7820, commission: "2%", risk: "Low", color: "#FF4D6A" },
  { name: "Validator Epsilon", score: 9560, commission: "8%", risk: "Medium", color: "#FFB800" },
];

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositComplete, setDepositComplete] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const estimatedAPY = 5.2;
  const estimatedReward = numAmount * (estimatedAPY / 100);

  function handleDeposit() {
    if (numAmount < 0.01) return;
    setShowConfirm(true);
  }

  function handleConfirm() {
    setIsDepositing(true);
    setTimeout(() => {
      setIsDepositing(false);
      setDepositComplete(true);
    }, 2000);
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>💎 Deposit Stake</h1>
          <p>Deposit ETH and let the algorithm optimize your allocation</p>
        </div>
        <Link href="/" className="btn btn-outline btn-sm">← Back to Dashboard</Link>
      </div>

      <div className="grid-2" style={{ gap: "32px" }}>
        {/* Input Section */}
        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor="#CAFF33" height="auto" style={{ marginBottom: "24px" }}>
              <h3 className="section-title" style={{ marginBottom: "24px" }}>Staking Amount</h3>

              <div className="input-group" style={{ marginBottom: "24px" }}>
                <label className="input-label">Amount to Stake</label>
                <div className="input-wrapper">
                  <input
                    className="input input-lg"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.1"
                    style={{ paddingRight: "70px" }}
                    id="deposit-amount"
                  />
                  <span className="input-suffix">ETH</span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                {[1, 5, 10, 25, 50].map((v) => (
                  <button
                    key={v}
                    className="btn btn-outline btn-sm"
                    onClick={() => setAmount(String(v))}
                    style={{
                      flex: 1,
                      borderColor: amount === String(v) ? "var(--neon-green)" : undefined,
                      color: amount === String(v) ? "var(--neon-green)" : undefined,
                    }}
                  >
                    {v} ETH
                  </button>
                ))}
              </div>

              {/* Validator Selection */}
              <div className="input-group" style={{ marginBottom: "24px" }}>
                <label className="input-label">Select Validator (Optional)</label>
                <div style={{ position: "relative" }}>
                  <button
                    className="input"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontFamily: "'Inter', sans-serif",
                    }}
                    id="validator-dropdown"
                  >
                    <span style={{ color: selectedValidator ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {selectedValidator || "Auto-optimize across all validators"}
                    </span>
                    <motion.span
                      animate={{ rotate: dropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▼
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scaleY: 0.9 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -10, scaleY: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: "absolute",
                          top: "calc(100% + 8px)",
                          left: 0,
                          right: 0,
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-hover)",
                          borderRadius: "var(--radius-md)",
                          overflow: "hidden",
                          zIndex: 50,
                          boxShadow: "var(--shadow-lg)",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px 16px",
                            cursor: "pointer",
                            transition: "background 0.15s",
                            borderBottom: "1px solid var(--border-card)",
                          }}
                          onClick={() => { setSelectedValidator(null); setDropdownOpen(false); }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <span style={{ color: "var(--neon-green)", fontWeight: 600 }}>🧠 Auto-Optimize</span>
                          <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            AI distributes across all validators
                          </span>
                        </div>
                        {VALIDATORS.map((v) => (
                          <div
                            key={v.name}
                            style={{
                              padding: "12px 16px",
                              cursor: "pointer",
                              transition: "background 0.15s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderBottom: "1px solid var(--border-card)",
                            }}
                            onClick={() => { setSelectedValidator(v.name); setDropdownOpen(false); }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{
                                width: "10px", height: "10px", borderRadius: "3px",
                                backgroundColor: v.color,
                              }} />
                              <span style={{ fontWeight: 500 }}>{v.name}</span>
                            </div>
                            <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>
                              Score: {v.score}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Deposit Button */}
              <Button3D
                variant="primary"
                size="lg"
                style={{ width: "100%" }}
                onClick={handleDeposit}
                disabled={numAmount < 0.01}
              >
                ⚡ Deposit & Optimize
              </Button3D>
            </Card3D>
          </StaggerItem>
        </StaggerContainer>

        {/* Estimation Card */}
        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor="#8B5CF6" height="auto" style={{ marginBottom: "24px" }}>
              <h3 className="section-title" style={{ marginBottom: "20px" }}>📊 Estimation</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)" }}>Deposit Amount</span>
                  <span className="mono" style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--neon-green)" }}>
                    {numAmount.toFixed(2)} ETH
                  </span>
                </div>
                <div className="divider" style={{ margin: "0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Estimated APY</span>
                  <span className="mono" style={{ fontWeight: 600, color: "var(--cyan)" }}>{estimatedAPY}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Est. Annual Return</span>
                  <span className="mono" style={{ fontWeight: 600, color: "var(--neon-green)" }}>
                    ~{estimatedReward.toFixed(4)} ETH
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Strategy</span>
                  <span className="badge badge-purple">Weighted Score</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Risk Level</span>
                  <span className="badge badge-green">Low</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Withdrawal Cooldown</span>
                  <span className="mono" style={{ fontSize: "0.85rem" }}>24 hours</span>
                </div>
              </div>
            </Card3D>
          </StaggerItem>

          <StaggerItem>
            <div className="card">
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "16px" }}>How It Works</h4>
              {[
                { step: "1", title: "Deposit ETH", desc: "Enter your amount and confirm" },
                { step: "2", title: "AI Allocation", desc: "Algorithm distributes across validators" },
                { step: "3", title: "Earn Rewards", desc: "Receive optimized staking returns" },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", gap: "14px", alignItems: "flex-start",
                  padding: "12px 0", borderBottom: i < 2 ? "1px solid var(--border-card)" : "none",
                }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "var(--radius-sm)",
                    background: "var(--neon-green-dim)", color: "var(--neon-green)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: "0.85rem", flexShrink: 0,
                  }}>
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "2px" }}>{s.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isDepositing && setShowConfirm(false)}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {!depositComplete ? (
                <>
                  <button
                    className="modal-close"
                    onClick={() => !isDepositing && setShowConfirm(false)}
                  >
                    ✕
                  </button>

                  <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "12px" }}>
                      {isDepositing ? "⏳" : "💎"}
                    </div>
                    <h3>{isDepositing ? "Processing Deposit..." : "Confirm Deposit"}</h3>
                  </div>

                  <div style={{
                    background: "var(--bg-input)", borderRadius: "var(--radius-md)",
                    padding: "16px", marginBottom: "20px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Amount</span>
                      <span className="mono" style={{ fontWeight: 700, color: "var(--neon-green)" }}>
                        {numAmount} ETH
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Validator</span>
                      <span style={{ fontWeight: 500 }}>{selectedValidator || "Auto-Optimize"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Est. APY</span>
                      <span className="mono" style={{ color: "var(--cyan)" }}>{estimatedAPY}%</span>
                    </div>
                  </div>

                  {isDepositing ? (
                    <div className="progress-bar" style={{ height: "8px" }}>
                      <motion.div
                        className="progress-fill"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "linear" }}
                        style={{ background: "linear-gradient(90deg, var(--neon-green), var(--cyan))" }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        className="btn btn-outline"
                        style={{ flex: 1 }}
                        onClick={() => setShowConfirm(false)}
                      >
                        Cancel
                      </button>
                      <motion.button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={handleConfirm}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ⚡ Confirm Deposit
                      </motion.button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: "center" }}
                >
                  <div style={{ fontSize: "4rem", marginBottom: "16px" }}>✅</div>
                  <h3 style={{ marginBottom: "8px", color: "var(--neon-green)" }}>Deposit Successful!</h3>
                  <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
                    {numAmount} ETH has been deposited and allocated optimally
                  </p>
                  <Link href="/allocation" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                    🧠 View Allocation
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
