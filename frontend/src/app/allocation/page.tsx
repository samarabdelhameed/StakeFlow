"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ScatterChart, Scatter, ZAxis, Cell,
  LineChart, Line,
} from "recharts";
import { StaggerContainer, StaggerItem, FlipCard } from "@/components/UIComponents";
import { Card3D, Button3D } from "@/components/3D/Card3D";

import { useStakeFlow } from "@/hooks/useStakeFlow";

const API_BASE = "http://localhost:8080";
const COLORS = ["#CAFF33", "#8B5CF6", "#00F5FF", "#FF4D6A", "#FFB800"];

export default function AllocationPage() {
  const { position } = useStakeFlow();
  const [allocationData, setAllocationData] = useState<any>(null);
  const [amount, setAmount] = useState("0.02"); // Default to your current stake for demo context
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);

  useEffect(() => {
    // If user has a real position, use that for the initial view
    const initialAmt = position?.ethValue && parseFloat(position.ethValue) > 0 
      ? position.ethValue 
      : "0.02";
      
    setAmount(initialAmt);
    fetchAllocation(initialAmt);
  }, [position?.ethValue]);

  async function fetchAllocation(amountETH: string) {
    if (!amountETH || parseFloat(amountETH) <= 0) return;
    try {
      const res = await fetch(`${API_BASE}/api/allocation/simulate?amount=${amountETH}`);

      if (!res.ok) throw new Error("Backend is returning an error");
      
      const data = await res.json();
      if (!data || !data.allocations || data.allocations.length === 0) {
        throw new Error("Invalid allocation format");
      }
      
      setAllocationData(data);
    } catch {
      setAllocationData({
        totalAmountETH: parseFloat(amountETH),
        allocations: [
          { validatorName: "Epsilon", percentageHuman: "25%", percentage: 2500, amountETH: parseFloat(amountETH) * 0.25, score: 9560, validator: "0x5555" },
          { validatorName: "Beta", percentageHuman: "20%", percentage: 2000, amountETH: parseFloat(amountETH) * 0.20, score: 9400, validator: "0x2222" },
          { validatorName: "Alpha", percentageHuman: "20%", percentage: 2000, amountETH: parseFloat(amountETH) * 0.20, score: 8900, validator: "0x1111" },
          { validatorName: "Gamma", percentageHuman: "15%", percentage: 1500, amountETH: parseFloat(amountETH) * 0.15, score: 7920, validator: "0x3333" },
          { validatorName: "Delta", percentageHuman: "20%", percentage: 2000, amountETH: parseFloat(amountETH) * 0.20, score: 7820, validator: "0x4444" },
        ],
        strategy: "AI_WEIGHTED_OPTIMIZER",
      });
    }
  }

  function handleRecalculate() {
    fetchAllocation(amount);
    setSelectedValidator(null);
  }

  const barData = allocationData?.allocations?.map((a: any, i: number) => ({
    name: a.validatorName?.replace("Validator ", ""),
    allocated: a.amountETH,
    score: (a.score || 0) / 100,
    fill: COLORS[i % COLORS.length],
  })) || [];

  const scatterData = allocationData?.allocations?.map((a: any, i: number) => ({
    name: a.validatorName?.replace("Validator ", ""),
    risk: a.risk || 20, 
    reward: a.score || 0,
    amount: (a.amount || 0.01) * 1000 + 300, 
    color: COLORS[i % COLORS.length],
  })) || [];




  return (
    <>
      <div className="section-header" style={{ marginBottom: "48px" }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "3rem", marginBottom: "8px" }}>Allocation Strategy</h1>
          <p style={{ color: "var(--text-dim)", fontSize: "1rem" }}>AI-powered optimal distribution across validators</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
           <div className="glass-card" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
             <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-dim)" }}>AMOUNT:</span>
             <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              style={{ background: "transparent", border: "none", color: "white", fontWeight: "800", width: "80px", outline: "none", fontFamily: "JetBrains Mono" }}
             />
             <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--neon-green)" }}>ETH</span>
           </div>
           <Button3D variant="primary" size="md" onClick={handleRecalculate}>🔄 Refresh Strategy</Button3D>
        </div>
      </div>

      {/* Distribution Overview Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card section"
        style={{ padding: "40px" }}
      >
        <div className="section-header" style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "1.2rem" }}>Optimization Engine Overview</h3>
          <span className="badge-neon">{allocationData?.strategy || "AI_WEIGHTED"}</span>
        </div>

        <div style={{ height: "16px", display: "flex", borderRadius: "8px", overflow: "hidden", background: "rgba(255,255,255,0.02)", marginBottom: "48px" }}>
          {allocationData?.allocations?.map((a: any, i: number) => (
            <motion.div
              key={a.validatorName}
              initial={{ width: 0 }}
              animate={{ width: a.percentageHuman }}
              transition={{ delay: i * 0.1, duration: 1 }}
              style={{ backgroundColor: COLORS[i % COLORS.length], cursor: "pointer", position: "relative" }}
              onClick={() => setSelectedValidator(a.validatorName === selectedValidator ? null : a.validatorName)}
            >
               <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)" }} />
            </motion.div>
          ))}
        </div>

        <StaggerContainer className="grid-3" style={{ gap: "20px" }}>
          {allocationData?.allocations?.map((a: any, i: number) => {
            const isFlipped = selectedValidator === a.validatorName;

            const frontSide = (
              <div 
                className="glass-card" 
                style={{ 
                  height: "100%", 
                  padding: "24px", 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  borderColor: isFlipped ? COLORS[i % COLORS.length] : "var(--glass-border)",
                  background: isFlipped ? `${COLORS[i % COLORS.length]}08` : "var(--glass-bg)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", border: `1px solid ${COLORS[i % COLORS.length]}40` }}>
                        {a.validatorName?.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: "800", color: "white", fontSize: "1rem" }}>{a.validatorName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: "600" }}>SCORE: {((a.score || 0) / 100).toFixed(1)}%</div>
                    </div>

                </div>

                <div style={{ marginTop: "20px" }}>
                   <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontWeight: "700", marginBottom: "4px", textTransform: "uppercase" }}>Allocated</div>
                   <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "white" }}>
                      {a.amountETH?.toFixed(2)} <span style={{ fontSize: "0.9rem", color: COLORS[i % COLORS.length] }}>ETH</span>
                   </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                   <span className="badge-neon" style={{ background: `${COLORS[i % COLORS.length]}10`, color: COLORS[i % COLORS.length], borderColor: `${COLORS[i % COLORS.length]}20` }}>{a.percentageHuman}</span>
                   <button onClick={() => setSelectedValidator(a.validatorName)} style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700" }}>Details →</button>
                </div>
              </div>
            );

            const backSide = (
              <div 
                className="glass-card" 
                style={{ height: "100%", padding: "20px", display: "flex", flexDirection: "column", borderColor: COLORS[i % COLORS.length], background: "var(--bg-secondary)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontWeight: "800", fontSize: "0.8rem", color: COLORS[i % COLORS.length] }}>LIVE METRICS</span>
                    <button onClick={() => setSelectedValidator(null)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}>✕</button>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="glass-card" style={{ padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontWeight: "700", marginBottom: "4px" }}>RELIABILITY SCORE</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "900", color: COLORS[i % COLORS.length] }}>{((a.score || 0) / 100).toFixed(1)}%</div>
                  </div>
                  
                  <div className="glass-card" style={{ padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontWeight: "700", marginBottom: "4px" }}>OPTIMAL WEIGHT</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "white" }}>{a.percentageHuman}</div>
                  </div>

                  <div className="glass-card" style={{ padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontWeight: "700", marginBottom: "4px" }}>ADDRESS</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-dim)", fontFamily: "JetBrains Mono" }}>
                      {a.validator?.substring(0, 10)}...{a.validator?.substring(a.validator.length - 4)}
                    </div>
                  </div>
                </div>
              </div>
            );


            return (
              <StaggerItem key={a.validatorName}>
                <div style={{ height: "220px", width: "100%" }}>
                  <FlipCard 
                    front={frontSide} 
                    back={backSide} 
                    isFlipped={isFlipped} 
                    style={{ height: "100%", width: "100%" }} 
                  />
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </motion.div>

      {/* Analytics Row */}
      <div className="grid-2 section">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <Card3D glowColor="var(--neon-green)" height={400}>
            <div className="section-header" style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.2rem" }}>Node Weighting Bar</h3>
              <span className="badge-neon">Volume Distribution</span>
            </div>
            <div style={{ height: "260px", width: "100%", minWidth: 0 }}>
               <ResponsiveContainer width="99%" height="100%">
                  <BarChart data={barData}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-dim)', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", borderRadius: "12px" }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="allocated" radius={[6, 6, 0, 0]}>
                       {barData.map((entry: any, i: number) => (
                         <Cell key={i} fill={COLORS[i % COLORS.length]} />
                       ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </Card3D>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
          <Card3D glowColor="var(--neon-blue)" height={400}>
            <div className="section-header" style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.2rem" }}>Risk Efficiency Frontier</h3>
              <span className="badge-neon">Scatter Analysis</span>
            </div>
            <div style={{ height: "260px", width: "100%", minWidth: 0 }}>
               <ResponsiveContainer width="99%" height="100%">
                   <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <XAxis type="number" dataKey="risk" name="Risk" hide domain={[0, 50]} />
                    <YAxis type="number" dataKey="reward" name="Reward" hide domain={[0, 100]} />
                    <ZAxis type="number" dataKey="amount" range={[400, 1500]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="glass-card" style={{ padding: "12px", border: "1px solid var(--glass-border)", background: "rgba(10,10,15,0.9)", backdropFilter: "blur(12px)", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                              <div style={{ color: "white", fontWeight: "800", marginBottom: "4px", fontSize: "0.9rem" }}>{data.name}</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <div style={{ color: "var(--neon-green)", fontSize: "0.75rem", fontWeight: "700" }}>REWARD: {((data.reward || 0) / 100).toFixed(1)}%</div>
                                <div style={{ color: "var(--neon-blue)", fontSize: "0.75rem", fontWeight: "700" }}>RISK SCORE: {((data.risk || 0) / 100).toFixed(1)}%</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={scatterData}>
                       {scatterData.map((entry: any, i: number) => (
                         <Cell key={i} fill={COLORS[i % COLORS.length]} />
                       ))}
                    </Scatter>
                  </ScatterChart>
               </ResponsiveContainer>
            </div>
          </Card3D>
        </motion.div>
      </div>
    </>
  );
}
