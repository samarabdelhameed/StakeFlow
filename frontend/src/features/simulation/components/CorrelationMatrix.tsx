'use client';
import React from 'react';

interface CorrelationMatrixProps {
  matrix: number[][];
  labels?: string[];
}

export default function CorrelationMatrix({ matrix, labels }: CorrelationMatrixProps) {
  // Helper to map 0-1 values to a cool heatmap color (from dark blue/purple to bright neon pink/cyan)
  const getColor = (value: number) => {
    if (value === 1) return 'bg-cyan-500 text-black font-bold'; // Perfect correlation
    if (value > 0.8) return 'bg-cyan-700/80 text-cyan-100';
    if (value > 0.5) return 'bg-blue-800/60 text-blue-200';
    if (value > 0.2) return 'bg-indigo-900/50 text-indigo-300';
    return 'bg-slate-900/40 text-slate-500'; // Close to 0
  };

  return (
    <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Covariance & Correlation Matrix
        </h3>
        <span className="text-xs text-slate-400 font-mono">Systemic Risk Module</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2"></th>
              {matrix.map((_, i) => (
                <th key={i} className="p-2 text-xs text-slate-400 font-medium">
                  {labels ? labels[i] : `Val ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="p-2 text-xs text-slate-400 font-medium text-left">
                  {labels ? labels[i] : `Val ${i + 1}`}
                </td>
                {row.map((val, j) => (
                  <td key={j} className="p-1">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-lg text-xs transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] cursor-pointer ${getColor(
                        val
                      )}`}
                      title={`Correlation between ${labels ? labels[i] : i+1} and ${labels ? labels[j] : j+1}: ${(val * 100).toFixed(0)}%`}
                    >
                      {val.toFixed(2)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 justify-center">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-900/40"></div> Low</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-800/60"></div> Medium</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-cyan-700/80"></div> High</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-cyan-500"></div> Perfect (1.0)</div>
      </div>
    </div>
  );
}
