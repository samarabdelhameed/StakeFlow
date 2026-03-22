import "dotenv/config";
import { Hono } from "hono";
import { cors } from 'hono/cors';
import { ethers } from "ethers";
import simulate from "./routes/simulate";
import slash from "./routes/slash";
import { 
  REGISTRY_ADDRESS, 
  VAULT_ADDRESS, 
  REGISTRY_ABI, 
  VAULT_ABI 
} from "./constants";

const app = new Hono();

// Initialize Blockchain Provider
const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc");
const registryContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.route("/api/simulate", simulate);
app.route("/api/slash", slash);

// Health check
app.get("/", (c) => c.text("StakeFlow API (REAL DATA-MODE) Running 🚀"));
app.get("/health", (c) => c.json({ status: "healthy", timestamp: new Date().toISOString() }));

// REAL API endpoints for frontend
app.get("/api/validators", async (c) => {
  try {
    const list = await registryContract.getActiveValidators();
    const validators = list.map((data: any) => {
      return {
        address: data.validatorAddress,
        name: data.name,
        commissionPercent: `${(Number(data.commission) / 100).toFixed(2)}%`,
        riskScore: Number(data.riskScore),
        performancePercent: `${(Number(data.performanceScore) / 100).toFixed(2)}%`,
        totalStakedETH: ethers.formatEther(data.totalStaked),
        isActive: data.isActive
      };
    });
    return c.json({ validators });
  } catch (err: any) {
    return c.json({ error: "Failed to fetch real validator data", details: err.message }, 500);
  }
});

app.get("/api/protocol-stats", async (c) => {
  try {
    const tvl = await vaultContract.totalValueLocked();
    const rate = await vaultContract.exchangeRate();
    return c.json({
      tvlEth: ethers.formatEther(tvl),
      exchangeRate: ethers.formatEther(rate)
    });
  } catch (err: any) {
    return c.json({ error: "Failed to fetch protocol stats", details: err.message }, 500);
  }
});

app.get("/api/allocation/simulate", async (c) => {
  // Use real validators for simulate route
  const amount = c.req.query("amount") || "100";
  const amountNum = parseFloat(amount);
  
  try {
    const list = await registryContract.getActiveValidators();
    const validators = list.map((data: any) => {
      return { name: data.name, score: Number(data.performanceScore) };
    });

    // Simple strategy for preview
    const totalScore = validators.reduce((acc: number, v: any) => acc + v.score, 0);
    const allocations = validators.map((v: any) => ({
      validatorName: v.name.split(" ")[1] || v.name,
      percentageHuman: `${((v.score / totalScore) * 100).toFixed(2)}%`,
      amountETH: amountNum * (v.score / totalScore)
    }));


    return c.json({
      totalAmountETH: amountNum,
      allocations,
      strategy: "weighted_score",
    });
  } catch (err: any) {
    return c.json({ error: "Failed to run simulation with real data", details: err.message }, 500);
  }
});

const port = process.env.PORT || 8080;

export default {
  port,
  fetch: app.fetch,
};
