import { Hono } from "hono";
import simulate from "./routes/simulate";
import slash from "./routes/slash";

const app = new Hono();

// CORS is often needed for local dev with a separate frontend
import { cors } from 'hono/cors';
app.use('*', cors());

app.route("/simulate", simulate);
app.route("/slash", slash);

app.get("/", (c) => c.text("StakeFlow API Running 🚀"));

export default app;
