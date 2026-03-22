"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card3D, StatsCard3D, Button3D } from "@/components/3D/Card3D";
import { AllocationChart3D } from "@/components/3D/Charts3D";
import { StaggerContainer, StaggerItem } from "@/components/UIComponents";
import { useStakeFlow } from "@/hooks/useStakeFlow";
import { formatEther } from "viem";
import toast from "react-hot-toast";


const COLORS = ["#CAFF33", "#8B5CF6", "#06D6A0", "#FF4D6A", "#00F5FF"];

// Mock staked positions
const STAKED_POSITIONS = [
  { validator: "Validator Epsilon", amount: 21.92, apy: 5.8, color: COLORS[0], canWithdraw: 18.5, locked: 3.42 },
  { validator: "Validator Beta", amount: 21.55, apy: 5.2, color: COLORS[1], canWithdraw: 21.55, locked: 0 },
  { validator: "Validator Alpha", amount: 20.41, apy: 4.9, color: COLORS[2], canWithdraw: 15.2, locked: 5.21 },
  { validator: "Validator Gamma", amount: 18.16, apy: 4.5, color: COLORS[3], canWithdraw: 18.16, locked: 0 },
  { validator: "Validator Delta", amount: 17.93, apy: 4.2, color: COLORS[4], canWithdraw: 10.8, locked: 7.13 },
];

export default function WithdrawPage() {
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawType, setWithdrawType] = useState<"partial" | "full">("partial");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { position, withdraw } = useStakeFlow();

  // If real position exists, use it. Otherwise use dummy for UI state.
  const userTotalStaked = position ? parseFloat(position.deposited) : 0;
  const userAvailable = position ? parseFloat(position.deposited) : 0;

  const STAKED_POSITIONS = [
    { validator: "AI Pooled Engine", amount: userTotalStaked, apy: 5.2, color: COLORS[0], canWithdraw: userAvailable, locked: 0 },
  ];


  const totalStaked = STAKED_POSITIONS.reduce((sum, pos) => sum + pos.amount, 0);
  const totalAvailable = STAKED_POSITIONS.reduce((sum, pos) => sum + pos.canWithdraw, 0);
  const totalLocked = STAKED_POSITIONS.reduce((sum, pos) => sum + pos.locked, 0);
  
  const selectedAmount = selectedPositions.reduce((sum, validator) => {
    const pos = STAKED_POSITIONS.find(p => p.validator === validator);
    return sum + (pos?.canWithdraw || 0);
  }, 0);

  const handlePositionToggle = (validator: string) => {
    setSelectedPositions(prev => 
      prev.includes(validator) 
        ? prev.filter(v => v !== validator)
        : [...prev, validator]
    );
  };

  const handleWithdraw = () => {
    if (withdrawType === "partial" && parseFloat(withdrawAmount) > totalAvailable) {
      alert("Insufficient Balance");
      return;
    }
    if (withdrawType === "full" && selectedPositions.length === 0) {
      alert("Please select a position to withdraw");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const amountToWithdraw = withdrawType === "partial" ? withdrawAmount : String(userAvailable);
      const hash = await withdraw(amountToWithdraw);
      if (hash) {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <>
      <div className="section-header" style={{ marginBottom: "48px" }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "3rem", marginBottom: "8px" }}>Withdraw Stakes</h1>
          <p style={{ color: "var(--text-dim)", fontSize: "1rem" }}>Unstake your ETH with flexible withdrawal options</p>
        </div>
        <Link href="/">
          <Button3D variant="outline" size="sm" style={{ border: "1px solid var(--glass-border)", color: "white" }}>
            ← Back to Portfolio
          </Button3D>
        </Link>
      </div>

      <StaggerContainer className="grid-4 section">
        <StaggerItem>
          <StatsCard3D title="Total Staked" value={totalStaked} suffix=" ETH" icon="💎" color="var(--neon-green)" />
        </StaggerItem>
        <StaggerItem>
          <StatsCard3D title="Available to Withdraw" value={totalAvailable} suffix=" ETH" change={2.1} changeType="positive" icon="✅" color="var(--neon-blue)" />
        </StaggerItem>
        <StaggerItem>
          <StatsCard3D title="Locked (Cooldown)" value={totalLocked} suffix=" ETH" icon="🔒" color="var(--neon-purple)" />
        </StaggerItem>
        <StaggerItem>
          <StatsCard3D title="Est. Withdrawal Time" value={24} suffix=" hours" icon="⏳" color="var(--neon-amber)" />
        </StaggerItem>
      </StaggerContainer>

      <div className="grid-2 section">
        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor="var(--neon-purple)" height={600}>
              <div className="section-header" style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "1.2rem" }}>Withdrawal Configuration</h3>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-dim)", marginBottom: "12px", textTransform: "uppercase" }}>
                  Withdrawal Type
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    className={`btn ${withdrawType === "partial" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setWithdrawType("partial")}
                    style={{ flex: 1, padding: "12px", borderRadius: "12px", border: withdrawType === "partial" ? "none" : "1px solid var(--glass-border)" }}
                  >
                    Partial
                  </button>
                  <button
                    className={`btn ${withdrawType === "full" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setWithdrawType("full")}
                    style={{ flex: 1, padding: "12px", borderRadius: "12px", border: withdrawType === "full" ? "none" : "1px solid var(--glass-border)" }}
                  >
                    Full Positions
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {withdrawType === "partial" ? (
                  <motion.div key="partial" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="glass-card" style={{ padding: "24px", background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", marginBottom: "32px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase" }}>Amount to Withdraw</label>
                        <span style={{ fontSize: "0.85rem", color: "var(--neon-green)" }}>Max: {totalAvailable.toFixed(2)} ETH</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "12px 20px", border: "1px solid var(--glass-border-bright)" }}>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                          style={{ flex: 1, background: "transparent", border: "none", color: "white", fontSize: "1.5rem", fontWeight: "800", outline: "none" }}
                        />
                        <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--neon-green)" }}>ETH</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                        {[25, 50, 75, 100].map((percent) => (
                          <button
                            key={percent}
                            className="btn btn-ghost"
                            onClick={() => setWithdrawAmount((totalAvailable * percent / 100).toFixed(2))}
                            style={{ flex: 1, fontSize: "0.8rem", padding: "8px", border: "1px solid rgba(255,255,255,0.05)" }}
                          >
                            {percent}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div style={{ marginBottom: "32px", maxHeight: "250px", overflowY: "auto", paddingRight: "8px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-dim)", marginBottom: "12px", textTransform: "uppercase" }}>Select Positions</label>
                      {STAKED_POSITIONS.map((position) => {
                        const isSelected = selectedPositions.includes(position.validator);
                        return (
                          <motion.div
                            key={position.validator}
                            onClick={() => handlePositionToggle(position.validator)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="glass-card"
                            style={{
                              padding: "16px",
                              marginBottom: "12px",
                              cursor: "pointer",
                              border: isSelected ? `1px solid ${position.color}` : "1px solid var(--glass-border)",
                              background: isSelected ? `${position.color}15` : "rgba(255,255,255,0.02)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: "700", color: "white" }}>{position.validator}</div>
                              <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginTop: "4px" }}>
                                Available: {position.canWithdraw} ETH
                                {position.locked > 0 && <span style={{ color: "var(--neon-purple)", marginLeft: "8px" }}>(Locked: {position.locked})</span>}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: "800", color: position.color }}>{position.amount} ETH</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{position.apy}% APY</div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ marginTop: "auto" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", padding: "0 8px" }}>
                    <span style={{ color: "var(--text-dim)", fontWeight: "600", fontSize: "0.9rem" }}>Total to Withdraw</span>
                    <span style={{ color: "white", fontWeight: "800", fontSize: "1.1rem" }}>
                      {withdrawType === "partial" ? `${parseFloat(withdrawAmount || "0").toFixed(2)} ETH` : `${selectedAmount.toFixed(2)} ETH`}
                    </span>
                 </div>
                 <Button3D
                  variant="primary"
                  size="lg"
                  style={{ width: "100%", background: "linear-gradient(90deg, #FF4D6A, #8B5CF6)", border: "none" }}
                  onClick={handleWithdraw}
                  disabled={
                    (withdrawType === "partial" && (parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > totalAvailable)) ||
                    (withdrawType === "full" && selectedPositions.length === 0)
                  }
                 >
                   🚀 {withdrawType === "partial" ? "Initiate Partial Withdrawal" : "Unstake Selected"}
                 </Button3D>
              </div>
            </Card3D>
          </StaggerItem>
        </StaggerContainer>

        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor="var(--neon-blue)" height={600}>
              <div className="section-header" style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "1.2rem" }}>Position Overview</h3>
                <span className="badge-neon" style={{ borderColor: "var(--neon-blue)", color: "var(--neon-blue)", background: "rgba(0, 245, 255, 0.1)" }}>Real-time</span>
              </div>
              <div style={{ height: "450px", width: "100%", minWidth: 0 }}>
                <AllocationChart3D
                  data={STAKED_POSITIONS.map(pos => ({
                    name: pos.validator.split(" ")[1],
                    value: pos.amount,
                    color: pos.color,
                  }))}
                />
              </div>
            </Card3D>
          </StaggerItem>
        </StaggerContainer>
      </div>

      <StaggerContainer className="section">
        <StaggerItem>
          <Card3D glowColor="var(--neon-amber)" style={{ height: "auto" }}>
            <h3 className="section-title" style={{ marginBottom: "24px" }}>Withdrawal Queue</h3>
            <div className="grid-3" style={{ gap: "20px" }}>
              {[
                { status: "Processing", amount: "5.20 ETH", time: "18h remaining", color: "var(--neon-amber)" },
                { status: "Pending Queue", amount: "12.80 ETH", time: "2 days remaining", color: "var(--neon-purple)" },
                { status: "Ready to Claim", amount: "3.10 ETH", time: "Available now", color: "var(--neon-green)" },
              ].map((item, i) => (
                <div key={i} className="glass-card" style={{ padding: "24px", border: `1px solid ${item.color}30`, background: `linear-gradient(145deg, rgba(255,255,255,0.02), ${item.color}05)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                    <span style={{ fontWeight: "700", color: item.color, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>{item.status}</span>
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: "900", color: "white", marginBottom: "8px", letterSpacing: "-0.5px" }}>
                    {item.amount.split(' ')[0]} <span style={{ fontSize: "1rem", color: "var(--text-dim)" }}>ETH</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-dim)", fontWeight: "600" }}>{item.time}</div>
                </div>
              ))}
            </div>
          </Card3D>
        </StaggerItem>
      </StaggerContainer>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
            onClick={() => !isProcessing && !success && setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card deposit-success-modal"
              style={{ width: "100%", maxWidth: "450px", padding: "40px", textAlign: "center", border: "1px solid var(--glass-border-bright)", background: "var(--bg-secondary)" }}
            >
              {!success ? (
                <>
                  <div style={{ fontSize: "4rem", marginBottom: "16px", filter: "drop-shadow(0 0 20px rgba(255, 77, 106, 0.4))" }}>
                    {isProcessing ? "⏳" : "🔓"}
                  </div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "white", marginBottom: "8px" }}>
                    {isProcessing ? "Processing Request" : "Confirm Withdrawal"}
                  </h2>
                  <p style={{ color: "var(--text-dim)", fontSize: "0.95rem", marginBottom: "32px" }}>
                    {isProcessing 
                      ? "Submitting withdrawal intent to the network..." 
                      : "Please review your withdrawal request below."}
                  </p>

                  <div className="glass-card" style={{ background: "rgba(0,0,0,0.3)", padding: "20px", marginBottom: "32px", textAlign: "left" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" }}>
                      <span style={{ color: "var(--text-dim)" }}>Amount</span>
                      <span style={{ color: "var(--neon-green)", fontWeight: "800", fontSize: "1.1rem" }}>
                        {withdrawType === "partial" ? parseFloat(withdrawAmount).toFixed(2) : selectedAmount.toFixed(2)} ETH
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" }}>
                      <span style={{ color: "var(--text-dim)" }}>Processing Time</span>
                      <span style={{ color: "white", fontWeight: "600" }}>~24 hours</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-dim)" }}>Network Fee</span>
                      <span style={{ color: "white", fontWeight: "600" }}>0.005 ETH</span>
                    </div>
                  </div>

                  {isProcessing ? (
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "linear" }}
                        style={{ height: "100%", background: "linear-gradient(90deg, #FF4D6A, #8B5CF6)", boxShadow: "0 0 15px #FF4D6A" }}
                      />
                    </div>
                  ) : (
                    <Button3D
                      variant="primary"
                      size="lg"
                      style={{ width: "100%", background: "linear-gradient(90deg, #FF4D6A, #8B5CF6)", border: "none" }}
                      onClick={handleConfirm}
                    >
                      Confirm Request
                    </Button3D>
                  )}
                </>
              ) : (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <div style={{ fontSize: "5rem", marginBottom: "16px" }}>🎉</div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--neon-green)", marginBottom: "8px", textShadow: "0 0 20px rgba(202, 255, 51, 0.3)" }}>
                    Request Submitted!
                  </h2>
                  <p style={{ color: "var(--text-dim)", marginBottom: "32px" }}>
                    Your withdrawal queue position has been secured on-chain.
                  </p>
                  <Button3D variant="outline" size="lg" style={{ width: "100%", color: "var(--neon-green)", borderColor: "var(--neon-green)" }} onClick={() => setShowConfirm(false)}>
                    View Queue Status
                  </Button3D>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}