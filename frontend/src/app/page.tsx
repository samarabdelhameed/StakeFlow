"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  AnimatedCounter, TiltCard, RiskGauge, Sparkline,
  StaggerContainer, StaggerItem,
} from "@/components/UIComponents";

const Background3D = dynamic(() => import("@/components/Background3D"), { ssr: false });

const API_BASE = "http://localhost:8080";

// Mock TVL History
const tvlHistory = [
  { month: "Jan", tvl: 8200 }, { month: "Feb", tvl: 9100 },
  { month: "Mar", tvl: 10400 }, { month: "Apr", tvl: 11800 },
  { month: "May", tvl: 13200 }, { month: "Jun", tvl: 14500 },
  { month: "Jul", tvl: 15750 },
];

// Mock staking rewards
const rewardsData = [
  { month: "Jan", rewards: 120 }, { month: "Feb", rewards: 180 },
  { month: "Mar", rewards: 250 }, { month: "Apr", rewards: 310 },
  { month: "May", rewards: 420 }, { month: "Jun", rewards: 380 },
  { month: "Jul", rewards: 490 },
];

const COLORS = ["#CAFF33", "#8B5CF6", "#06D6A0", "#FF4D6A", "#FFB800"];

export default function Dashboard() {
  const [validators, setValidators] = useState<any[]>([]);
  const [allocationData, setAllocationData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [vRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/api/validators`),
        fetch(`${API_BASE}/api/allocation/simulate?amount=100`),
      ]);
      const vData = await vRes.json();
      const aData = await aRes.json();
      setValidators(vData.validators || []);
      setAllocationData(aData);
    } catch {
      setValidators([
        { name: "Validator Alpha", performancePercent: "85.00%", commissionPercent: "5.00%", totalStakedETH: "1000.00", isActive: true },
        { name: "Validator Beta", performancePercent: "92.00%", commissionPercent: "3.00%", totalStakedETH: "750.00", isActive: true },
        { name: "Validator Gamma", performancePercent: "70.00%", commissionPercent: "7.00%", totalStakedETH: "500.00", isActive: true },
        { name: "Validator Delta", performancePercent: "65.00%", commissionPercent: "2.00%", totalStakedETH: "300.00", isActive: true },
        { name: "Validator Epsilon", performancePercent: "98.00%", commissionPercent: "8.00%", totalStakedETH: "200.00", isActive: true },
      ]);
      setAllocationData({
        allocations: [
          { validatorName: "Epsilon", percentageHuman: "21.92%", amountETH: 21.92, score: 9560 },
          { validatorName: "Beta", percentageHuman: "21.55%", amountETH: 21.55, score: 9400 },
          { validatorName: "Alpha", percentageHuman: "20.41%", amountETH: 20.41, score: 8900 },
          { validatorName: "Gamma", percentageHuman: "18.16%", amountETH: 18.16, score: 7920 },
          { validatorName: "Delta", percentageHuman: "17.93%", amountETH: 17.93, score: 7820 },
        ],
      });
    }
  }

  return (
    <>
      <Background3D />

      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-left">
          <h1>Dashboard</h1>
          <p>Real-time overview of your restaking portfolio</p>
        </div>
        <div className="topbar-right">
          <div className="tabs">
            <button className="tab active">All</button>
            <button className="tab">Week</button>
            <button className="tab">Month</button>
            <button className="tab">Year</button>
          </div>
          <button className="btn btn-primary btn-sm">
            <Link href="/deposit" style={{ color: "inherit" }}>⚡ Deposit</Link>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <StaggerContainer className="grid-4 section">
        <StaggerItem>
          <TiltCard className="stat-card" glowColor="rgba(202, 255, 51, 0.08)">
            <div className="stat-icon" style={{ background: "var(--neon-green-dim)" }}>💰</div>
            <span className="stat-label">Total Value Locked</span>
            <span className="stat-value mono" style={{ color: "var(--neon-green)" }}>
              <AnimatedCounter value={15750} suffix=" ETH" />
            </span>
            <span className="stat-change positive">↑ 12.5%</span>
          </TiltCard>
        </StaggerItem>

        <StaggerItem>
          <TiltCard className="stat-card" glowColor="rgba(6, 214, 160, 0.08)">
            <div className="stat-icon" style={{ background: "var(--cyan-dim)" }}>📈</div>
            <span className="stat-label">Average APY</span>
            <span className="stat-value" style={{ color: "var(--cyan)" }}>
              <AnimatedCounter value={5.2} decimals={1} suffix="%" />
            </span>
            <span className="stat-change positive">↑ 0.3%</span>
          </TiltCard>
        </StaggerItem>

        <StaggerItem>
          <TiltCard className="stat-card" glowColor="rgba(139, 92, 246, 0.08)">
            <div className="stat-icon" style={{ background: "var(--purple-dim)" }}>⚡</div>
            <span className="stat-label">Active Validators</span>
            <span className="stat-value" style={{ color: "var(--purple)" }}>
              <AnimatedCounter value={5} />
            </span>
            <span className="badge badge-green" style={{ width: "fit-content" }}>
              <span className="status-dot active" /> All Online
            </span>
          </TiltCard>
        </StaggerItem>

        <StaggerItem>
          <TiltCard className="stat-card" glowColor="rgba(255, 77, 106, 0.06)">
            <div className="stat-icon" style={{ background: "var(--amber-dim)" }}>🛡️</div>
            <span className="stat-label">Risk Level</span>
            <RiskGauge value={32} color="var(--neon-green)" size={90} label="Low Risk" />
          </TiltCard>
        </StaggerItem>
      </StaggerContainer>

      {/* Charts Row */}
      <div className="grid-2 section">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="card">
            <div className="section-header">
              <h3 className="section-title">📊 TVL Growth</h3>
              <span className="badge badge-green">+91.2%</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tvlHistory}>
                  <defs>
                    <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#CAFF33" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#CAFF33" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}
                    labelStyle={{ color: "#F1F5F9" }}
                    itemStyle={{ color: "#CAFF33" }}
                  />
                  <Area type="monotone" dataKey="tvl" stroke="#CAFF33" strokeWidth={2.5} fill="url(#tvlGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="card">
            <div className="section-header">
              <h3 className="section-title">💰 Staking Rewards</h3>
              <span className="badge badge-purple">Monthly</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rewardsData} barCategoryGap="30%">
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#CAFF33" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}
                    labelStyle={{ color: "#F1F5F9" }}
                  />
                  <Bar dataKey="rewards" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Allocation Preview + Top Validators */}
      <div className="grid-2 section">
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="card">
            <div className="section-header">
              <h3 className="section-title">🧠 Current Allocation</h3>
              <Link href="/allocation" className="btn btn-ghost btn-sm">View Details →</Link>
            </div>

            {/* Allocation Bar */}
            <div className="alloc-bar" style={{ marginBottom: "20px", height: "14px" }}>
              {allocationData?.allocations?.map((a: any, i: number) => (
                <div
                  key={i}
                  className="alloc-segment"
                  style={{
                    width: a.percentageHuman,
                    backgroundColor: COLORS[i % COLORS.length],
                  }}
                />
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {allocationData?.allocations?.map((a: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "12px", height: "12px", borderRadius: "4px",
                      backgroundColor: COLORS[i % COLORS.length],
                    }} />
                    <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{a.validatorName}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span className="mono" style={{ fontSize: "0.85rem", color: COLORS[i % COLORS.length] }}>
                      {a.percentageHuman}
                    </span>
                    <span className="mono" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {a.amountETH?.toFixed(2)} ETH
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-card)" }}>
              <h3 className="section-title">⚡ Top Validators</h3>
            </div>
            {validators.slice(0, 4).map((v, i) => {
              const perf = parseFloat(v.performancePercent || "0");
              return (
                <div key={i} className="validator-card" style={{
                  margin: "8px 12px", borderRadius: "var(--radius-md)",
                }}>
                  <div className="validator-avatar" style={{
                    background: `linear-gradient(135deg, ${COLORS[i]}22, ${COLORS[i]}08)`,
                    border: `1px solid ${COLORS[i]}33`,
                    color: COLORS[i],
                  }}>
                    {v.name?.charAt(v.name.lastIndexOf(" ") + 1)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "4px" }}>
                      {v.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="progress-bar" style={{ width: "60px" }}>
                        <div className="progress-fill" style={{
                          width: `${perf}%`,
                          background: `linear-gradient(90deg, ${COLORS[i]}, ${COLORS[(i+1) % COLORS.length]})`,
                        }} />
                      </div>
                      <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {v.performancePercent}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {v.totalStakedETH} ETH
                    </div>
                    <Sparkline data={[3, 5, 4, 7, 6, 8, 9].map(d => d + i)} color={COLORS[i]} width={60} height={20} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="grid-3 section"
      >
        <Link href="/deposit">
          <TiltCard className="card-glow-green" style={{ textAlign: "center", cursor: "pointer" }} glowColor="rgba(202, 255, 51, 0.06)">
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>💎</div>
            <h4 style={{ marginBottom: "6px" }}>Deposit & Stake</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Deposit ETH and let AI optimize your allocation
            </p>
          </TiltCard>
        </Link>

        <Link href="/allocation">
          <TiltCard className="card-glow-purple" style={{ textAlign: "center", cursor: "pointer" }} glowColor="rgba(139, 92, 246, 0.06)">
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🧠</div>
            <h4 style={{ marginBottom: "6px" }}>View Allocation</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              See optimized validator distribution strategy
            </p>
          </TiltCard>
        </Link>

        <Link href="/analytics">
          <TiltCard style={{ textAlign: "center", cursor: "pointer" }} glowColor="rgba(6, 214, 160, 0.06)">
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📈</div>
            <h4 style={{ marginBottom: "6px" }}>Analytics</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Deep dive into performance metrics & risk
            </p>
          </TiltCard>
        </Link>
      </motion.div>
    </>
  );
}
