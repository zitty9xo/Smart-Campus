import { NextResponse } from 'next/server';
import { getAllReports } from '@/lib/store';
import { searchWithGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Search query string is required' }, { status: 400 });
    }

    const reports = getAllReports();
    const { results, isAiGenerated, modelUsed } = await searchWithGemini(query, reports);

    // Attach full report objects
    const populatedResults = results.map(r => {
      const report = reports.find(rep => rep.id === r.reportId);
      return {
        ...r,
        report
      };
    }).filter(r => r.report !== undefined);

    return NextResponse.json({
      query,
      results: populatedResults,
      isAiGenerated,
      modelUsed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing AI search' }, { status: 500 });
  }
}
