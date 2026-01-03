import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(3),
  name: z.string().min(2),
  price: z.number().positive(),
  cost: z.number().nonnegative(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().positive().optional(),
  cost: z.number().nonnegative().optional(),
  active: z.boolean().optional(),
});
