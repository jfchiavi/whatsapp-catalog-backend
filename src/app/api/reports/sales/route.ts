import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { permissionMiddleware } from '@/middlewares/permission.middleware';
import { getSalesReport } from '@/modules/reports/report.service';
import { handleError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  const auth = authMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  permissionMiddleware(auth.role, 'reports');

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json(
      { message: 'Missing date range' },
      { status: 400 }
    );
  }
  try {
    const report = await getSalesReport(from, to);
    return NextResponse.json(report);
  } catch (error) {
    handleError(error);
  }

}
