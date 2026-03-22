"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  StaggerContainer, StaggerItem, Sparkline
} from "@/components/UIComponents";
import { Card3D, StatsCard3D, Button3D } from "@/components/3D/Card3D";
import { AllocationChart3D, PortfolioDonut3D } from "@/components/3D/Charts3D";

const Background3D = dynamic(() => import("@/components/Background3D"), { ssr: false });

const API_BASE = "http://localhost:8080";

const COLORS = ["#CAFF33", "#8B5CF6", "#00F5FF", "#FF4D6A", "#FFB800"];

export default function Dashboard() {
  const [validators, setValidators] = useState<any[]>([]);
  const [allocationData, setAllocationData] = useState<any>(null);
  const [protocolStats, setProtocolStats] = useState<any>({ tvlEth: "0", exchangeRate: "1.0" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [vRes, aRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/api/validators`),
        fetch(`${API_BASE}/api/allocation/simulate?amount=100`),
        fetch(`${API_BASE}/api/protocol-stats`),
      ]);
      
      if (!vRes.ok || !aRes.ok || !sRes.ok) {
        throw new Error("Backend is returning an error");
      }
      
      const vData = await vRes.json();
      const aData = await aRes.json();
      const sData = await sRes.json();
      
      if (vData.validators) {
        setValidators(vData.validators);
      } else {
        throw new Error("Invalid validators format");
      }
      
      if (aData.allocations) {
        setAllocationData(aData);
      } else {
        throw new Error("Invalid allocation format");
      }
      setProtocolStats(sData);
    } catch {
      // Fallback only if backend is down
      setValidators([
        { name: "Validator Alpha", performancePercent: "85.00%", commissionPercent: "5.00%", totalStakedETH: "1000.00", isActive: true },
        { name: "Validator Beta", performancePercent: "92.00%", commissionPercent: "3.00%", totalStakedETH: "750.00", isActive: true },
        { name: "Validator Gamma", performancePercent: "70.00%", commissionPercent: "7.00%", totalStakedETH: "500.00", isActive: true },
        { name: "Validator Delta", performancePercent: "98.00%", commissionPercent: "2.50%", totalStakedETH: "1200.00", isActive: true },
      ]);
      setAllocationData({
        allocations: [
          { validatorName: "Beta", percentageHuman: "40.00%", amountETH: 40, score: 9400 },
          { validatorName: "Delta", percentageHuman: "30.00%", amountETH: 30, score: 9800 },
          { validatorName: "Alpha", percentageHuman: "20.00%", amountETH: 20, score: 8900 },
          { validatorName: "Gamma", percentageHuman: "10.00%", amountETH: 10, score: 7920 },
        ],
      });
    }
  }

  return (
    <>
      <Background3D />

      {/* Top Bar */}
      <div className="section-header" style={{ marginBottom: "48px" }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "3.5rem", marginBottom: "8px" }}>Portfolio</h1>
          <p style={{ color: "var(--text-dim)", fontSize: "1.1rem", fontWeight: "500" }}>
            Real-time overview of your <span style={{ color: "var(--neon-green)" }}>restaking engine</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div className="glass-card" style={{ padding: "4px", borderRadius: "12px", display: "flex", gap: "4px" }}>
            {["1D", "1W", "1M", "ALL"].map(t => (
              <button key={t} className={`btn ${t === 'ALL' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: "8px 16px", minWidth: "60px", fontSize: "0.8rem", borderRadius: "8px" }}>
                {t}
              </button>
            ))}
          </div>
          <Link href="/deposit">
            <Button3D variant="primary" size="md">
              ⚡ Stake Now
            </Button3D>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <StaggerContainer className="grid-4 section">
        <StaggerItem>
          <StatsCard3D
            title="Total Value Locked"
            value={parseFloat(protocolStats.tvlEth) || 0}
            suffix=" ETH"
            change={12.5}
            changeType="positive"
            icon="💰"
            color="var(--neon-green)"
            tooltip="Aggregate ETH staked across all selected validators"
          />
        </StaggerItem>

        <StaggerItem>
          <StatsCard3D
            title="Expected APY"
            value={5.2}
            suffix="%"
            change={0.8}
            changeType="positive"
            icon="📈"
            color="var(--neon-blue)"
            tooltip="Projected annual percentage yield based on current performance"
          />
        </StaggerItem>

        <StaggerItem>
          <StatsCard3D
            title="Active Validators"
            value={validators.length}
            change={0}
            changeType="neutral"
            icon="⚡"
            color="var(--neon-purple)"
            tooltip="Number of validators currently securing your stake"
          />
        </StaggerItem>

        <StaggerItem>
          <StatsCard3D
            title="AI Risk Score"
            value={validators.length > 0 ? Math.round(validators.reduce((acc: number, v: any) => acc + (v.riskScore || 0), 0) / (validators.length * 100)) : 0}
            suffix="/100"
            change={-2.1}
            changeType="positive"
            icon="🛡️"
            color="var(--neon-amber)"
            tooltip="Systemic risk score calculated by our AI engine"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Charts Row - 3D Enhanced */}
      <div className="grid-2 section">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Card3D glowColor="var(--neon-green)" height={400}>
            <div className="section-header" style={{ marginBottom: "24px" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem" }}>Portfolio Distribution</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Allocation across various node operators</p>
              </div>
              <span className="badge badge-neon">AI Optimized</span>
            </div>
            {allocationData?.allocations && (
              <div style={{ height: "260px", width: "100%", minWidth: 0 }}>
                <PortfolioDonut3D
                  data={allocationData.allocations.map((a: any, i: number) => ({
                    name: a.validatorName,
                    value: parseFloat(a.percentageHuman.replace('%', '')),
                    color: COLORS[i % COLORS.length],
                  }))}
                  onSliceClick={(validator) => console.log('Selected validator:', validator)}
                />
              </div>
            )}
          </Card3D>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Card3D glowColor="var(--neon-purple)" height={400}>
            <div className="section-header" style={{ marginBottom: "24px" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem" }}>Performance Engine</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Historical validator uptime & efficiency</p>
              </div>
              <span className="badge" style={{ background: "rgba(139, 92, 246, 0.1)", color: "var(--neon-purple)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>Real-time</span>
            </div>
            {allocationData?.allocations && (
              <div style={{ height: "260px", width: "100%", minWidth: 0 }}>
                <AllocationChart3D
                  data={allocationData.allocations.map((a: any, i: number) => ({
                    name: a.validatorName,
                    value: a.score / 100,
                    color: COLORS[i % COLORS.length],
                  }))}
                  onValidatorClick={(validator) => console.log('Clicked validator:', validator)}
                />
              </div>
            )}
          </Card3D>
        </motion.div>
      </div>

      {/* Allocation Preview + Top Validators */}
      <div className="grid-2 section">
        <motion.div
           initial={{ opacity: 0, x: -30 }} 
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.6, duration: 0.7 }}
        >
          <div className="glass-card" style={{ padding: "32px", height: "100%" }}>
            <div className="section-header" style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Allocation Strategy</h3>
              <Link href="/allocation" className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "8px 16px" }}>Refine Strategy →</Link>
            </div>

            {/* Allocation Bar */}
            <div className="alloc-bar" style={{ 
              marginBottom: "32px", 
              height: "20px", 
              borderRadius: "10px", 
              display: "flex", 
              overflow: "hidden", 
              background: "rgba(255,255,255,0.05)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)"
            }}>
              {allocationData?.allocations?.map((a: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  animate={{ width: a.percentageHuman }}
                  transition={{ duration: 1.5, ease: "circOut", delay: 0.8 }}
                  style={{
                    backgroundColor: COLORS[i % COLORS.length],
                    position: "relative"
                  }}
                >
                  <div style={{ 
                    position: "absolute", 
                    inset: 0, 
                    background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)" 
                  }} />
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {allocationData?.allocations?.map((a: any, i: number) => (
                <div key={i} className="glass-card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{
                    width: "10px", height: "10px", borderRadius: "3px",
                    backgroundColor: COLORS[i % COLORS.length],
                    boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}`
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "white", marginBottom: "2px" }}>{a.validatorName}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>{a.percentageHuman} Weight</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
        >
          <div className="glass-card" style={{ padding: 0, height: "100%" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--glass-border)" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Safe-yield Nodes</h3>
            </div>
            <div style={{ padding: "16px" }}>
              {validators.slice(0, 4).map((v, i) => {
                const perf = parseFloat(v.performancePercent || "0");
                return (
                  <div key={i} className="glass-card" style={{
                    margin: "8px 0", 
                    padding: "16px",
                    background: "rgba(255,255,255,0.02)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    border: "none"
                  }}>
                    <div className="validator-avatar" style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: `linear-gradient(135deg, ${COLORS[i]}22, ${COLORS[i]}08)`,
                      border: `1px solid ${COLORS[i]}33`,
                      color: COLORS[i],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "0.9rem"
                    }}>
                      {v.name?.charAt(v.name.lastIndexOf(" ") + 1)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "white", marginBottom: "6px" }}>
                        {v.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${perf}%` }}
                            transition={{ duration: 1, delay: 1 + (i * 0.1) }}
                            style={{
                              height: "100%",
                              background: COLORS[i],
                              boxShadow: `0 0 10px ${COLORS[i]}`
                            }} 
                          />
                        </div>
                        <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                          {v.performancePercent}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "100px" }}>
                      <div className="mono" style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--neon-green)" }}>
                        +{v.totalStakedETH.split('.')[0]} ETH
                      </div>
                      <Sparkline data={[3, 5, 4, 7, 6, 8, 9].map(d => d + i)} color={COLORS[i]} width={60} height={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions - 3D Enhanced */}
      <h3 style={{ marginBottom: "32px", fontSize: "1.4rem", fontWeight: "800" }}>Quick Actions</h3>
      <motion.div
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="grid-3 section"
      >
        <Card3D glowColor="var(--neon-green)" height={220} onClick={() => window.location.href = '/deposit'}>
          <div style={{ textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px", filter: "drop-shadow(0 0 10px var(--neon-green-glow))" }}>💎</div>
            <h4 style={{ marginBottom: "8px", color: "white", fontSize: "1.2rem" }}>Deposit Stake</h4>
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: "20px", maxWidth: "200px" }}>
              Secure your ETH and begin earning optimized yield
            </p>
            <Button3D variant="primary" size="sm">
              Initiate →
            </Button3D>
          </div>
        </Card3D>

        <Card3D glowColor="var(--neon-purple)" height={220} onClick={() => window.location.href = '/allocation'}>
          <div style={{ textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px", filter: "drop-shadow(0 0 10px var(--neon-purple-glow))" }}>🧠</div>
            <h4 style={{ marginBottom: "8px", color: "white", fontSize: "1.2rem" }}>AI Allocation</h4>
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: "20px", maxWidth: "200px" }}>
              Compute real-time risk-aware distributions
            </p>
            <Button3D variant="secondary" size="sm">
              View Strategy
            </Button3D>
          </div>
        </Card3D>

        <Card3D glowColor="var(--neon-blue)" height={220} onClick={() => window.location.href = '/analytics'}>
          <div style={{ textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px", filter: "drop-shadow(0 0 10px var(--neon-blue-glow))" }}>📈</div>
            <h4 style={{ marginBottom: "8px", color: "white", fontSize: "1.2rem" }}>Performance</h4>
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: "20px", maxWidth: "200px" }}>
              Detailed metrics on portfolio health & growth
            </p>
            <Button3D variant="outline" size="sm">
              Deep Dive
            </Button3D>
          </div>
        </Card3D>
      </motion.div>
    </>
  );
}
