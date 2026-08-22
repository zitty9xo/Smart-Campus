import { NextResponse } from 'next/server';
import { getAllReports, addReport } from '@/lib/store';

export async function GET() {
  const reports = getAllReports();
  const lostCount = reports.filter(r => r.type === 'lost' && r.status === 'open').length;
  const foundCount = reports.filter(r => r.type === 'found' && r.status === 'open').length;
  const matchedCount = reports.filter(r => r.status === 'matched').length;

  return NextResponse.json({
    reports,
    stats: {
      total: reports.length,
      lostCount,
      foundCount,
      matchedCount,
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, title, category, description, location, time, imageBase64, contactInfo } = body;

    if (!type || !title || !description || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, description, and location are required.' },
        { status: 400 }
      );
    }

    const newReport = addReport({
      type,
      title,
      category: category || 'Other',
      description,
      location,
      time: time || new Date().toISOString(),
      imageBase64: imageBase64 || undefined,
      contactInfo: contactInfo || undefined,
    });

    return NextResponse.json({ success: true, report: newReport }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create report' }, { status: 500 });
  }
}
