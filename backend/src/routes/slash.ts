import { Hono } from "hono";

const route = new Hono();

route.post("/", async (c) => {
  const body = await c.req.json();
  const allocations = body.allocations;
  const slashRate = body.slashRate;

  let totalLoss = 0;

  for (let a of allocations) {
    const loss = a.amount * (slashRate / 100);
    totalLoss += loss;
  }

  return c.json({
    totalLoss,
    message: "Slashing simulation complete"
  });
});

export default route;
