'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/features/simulation/hooks/useSimulation';
import CorrelationMatrix from '@/features/simulation/components/CorrelationMatrix';
import MonteCarloChart from '@/features/simulation/components/MonteCarloChart';
import RiskMetrics from '@/features/simulation/components/RiskMetrics';
import AILoader from '@/components/ui/AILoader';
import { Play, RotateCcw } from 'lucide-react';

export default function AnalyticsPage() {
  const { runSimulation, data, isLoading, error } = useSimulation();
  
  const [amount, setAmount] = useState<number>(100);

  // Mock initial validators to represent the options before fetching from Smart Contracts
  const MOCK_VALIDATORS = [
    { id: 'Val_A', performance: 8, risk: 2, commission: 5, cap: 1000, volatility: 0.15 },
    { id: 'Val_B', performance: 9, risk: 4, commission: 8, cap: 500, volatility: 0.25 },
    { id: 'Val_C', performance: 6, risk: 1, commission: 3, cap: 2000, volatility: 0.08 },
    { id: 'Val_D', performance: 12, risk: 8, commission: 10, cap: 300, volatility: 0.40 },
  ];

  // Cholesky-ready realistic systemic correlation matrix
  const CORRELATION_MATRIX = [
    [1.0, 0.8, 0.2, 0.5],
    [0.8, 1.0, 0.1, 0.7],
    [0.2, 0.1, 1.0, 0.0],
    [0.5, 0.7, 0.0, 1.0],
  ];

  const handleRun = () => {
    runSimulation(amount, MOCK_VALIDATORS, CORRELATION_MATRIX);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans overflow-x-hidden">
      {/* Decorative Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500">
              Institutional Risk Terminal
            </h1>
            <p className="mt-2 text-slate-400">
              AI-driven allocation & Monte Carlo systemic risk simulator
            </p>
          </div>
          
          <div className="mt-6 md:mt-0 flex gap-4 bg-black/40 p-2 rounded-xl border border-white/10">
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 uppercase px-2 mb-1">Portfolio (ETH)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="bg-transparent border-none outline-none text-xl font-bold text-white px-2 w-32 focus:ring-0"
              />
            </div>
            <button 
              onClick={handleRun}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Simulating...' : <><Play size={18} /> Run AI</>}
            </button>
          </div>
        </div>

        {/* ERROR BOUNDARY */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl">
            Simulation Error: {error}
          </div>
        )}

        {/* LOADING OVERLAY */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 bg-black/20 rounded-3xl border border-white/5"
            >
              <AILoader />
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS PANEL */}
        <AnimatePresence>
          {!isLoading && data && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ staggerChildren: 0.2 }}
              className="space-y-8"
            >
              {/* TOP METRICS */}
              <RiskMetrics 
                expectedReturn={data.expectedReturn}
                worstCaseLoss={data.worstCaseLoss}
                var95={data.monteCarlo?.VaR || 0}
                cvar95={data.monteCarlo?.CVaR || 0}
                hhi={data.diversificationScore}
              />

              <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT: CORRELATION MATRIX */}
                <div className="lg:col-span-1">
                  <CorrelationMatrix 
                    matrix={CORRELATION_MATRIX} 
                    labels={MOCK_VALIDATORS.map(v => v.id.replace('Val_', ''))} 
                  />
                  
                  {/* Quick Allocation breakdown list */}
                  <div className="mt-6 bg-black/40 border border-white/10 rounded-2xl p-5 shadow-xl">
                    <h3 className="text-sm font-semibold text-purple-400 mb-4">AI Optimal Allocation</h3>
                    <div className="space-y-3">
                      {data.allocations.map((alloc, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-white/5">
                          <span className="text-slate-300 text-sm font-medium">{alloc.validator}</span>
                          <div className="flex flex-col items-end">
                            <span className="text-cyan-400 font-bold">{alloc.amount.toFixed(2)} ETH</span>
                            <span className="text-xs text-slate-500">{(alloc.percentage / 100).toFixed(2)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: MONTE CARLO CHART */}
                <div className="lg:col-span-2">
                  <div className="h-full w-full bg-gradient-to-br from-black/50 to-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Simulated Portfolio Trajectories</h3>
                      <p className="text-sm text-slate-400">10,000 permutations modeled with Cholesky Decoupled Systemic Shocks.</p>
                    </div>
                    {data.monteCarlo?.distribution && (
                      <MonteCarloChart 
                        distribution={data.monteCarlo.distribution} 
                        initialAmount={amount}
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EMPTY STATE */}
        {!isLoading && !data && !error && (
          <div className="py-24 text-center rounded-3xl border border-dashed border-slate-700/50 bg-slate-900/20">
            <RotateCcw size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
            <h2 className="text-xl font-medium text-slate-400">Awaiting Input Parameters</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
              Enter your capital configuration above and run the AI Quant Engine to generate your market-aware stochastic simulations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
