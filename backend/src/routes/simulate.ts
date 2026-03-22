import { Hono } from "hono";
import { simulatePortfolio, simulateSlashing } from "../services/simulationService";
import { simulationSchema } from "../utils/validation";


const route = new Hono();

route.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = simulationSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);

  const { amount, validators, correlationMatrix } = parsed.data;
  return c.json(simulatePortfolio(amount, validators, correlationMatrix));
});

route.post("/shocker", async (c) => {
  const body = await c.req.json();
  const parsed = simulationSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);

  const { amount, validators, correlationMatrix } = parsed.data;
  return c.json(simulateSlashing(amount, validators, correlationMatrix));
});

export default route;

