/// @title AllocationService
/// @description Core allocation algorithm - calculates optimal stake distribution across validators

export interface ValidatorData {
  address: string;
  name: string;
  performanceScore: number; // 0-10000
  commission: number; // basis points
  totalStaked: bigint;
  isActive: boolean;
}

export interface AllocationResult {
  validator: string;
  validatorName: string;
  percentage: number; // basis points
  amount: string; // wei as string
  score: number;
}

export interface AllocationResponse {
  totalAmount: string;
  allocations: AllocationResult[];
  timestamp: number;
  strategy: string;
}

const BASIS_POINTS = 10_000;
const MIN_ALLOCATION = 500; // 5%
const MAX_ALLOCATION = 4_000; // 40%

/**
 * Calculate weighted score for a validator
 * Considers both performance and commission
 */
function weightedScore(
  performance: number,
  commission: number,
  performanceWeight: number = 6_000 // 60%
): number {
  const commissionWeight = BASIS_POINTS - performanceWeight;
  const invertedCommission = BASIS_POINTS - commission;
  return Math.floor(
    (performance * performanceWeight + invertedCommission * commissionWeight) /
      BASIS_POINTS
  );
}

/**
 * Calculate optimal allocation across validators
 * This is the core algorithm 🔥
 */
export function calculateOptimalAllocation(
  totalAmount: bigint,
  validators: ValidatorData[],
  performanceWeight: number = 6_000
): AllocationResponse {
  const activeValidators = validators.filter((v) => v.isActive);

  if (activeValidators.length === 0) {
    return {
      totalAmount: totalAmount.toString(),
      allocations: [],
      timestamp: Date.now(),
      strategy: "weighted_score",
    };
  }

  // Calculate scores
  const scores = activeValidators.map((v) => ({
    ...v,
    score: weightedScore(v.performanceScore, v.commission, performanceWeight),
  }));

  const totalScore = scores.reduce((sum, v) => sum + v.score, 0);

  // Build allocations
  const allocations: AllocationResult[] = [];
  let totalAllocated = 0n;

  for (const v of scores) {
    let pct = Math.floor((v.score * BASIS_POINTS) / totalScore);

    // Clamp to bounds
    if (pct < MIN_ALLOCATION) pct = MIN_ALLOCATION;
    if (pct > MAX_ALLOCATION) pct = MAX_ALLOCATION;

    const amount = (totalAmount * BigInt(pct)) / BigInt(BASIS_POINTS);

    allocations.push({
      validator: v.address,
      validatorName: v.name,
      percentage: pct,
      amount: amount.toString(),
      score: v.score,
    });

    totalAllocated += amount;
  }

  // Assign remainder to top performer
  if (totalAllocated < totalAmount && allocations.length > 0) {
    const remainder = totalAmount - totalAllocated;
    allocations[0].amount = (
      BigInt(allocations[0].amount) + remainder
    ).toString();
  }

  // Sort by score descending
  allocations.sort((a, b) => b.score - a.score);

  return {
    totalAmount: totalAmount.toString(),
    allocations,
    timestamp: Date.now(),
    strategy: "weighted_score",
  };
}

/**
 * Simulate allocation with mock validators (for demo/testing)
 */
export function simulateAllocation(
  totalAmountETH: number
): AllocationResponse {
  const mockValidators: ValidatorData[] = [
    {
      address: "0x1111111111111111111111111111111111111111",
      name: "Validator Alpha",
      performanceScore: 8_500,
      commission: 500,
      totalStaked: 1000000000000000000000n,
      isActive: true,
    },
    {
      address: "0x2222222222222222222222222222222222222222",
      name: "Validator Beta",
      performanceScore: 9_200,
      commission: 300,
      totalStaked: 750000000000000000000n,
      isActive: true,
    },
    {
      address: "0x3333333333333333333333333333333333333333",
      name: "Validator Gamma",
      performanceScore: 7_000,
      commission: 700,
      totalStaked: 500000000000000000000n,
      isActive: true,
    },
    {
      address: "0x4444444444444444444444444444444444444444",
      name: "Validator Delta",
      performanceScore: 6_500,
      commission: 200,
      totalStaked: 300000000000000000000n,
      isActive: true,
    },
    {
      address: "0x5555555555555555555555555555555555555555",
      name: "Validator Epsilon",
      performanceScore: 9_800,
      commission: 800,
      totalStaked: 200000000000000000000n,
      isActive: true,
    },
  ];

  const totalAmountWei = BigInt(Math.floor(totalAmountETH * 1e18));

  return calculateOptimalAllocation(totalAmountWei, mockValidators);
}
