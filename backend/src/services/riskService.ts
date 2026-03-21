import { Allocation, Validator } from "../models/types";

export function calculateHHI(allocations: Allocation[]) {
  let sum = 0;

  for (let a of allocations) {
    const share = a.percentage / 10000;
    sum += share * share;
  }

  return sum;
}

export function diversificationScore(allocations: Allocation[]) {
  const hhi = calculateHHI(allocations);

  return (1 - hhi) * 100; // كل ما قرب من 100 يبقى diversified
}

export function calculateExpectedReturn(
  allocations: Allocation[],
  validators: Validator[]
) {
  let total = 0;

  for (let alloc of allocations) {
    const v = validators.find(v => v.id === alloc.validator);
    if (!v) continue;

    total += alloc.amount * (v.performance / 100);
  }

  return total;
}

export function calculateWorstCaseLoss(
  allocations: Allocation[],
  validators: Validator[]
) {
  let totalLoss = 0;

  for (let alloc of allocations) {
    const v = validators.find(v => v.id === alloc.validator);
    if (!v) continue;

    const loss = alloc.amount * (v.risk / 100);
    totalLoss += loss;
  }

  return totalLoss;
}
