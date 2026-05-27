import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { permissionMiddleware } from '@/middlewares/permission.middleware';
import { createSaleSchema } from '@/validators/sale.schema';
import { createSale, getSales } from '@/modules/sales/sale.service';

export async function GET(req: NextRequest) {
  const auth = authMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  permissionMiddleware(auth.role, 'sales');

  try {
    const branchId = auth.branchId || undefined;
    const sales = await getSales(branchId);
    return NextResponse.json(sales);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = authMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  permissionMiddleware(auth.role, 'sales');

  const body = await req.json();
  console.log('BACK: Received sale creation request:', body);
  const parsed = createSaleSchema.safeParse(body);
  console.log('BACK: Validation result:', parsed);
  //TODO: ver como corregir el branchId null cuando es admin
  // success: false,
  // error: Error [ZodError]: [
  //   {
  //     "expected": "string",
  //     "code": "invalid_type",
  //     "path": [
  //       "branchId"
  //     ],
  //     "message": "Invalid input: expected string, received null"
  //   },
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
