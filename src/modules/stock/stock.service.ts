import { prisma } from '@/lib/prisma';

export const getStockByProduct = async (productId: string) => {
  return prisma.stock.findMany({
    where: { productId },
    include: { branch: true },
  });
};

export const getSockByBranch = async (branchId: string) => {
  return prisma.stock.findMany({
    where: { branchId },
    include: { product: true },
  });
};

export const adjustStock = async (
  productId: string,
  branchId: string,
  quantity: number
) => {
  return prisma.$transaction(async (tx) => {
    const stock = await tx.stock.upsert({
      where: {
        productId_branchId: { productId, branchId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        productId,
        branchId,
        quantity,
      },
    });

    if (stock.quantity < 0) {
      throw new Error('Stock cannot be negative');
    }

    await tx.stockMovement.create({
      data: {
        productId,
        toBranchId: branchId,
        quantity,
        type: 'ADJUST',
      },
    });

    return stock;
  });
};

export const transferStock = async (
  productId: string,
  fromBranchId: string,
  toBranchId: string,
  quantity: number
) => {
  return prisma.$transaction(async (tx) => {
    const fromStock = await tx.stock.findUnique({
      where: {
        productId_branchId: { productId, branchId: fromBranchId },
      },
    });

    if (!fromStock || fromStock.quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    await tx.stock.update({
      where: {
        productId_branchId: { productId, branchId: fromBranchId },
      },
      data: { quantity: { decrement: quantity } },
    });

    await tx.stock.upsert({
      where: {
        productId_branchId: { productId, branchId: toBranchId },
      },
      update: { quantity: { increment: quantity } },
      create: {
        productId,
        branchId: toBranchId,
        quantity,
      },
    });

    await tx.stockMovement.create({
      data: {
        productId,
        fromBranchId,
        toBranchId,
        quantity,
        type: 'TRANSFER',
      },
    });
  });
};
