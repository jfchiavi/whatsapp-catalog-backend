import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { permissionMiddleware } from '@/middlewares/permission.middleware';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = authMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  permissionMiddleware(auth.role, 'sales');

  const sale = await prisma.sale.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: { product: true },
      },
      branch: true,
      user: true,
    },
  });

  return NextResponse.json(sale);
}
