"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
  AreaChart, Area,
} from "recharts";
import { TiltCard, AnimatedCounter, RiskGauge, StaggerContainer, StaggerItem } from "@/components/UIComponents";

const COLORS = ["#CAFF33", "#8B5CF6", "#06D6A0", "#FF4D6A", "#FFB800"];

const donutData = [
  { name: "Epsilon", value: 21.92, color: COLORS[0] },
  { name: "Beta", value: 21.55, color: COLORS[1] },
  { name: "Alpha", value: 20.41, color: COLORS[2] },
  { name: "Gamma", value: 18.16, color: COLORS[3] },
  { name: "Delta", value: 17.96, color: COLORS[4] },
];

const growthData = [
  { month: "Jan", staked: 5000, rewards: 45 },
  { month: "Feb", staked: 6200, rewards: 62 },
  { month: "Mar", staked: 7800, rewards: 85 },
  { month: "Apr", staked: 9500, rewards: 110 },
  { month: "May", staked: 11000, rewards: 145 },
  { month: "Jun", staked: 13200, rewards: 180 },
  { month: "Jul", staked: 15750, rewards: 220 },
];

const riskRewardData = [
  { name: "Epsilon", risk: 30, reward: 95.6, size: 22, color: COLORS[0] },
  { name: "Beta", risk: 15, reward: 94.0, size: 22, color: COLORS[1] },
  { name: "Alpha", risk: 20, reward: 89.0, size: 20, color: COLORS[2] },
  { name: "Gamma", risk: 35, reward: 79.2, size: 18, color: COLORS[3] },
  { name: "Delta", risk: 10, reward: 78.2, size: 18, color: COLORS[4] },
];

const performanceTimeline = [
  { month: "Jan", Epsilon: 85, Beta: 80, Alpha: 75, Gamma: 60, Delta: 55 },
  { month: "Feb", Epsilon: 87, Beta: 82, Alpha: 78, Gamma: 62, Delta: 58 },
  { month: "Mar", Epsilon: 90, Beta: 85, Alpha: 80, Gamma: 65, Delta: 60 },
  { month: "Apr", Epsilon: 92, Beta: 88, Alpha: 82, Gamma: 68, Delta: 62 },
  { month: "May", Epsilon: 95, Beta: 90, Alpha: 84, Gamma: 70, Delta: 64 },
  { month: "Jun", Epsilon: 94, Beta: 91, Alpha: 83, Gamma: 69, Delta: 63 },
  { month: "Jul", Epsilon: 98, Beta: 92, Alpha: 85, Gamma: 70, Delta: 65 },
];

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("7D");
  const [activeIndex, setActiveIndex] = useState(-1);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>📈 Analytics</h1>
          <p>Deep dive into performance metrics & risk analysis</p>
        </div>
        <div className="topbar-right">
          <select className="input input-sm" style={{ width: "160px", padding: "8px" }} defaultValue="All">
            <option value="All">All Validators</option>
            <option value="Alpha">Validator Alpha</option>
            <option value="Beta">Validator Beta</option>
            <option value="Gamma">Validator Gamma</option>
          </select>
          <div className="tabs">
            {["24H", "7D", "30D", "1Y", "All"].map((t) => (
              <button key={t} className={`tab ${timeframe === t ? "active" : ""}`} onClick={() => setTimeframe(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <StaggerContainer className="grid-4 section">
        {[
          { label: "Total Return", value: 892, suffix: " ETH", color: "var(--neon-green)", change: "+18.4%" },
          { label: "Avg Score", value: 87.2, suffix: "%", color: "var(--cyan)", change: "+3.1%" },
          { label: "Risk Score", value: 22, suffix: "/100", color: "var(--neon-green)", change: "-5.2%" },
          { label: "Sharpe Ratio", value: 2.4, suffix: "", color: "var(--purple)", change: "+0.3" },
        ].map((m, i) => (
          <StaggerItem key={i}>
            <TiltCard className="stat-card" glowColor={`${m.color}10`}>
              <span className="stat-label">{m.label}</span>
              <span className="stat-value mono" style={{ color: m.color }}>
                <AnimatedCounter value={m.value} decimals={m.suffix === "%" || m.suffix === "" ? 1 : 0} suffix={m.suffix} />
              </span>
              <span className="stat-change positive">{m.change}</span>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Donut + Gauges Row */}
      <div className="grid-2 section">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: "20px" }}>🍩 Portfolio Distribution</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ width: "200px", height: "200px" }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%" cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(-1)}
                    >
                      {donutData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.color}
                          stroke="transparent"
                          style={{
                            transform: activeIndex === i ? "scale(1.08)" : "scale(1)",
                            transformOrigin: "center",
                            transition: "transform 0.3s ease",
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                {donutData.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "6px 0",
                      opacity: activeIndex === -1 || activeIndex === i ? 1 : 0.4,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: d.color }} />
                      <span style={{ fontSize: "0.85rem" }}>{d.name}</span>
                    </div>
                    <span className="mono" style={{ fontSize: "0.85rem", color: d.color, fontWeight: 600 }}>
                      {d.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: "20px" }}>🛡️ Risk Analysis</h3>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "20px 0" }}>
              <RiskGauge value={22} color="var(--neon-green)" size={110} label="Overall" />
              <RiskGauge value={68} color="var(--cyan)" size={110} label="Return" />
              <RiskGauge value={91} color="var(--purple)" size={110} label="Uptime" />
            </div>
            <div className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Max Drawdown</span>
              <span className="mono" style={{ color: "var(--neon-green)", fontWeight: 600 }}>-2.3%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Timeline */}
      <motion.div
        className="card section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h3 className="section-title" style={{ marginBottom: "20px" }}>📊 Validator Performance Timeline</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[40, 100]} />
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }} />
              {["Epsilon", "Beta", "Alpha", "Gamma", "Delta"].map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i]} strokeWidth={2.5}
                  dot={false} activeDot={{ r: 6, fill: COLORS[i], stroke: "#1a1a3e", strokeWidth: 2 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bubble Chart + Growth */}
      <div className="grid-2 section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: "20px" }}>🫧 Risk vs Reward Bubble</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis type="number" dataKey="risk" name="Risk" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="number" dataKey="reward" name="Score" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <ZAxis type="number" dataKey="size" range={[100, 400]} />
                  <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }} />
                  <Scatter data={riskRewardData}>
                    {riskRewardData.map((d, i) => (
                      <Cell key={i} fill={d.color} fillOpacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: "20px" }}>🚀 Staking Growth</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="staked" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#growthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
