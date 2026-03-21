import { Allocation } from "../models/types";

export function runMonteCarlo(
  allocations: Allocation[],
  iterations = 1000
) {
  let results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let total = 0;

    for (let alloc of allocations) {
      const randomShock = Math.random() * 0.2; // volatility
      const loss = alloc.amount * randomShock;
      total += (alloc.amount - loss);
    }

    results.push(total);
  }

  const avg = results.reduce((a, b) => a + b, 0) / results.length;
  const worst = Math.min(...results);

  return {
    expected: avg,
    worstCase: worst
  };
}
