import { prisma } from '@/lib/prisma';

export const createSale = async (
  userId: string,
  branchId: string,
  items: { productId: string; quantity: number }[]
) => {
  return prisma.$transaction(async (tx) => {
    let total = 0;

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.active) {
        throw new Error('Invalid or inactive product');
      }

      const stock = await tx.stock.findUnique({
        where: {
          productId_branchId: {
            productId: item.productId,
            branchId,
          },
        },
      });

      if (!stock || stock.quantity < item.quantity) {
        throw new Error('Insufficient stock');
      }

      total += product.price * item.quantity;

      await tx.stock.update({
        where: {
          productId_branchId: {
            productId: item.productId,
            branchId,
          },
        },
        data: { quantity: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          fromBranchId: branchId,
          quantity: item.quantity,
          type: 'SALE',
        },
      });
    }

    const sale = await tx.sale.create({
      data: {
        userId,
        branchId,
        total,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: 0, // price snapshot opcional
          })),
        },
      },
      include: { items: true },
    });

    return sale;
  });
};
