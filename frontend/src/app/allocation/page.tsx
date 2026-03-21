"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ScatterChart, Scatter, ZAxis, Cell,
  LineChart, Line, PieChart, Pie,
} from "recharts";
import { TiltCard, AnimatedCounter, StaggerContainer, StaggerItem } from "@/components/UIComponents";

const API_BASE = "http://localhost:8080";
const COLORS = ["#CAFF33", "#8B5CF6", "#06D6A0", "#FF4D6A", "#FFB800"];

const MOCK_HISTORY: Record<string, number[]> = {
  Epsilon: [85, 87, 90, 92, 95, 94, 98],
  Beta: [80, 82, 85, 88, 90, 91, 92],
  Alpha: [75, 78, 80, 82, 84, 83, 85],
  Gamma: [60, 62, 65, 68, 70, 69, 70],
  Delta: [55, 58, 60, 62, 64, 63, 65],
};

export default function AllocationPage() {
  const [allocationData, setAllocationData] = useState<any>(null);
  const [amount, setAmount] = useState("100");
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);

  useEffect(() => {
    fetchAllocation("100");
  }, []);

  async function fetchAllocation(amountETH: string) {
    try {
      const res = await fetch(`${API_BASE}/api/allocation/simulate?amount=${amountETH}`);
      const data = await res.json();
      setAllocationData(data);
    } catch {
      setAllocationData({
        totalAmountETH: parseFloat(amountETH),
        allocations: [
          { validatorName: "Epsilon", percentageHuman: "21.92%", percentage: 2192, amountETH: parseFloat(amountETH) * 0.2192, score: 9560, validator: "0x5555" },
          { validatorName: "Beta", percentageHuman: "21.55%", percentage: 2155, amountETH: parseFloat(amountETH) * 0.2155, score: 9400, validator: "0x2222" },
          { validatorName: "Alpha", percentageHuman: "20.41%", percentage: 2041, amountETH: parseFloat(amountETH) * 0.2041, score: 8900, validator: "0x1111" },
          { validatorName: "Gamma", percentageHuman: "18.16%", percentage: 1816, amountETH: parseFloat(amountETH) * 0.1816, score: 7920, validator: "0x3333" },
          { validatorName: "Delta", percentageHuman: "17.93%", percentage: 1793, amountETH: parseFloat(amountETH) * 0.1793, score: 7820, validator: "0x4444" },
        ],
        strategy: "weighted_score",
      });
    }
  }

  function handleRecalculate() {
    fetchAllocation(amount);
    setSelectedValidator(null);
  }

  const scatterData = allocationData?.allocations?.map((a: any, i: number) => ({
    name: a.validatorName,
    risk: [20, 15, 25, 35, 30][i],
    reward: [a.score / 100, a.score / 100, a.score / 100, a.score / 100, a.score / 100][i] || a.score / 100,
    amount: a.amountETH,
    color: COLORS[i],
  })) || [];

  const barData = allocationData?.allocations?.map((a: any, i: number) => ({
    name: a.validatorName?.replace("Validator ", ""),
    allocated: a.amountETH,
    score: a.score / 100,
    fill: COLORS[i],
  })) || [];

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>🧠 Allocation Strategy</h1>
          <p>AI-powered optimal distribution across validators</p>
        </div>
        <div className="topbar-right">
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div className="input-wrapper">
              <input
                className="input mono"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: "140px", paddingRight: "50px" }}
                id="alloc-amount"
              />
              <span className="input-suffix">ETH</span>
            </div>
            <motion.button
              className="btn btn-primary"
              onClick={handleRecalculate}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              id="recalculate-btn"
            >
              🔄 Recalculate
            </motion.button>
          </div>
        </div>
      </div>

      {/* Allocation Bar */}
      <motion.div
        className="card section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-header">
          <h3 className="section-title">Distribution Overview</h3>
          <span className="badge badge-purple">Strategy: {allocationData?.strategy || "weighted_score"}</span>
        </div>

        <div className="alloc-bar" style={{ height: "20px", marginBottom: "24px", borderRadius: "var(--radius-lg)" }}>
          {allocationData?.allocations?.map((a: any, i: number) => (
            <motion.div
              key={a.validatorName}
              className="alloc-segment"
              style={{ backgroundColor: COLORS[i % COLORS.length], cursor: "pointer" }}
              initial={{ width: "0%" }}
              animate={{ width: a.percentageHuman }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setSelectedValidator(a.validatorName === selectedValidator ? null : a.validatorName)}
            />
          ))}
        </div>

        {/* Validator Cards Grid */}
        <StaggerContainer className="grid-3" style={{ gap: "16px" }}>
          {allocationData?.allocations?.map((a: any, i: number) => (
            <StaggerItem key={a.validatorName}>
              <motion.div
                className="validator-card"
                style={{
                  borderColor: selectedValidator === a.validatorName ? COLORS[i] : undefined,
                  background: selectedValidator === a.validatorName ? `${COLORS[i]}08` : undefined,
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: "12px",
                }}
                onClick={() => setSelectedValidator(a.validatorName === selectedValidator ? null : a.validatorName)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className="validator-avatar" style={{
                    background: `${COLORS[i]}18`,
                    border: `1px solid ${COLORS[i]}33`,
                    color: COLORS[i],
                    width: "38px",
                    height: "38px",
                    fontSize: "0.9rem",
                  }}>
                    {a.validatorName?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{a.validatorName}</div>
                    <div className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Score: {a.score}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "2px" }}>ALLOCATED</div>
                    <div className="mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: COLORS[i] }}>
                      {a.amountETH?.toFixed(2)} ETH
                    </div>
                  </div>
                  <div className="badge" style={{
                    background: `${COLORS[i]}15`,
                    color: COLORS[i],
                  }}>
                    {a.percentageHuman}
                  </div>
                </div>

                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: "0%" }}
                    animate={{ width: `${a.percentage / 100}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                    style={{ background: COLORS[i] }}
                  />
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </motion.div>

      {/* Charts Row */}
      <div className="grid-2 section">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: "20px" }}>📊 Allocation Distribution</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }} />
                  <Bar dataKey="allocated" radius={[8, 8, 0, 0]}>
                    {barData.map((entry: any, i: number) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: "20px" }}>🎯 Risk vs Reward</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis type="number" dataKey="risk" name="Risk" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} label={{ value: "Risk %", position: "bottom", fill: "#64748B", fontSize: 11 }} />
                  <YAxis type="number" dataKey="reward" name="Reward" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} label={{ value: "Score", angle: -90, position: "insideLeft", fill: "#64748B", fontSize: 11 }} />
                  <ZAxis type="number" dataKey="amount" range={[80, 300]} />
                  <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }} />
                  <Scatter data={scatterData}>
                    {scatterData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Validator Detail Modal */}
      <AnimatePresence>
        {selectedValidator && (
          <motion.div
            className="card section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            style={{ overflow: "hidden" }}
          >
            <div className="section-header">
              <h3 className="section-title">📈 {selectedValidator} — Historical Performance</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedValidator(null)}>✕ Close</button>
            </div>
            <div className="chart-container chart-container-sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={
                  (MOCK_HISTORY[selectedValidator.replace("Validator ", "")] || [50,55,60,65,70,75,80])
                    .map((v, i) => ({ month: ["Jan","Feb","Mar","Apr","May","Jun","Jul"][i], perf: v }))
                }>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[40, 100]} />
                  <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="perf"
                    stroke={COLORS[allocationData?.allocations?.findIndex((a: any) => a.validatorName === selectedValidator) || 0]}
                    strokeWidth={3}
                    dot={{ fill: "#1a1a3e", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: "var(--neon-green)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
