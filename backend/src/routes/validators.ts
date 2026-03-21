import { Hono } from "hono";

export const validatorRoutes = new Hono();

// Mock validator data for demo
const mockValidators = [
  {
    address: "0x1111111111111111111111111111111111111111",
    name: "Validator Alpha",
    performanceScore: 8500,
    commission: 500,
    totalStaked: "1000000000000000000000",
    isActive: true,
    registeredAt: Date.now() - 86400000 * 30,
  },
  {
    address: "0x2222222222222222222222222222222222222222",
    name: "Validator Beta",
    performanceScore: 9200,
    commission: 300,
    totalStaked: "750000000000000000000",
    isActive: true,
    registeredAt: Date.now() - 86400000 * 60,
  },
  {
    address: "0x3333333333333333333333333333333333333333",
    name: "Validator Gamma",
    performanceScore: 7000,
    commission: 700,
    totalStaked: "500000000000000000000",
    isActive: true,
    registeredAt: Date.now() - 86400000 * 15,
  },
  {
    address: "0x4444444444444444444444444444444444444444",
    name: "Validator Delta",
    performanceScore: 6500,
    commission: 200,
    totalStaked: "300000000000000000000",
    isActive: true,
    registeredAt: Date.now() - 86400000 * 45,
  },
  {
    address: "0x5555555555555555555555555555555555555555",
    name: "Validator Epsilon",
    performanceScore: 9800,
    commission: 800,
    totalStaked: "200000000000000000000",
    isActive: true,
    registeredAt: Date.now() - 86400000 * 10,
  },
];

/**
 * GET /api/validators
 * List all validators
 */
validatorRoutes.get("/", (c) => {
  return c.json({
    count: mockValidators.length,
    validators: mockValidators.map((v) => ({
      ...v,
      totalStakedETH: (Number(BigInt(v.totalStaked)) / 1e18).toFixed(2),
      commissionPercent: `${(v.commission / 100).toFixed(2)}%`,
      performancePercent: `${(v.performanceScore / 100).toFixed(2)}%`,
    })),
  });
});

/**
 * GET /api/validators/:address
 * Get specific validator details
 */
validatorRoutes.get("/:address", (c) => {
  const address = c.req.param("address").toLowerCase();
  const validator = mockValidators.find(
    (v) => v.address.toLowerCase() === address
  );

  if (!validator) {
    return c.json({ error: "Validator not found" }, 404);
  }

  return c.json(validator);
});

/**
 * GET /api/validators/stats
 * Aggregate validator statistics
 */
validatorRoutes.get("/stats/overview", (c) => {
  const totalStaked = mockValidators.reduce(
    (sum, v) => sum + BigInt(v.totalStaked),
    0n
  );
  const avgPerformance =
    mockValidators.reduce((sum, v) => sum + v.performanceScore, 0) /
    mockValidators.length;
  const avgCommission =
    mockValidators.reduce((sum, v) => sum + v.commission, 0) /
    mockValidators.length;

  return c.json({
    totalValidators: mockValidators.length,
    activeValidators: mockValidators.filter((v) => v.isActive).length,
    totalStakedETH: (Number(totalStaked) / 1e18).toFixed(2),
    averagePerformance: `${(avgPerformance / 100).toFixed(2)}%`,
    averageCommission: `${(avgCommission / 100).toFixed(2)}%`,
  });
});
