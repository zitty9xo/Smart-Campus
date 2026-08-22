import { NextResponse } from 'next/server';
import { getReportById, getAllReports } from '@/lib/store';
import { matchWithGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'reportId parameter is required' }, { status: 400 });
    }

    const targetReport = getReportById(reportId);
    if (!targetReport) {
      return NextResponse.json({ error: `Report with ID "${reportId}" not found` }, { status: 404 });
    }

    // Get opposite-type open reports
    const oppositeType = targetReport.type === 'lost' ? 'found' : 'lost';
    const allReports = getAllReports();
    const candidates = allReports.filter(r => r.type === oppositeType && r.status === 'open');

    if (candidates.length === 0) {
      return NextResponse.json({
        targetReport,
        matches: [],
        isAiGenerated: false,
        message: `No open ${oppositeType} reports currently available to match against.`
      });
    }

    // Call Gemini AI matcher
    console.log(`[API /api/match] Calling matchWithGemini for target report "${targetReport.title}" (${targetReport.id})`);
    const { matches, isAiGenerated, modelUsed } = await matchWithGemini(targetReport, candidates);

    // Populate full report objects for candidate matches
    const populatedMatches = matches.map(m => {
      const candidateReport = candidates.find(c => c.id === m.reportId);
      return {
        ...m,
        report: candidateReport
      };
    }).filter(m => m.report !== undefined);

    console.log(`[API /api/match] Returning match response: isAiGenerated = ${isAiGenerated}, modelUsed = ${modelUsed}, candidates found = ${populatedMatches.length}`);

    return NextResponse.json({
      targetReport,
      matches: populatedMatches,
      isAiGenerated,
      modelUsed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing AI match' }, { status: 500 });
  }
}
