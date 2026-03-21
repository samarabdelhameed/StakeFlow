'use client';
import React, { useState } from 'react';
import { useStakeFlow } from '@/hooks/useStakeFlow';
import { ArrowRight, Bot, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnchainTerminal() {
  const { isConnected, isPendingTx, position, deposit, optimizePosition } = useStakeFlow();
  const [amount, setAmount] = useState('1.0');

  const handleDeposit = async () => {
    if (Number(amount) < 0.01) {
      return toast.error("Minimum deposit is 0.01 ETH");
    }
    await deposit(amount);
  };

  return (
    <div className="bg-black/60 border border-white/10 rounded-3xl p-8 max-w-lg w-full backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Vault Interactions
          </h2>
          <p className="text-slate-400 text-sm mt-1">Execute on-chain smart strategies</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {position && (
        <div className="mb-6 bg-slate-900/50 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Your Portfolio Value:</span>
            <span className="text-lg font-bold text-white">{Number(position.ethValue).toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Withdrawal Status:</span>
            <span className={`text-xs ${position.canWithdraw ? 'text-emerald-400' : 'text-amber-400'}`}>
              {position.canWithdraw ? 'Unlocked' : 'In Cooldown'}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPendingTx}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="0.0"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">ETH</span>
        </div>

        <button 
          onClick={handleDeposit}
          disabled={isPendingTx || !isConnected}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          {isPendingTx ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={20} />}
          Deposit Funds
        </button>

        <button 
          onClick={() => optimizePosition()}
          disabled={isPendingTx || !isConnected || !position || Number(position.ethValue) === 0}
          className="w-full flex items-center justify-center gap-2 bg-transparent border border-purple-500/50 hover:bg-purple-500/10 text-purple-400 font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Bot size={20} />
          Optimize Position On-Chain
          <ArrowRight size={16} />
        </button>
      </div>
      
      {!isConnected && (
        <p className="text-center text-xs text-rose-400 mt-4">
          * Please connect using RainbowKit (top right) to interact.
        </p>
      )}
    </div>
  );
}
