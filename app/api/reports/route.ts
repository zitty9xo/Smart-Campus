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

    // Required fields check
    if (!type || !title || !description || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, description, and location are required.' },
        { status: 400 }
      );
    }

    // Type validation
    if (type !== 'lost' && type !== 'found') {
      return NextResponse.json(
        { error: 'Invalid report type. Must be either "lost" or "found".' },
        { status: 400 }
      );
    }

    // Payload size / length validation
    if (typeof title !== 'string' || title.trim().length === 0 || title.length > 150) {
      return NextResponse.json({ error: 'Title must be between 1 and 150 characters.' }, { status: 400 });
    }

    if (typeof description !== 'string' || description.trim().length === 0 || description.length > 2000) {
      return NextResponse.json({ error: 'Description must be between 1 and 2000 characters.' }, { status: 400 });
    }

    if (typeof location !== 'string' || location.trim().length === 0 || location.length > 200) {
      return NextResponse.json({ error: 'Location must be between 1 and 200 characters.' }, { status: 400 });
    }

    // Image payload validation (Max ~5MB base64)
    if (imageBase64) {
      if (typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image/')) {
        return NextResponse.json({ error: 'Invalid image format. Must be a valid image data URI.' }, { status: 400 });
      }
      if (imageBase64.length > 7 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image size exceeds maximum limit of 5MB.' }, { status: 400 });
      }
    }

    const newReport = addReport({
      type,
      title: title.trim(),
      category: typeof category === 'string' ? category.trim() : 'Other',
      description: description.trim(),
      location: location.trim(),
      time: time && typeof time === 'string' ? time : new Date().toISOString(),
      imageBase64: imageBase64 || undefined,
      contactInfo: typeof contactInfo === 'string' ? contactInfo.trim().slice(0, 200) : undefined,
    });

    return NextResponse.json({ success: true, report: newReport }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create report' }, { status: 500 });
  }
}
