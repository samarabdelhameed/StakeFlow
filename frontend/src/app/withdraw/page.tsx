"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card3D, StatsCard3D, Button3D } from "@/components/3D/Card3D";
import { AllocationChart3D } from "@/components/3D/Charts3D";
import { StaggerContainer, StaggerItem } from "@/components/UIComponents";

const COLORS = ["#CAFF33", "#8B5CF6", "#06D6A0", "#FF4D6A", "#FFB800"];

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
    if (withdrawType === "partial" && parseFloat(withdrawAmount) > totalAvailable) return;
    if (withdrawType === "full" && selectedPositions.length === 0) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirm(false);
      setSelectedPositions([]);
      setWithdrawAmount("");
    }, 3000);
  };

  return (
    <>
      {/* Header */}
      <div className="topbar">
        <div className="topbar-left">
          <h1>💸 Withdraw Stakes</h1>
          <p>Unstake your ETH with flexible withdrawal options</p>
        </div>
        <Link href="/" className="btn btn-outline btn-sm">← Back to Dashboard</Link>
      </div>

      {/* Overview Stats */}
      <StaggerContainer className="grid-4 section">
        <StaggerItem>
          <StatsCard3D
            title="Total Staked"
            value={totalStaked}
            suffix=" ETH"
            icon="💰"
            color="#CAFF33"
          />
        </StaggerItem>
        
        <StaggerItem>
          <StatsCard3D
            title="Available to Withdraw"
            value={totalAvailable}
            suffix=" ETH"
            change={2.1}
            changeType="positive"
            icon="✅"
            color="#06D6A0"
          />
        </StaggerItem>
        
        <StaggerItem>
          <StatsCard3D
            title="Locked (Cooldown)"
            value={totalLocked}
            suffix=" ETH"
            icon="🔒"
            color="#FF4D6A"
          />
        </StaggerItem>
        
        <StaggerItem>
          <StatsCard3D
            title="Est. Withdrawal Time"
            value={24}
            suffix=" hours"
            icon="⏰"
            color="#FFB800"
          />
        </StaggerItem>
      </StaggerContainer>

      <div className="grid-2 section">
        {/* Withdrawal Form */}
        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor="#8B5CF6" height="auto">
              <h3 className="section-title" style={{ marginBottom: "24px" }}>Withdrawal Options</h3>

              {/* Withdrawal Type Selection */}
              <div style={{ marginBottom: "24px" }}>
                <label className="input-label">Withdrawal Type</label>
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    className={`btn ${withdrawType === "partial" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setWithdrawType("partial")}
                    style={{ flex: 1 }}
                  >
                    Partial Withdrawal
                  </button>
                  <button
                    className={`btn ${withdrawType === "full" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setWithdrawType("full")}
                    style={{ flex: 1 }}
                  >
                    Full Withdrawal
                  </button>
                </div>
              </div>

              {withdrawType === "partial" ? (
                <div style={{ marginBottom: "24px" }}>
                  <label className="input-label">Amount to Withdraw</label>
                  <div className="input-wrapper">
                    <input
                      className="input input-lg"
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      max={totalAvailable}
                      step="0.1"
                      style={{ paddingRight: "70px" }}
                    />
                    <span className="input-suffix">ETH</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    {[25, 50, 75, 100].map((percent) => (
                      <button
                        key={percent}
                        className="btn btn-outline btn-sm"
                        onClick={() => setWithdrawAmount((totalAvailable * percent / 100).toFixed(2))}
                        style={{ flex: 1 }}
                      >
                        {percent}%
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: "24px" }}>
                  <label className="input-label">Select Positions to Withdraw</label>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                    Choose which validator positions to fully withdraw
                  </div>
                </div>
              )}

              {/* Position Selection for Full Withdrawal */}
              {withdrawType === "full" && (
                <div style={{ marginBottom: "24px" }}>
                  {STAKED_POSITIONS.map((position, i) => (
                    <motion.div
                      key={position.validator}
                      style={{
                        padding: "16px",
                        border: `2px solid ${selectedPositions.includes(position.validator) ? position.color + "60" : "var(--border-card)"}`,
                        borderRadius: "12px",
                        marginBottom: "12px",
                        cursor: "pointer",
                        background: selectedPositions.includes(position.validator) 
                          ? position.color + "10" 
                          : "var(--bg-input)",
                        transition: "all 0.3s ease",
                      }}
                      onClick={() => handlePositionToggle(position.validator)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                            {position.validator}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            Available: {position.canWithdraw} ETH
                            {position.locked > 0 && (
                              <span style={{ color: "#FF4D6A", marginLeft: "8px" }}>
                                (Locked: {position.locked} ETH)
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 600, color: position.color }}>
                            {position.amount} ETH
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {position.apy}% APY
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Withdrawal Summary */}
              <div style={{
                background: "var(--bg-input)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
              }}>
                <h4 style={{ marginBottom: "12px", fontSize: "0.9rem" }}>Withdrawal Summary</h4>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Amount</span>
                  <span className="mono" style={{ fontWeight: 600, color: "#CAFF33" }}>
                    {withdrawType === "partial" 
                      ? `${parseFloat(withdrawAmount || "0").toFixed(2)} ETH`
                      : `${selectedAmount.toFixed(2)} ETH`
                    }
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Est. Processing Time</span>
                  <span>24 hours</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Network Fee</span>
                  <span className="mono">~0.005 ETH</span>
                </div>
              </div>

              <Button3D
                variant="primary"
                size="lg"
                style={{ width: "100%" }}
                onClick={handleWithdraw}
                disabled={
                  (withdrawType === "partial" && (parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > totalAvailable)) ||
                  (withdrawType === "full" && selectedPositions.length === 0)
                }
              >
                {withdrawType === "partial" ? "💸 Withdraw ETH" : "🔓 Unstake Selected"}
              </Button3D>
            </Card3D>
          </StaggerItem>
        </StaggerContainer>

        {/* Position Overview */}
        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor="#CAFF33" height="auto">
              <h3 className="section-title" style={{ marginBottom: "20px" }}>📊 Position Overview</h3>
              
              <AllocationChart3D
                data={STAKED_POSITIONS.map(pos => ({
                  name: pos.validator.split(" ")[1],
                  value: pos.amount,
                  color: pos.color,
                }))}
                onValidatorClick={(validator) => console.log('Selected:', validator)}
              />
            </Card3D>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Withdrawal Queue */}
      <StaggerContainer className="section">
        <StaggerItem>
          <Card3D glowColor="#06D6A0" height="auto">
            <h3 className="section-title" style={{ marginBottom: "20px" }}>⏳ Withdrawal Queue</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              {[
                { status: "Processing", amount: "5.2 ETH", time: "18 hours remaining", color: "#FFB800" },
                { status: "Pending", amount: "12.8 ETH", time: "2 days remaining", color: "#8B5CF6" },
                { status: "Ready", amount: "3.1 ETH", time: "Available now", color: "#06D6A0" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px",
                    background: "var(--bg-input)",
                    borderRadius: "12px",
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: item.color,
                      }}
                    />
                    <span style={{ fontWeight: 600, color: item.color }}>{item.status}</span>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "4px" }}>
                    {item.amount}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {item.time}
                  </div>
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
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isProcessing && setShowConfirm(false)}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "500px" }}
            >
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>
                  {isProcessing ? "⏳" : "💸"}
                </div>
                <h3>{isProcessing ? "Processing Withdrawal..." : "Confirm Withdrawal"}</h3>
              </div>

              <div style={{
                background: "var(--bg-input)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Withdrawal Amount</span>
                  <span className="mono" style={{ fontWeight: 700, color: "#CAFF33" }}>
                    {withdrawType === "partial" 
                      ? `${parseFloat(withdrawAmount || "0").toFixed(2)} ETH`
                      : `${selectedAmount.toFixed(2)} ETH`
                    }
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Processing Time</span>
                  <span>~24 hours</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Network Fee</span>
                  <span className="mono">0.005 ETH</span>
                </div>
              </div>

              {isProcessing ? (
                <div className="progress-bar" style={{ height: "8px" }}>
                  <motion.div
                    className="progress-fill"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                    style={{ background: "linear-gradient(90deg, #CAFF33, #06D6A0)" }}
                  />
                </div>
              ) : (
                <div style={{ display: "flex", gap: "12px" }}>
                  <Button3D
                    variant="outline"
                    style={{ flex: 1 }}
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </Button3D>
                  <Button3D
                    variant="primary"
                    style={{ flex: 1 }}
                    onClick={handleConfirm}
                  >
                    💸 Confirm Withdrawal
                  </Button3D>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}