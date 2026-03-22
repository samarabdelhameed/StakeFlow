"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/UIComponents";
import { Card3D, Button3D } from "@/components/3D/Card3D";
import toast from "react-hot-toast";
import { useStakeFlow } from "@/hooks/useStakeFlow";


const VALIDATORS = [
  { name: "Validator Alpha", score: 8900, commission: "5%", risk: "Low", color: "var(--neon-green)" },
  { name: "Validator Beta", score: 9400, commission: "3%", risk: "Low", color: "var(--neon-purple)" },
  { name: "Validator Gamma", score: 7920, commission: "7%", risk: "Medium", color: "var(--neon-blue)" },
  { name: "Validator Delta", score: 7820, commission: "2%", risk: "Low", color: "var(--neon-rose)" },
  { name: "Validator Epsilon", score: 9560, commission: "8%", risk: "Medium", color: "var(--neon-amber)" },
];

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositComplete, setDepositComplete] = useState(false);
  const { deposit } = useStakeFlow();


  const numAmount = parseFloat(amount) || 0;
  const estimatedAPY = 5.2;
  const estimatedReward = numAmount * (estimatedAPY / 100);

  function handleDeposit() {
    if (numAmount < 0.0001) {
      toast.error("Amount is below minimum deposit");
      return;
    }
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setIsDepositing(true);
    try {
      const hash = await deposit(amount);
      if (hash) {
        setDepositComplete(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDepositing(false);
    }
  }


  return (
    <>
      <div className="section-header" style={{ marginBottom: "48px" }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "3rem", marginBottom: "8px" }}>Deposit Stake</h1>
          <p style={{ color: "var(--text-dim)", fontSize: "1rem" }}>Secure your assets with our AI-optimized engine</p>
        </div>
        <Link href="/">
           <Button3D variant="outline" size="sm">← Back to Portfolio</Button3D>
        </Link>
      </div>

      <div className="grid-2 section" style={{ gap: "32px", alignItems: "start" }}>
        {/* Input Section */}
        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor="var(--neon-green)" height="auto" style={{ marginBottom: "24px" }}>
              <h3 style={{ marginBottom: "24px", fontSize: "1.2rem" }}>Staking Configuration</h3>

              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", color: "var(--text-dim)", fontSize: "0.85rem", fontWeight: "700", marginBottom: "12px", textTransform: "uppercase" }}>
                  Stake Amount (ETH)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ 
                      width: "100%", 
                      background: "rgba(255,255,255,0.03)", 
                      border: "1px solid var(--glass-border)", 
                      borderRadius: "12px", 
                      padding: "20px 24px", 
                      fontSize: "2rem",
                      fontWeight: "800",
                      color: "white",
                      fontFamily: "Outfit",
                      outline: "none",
                      boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)"
                    }}
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <div style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem", fontWeight: "800", color: "var(--neon-green)" }}>
                    ETH
                  </div>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "32px" }}>
                {[1, 5, 10, 25, 50].map((v) => (
                  <motion.button
                    key={v}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAmount(String(v))}
                    style={{
                      padding: "12px 0",
                      background: amount === String(v) ? "var(--neon-green)" : "rgba(255,255,255,0.05)",
                      color: amount === String(v) ? "var(--bg-primary)" : "var(--text-dim)",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: "800",
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    {v}
                  </motion.button>
                ))}
              </div>

              {/* Validator Selection */}
              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", color: "var(--text-dim)", fontSize: "0.85rem", fontWeight: "700", marginBottom: "12px", textTransform: "uppercase" }}>
                  Allocation Target
                </label>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "12px",
                      padding: "16px 20px",
                      color: "white",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      fontSize: "1rem"
                    }}
                  >
                    <span>
                      {selectedValidator ? <span style={{ color: "var(--neon-purple)" }}>● {selectedValidator}</span> : "🧠 AI Multi-Validator Optimization"}
                    </span>
                    <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }}>▼</motion.span>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0 }}
                        style={{
                          position: "absolute",
                          top: "calc(100% + 10px)",
                          left: 0,
                          right: 0,
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "16px",
                          overflow: "hidden",
                          zIndex: 100,
                          boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                          transformOrigin: "top"
                        }}
                      >
                        <div
                          style={{ padding: "16px 20px", cursor: "pointer", borderBottom: "1px solid var(--glass-border)" }}
                          onClick={() => { setSelectedValidator(null); setDropdownOpen(false); }}
                        >
                          <span style={{ color: "var(--neon-green)", fontWeight: "800" }}>🧠 AI Managed Engine</span>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>Recommended: Optimized risk/reward ratio</p>
                        </div>
                        {VALIDATORS.map((v) => (
                          <div
                            key={v.name}
                            style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                            onClick={() => { setSelectedValidator(v.name); setDropdownOpen(false); }}
                          >
                            <span style={{ color: "white", fontWeight: "600" }}>{v.name}</span>
                            <span className="badge-neon" style={{ fontSize: "0.65rem", padding: "4px 8px" }}>Score: {v.score}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <Button3D
                variant="primary"
                size="lg"
                style={{ width: "100%", fontSize: "1.1rem" }}
                onClick={handleDeposit}
                disabled={numAmount < 0.0001}
              >
                🚀 INITIATE RESTAKING
              </Button3D>
            </Card3D>
          </StaggerItem>
        </StaggerContainer>

        {/* Estimation Card */}
        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor="var(--neon-purple)" height="auto" style={{ marginBottom: "24px" }}>
              <h3 style={{ marginBottom: "24px", fontSize: "1.2rem" }}>Yield Projections</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-dim)" }}>Principal Deposit</span>
                  <span style={{ fontWeight: "800", fontSize: "1.4rem", color: "white" }}>
                    {numAmount.toFixed(4)} <span style={{ color: "var(--neon-green)", fontSize: "0.9rem" }}>ETH</span>
                  </span>
                </div>
                <div style={{ height: "1px", background: "var(--glass-border)" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-dim)" }}>Optimized APY</span>
                  <span style={{ fontWeight: "800", color: "var(--neon-blue)", fontSize: "1.1rem" }}>{estimatedAPY}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-dim)" }}>Estimated Annual</span>
                  <span style={{ fontWeight: "800", color: "var(--neon-green)", fontSize: "1.1rem" }}>
                    +{estimatedReward.toFixed(4)} ETH
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <span style={{ color: "var(--text-dim)" }}>Security Level</span>
                   <span className="badge-neon">High Priority</span>
                </div>
              </div>
            </Card3D>
          </StaggerItem>

          <StaggerItem>
            <div className="glass-card" style={{ padding: "32px" }}>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "24px" }}>Infrastructure Insights</h4>
              {[
                { title: "Non-Custodial", desc: "You maintain full ownership of your keys" },
                { title: "Real-time Monitoring", desc: "Continuous uptime verification" },
                { title: "Dynamic Slashing Guard", desc: "Automated exit if validator health drops" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--neon-green)", color: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "900", flexShrink: 0 }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", color: "white", fontSize: "0.95rem" }}>{s.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginTop: "2px" }}>{s.desc}</div>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "24px"
            }}
            onClick={() => !isDepositing && setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="glass-card"
              style={{ padding: "48px", width: "100%", maxWidth: "500px", textAlign: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              {!depositComplete ? (
                <>
                  <div style={{ fontSize: "4rem", marginBottom: "24px" }}>{isDepositing ? "⚙️" : "🏦"}</div>
                  <h2 style={{ marginBottom: "16px" }}>{isDepositing ? "Synchronizing..." : "Confirm Deployment"}</h2>
                  <p style={{ color: "var(--text-dim)", marginBottom: "32px" }}>
                    Finalize your stake of <span style={{ color: "white", fontWeight: "800" }}>{numAmount} ETH</span> via {selectedValidator || "AI Managed Engine"}
                  </p>

                  {isDepositing ? (
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", marginBottom: "24px" }}>
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2 }}
                        style={{ height: "100%", background: "var(--gradient-primary)" }}
                       />
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <Button3D variant="outline" onClick={() => setShowConfirm(false)}>Abort</Button3D>
                      <Button3D variant="primary" onClick={handleConfirm}>Execute</Button3D>
                    </div>
                  )}
                </>
              ) : (
                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                  <div style={{ fontSize: "5rem", marginBottom: "24px" }}>🎉</div>
                  <h2 style={{ color: "var(--neon-green)", marginBottom: "16px" }}>Restaked Successfully</h2>
                  <p style={{ color: "var(--text-dim)", marginBottom: "40px" }}>Your position has been minted and secured on-chain.</p>
                  <Link href="/allocation">
                    <Button3D variant="primary" style={{ width: "100%" }}>View Position Dynamics</Button3D>
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
