import { z } from 'zod';

export const createSaleSchema = z.object({
  branchId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
});
