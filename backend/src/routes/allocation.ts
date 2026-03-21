import { Hono } from "hono";
import {
  calculateOptimalAllocation,
  simulateAllocation,
  type ValidatorData,
} from "../services/allocationService";

export const allocationRoutes = new Hono();

/**
 * POST /api/allocation/calculate
 * Calculate optimal allocation for given amount and validators
 */
allocationRoutes.post("/calculate", async (c) => {
  try {
    const body = await c.req.json();
    const { totalAmount, validators } = body;

    if (!totalAmount || !validators || !Array.isArray(validators)) {
      return c.json({ error: "Missing totalAmount or validators array" }, 400);
    }

    const result = calculateOptimalAllocation(
      BigInt(totalAmount),
      validators as ValidatorData[]
    );

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/allocation/simulate?amount=10
 * Quick simulation with mock validators
 */
allocationRoutes.get("/simulate", (c) => {
  const amount = parseFloat(c.req.query("amount") || "10");

  if (isNaN(amount) || amount <= 0) {
    return c.json({ error: "Invalid amount. Provide a positive number." }, 400);
  }

  const result = simulateAllocation(amount);

  // Add human-readable amounts
  const enriched = {
    ...result,
    totalAmountETH: amount,
    allocations: result.allocations.map((a) => ({
      ...a,
      amountETH: parseFloat(
        (Number(BigInt(a.amount)) / 1e18).toFixed(6)
      ),
      percentageHuman: `${(a.percentage / 100).toFixed(2)}%`,
    })),
  };

  return c.json(enriched);
});

/**
 * GET /api/allocation/health
 * Check allocation service health
 */
allocationRoutes.get("/health", (c) => {
  return c.json({
    status: "healthy",
    service: "AllocationService",
    timestamp: Date.now(),
  });
});
