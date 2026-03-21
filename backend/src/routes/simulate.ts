import { Hono } from "hono";
import { simulatePortfolio } from "../services/simulationService";
import { simulationSchema } from "../utils/validation";

const route = new Hono();

route.post("/", async (c) => {
  const body = await c.req.json();

  const parsed = simulationSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error }, 400);
  }

  const { amount, validators, correlationMatrix } = parsed.data;

  const result = simulatePortfolio(amount, validators, correlationMatrix);

  return c.json(result);
});

export default route;
