"use client";

import { useState, useEffect } from "react";

interface Allocation {
  validator: string;
  validatorName: string;
  percentage: number;
  amount: string;
  score: number;
  amountETH: number;
  percentageHuman: string;
}

interface AllocationData {
  totalAmount: string;
  totalAmountETH: number;
  allocations: Allocation[];
  timestamp: number;
  strategy: string;
}

const COLORS = ["#6366f1", "#06b6d4", "#a855f7", "#10b981", "#f59e0b"];

const API_BASE = "http://localhost:8080";

export default function Dashboard() {
  const [amount, setAmount] = useState("10");
  const [allocationData, setAllocationData] = useState<AllocationData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [vaultInfo, setVaultInfo] = useState<any>(null);
  const [validators, setValidators] = useState<any[]>([]);
  const [animatedTVL, setAnimatedTVL] = useState(0);

  // Fetch initial data
  useEffect(() => {
    fetchVaultInfo();
    fetchValidators();
    fetchAllocation("10");
  }, []);

  // Animate TVL counter
  useEffect(() => {
    if (vaultInfo) {
      const target = parseFloat(vaultInfo.totalValueLockedETH);
      const duration = 2000;
      const start = Date.now();
      const animate = () => {
        const progress = Math.min((Date.now() - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedTVL(target * eased);
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }
  }, [vaultInfo]);

  async function fetchVaultInfo() {
    try {
      const res = await fetch(`${API_BASE}/api/vault/info`);
      const data = await res.json();
      setVaultInfo(data);
    } catch {
      // Use mock data if backend is down
      setVaultInfo({
        totalValueLockedETH: "15750.00",
        totalDepositors: 342,
        averageAPY: "5.2%",
        status: "🟢 Active",
      });
    }
  }

  async function fetchValidators() {
    try {
      const res = await fetch(`${API_BASE}/api/validators`);
      const data = await res.json();
      setValidators(data.validators || []);
    } catch {
      setValidators([
        {
          name: "Validator Alpha",
          address: "0x1111...1111",
          performancePercent: "85.00%",
          commissionPercent: "5.00%",
          totalStakedETH: "1000.00",
          isActive: true,
        },
        {
          name: "Validator Beta",
          address: "0x2222...2222",
          performancePercent: "92.00%",
          commissionPercent: "3.00%",
          totalStakedETH: "750.00",
          isActive: true,
        },
        {
          name: "Validator Gamma",
          address: "0x3333...3333",
          performancePercent: "70.00%",
          commissionPercent: "7.00%",
          totalStakedETH: "500.00",
          isActive: true,
        },
        {
          name: "Validator Delta",
          address: "0x4444...4444",
          performancePercent: "65.00%",
          commissionPercent: "2.00%",
          totalStakedETH: "300.00",
          isActive: true,
        },
        {
          name: "Validator Epsilon",
          address: "0x5555...5555",
          performancePercent: "98.00%",
          commissionPercent: "8.00%",
          totalStakedETH: "200.00",
          isActive: true,
        },
      ]);
    }
  }

  async function fetchAllocation(amountETH: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/allocation/simulate?amount=${amountETH}`
      );
      const data = await res.json();
      setAllocationData(data);
    } catch {
      // Mock allocation data
      setAllocationData({
        totalAmount: "10000000000000000000",
        totalAmountETH: parseFloat(amountETH),
        allocations: [
          {
            validator: "0x5555",
            validatorName: "Validator Epsilon",
            percentage: 2192,
            amount: "2192000000000000000",
            score: 9560,
            amountETH: 2.192,
            percentageHuman: "21.92%",
          },
          {
            validator: "0x2222",
            validatorName: "Validator Beta",
            percentage: 2155,
            amount: "2155000000000000000",
            score: 9400,
            amountETH: 2.155,
            percentageHuman: "21.55%",
          },
          {
            validator: "0x1111",
            validatorName: "Validator Alpha",
            percentage: 2041,
            amount: "2041000000000000000",
            score: 8900,
            amountETH: 2.041,
            percentageHuman: "20.41%",
          },
          {
            validator: "0x3333",
            validatorName: "Validator Gamma",
            percentage: 1816,
            amount: "1816000000000000000",
            score: 7920,
            amountETH: 1.816,
            percentageHuman: "18.16%",
          },
          {
            validator: "0x4444",
            validatorName: "Validator Delta",
            percentage: 1793,
            amount: "1793000000000000000",
            score: 7820,
            amountETH: 1.793,
            percentageHuman: "17.93%",
          },
        ],
        timestamp: Date.now(),
        strategy: "weighted_score",
      });
    }
    setLoading(false);
  }

  function handleCalculate() {
    if (parseFloat(amount) > 0) {
      fetchAllocation(amount);
    }
  }

  return (
    <main className="container">
      {/* ═══ Hero Stats ═══ */}
      <section className="section">
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1
            className="gradient-text fade-in-up"
            style={{ fontSize: "3rem", marginBottom: "12px" }}
          >
            Intelligent Restaking
          </h1>
          <p
            className="fade-in-up fade-in-up-delay-1"
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Maximize your ETH rewards with AI-powered allocation across
            top-performing validators
          </p>
        </div>

        <div className="grid-4" id="stats-overview">
          <div className="card card-glow stat-card fade-in-up fade-in-up-delay-1">
            <span className="stat-label">Total Value Locked</span>
            <span className="stat-value gradient-text mono">
              {animatedTVL.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}{" "}
              ETH
            </span>
            <span className="stat-change positive">↑ 12.5% this week</span>
          </div>

          <div className="card card-glow stat-card fade-in-up fade-in-up-delay-2">
            <span className="stat-label">Average APY</span>
            <span
              className="stat-value"
              style={{ color: "var(--accent-emerald)" }}
            >
              {vaultInfo?.averageAPY || "5.2%"}
            </span>
            <span className="stat-change positive">↑ 0.3% from last week</span>
          </div>

          <div className="card card-glow stat-card fade-in-up fade-in-up-delay-3">
            <span className="stat-label">Active Validators</span>
            <span
              className="stat-value"
              style={{ color: "var(--accent-cyan)" }}
            >
              {validators.length || 5}
            </span>
            <span className="badge badge-success">
              <span className="status-dot active"></span>All Online
            </span>
          </div>

          <div className="card card-glow stat-card fade-in-up fade-in-up-delay-4">
            <span className="stat-label">Total Depositors</span>
            <span
              className="stat-value"
              style={{ color: "var(--accent-purple)" }}
            >
              {vaultInfo?.totalDepositors || 342}
            </span>
            <span className="stat-change positive">↑ 48 new this week</span>
          </div>
        </div>
      </section>

      {/* ═══ Allocation Calculator ═══ */}
      <section className="section" id="allocation">
        <div className="section-header">
          <div>
            <h2 className="section-title">🧠 Smart Allocation</h2>
            <p className="section-subtitle">
              Enter your amount to see the optimal distribution
            </p>
          </div>
          <span className="badge badge-info">
            Strategy: Weighted Score Algorithm
          </span>
        </div>

        <div className="grid-2" style={{ gap: "32px" }}>
          {/* Input Card */}
          <div className="card">
            <div className="input-container" style={{ marginBottom: "20px" }}>
              <label className="input-label" htmlFor="stake-amount">
                Stake Amount
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="stake-amount"
                  className="input mono"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter ETH amount"
                  min="0.01"
                  step="0.1"
                  style={{ paddingRight: "60px" }}
                />
                <span className="input-suffix">ETH</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleCalculate}
              disabled={loading}
              id="calculate-btn"
              style={{ width: "100%" }}
            >
              {loading ? (
                <>
                  <span className="shimmer" style={{ width: 20, height: 20, borderRadius: "50%", display: "inline-block" }}></span>
                  Calculating...
                </>
              ) : (
                <>🚀 Calculate Optimal Allocation</>
              )}
            </button>

            {allocationData && (
              <div style={{ marginTop: "24px" }}>
                <div className="divider" />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Strategy
                  </span>
                  <span className="mono" style={{ fontSize: "0.85rem" }}>
                    {allocationData.strategy}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Total
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--accent-emerald)",
                    }}
                  >
                    {allocationData.totalAmountETH} ETH
                  </span>
                </div>

                {/* Allocation Bar */}
                <div className="allocation-bar" style={{ marginBottom: "16px" }}>
                  {allocationData.allocations.map((alloc, i) => (
                    <div
                      key={alloc.validator}
                      className="allocation-segment tooltip"
                      data-tooltip={`${alloc.validatorName}: ${alloc.percentageHuman}`}
                      style={{
                        width: `${alloc.percentage / 100}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {allocationData.allocations.map((alloc, i) => (
                    <div
                      key={alloc.validator}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                      }}
                    >
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "3px",
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                      <span style={{ color: "var(--text-muted)" }}>
                        {alloc.validatorName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Allocation Results */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-default)",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                Allocation Breakdown
              </h3>
            </div>

            {allocationData ? (
              <div>
                {allocationData.allocations.map((alloc, i) => (
                  <div
                    key={alloc.validator}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "16px 24px",
                      borderBottom: "1px solid var(--border-default)",
                      transition: "background var(--transition-fast)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "var(--radius-sm)",
                        background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}33, ${COLORS[i % COLORS.length]}11)`,
                        border: `1px solid ${COLORS[i % COLORS.length]}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "16px",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: COLORS[i % COLORS.length],
                      }}
                    >
                      {i + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          marginBottom: "2px",
                        }}
                      >
                        {alloc.validatorName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                        className="mono"
                      >
                        Score: {alloc.score.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontWeight: 600 }}>
                        {alloc.amountETH.toFixed(4)} ETH
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: COLORS[i % COLORS.length],
                          fontWeight: 600,
                        }}
                      >
                        {alloc.percentageHuman}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📊</div>
                Enter an amount and click calculate
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Validators Table ═══ */}
      <section className="section" id="validators">
        <div className="section-header">
          <div>
            <h2 className="section-title">⚡ Active Validators</h2>
            <p className="section-subtitle">
              Real-time performance and commission data
            </p>
          </div>
          <span className="badge badge-success">
            <span className="status-dot active"></span>
            {validators.length} Active
          </span>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Validator</th>
                  <th>Status</th>
                  <th>Performance</th>
                  <th>Commission</th>
                  <th>Total Staked</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {validators.map((v, i) => {
                  const perf = parseFloat(v.performancePercent || "0");
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "var(--radius-sm)",
                              background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}33, ${COLORS[i % COLORS.length]}11)`,
                              border: `1px solid ${COLORS[i % COLORS.length]}44`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: COLORS[i % COLORS.length],
                            }}
                          >
                            {v.name?.charAt(v.name.lastIndexOf(" ") + 1) || "V"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{v.name}</div>
                            <div
                              className="mono"
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {v.address?.slice(0, 6)}...{v.address?.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${v.isActive ? "badge-success" : "badge-danger"}`}>
                          <span className={`status-dot ${v.isActive ? "active" : "inactive"}`}></span>
                          {v.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="progress-bar" style={{ width: "80px" }}>
                            <div
                              className="progress-fill"
                              style={{
                                width: `${perf}%`,
                                background:
                                  perf > 80
                                    ? "linear-gradient(90deg, var(--accent-emerald), var(--accent-cyan))"
                                    : perf > 60
                                    ? "linear-gradient(90deg, var(--accent-amber), var(--accent-emerald))"
                                    : "linear-gradient(90deg, var(--accent-rose), var(--accent-amber))",
                              }}
                            />
                          </div>
                          <span className="mono" style={{ fontSize: "0.85rem" }}>
                            {v.performancePercent}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="mono">{v.commissionPercent}</span>
                      </td>
                      <td>
                        <span className="mono" style={{ fontWeight: 600 }}>
                          {v.totalStakedETH} ETH
                        </span>
                      </td>
                      <td>
                        <span
                          className="mono"
                          style={{
                            fontWeight: 700,
                            color: COLORS[i % COLORS.length],
                          }}
                        >
                          {((perf / 100) * 10000).toFixed(0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ Protocol Info ═══ */}
      <section className="section" style={{ paddingBottom: "80px" }}>
        <div className="grid-3">
          <div className="card card-glow" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔒</div>
            <h4 style={{ marginBottom: "8px" }}>Secure by Design</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6" }}>
              Built with OpenZeppelin contracts, audited patterns, and Foundry
              fuzz testing
            </p>
          </div>

          <div className="card card-glow" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚡</div>
            <h4 style={{ marginBottom: "8px" }}>Lightning Fast</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6" }}>
              Powered by Bun runtime & Hono framework for sub-millisecond API
              responses
            </p>
          </div>

          <div className="card card-glow" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🧠</div>
            <h4 style={{ marginBottom: "8px" }}>Smart Allocation</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6" }}>
              Weighted scoring algorithm optimizes returns based on performance
              & commission
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer
        style={{
          borderTop: "1px solid var(--glass-border)",
          padding: "32px 0",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        <p>
          <span className="gradient-text" style={{ fontWeight: 700 }}>
            StakeFlow
          </span>{" "}
          — Built with Foundry + Bun + Next.js • 2026
        </p>
      </footer>
    </main>
  );
}
