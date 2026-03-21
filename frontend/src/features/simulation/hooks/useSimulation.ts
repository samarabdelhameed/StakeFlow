import { useState } from 'react';

export interface SimulationResult {
  allocations: { validator: string; amount: number; percentage: number }[];
  expectedReturn: number;
  worstCaseLoss: number;
  diversificationScore: number;
  monteCarlo: {
    expected: number;
    worstCase: number;
    VaR: number;
    CVaR: number;
    distribution: number[];
  };
}

export function useSimulation() {
  const [data, setData] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async (amount: number, validators: any[], correlationMatrix: number[][]) => {
    setIsLoading(true);
    setError(null);
    try {
      // Assuming Bun backend is running on port 3000
      const response = await fetch('http://localhost:3000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, validators, correlationMatrix }),
      });

      if (!response.ok) {
        throw new Error('Simulation failed to fetch');
      }

      const result: SimulationResult = await response.json();
      
      // Add a slight artificial delay so the user enjoys the "AI Thinking" loader 😈
      setTimeout(() => {
        setData(result);
        setIsLoading(false);
      }, 1500);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, runSimulation };
}
