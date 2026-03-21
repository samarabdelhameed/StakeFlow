import { Validator, Allocation } from "../models/types";
import { percentOf, clamp, BASIS_POINTS } from "../utils/math";

export function calculateScore(v: Validator) {
  const performanceWeight = 0.6;
  const riskWeight = 0.2;
  const commissionWeight = 0.2;

  const score =
    v.performance * performanceWeight +
    (100 - v.risk) * riskWeight +
    (100 - v.commission) * commissionWeight;

  return score;
}

export function optimizeAllocation(
  amount: number,
  validators: Validator[]
): Allocation[] {
  const scores = validators.map(v => ({
    ...v,
    score: calculateScore(v)
  }));

  const totalScore = scores.reduce((acc, v) => acc + v.score, 0);

  let allocations: Allocation[] = [];
  let allocated = 0;

  for (let v of scores) {
    let pct = (v.score / totalScore) * BASIS_POINTS;
    pct = clamp(pct, 500, 4000);

    let allocAmount = percentOf(amount, pct);

    if (v.cap > 0 && allocAmount > v.cap) {
      allocAmount = v.cap;
      pct = (allocAmount / amount) * BASIS_POINTS;
    }

    allocations.push({
      validator: v.id,
      amount: allocAmount,
      percentage: pct
    });

    allocated += allocAmount;
  }

  // Distribution of remaining amount
  if (allocated < amount && allocations.length > 0) {
    allocations[0].amount += (amount - allocated);
  }

  return allocations;
}
