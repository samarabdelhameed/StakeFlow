"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, CartesianGrid,
} from "recharts";
import { Card3D, StatsCard3D, Button3D } from "@/components/3D/Card3D";
import { PerformanceTimeline3D } from "@/components/3D/Charts3D";
import { StaggerContainer, StaggerItem, FlipCard } from "@/components/UIComponents";

const COLORS = ["#CAFF33", "#8B5CF6", "#06D6A0", "#FF4D6A", "#FFB800"];

// Mock validator data
const VALIDATOR_DATA = {
  "epsilon": {
    name: "Validator Epsilon",
    address: "0x5555...abcd",
    score: 9560,
    performance: "98.2%",
    commission: "8.0%",
    totalStaked: "1,250.5 ETH",
    uptime: "99.8%",
    slashingRisk: "Low",
    apy: "5.8%",
    color: "#CAFF33",
    status: "Active",
    description: "High-performance validator with excellent track record and advanced infrastructure.",
    metrics: {
      blocks: 15420,
      attestations: 98750,
      proposals: 245,
      rewards: "125.8 ETH",
    },
    history: [
      { month: "Jan", performance: 85, rewards: 12.5, uptime: 99.2 },
      { month: "Feb", performance: 87, rewards: 14.2, uptime: 99.5 },
      { month: "Mar", performance: 90, rewards: 16.8, uptime: 99.7 },
      { month: "Apr", performance: 92, rewards: 18.3, uptime: 99.8 },
      { month: "May", performance: 95, rewards: 21.2, uptime: 99.9 },
      { month: "Jun", performance: 94, rewards: 19.8, uptime: 99.8 },
      { month: "Jul", performance: 98, rewards: 23.1, uptime: 99.8 },
    ],
  },
  // Add more validators as needed
};

export default function ValidatorDetailsPage() {
  const params = useParams();
  const validatorId = params.id as string;
  const [validator, setValidator] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("performance");

  useEffect(() => {
    // In real app, fetch from API
    setValidator(VALIDATOR_DATA[validatorId as keyof typeof VALIDATOR_DATA] || VALIDATOR_DATA.epsilon);
  }, [validatorId]);

  if (!validator) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="topbar">
        <div className="topbar-left">
          <h1>🔍 Validator Details</h1>
          <p>Deep dive into {validator.name} performance and metrics</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/allocation" className="btn btn-outline btn-sm">
            ← Back to Allocation
          </Link>
          <Button3D variant="primary" size="sm">
            Stake with this Validator
          </Button3D>
        </div>
      </div>

      {/* Validator Overview */}
      <StaggerContainer className="section">
        <div className="grid-4">
          <StaggerItem>
            <StatsCard3D
              title="Performance Score"
              value={validator.score}
              change={2.5}
              changeType="positive"
              icon="⚡"
              color={validator.color}
            />
          </StaggerItem>
          
          <StaggerItem>
            <StatsCard3D
              title="Current APY"
              value={parseFloat(validator.apy)}
              suffix="%"
              change={0.3}
              changeType="positive"
              icon="📈"
              color="#06D6A0"
            />
          </StaggerItem>
          
          <StaggerItem>
            <StatsCard3D
              title="Total Staked"
              value={parseFloat(validator.totalStaked.replace(/[^\d.]/g, ""))}
              suffix=" ETH"
              change={5.2}
              changeType="positive"
              icon="💰"
              color="#8B5CF6"
            />
          </StaggerItem>
          
          <StaggerItem>
            <StatsCard3D
              title="Uptime"
              value={parseFloat(validator.uptime)}
              suffix="%"
              change={0.1}
              changeType="positive"
              icon="🛡️"
              color="#FFB800"
            />
          </StaggerItem>
        </div>
      </StaggerContainer>

      {/* Main Content */}
      <div className="grid-2 section">
        {/* Validator Info Card */}
        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor={validator.color} height={400}>
              <FlipCard
                isFlipped={isFlipped}
                front={
                  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "16px",
                          background: `linear-gradient(135deg, ${validator.color}22, ${validator.color}08)`,
                          border: `2px solid ${validator.color}33`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          color: validator.color,
                          fontWeight: 800,
                        }}
                      >
                        {validator.name.charAt(validator.name.lastIndexOf(" ") + 1)}
                      </div>
                      <div>
                        <h3 style={{ marginBottom: "4px" }}>{validator.name}</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "JetBrains Mono" }}>
                          {validator.address}
                        </p>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
                        {validator.description}
                      </p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                        <div>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Commission</span>
                          <div style={{ fontSize: "1.2rem", fontWeight: 600, color: validator.color }}>
                            {validator.commission}
                          </div>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Risk Level</span>
                          <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "#06D6A0" }}>
                            {validator.slashingRisk}
                          </div>
                        </div>
                      </div>

                      <Button3D
                        variant="outline"
                        size="sm"
                        style={{ width: "100%" }}
                        onClick={() => setIsFlipped(true)}
                      >
                        View Historical Data →
                      </Button3D>
                    </div>
                  </div>
                }
                back={
                  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h4>Historical Performance</h4>
                      <Button3D
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFlipped(false)}
                      >
                        ← Back
                      </Button3D>
                    </div>

                    <div style={{ flex: 1 }}>
                      <ResponsiveContainer width="100%" height="200">
                        <LineChart data={validator.history}>
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
                          <Line
                            type="monotone"
                            dataKey="performance"
                            stroke={validator.color}
                            strokeWidth={2}
                            dot={{ fill: validator.color, strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
                        <div style={{ textAlign: "center", padding: "12px", background: "var(--bg-input)", borderRadius: "8px" }}>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Avg Performance</div>
                          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: validator.color }}>
                            {(validator.history.reduce((sum: number, h: any) => sum + h.performance, 0) / validator.history.length).toFixed(1)}%
                          </div>
                        </div>
                        <div style={{ textAlign: "center", padding: "12px", background: "var(--bg-input)", borderRadius: "8px" }}>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Rewards</div>
                          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#06D6A0" }}>
                            {validator.metrics.rewards}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              />
            </Card3D>
          </StaggerItem>
        </StaggerContainer>

        {/* Performance Chart */}
        <StaggerContainer>
          <StaggerItem>
            <Card3D glowColor="#8B5CF6" height={400}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h4>📊 Performance Timeline</h4>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["performance", "rewards", "uptime"].map((metric) => (
                    <button
                      key={metric}
                      className={`btn btn-sm ${selectedMetric === metric ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setSelectedMetric(metric)}
                      style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                    >
                      {metric}
                    </button>
                  ))}
                </div>
              </div>
              
              <PerformanceTimeline3D
                data={validator.history}
                selectedMetric={selectedMetric}
              />
            </Card3D>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Metrics Grid */}
      <StaggerContainer className="section">
        <div className="grid-4">
          <StaggerItem>
            <Card3D glowColor="#CAFF33" height={120}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                  Blocks Proposed
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#CAFF33", fontFamily: "JetBrains Mono" }}>
                  {validator.metrics.blocks.toLocaleString()}
                </div>
              </div>
            </Card3D>
          </StaggerItem>

          <StaggerItem>
            <Card3D glowColor="#8B5CF6" height={120}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                  Attestations
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#8B5CF6", fontFamily: "JetBrains Mono" }}>
                  {validator.metrics.attestations.toLocaleString()}
                </div>
              </div>
            </Card3D>
          </StaggerItem>

          <StaggerItem>
            <Card3D glowColor="#06D6A0" height={120}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                  Successful Proposals
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#06D6A0", fontFamily: "JetBrains Mono" }}>
                  {validator.metrics.proposals}
                </div>
              </div>
            </Card3D>
          </StaggerItem>

          <StaggerItem>
            <Card3D glowColor="#FF4D6A" height={120}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                  Total Rewards
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#FF4D6A", fontFamily: "JetBrains Mono" }}>
                  {validator.metrics.rewards}
                </div>
              </div>
            </Card3D>
          </StaggerItem>
        </div>
      </StaggerContainer>

      {/* Action Buttons */}
      <motion.div
        className="section"
        style={{ display: "flex", gap: "16px", justifyContent: "center" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button3D variant="primary" size="lg">
          💎 Stake with {validator.name}
        </Button3D>
        <Button3D variant="outline" size="lg">
          📊 Compare Validators
        </Button3D>
        <Button3D variant="secondary" size="lg">
          🔔 Set Alerts
        </Button3D>
      </motion.div>
    </>
  );
}