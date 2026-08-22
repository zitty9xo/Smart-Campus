import { NextResponse } from 'next/server';
import { resolveReport } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportId, matchedWithId } = body;

    if (!reportId || typeof reportId !== 'string' || reportId.trim().length === 0) {
      return NextResponse.json({ error: 'Valid reportId string parameter is required' }, { status: 400 });
    }

    const updated = resolveReport(reportId, matchedWithId);
    if (!updated) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error resolving report' }, { status: 500 });
  }
}
