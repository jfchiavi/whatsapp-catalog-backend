import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { permissionMiddleware } from '@/middlewares/permission.middleware';
import { createSaleSchema } from '@/validators/sale.schema';
import { createSale } from '@/modules/sales/sale.service';

export async function POST(req: NextRequest) {
  const auth = authMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  permissionMiddleware(auth.role, 'sales');

  const body = await req.json();
  const parsed = createSaleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  try {
    const sale = await createSale(
      auth.userId,
      parsed.data.branchId,
      parsed.data.items
    );
    return NextResponse.json(sale, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
