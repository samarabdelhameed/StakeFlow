import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { allocationRoutes } from "./routes/allocation";
import { validatorRoutes } from "./routes/validators";
import { vaultRoutes } from "./routes/vault";

const app = new Hono();

// ═══════════════════════════════════════════════════════
//                      MIDDLEWARE
// ═══════════════════════════════════════════════════════

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// ═══════════════════════════════════════════════════════
//                       ROUTES
// ═══════════════════════════════════════════════════════

app.get("/", (c) => {
  return c.json({
    name: "StakeFlow API",
    version: "1.0.0",
    status: "🟢 Running",
    endpoints: {
      allocation: "/api/allocation",
      validators: "/api/validators",
      vault: "/api/vault",
    },
  });
});

app.route("/api/allocation", allocationRoutes);
app.route("/api/validators", validatorRoutes);
app.route("/api/vault", vaultRoutes);

// ═══════════════════════════════════════════════════════
//                       SERVER
// ═══════════════════════════════════════════════════════

const port = parseInt(process.env.PORT || "8080");

console.log(`
╔═══════════════════════════════════════════════╗
║           🚀 StakeFlow API Server             ║
║          Running on port ${port}                ║
║          Powered by Bun + Hono               ║
╚═══════════════════════════════════════════════╝
`);

export default {
  port,
  fetch: app.fetch,
};
