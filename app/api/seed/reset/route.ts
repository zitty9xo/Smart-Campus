import { NextResponse } from 'next/server';
import { resetToSeedData } from '@/lib/store';

export async function POST() {
  const reports = resetToSeedData();
  const lostCount = reports.filter(r => r.type === 'lost' && r.status === 'open').length;
  const foundCount = reports.filter(r => r.type === 'found' && r.status === 'open').length;
  const matchedCount = reports.filter(r => r.status === 'matched').length;

  return NextResponse.json({
    success: true,
    reports,
    stats: {
      total: reports.length,
      lostCount,
      foundCount,
      matchedCount,
    }
  });
}
