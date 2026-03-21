import { z } from "zod";

export const validatorSchema = z.object({
  id: z.string(),
  performance: z.number(),
  risk: z.number(),
  commission: z.number(),
  cap: z.number(),
  volatility: z.number().default(0.1)
});

export const correlationSchema = z.array(z.array(z.number()));

export const simulationSchema = z.object({
  amount: z.number().positive(),
  validators: z.array(validatorSchema).min(1),
  correlationMatrix: correlationSchema
});
