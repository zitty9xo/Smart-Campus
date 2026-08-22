import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const aiEnabled = !!apiKey && apiKey.trim().length > 0;
  return NextResponse.json({
    aiEnabled,
    defaultModel: 'gemini-3.6-flash'
  });
}
