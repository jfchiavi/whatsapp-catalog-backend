import { prisma } from '@/lib/prisma';

export const getProducts = async () => {
  return prisma.product.findMany({
    orderBy: { name: 'asc' },
  });
};

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({ where: { id } });
};

export const createProduct = async (data: {
  sku: string;
  name: string;
  price: number;
  cost: number;
}) => {
  return prisma.product.create({ data });
};

export const updateProduct = async (
  id: string,
  data: Partial<{
    name: string;
    price: number;
    cost: number;
    active: boolean;
  }>
) => {
  return prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({ where: { id } });
};
