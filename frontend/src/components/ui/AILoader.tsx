'use client';
import React from 'react';

export default function AILoader() {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6">
      {/* Outer rotating ring */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400 border-opacity-70 animate-[spin_2s_linear_infinite]"></div>
        <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-500 border-opacity-70 animate-[spin_3s_linear_infinite_reverse]"></div>
        
        {/* Core glowing brain */}
        <div className="w-8 h-8 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_30px_10px_rgba(34,211,238,0.5)]"></div>
      </div>

      {/* Code-like thinking text */}
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse mb-2">
          Initializing AI Quant Engine...
        </h3>
        <div className="flex flex-col items-center text-xs font-mono text-cyan-500/60 space-y-1">
          <span className="animate-[fade-in_1s_ease-in-out]">Decomposing Covariance Matrix (Cholesky)...</span>
          <span className="animate-[fade-in_2s_ease-in-out]">Running 10,000 Monte Carlo Paths...</span>
          <span className="animate-[fade-in_3s_ease-in-out]">Calculating Expected CVaR & VaR...</span>
        </div>
      </div>
    </div>
  );
}
