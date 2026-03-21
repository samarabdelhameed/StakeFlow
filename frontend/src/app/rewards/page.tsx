"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, CartesianGrid,
} from "recharts";
import { Card3D, StatsCard3D, Button3D } from "@/components/3D/Card3D";
import { PerformanceTimeline3D } from "@/components/3D/Charts3D";
import { StaggerContainer, StaggerItem } from "@/components/UIComponents";

const COLORS = ["#CAFF33", "#8B5CF6", "#06D6A0", "#FF4D6A", "#FFB800"];

// Mock rewards data
const REWARDS_HISTORY = [
  { month: "Jan", earned: 12.5, claimed: 12.5, pending: 0 },
  { month: "Feb", earned: 14.2, claimed: 14.2, pending: 0 },
  { month: "Mar", earned: 16.8, claimed: 15.0, pending: 1.8 },
  { month: "Apr", earned: 18.3, claimed: 16.5, pending: 1.8 },
  { month: "May", earned: 21.2, claimed: 19.4, pending: 1.8 },
  { month: "Jun", earned: 19.8, claimed: 18.0, pending: 1.8 },
  { month: "Jul", earned: 23.1, claimed: 21.3, pending: 1.8 },
];

const VALIDATOR_REWARDS = [
  { validator: "Validator Epsilon", earned: 45.2, pending: 2.8, apy: 5.8, color: COLORS[0] },
  { validator: "Validator Beta", earned: 38.7, pending: 1.9, apy: 5.2, color: COLORS[1] },
  { validator: "Validator Alpha", earned: 32.1, pending: 1.5, apy: 4.9, color: COLORS[2] },
  { validator: "Validator Gamma", earned: 28.9, pending: 1.2, apy: 4.5, color: COLORS[3] },
  { validator: "Validator Delta", earned: 25.3, pending: 0.8, apy: 4.2, color: COLORS[4] },
];

export default function RewardsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const totalEarned = VALIDATOR_REWARDS.reduce((sum, v) => sum + v.earned, 0);
  const totalPending = VALIDATOR_REWARDS.reduce((sum, v) => sum + v.pending, 0);
  const avgAPY = VALIDATOR_REWARDS.reduce((sum, v) => sum + v.apy, 0) / VALIDATOR_REWARDS.length;

  const handleClaimAll = () => {
    setIsClaiming(true);
    setTimeout(() => {
      setIsClaiming(false);
      setShowClaimModal(false);
    }, 2500);
  };

  return (
    <>
      {/* Header */}
      <div className="topbar">
        <div className="topbar-left">
          <h1>🎁 Staking Rewards</h1>
          <p>Track and claim your staking rewards across all validators</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/" className="btn btn-outline btn-sm">← Back to Dashboard</Link>
          <Button3D 
            variant="primary" 
            size="sm"
            onClick={() => setShowClaimModal(true)}
            disabled={totalPending === 0}
          >
            💰 Claim All Rewards
          </Button3D>
        </div>
      </div>

      {/* Stats Overview */}
      <StaggerContainer className="grid-4 section">
        <StaggerItem>
          <StatsCard3D
            title="Total Earned"
            value={totalEarned}
            suffix=" ETH"
            change={8.5}
            changeType="positive"
            icon="💰"
            color="#CAFF33"
          />
        </StaggerItem>
        
        <StaggerItem>
          <StatsCard3D
            title="Pending Rewards"
            value={totalPending}
            suffix=" ETH"
            change={12.3}
            changeType="positive"
            icon="⏳"
            color="#FFB800"
          />
        </StaggerItem>
        
        <StaggerItem>
          <StatsCard3D
            title="Average APY"
            value={avgAPY}
            suffix="%"
            change={0.4}
            changeType="positive"
            icon="📈"
            color="#06D6A0"
          />
        </StaggerItem>
        
        <StaggerItem>
          <StatsCard3D
            title="This Month"
            value={23.1}
            suffix=" ETH"
            change={16.7}
            changeType="positive"
            icon="🗓️"
            color="#8B5CF6"
          />
        </StaggerItem>
      </StaggerContainer>

      <div className="grid-2 section">
        {/* Rewards Timeline */}
        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor="#CAFF33" height={400}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 className="section-title">📊 Rewards Timeline</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["3M", "6M", "1Y", "all"].map((period) => (
                    <button
                      key={period}
                      className={`btn btn-sm ${selectedPeriod === period ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setSelectedPeriod(period)}
                      style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                    >
                      {period.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={REWARDS_HISTORY}>
                  <defs>
                    <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#CAFF33" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#CAFF33" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFB800" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#FFB800" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a3e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="earned"
                    stackId="1"
                    stroke="#CAFF33"
                    fill="url(#earnedGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stackId="1"
                    stroke="#FFB800"
                    fill="url(#pendingGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card3D>
          </StaggerItem>
        </StaggerContainer>

        {/* Validator Breakdown */}
        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor="#8B5CF6" height={400}>
              <h3 className="section-title" style={{ marginBottom: "20px" }}>⚡ Rewards by Validator</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "320px", overflowY: "auto" }}>
                {VALIDATOR_REWARDS.map((validator, i) => (
                  <motion.div
                    key={validator.validator}
                    style={{
                      padding: "16px",
                      background: "var(--bg-input)",
                      borderRadius: "12px",
                      border: `1px solid ${validator.color}30`,
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "3px",
                            background: validator.color,
                          }}
                        />
                        <span style={{ fontWeight: 600 }}>{validator.validator}</span>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: validator.color, fontWeight: 600 }}>
                        {validator.apy}% APY
                      </span>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Earned</div>
                        <div style={{ fontWeight: 600, color: "#CAFF33" }}>{validator.earned} ETH</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Pending</div>
                        <div style={{ fontWeight: 600, color: "#FFB800" }}>{validator.pending} ETH</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <Button3D
                          variant="outline"
                          size="sm"
                          style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                          disabled={validator.pending === 0}
                        >
                          Claim
                        </Button3D>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card3D>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Rewards Analytics */}
      <StaggerContainer className="section">
        <StaggerItem>
          <Card3D glowColor="#06D6A0" height={350}>
            <h3 className="section-title" style={{ marginBottom: "20px" }}>📈 Performance Analytics</h3>
            
            <div className="grid-3" style={{ gap: "20px", height: "280px" }}>
              {/* Monthly Comparison */}
              <div>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "12px", color: "var(--text-secondary)" }}>
                  Monthly Comparison
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={REWARDS_HISTORY.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a3e",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                      }}
                    />
                    <Bar dataKey="earned" fill="#06D6A0" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* APY Trend */}
              <div>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "12px", color: "var(--text-secondary)" }}>
                  APY Trend
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={VALIDATOR_REWARDS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="validator" stroke="#64748B" fontSize={8} angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a3e",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="apy"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Rewards Distribution */}
              <div>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "12px", color: "var(--text-secondary)" }}>
                  Distribution
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "200px", overflowY: "auto" }}>
                  {VALIDATOR_REWARDS.map((validator, i) => {
                    const percentage = (validator.earned / totalEarned) * 100;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: validator.color,
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, fontSize: "0.8rem" }}>
                          {validator.validator.split(" ")[1]}
                        </div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: validator.color }}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card3D>
        </StaggerItem>
      </StaggerContainer>

      {/* Claim All Modal */}
      {showClaimModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isClaiming && setShowClaimModal(false)}
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
                {isClaiming ? "⏳" : "🎁"}
              </div>
              <h3>{isClaiming ? "Claiming Rewards..." : "Claim All Rewards"}</h3>
            </div>

            <div style={{
              background: "var(--bg-input)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Total Pending</span>
                <span className="mono" style={{ fontWeight: 700, color: "#CAFF33" }}>
                  {totalPending.toFixed(2)} ETH
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Network Fee</span>
                <span className="mono">~0.003 ETH</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>You'll Receive</span>
                <span className="mono" style={{ fontWeight: 600, color: "#06D6A0" }}>
                  {(totalPending - 0.003).toFixed(3)} ETH
                </span>
              </div>
            </div>

            {isClaiming ? (
              <div className="progress-bar" style={{ height: "8px" }}>
                <motion.div
                  className="progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  style={{ background: "linear-gradient(90deg, #CAFF33, #06D6A0)" }}
                />
              </div>
            ) : (
              <div style={{ display: "flex", gap: "12px" }}>
                <Button3D
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowClaimModal(false)}
                >
                  Cancel
                </Button3D>
                <Button3D
                  variant="primary"
                  style={{ flex: 1 }}
                  onClick={handleClaimAll}
                >
                  🎁 Claim {totalPending.toFixed(2)} ETH
                </Button3D>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}