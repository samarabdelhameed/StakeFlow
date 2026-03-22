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

  const minValue = Math.min(...sorted);
  const maxValue = Math.max(...sorted);
  // Add a 5% buffer to make the distribution float nicely in the middle
  const padding = (maxValue - minValue) * 0.05 || (initialAmount * 0.001);
  const domainMin = minValue - padding;
  const domainMax = maxValue + padding;

  return (
    <div className="analytics-chart-container" style={{ width: "100%", height: "400px", marginTop: "32px", position: "relative" }}>
      <h4 style={{ position: "absolute", top: -24, left: 16, fontSize: "0.85rem", color: "var(--neon-cyan)", fontWeight: "600" }}>
        Simulated Outcome Distribution (Sorted Paths)
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={minValue < initialAmount ? "#FF4D6A" : "#CAFF33"} stopOpacity={0.6} />
              <stop offset="95%" stopColor={minValue < initialAmount ? "#FF4D6A" : "#CAFF33"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="percentile"
            stroke="rgba(255,255,255,0.3)"
            fontSize={10}
            tickMargin={10}
            minTickGap={40}
            hide={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            fontSize={10}
            domain={[domainMin, domainMax]}
            tickFormatter={(val) => val.toFixed(5)}
            width={70}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: "#1a1a3e", 
              border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              color: "white"
            }}
            labelStyle={{ color: "var(--text-dim)", marginBottom: "4px" }}
            itemStyle={{ color: "var(--neon-green)", fontWeight: "bold" }}
            formatter={(value: any) => [`${parseFloat(value).toFixed(6)} ETH`, 'Portfolio Valuation']}

          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={minValue < initialAmount ? "#FF4D6A" : "#CAFF33"}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={2500}
            baseValue="dataMin"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>


  );
}
