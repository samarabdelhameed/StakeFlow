import { Hono } from "hono";

export const vaultRoutes = new Hono();

// Mock vault state
const vaultState = {
  totalValueLocked: "15750000000000000000000", // 15,750 ETH
  totalShares: "15750000000000000000000000000000000000",
  exchangeRate: "1000000000000000000", // 1:1 initially
  totalDepositors: 342,
  averageAPY: 5.2,
  lastRewardDistribution: Date.now() - 3600000,
};

/**
 * GET /api/vault/info
 * Get vault overview
 */
vaultRoutes.get("/info", (c) => {
  return c.json({
    totalValueLockedETH: (
      Number(BigInt(vaultState.totalValueLocked)) / 1e18
    ).toFixed(2),
    totalDepositors: vaultState.totalDepositors,
    averageAPY: `${vaultState.averageAPY}%`,
    exchangeRate: vaultState.exchangeRate,
    lastRewardDistribution: new Date(
      vaultState.lastRewardDistribution
    ).toISOString(),
    status: "🟢 Active",
  });
});

/**
 * GET /api/vault/tvl
 * Get TVL history (mock data)
 */
vaultRoutes.get("/tvl", (c) => {
  const now = Date.now();
  const history = Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(now - (29 - i) * 86400000).toISOString(),
    tvlETH: (10000 + Math.random() * 8000).toFixed(2),
  }));

  return c.json({ history });
});

/**
 * POST /api/vault/estimate
 * Estimate deposit shares
 */
vaultRoutes.post("/estimate", async (c) => {
  try {
    const { amount } = await c.req.json();
    const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e18));

    // Simple share calculation
    const totalShares = BigInt(vaultState.totalShares);
    const totalAssets = BigInt(vaultState.totalValueLocked);

    let shares: bigint;
    if (totalShares === 0n || totalAssets === 0n) {
      shares = amountWei * BigInt(1e18);
    } else {
      shares = (amountWei * totalShares) / totalAssets;
    }

    return c.json({
      depositAmountETH: amount,
      estimatedShares: shares.toString(),
      currentExchangeRate: vaultState.exchangeRate,
      estimatedAPY: `${vaultState.averageAPY}%`,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
