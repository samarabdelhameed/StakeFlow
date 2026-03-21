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
import { Card3D, StatsCard3D, Button3D } from "@/components/3D/Card3D";
import { AllocationChart3D, PortfolioDonut3D } from "@/components/3D/Charts3D";

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
          <StatsCard3D
            title="Total Value Locked"
            value={15750}
            suffix=" ETH"
            change={12.5}
            changeType="positive"
            icon="💰"
            color="#CAFF33"
          />
        </StaggerItem>

        <StaggerItem>
          <StatsCard3D
            title="Expected Return (APY)"
            value={5.2}
            suffix="%"
            change={0.8}
            changeType="positive"
            icon="📈"
            color="#06D6A0"
          />
        </StaggerItem>

        <StaggerItem>
          <StatsCard3D
            title="Active Validators"
            value={5}
            change={0}
            changeType="neutral"
            icon="⚡"
            color="#8B5CF6"
          />
        </StaggerItem>

        <StaggerItem>
          <StatsCard3D
            title="Risk Level"
            value={32}
            suffix="% Low Risk"
            change={-2.1}
            changeType="positive"
            icon="🛡️"
            color="#FFB800"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Charts Row - 3D Enhanced */}
      <div className="grid-2 section">
        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card3D glowColor="#CAFF33" height={350}>
            <div className="section-header">
              <h3 className="section-title">📊 Portfolio Distribution</h3>
              <span className="badge badge-green">3D View</span>
            </div>
            {allocationData?.allocations && (
              <PortfolioDonut3D
                data={allocationData.allocations.map((a: any, i: number) => ({
                  name: a.validatorName,
                  value: parseFloat(a.percentageHuman.replace('%', '')),
                  color: COLORS[i % COLORS.length],
                }))}
                onSliceClick={(validator) => console.log('Selected validator:', validator)}
              />
            )}
          </Card3D>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card3D glowColor="#8B5CF6" height={350}>
            <div className="section-header">
              <h3 className="section-title">⚡ Validator Performance</h3>
              <span className="badge badge-purple">Interactive</span>
            </div>
            {allocationData?.allocations && (
              <AllocationChart3D
                data={allocationData.allocations.map((a: any, i: number) => ({
                  name: a.validatorName,
                  value: a.score / 100,
                  color: COLORS[i % COLORS.length],
                }))}
                onValidatorClick={(validator) => console.log('Clicked validator:', validator)}
              />
            )}
          </Card3D>
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

      {/* Quick Actions - 3D Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="grid-3 section"
      >
        <Card3D glowColor="#CAFF33" height={180} onClick={() => window.location.href = '/deposit'}>
          <div style={{ textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>💎</div>
            <h4 style={{ marginBottom: "8px", color: "#CAFF33" }}>Deposit & Stake</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
              Deposit ETH and let AI optimize your allocation
            </p>
            <Button3D variant="primary" size="sm">
              Start Staking →
            </Button3D>
          </div>
        </Card3D>

        <Card3D glowColor="#8B5CF6" height={180} onClick={() => window.location.href = '/allocation'}>
          <div style={{ textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🧠</div>
            <h4 style={{ marginBottom: "8px", color: "#8B5CF6" }}>View Allocation</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
              See optimized validator distribution strategy
            </p>
            <Button3D variant="secondary" size="sm">
              View Strategy →
            </Button3D>
          </div>
        </Card3D>

        <Card3D glowColor="#06D6A0" height={180} onClick={() => window.location.href = '/analytics'}>
          <div style={{ textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📈</div>
            <h4 style={{ marginBottom: "8px", color: "#06D6A0" }}>Analytics</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
              Deep dive into performance metrics & risk
            </p>
            <Button3D variant="outline" size="sm">
              View Analytics →
            </Button3D>
          </div>
        </Card3D>
      </motion.div>
    </>
  );
}
