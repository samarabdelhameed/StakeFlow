import { Allocation, Validator } from "../models/types";

function generateRandomNormal() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Cholesky Decomposition
function cholesky(matrix: number[][]) {
  const n = matrix.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }

      if (i === j) {
        L[i][j] = Math.sqrt(Math.max(matrix[i][i] - sum, 0)); // Safety to avoid NaN
      } else {
        L[i][j] = L[j][j] === 0 ? 0 : (matrix[i][j] - sum) / L[j][j];
      }
    }
  }

  return L;
}

export function runAdvancedMonteCarlo(
  allocations: Allocation[],
  validators: Validator[],
  correlationMatrix: number[][],
  iterations = 1000
) {
  // Only evaluate validators that received allocations
  const activeAllocs = allocations.filter(a => a.amount > 0);
  const n = activeAllocs.length;
  
  if (n === 0) return { expected: 0, worstCase: 0, VaR: 0, CVaR: 0, distribution: [] };

  // Safety filter for matrix size vs active allocations
  const activeMatrix = Array.from({ length: n }, (_, i) => 
    Array.from({ length: n }, (_, j) => correlationMatrix[i]?.[j] ?? (i===j ? 1 : 0))
  );

  const L = cholesky(activeMatrix);

  let results: number[] = [];
  let initialValue = activeAllocs.reduce((sum, a) => sum + a.amount, 0);

  for (let iter = 0; iter < iterations; iter++) {
    // Independent random shocks
    let z = Array.from({ length: n }, generateRandomNormal);

    // Correlated shocks
    let correlated: number[] = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        correlated[i] += L[i][j] * z[j];
      }
    }

    let total = 0;

    for (let i = 0; i < n; i++) {
      const alloc = activeAllocs[i];
      const v = validators.find(val => val.id === alloc.validator);
      if (!v) continue;

      const shock = correlated[i] * v.volatility;
      // performance acts as expected mean, shock is the deviation
      const adjustedReturn = v.performance + shock * 100;
      
      total += alloc.amount + (alloc.amount * (adjustedReturn / 10000));
    }

    results.push(total);
  }

  const avg = results.reduce((a, b) => a + b, 0) / results.length;
  const worst = Math.min(...results);

  // Bonus: Calculate VaR & CVaR (Value at Risk & Conditional Value at Risk) at 95% confidence
  const sorted = [...results].sort((a, b) => a - b);
  const index5Percent = Math.floor(iterations * 0.05);
  const VaR = initialValue - sorted[index5Percent];
  
  const worst5Percent = sorted.slice(0, index5Percent);
  const CVaR = initialValue - (worst5Percent.reduce((a, b) => a + b, 0) / (worst5Percent.length || 1));

  return {
    expected: avg,
    worstCase: worst,
    VaR: Math.max(0, VaR),
    CVaR: Math.max(0, CVaR),
    distribution: results.slice(0, 200) // sample for the graph
  };
}

