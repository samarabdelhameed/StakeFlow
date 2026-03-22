'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/features/simulation/hooks/useSimulation';
import CorrelationMatrix from '@/features/simulation/components/CorrelationMatrix';
import MonteCarloChart from '@/features/simulation/components/MonteCarloChart';
import AILoader from '@/components/ui/AILoader';
import { Card3D, StatsCard3D, Button3D } from '@/components/3D/Card3D';
import { StaggerContainer, StaggerItem } from '@/components/UIComponents';
import { useStakeFlow } from '@/hooks/useStakeFlow';

export default function AnalyticsPage() {
  const { position } = useStakeFlow();
  const { runSimulation, runSlashingSimulation, data, isLoading, error } = useSimulation();
  const [amount, setAmount] = useState<number>(0.02);

  // Auto-sync amount with real stake if available
  React.useEffect(() => {
    if (position?.ethValue && parseFloat(position.ethValue) > 0) {
      setAmount(Number(position.ethValue));
    }
  }, [position?.ethValue]);


  // Mock initial validators
  const MOCK_VALIDATORS = [
    { id: 'Val_A', performance: 8, risk: 2, commission: 5, cap: 1000, volatility: 0.15 },
    { id: 'Val_B', performance: 9, risk: 4, commission: 8, cap: 500, volatility: 0.25 },
    { id: 'Val_C', performance: 6, risk: 1, commission: 3, cap: 2000, volatility: 0.08 },
    { id: 'Val_D', performance: 12, risk: 8, commission: 10, cap: 300, volatility: 0.40 },
  ];

  // Systemic correlation matrix
  const CORRELATION_MATRIX = [
    [1.0, 0.8, 0.2, 0.5],
    [0.8, 1.0, 0.1, 0.7],
    [0.2, 0.1, 1.0, 0.0],
    [0.5, 0.7, 0.0, 1.0],
  ];

  const handleRun = () => {
    runSimulation(amount, MOCK_VALIDATORS, CORRELATION_MATRIX);
  };

  const handleSlashingShock = () => {
    runSlashingSimulation(amount, MOCK_VALIDATORS, CORRELATION_MATRIX);
  };

  return (
    <>
      <div className="section-header" style={{ marginBottom: "48px" }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: "3rem", marginBottom: "8px" }}>Risk Terminal</h1>
          <p style={{ color: "var(--text-dim)", fontSize: "1rem" }}>
            <span className="badge-neon" style={{ marginRight: "8px", verticalAlign: "middle", height: "18px", padding: "0 6px", fontSize: "0.6rem" }}>TEE SECURED</span>
            AI-driven allocation & Monte Carlo systemic risk simulator
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div className="glass-card" style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
             <label style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase" }}>Portfolio Amount</label>
             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  style={{ background: "transparent", border: "none", color: "white", fontSize: "1.2rem", fontWeight: "800", width: "100px", outline: "none", fontFamily: "JetBrains Mono" }}
                />
                <span style={{ fontSize: "1rem", fontWeight: "700", color: "var(--neon-green)" }}>ETH</span>
             </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Button3D 
              variant="primary" 
              size="md" 
              onClick={handleRun}
              disabled={isLoading}
              style={{ minWidth: "160px" }}
            >
              {isLoading ? 'Simulating...' : '▶ Run AI Engine'}
            </Button3D>
            <Button3D 
              variant="outline" 
              size="sm" 
              onClick={handleSlashingShock}
              disabled={isLoading}
              style={{ borderColor: "#FF4D6A", color: "#FF4D6A", fontSize: "0.7rem" }}
            >
              ☢ Simulate Slashing Shock
            </Button3D>
          </div>
        </div>
      </div>


      {error && (
        <div className="glass-card" style={{ padding: "16px", border: "1px solid var(--neon-purple)", color: "var(--neon-purple)", background: "rgba(139, 92, 246, 0.1)", marginBottom: "32px", borderRadius: "12px" }}>
          ⚠️ Simulation Error: {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card"
            style={{ padding: "64px", textAlign: "center", border: "1px solid var(--glass-border)", marginBottom: "32px" }}
          >
            <AILoader />
            <h3 style={{ marginTop: "24px", color: "var(--neon-cyan)", fontSize: "1.2rem", fontWeight: "700" }}>Running Quantum Simulations...</h3>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isLoading && data && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* @ts-ignore */}
            {data.isShocked && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="section"
                style={{ 
                  padding: "20px", 
                  borderRadius: "16px", 
                  background: "rgba(255, 77, 106, 0.1)", 
                  border: "2px solid #FF4D6A",
                  marginBottom: "32px",
                  display: "flex",
                  alignItems: "center",
                  gap: "24px"
                }}
              >
                <div style={{ fontSize: "3rem" }}>☣️</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: "#FF4D6A", fontWeight: "900", textTransform: "uppercase", fontSize: "1.4rem" }}>Systemic Slashing Event Simulated</h3>
                  {/* @ts-ignore */}
                  <p style={{ color: "white" }}>Validator <span className="mono" style={{ color: "#FF4D6A", fontWeight: "bold" }}>{data.slashedValidator}</span> went offline. AI Engine automatically liquidated position and rebalanced to 0-risk clusters.</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>REALIZED LOSS</div>
                  {/* @ts-ignore */}
                  <div className="mono" style={{ fontSize: "1.5rem", fontWeight: "900", color: "#FF4D6A" }}>-{data.lossAmount.toFixed(4)} ETH</div>
                </div>
              </motion.div>
            )}

            <StaggerContainer className="grid-4 section">

              <StaggerItem>
                <StatsCard3D
                  title="Expected APY"
                  value={data.expectedReturn}
                  suffix="%"
                  color="var(--neon-green)"
                  prefix="+"
                  icon="📈"
                />
              </StaggerItem>
              <StaggerItem>
                <StatsCard3D
                  title="VaR (95%)"
                  value={data.monteCarlo?.VaR || 0}
                  suffix=" ETH"
                  changeType="negative"
                  color="var(--neon-purple)"
                  prefix="-"
                  icon="🛡️"
                />
              </StaggerItem>
              <StaggerItem>
                <StatsCard3D
                  title="CVaR (95%)"
                  value={data.monteCarlo?.CVaR || 0}
                  suffix=" ETH"
                  changeType="negative"
                  color="#FF4D6A"
                  prefix="-"
                  icon="⚠️"
                />
              </StaggerItem>
              <StaggerItem>
                <StatsCard3D
                  title="Diversification"
                  value={data.diversificationScore}
                  suffix=" / 100"
                  color="var(--neon-blue)"
                  icon="⚡"
                />
              </StaggerItem>
            </StaggerContainer>

            <div className="grid-2 section" style={{ gridTemplateColumns: "1fr 2fr" }}>
              {/* Left Column */}
              <StaggerContainer>
                <StaggerItem>
                  <Card3D glowColor="var(--neon-blue)" style={{ height: "auto" }}>
                    <CorrelationMatrix 
                      matrix={CORRELATION_MATRIX} 
                      labels={MOCK_VALIDATORS.map(v => v.id.replace('Val_', ''))} 
                    />
                    
                    <div style={{ marginTop: "32px" }}>
                      <h4 style={{ fontSize: "1rem", color: "var(--neon-cyan)", marginBottom: "16px", fontWeight: "700" }}>AI Optimal Allocation</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {data.allocations.map((alloc, idx) => (
                          <div key={idx} className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)" }}>
                            <span style={{ color: "white", fontWeight: "600", fontSize: "0.95rem" }}>{alloc.validator}</span>
                            <div style={{ textAlign: "right" }}>
                              <div className="mono" style={{ color: "var(--neon-green)", fontWeight: "800" }}>{alloc.amount.toFixed(2)} ETH</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{(alloc.percentage / 100).toFixed(2)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card3D>
                </StaggerItem>
              </StaggerContainer>

              {/* Right Column */}
              <StaggerContainer>
                <StaggerItem>
                  <Card3D glowColor="var(--neon-purple)" height={600}>
                    <div className="section-header" style={{ marginBottom: "24px" }}>
                      <div>
                        <h3 style={{ fontSize: "1.2rem" }}>Simulated Portfolio Trajectories</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>10,000 permutations modeled with Cholesky Decoupled Systemic Shocks.</p>
                      </div>
                      <span className="badge-neon" style={{ borderColor: "var(--neon-purple)", color: "var(--neon-purple)", background: "rgba(139, 92, 246, 0.1)" }}>Monte Carlo</span>
                    </div>
                    {data.monteCarlo?.distribution && (
                      <div style={{ height: "480px", width: "100%", paddingRight: "16px" }}>
                        <MonteCarloChart 
                          distribution={data.monteCarlo.distribution} 
                          initialAmount={amount}
                        />
                      </div>
                    )}
                  </Card3D>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && !data && !error && (
        <div className="glass-card" style={{ padding: "80px 24px", textAlign: "center", background: "rgba(255,255,255,0.01)", border: "1px border var(--glass-border)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "24px", opacity: 0.5, filter: "grayscale(1)" }}>🧠</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "white", marginBottom: "8px" }}>Awaiting Input Parameters</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: "450px", margin: "0 auto", lineHeight: "1.6" }}>
            Enter your capital configuration above and run the AI Quant Engine to generate your market-aware stochastic simulations.
          </p>
        </div>
      )}
    </>
  );
}
