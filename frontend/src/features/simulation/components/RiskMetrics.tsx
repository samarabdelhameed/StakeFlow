'use client';
import React from 'react';
import { AlertTriangle, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  expectedReturn: number;
  worstCaseLoss: number;
  var95: number;
  cvar95: number;
  hhi: number;
}

export default function RiskMetrics({ expectedReturn, worstCaseLoss, var95, cvar95, hhi }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Expected Return */}
      <div className="bg-gradient-to-br from-black/60 to-slate-900/80 p-5 rounded-2xl border border-cyan-500/20 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
          <TrendingUp size={40} className="text-cyan-400" />
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Expected APY</p>
        <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          +{expectedReturn.toFixed(2)}%
        </p>
      </div>

      {/* Value at Risk (VaR) */}
      <div className="bg-gradient-to-br from-black/60 to-slate-900/80 p-5 rounded-2xl border border-purple-500/20 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
          <ShieldCheck size={40} className="text-purple-400" />
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">VaR (95%)</p>
        <p className="text-2xl font-bold text-purple-400">
          -{var95.toFixed(2)} ETH
        </p>
      </div>

      {/* CVaR */}
      <div className="bg-gradient-to-br from-black/60 to-slate-900/80 p-5 rounded-2xl border border-rose-500/20 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
          <AlertTriangle size={40} className="text-rose-400" />
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">CVaR (95%)</p>
        <p className="text-2xl font-bold text-rose-400">
          -{cvar95.toFixed(2)} ETH
        </p>
      </div>

      {/* HHI / Diversification */}
      <div className="bg-gradient-to-br from-black/60 to-slate-900/80 p-5 rounded-2xl border border-emerald-500/20 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
          <Zap size={40} className="text-emerald-400" />
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Diversification</p>
        <p className="text-2xl font-bold text-emerald-400">
          {hhi.toFixed(0)} / 100
        </p>
      </div>
    </div>
  );
}
