'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  distribution: number[];
  initialAmount: number;
}

export default function MonteCarloChart({ distribution, initialAmount }: Props) {
  // Sort and format distribution into buckets for a smooth bell-curve look
  const sorted = [...distribution].sort((a, b) => a - b);
  
  // We'll just show the distribution as a line/area of the sorted outcomes to keep it simple and beautiful
  const data = sorted.map((val, index) => ({
    percentile: ((index / sorted.length) * 100).toFixed(0) + '%',
    value: val,
    isLoss: val < initialAmount
  }));

  return (
    <div className="w-full h-64 mt-4 bg-black/30 p-4 rounded-xl border border-white/5">
      <h4 className="text-sm font-semibold text-cyan-400 mb-4 px-2">Simulated Outcome Distribution (Sorted Paths)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis 
            dataKey="percentile" 
            stroke="#ffffff50" 
            fontSize={12} 
            tickMargin={10} 
            minTickGap={30}
          />
          <YAxis 
            stroke="#ffffff50" 
            fontSize={12} 
            tickFormatter={(val) => val.toFixed(1)} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
            itemStyle={{ color: '#22d3ee' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number) => [value.toFixed(3) + ' ETH', 'Simulated Portfolio Value']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#a855f7" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
