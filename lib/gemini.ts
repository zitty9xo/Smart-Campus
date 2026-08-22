import { GoogleGenerativeAI } from '@google/generative-ai';
import { Report, MatchCandidate, SearchCandidate } from './types';

// Helper to extract base64 data & mime type from data URI
function parseDataUri(dataUri?: string): { mimeType: string; data: string } | null {
  if (!dataUri || !dataUri.startsWith('data:')) return null;
  const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;
  return {
    mimeType: matches[1],
    data: matches[2]
  };
}

/**
 * Fallback local AI matcher when Gemini API Key is not set or API fails
 */
function fallbackMatch(target: Report, candidates: Report[]): MatchCandidate[] {
  const targetText = `${target.title} ${target.description} ${target.category} ${target.location}`.toLowerCase();
  
  const results: MatchCandidate[] = [];

  for (const candidate of candidates) {
    const candidateText = `${candidate.title} ${candidate.description} ${candidate.category} ${candidate.location}`.toLowerCase();
    
    let confidence = 0;
    const reasons: string[] = [];

    // Category match
    if (target.category.toLowerCase() === candidate.category.toLowerCase()) {
      confidence += 30;
      reasons.push(`Both reports are in the ${target.category} category.`);
    }

    // Keyword & Brand matching
    const keywords = ['sony', 'headphone', 'headphones', 'hydro', 'flask', 'wallet', 'apple', 'charger', 'key', 'toyota', 'scratch', 'blue', 'brown', 'black', 'leather', 'library', 'auditorium', 'union', 'gym'];
    
    let sharedKeywords: string[] = [];
    for (const kw of keywords) {
      if (targetText.includes(kw) && candidateText.includes(kw)) {
        sharedKeywords.push(kw);
      }
    }

    if (sharedKeywords.length > 0) {
      confidence += Math.min(sharedKeywords.length * 18, 50);
      reasons.push(`Key terms match: "${sharedKeywords.slice(0, 3).join(', ')}" across both reports.`);
    }

    // Location proximity
    const targetLoc = target.location.toLowerCase();
    const candidateLoc = candidate.location.toLowerCase();
    if (targetLoc.includes('library') && candidateLoc.includes('library')) {
      confidence += 15;
      reasons.push('Locations align around Science Library.');
    } else if (targetLoc.includes('union') && candidateLoc.includes('union')) {
      confidence += 15;
      reasons.push('Both items refer to Student Union area.');
    } else if (targetLoc.includes('engineering') && candidateLoc.includes('engineering')) {
      confidence += 15;
      reasons.push('Location proximity match around Engineering complex.');
    }

    confidence = Math.min(Math.max(confidence, 0), 96);

    if (confidence >= 30) {
      results.push({
        reportId: candidate.id,
        confidence,
        reason: reasons.join(' ') || `Strong semantic correlation found between ${target.type} report and candidate report.`
      });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Fallback local search when Gemini API is unavailable
 */
function fallbackSearch(query: string, reports: Report[]): SearchCandidate[] {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 2);
  
  const results: SearchCandidate[] = [];

  for (const report of reports) {
    const text = `${report.title} ${report.description} ${report.category} ${report.location} ${report.type}`.toLowerCase();
    let score = 0;
    
    if (text.includes(q)) {
      score = 90;
    } else {
      let matchCount = 0;
      for (const w of words) {
        if (text.includes(w)) matchCount++;
      }
      if (words.length > 0) {
        score = Math.round((matchCount / words.length) * 80);
      }
    }

    if (score >= 25) {
      results.push({
        reportId: report.id,
        relevanceScore: score,
        matchReason: `Matches terms "${query}" in item ${report.title} located at ${report.location}.`
      });
    }
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Gemini Multimodal Matcher
 */
export async function matchWithGemini(target: Report, candidates: Report[]): Promise<{ matches: MatchCandidate[]; isAiGenerated: boolean; modelUsed?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('[Gemini Matcher] GEMINI_API_KEY is not set. Executing heuristic fallback matcher.');
    return { matches: fallbackMatch(target, candidates), isAiGenerated: false };
  }

  console.log(`\n================== [GEMINI MATCHER START] ==================`);
  console.log(`[Gemini Matcher] Target: "${target.title}" (ID: ${target.id}, Type: ${target.type})`);
  console.log(`[Gemini Matcher] Candidate count: ${candidates.length}`);
  console.log(`[Gemini Matcher] API Key prefix: ${apiKey.substring(0, 8)}... (Length: ${apiKey.length})`);
  console.log(`[Gemini Matcher] Initializing GoogleGenerativeAI with model cascade (primary: 'gemini-3.6-flash')...`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Model selection prioritizing gemini-3.6-flash per API requirement
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let response: any = null;
    let usedModel = '';

    const contents: any[] = [];

    const promptText = `
You are the Smart Campus Lost & Found Multimodal Reasoning AI Engine.
Analyze the TARGET item report below against all candidate OPPOSITE-TYPE open reports.

TARGET REPORT (${target.type.toUpperCase()}):
- ID: ${target.id}
- Title: ${target.title}
- Category: ${target.category}
- Description: ${target.description}
- Location: ${target.location}
- Time: ${target.time}

OPPOSITE-TYPE CANDIDATES:
${candidates.map((c, i) => `
[Candidate #${i + 1}]
- ID: ${c.id}
- Title: ${c.title}
- Category: ${c.category}
- Description: ${c.description}
- Location: ${c.location}
- Time: ${c.time}
`).join('\n')}

Instructions:
1. Compare visual features (if image present), scratch marks, colors, brand names, location proximity, and timing.
2. Return a STRICT JSON ARRAY of candidate matches with confidence score between 0 and 100 and a 1-sentence plain language explanation reason.
3. Only include candidates with confidence score > 30.
4. Format output strictly as JSON without markdown codeblock syntax:
[
  {
    "reportId": "string",
    "confidence": number,
    "reason": "one sentence explanation"
  }
]
`;

    contents.push(promptText);

    // Attach target photo only if valid supported raster image (PNG, JPEG, WEBP)
    const targetParsed = parseDataUri(target.imageBase64);
    const supportedRasterTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (targetParsed && supportedRasterTypes.includes(targetParsed.mimeType.toLowerCase())) {
      console.log(`[Gemini Matcher] Attaching inline raster image: ${targetParsed.mimeType}`);
      contents.push({
        inlineData: {
          mimeType: targetParsed.mimeType,
          data: targetParsed.data
        }
      });
    }

    let lastError: any = null;
    for (const modelName of candidateModels) {
      try {
        console.log(`[Gemini Matcher] Trying model '${modelName}'...`);
        const model = genAI.getGenerativeModel({ model: modelName }, { timeout: 15000 });
        response = await model.generateContent(contents);
        usedModel = modelName;
        console.log(`[Gemini Matcher] Successfully received response using '${modelName}'!`);
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Matcher] Model '${modelName}' failed: ${err?.message || err}`);
      }
    }

    if (!response) {
      throw lastError || new Error('All candidate Gemini models failed to generate content.');
    }

    const text = response.response.text().trim();
    
    console.log(`\n--- [RAW GEMINI API RESPONSE (${usedModel})] ---`);
    console.log(text);
    console.log(`---------------------------------\n`);

    // Clean potential json wrap
    const jsonStr = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    console.log(`[Gemini Matcher] Parsing JSON from cleaned response...`);
    const rawMatches = JSON.parse(jsonStr);

    const matches: MatchCandidate[] = rawMatches.map((m: any) => ({
      reportId: String(m.reportId),
      confidence: Math.min(Math.max(Number(m.confidence) || 0, 0), 100),
      reason: String(m.reason || 'AI identified matching characteristics.')
    })).filter((m: MatchCandidate) => m.confidence > 30);

    console.log(`[Gemini Matcher] SUCCESS! Parsed ${matches.length} candidates with confidence > 30% using model '${usedModel}'`);
    console.log(`================== [GEMINI MATCHER END] ==================\n`);
    return { matches, isAiGenerated: true, modelUsed: usedModel };
  } catch (error: any) {
    console.error(`\n>>> [GEMINI MATCHER EXCEPTION THROWN] <<<`);
    console.error(`Error message:`, error?.message || error);
    if (error?.status) console.error(`HTTP Status:`, error.status);
    if (error?.errorDetails) console.error(`Error details:`, error.errorDetails);
    console.log(`[Gemini Matcher] Executing heuristic fallback matcher due to API failure...`);
    console.log(`================== [GEMINI MATCHER END] ==================\n`);
    return { matches: fallbackMatch(target, candidates), isAiGenerated: false, modelUsed: 'fallback' };
  }
}

/**
 * Gemini Free-Text Search Engine
 */
export async function searchWithGemini(query: string, reports: Report[]): Promise<{ results: SearchCandidate[]; isAiGenerated: boolean; modelUsed?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('[Gemini Search] GEMINI_API_KEY not set. Using intelligent fallback search.');
    return { results: fallbackSearch(query, reports), isAiGenerated: false };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let response: any = null;
    let usedModel = '';

    const promptText = `
You are the Smart Campus Lost & Found Search AI.
Given the user free-text query "${query}", evaluate all campus reports below and rank the most relevant items.

CAMPUS REPORTS:
${reports.map((r, i) => `
[Item #${i + 1}]
- ID: ${r.id}
- Type: ${r.type}
- Title: ${r.title}
- Category: ${r.category}
- Description: ${r.description}
- Location: ${r.location}
`).join('\n')}

Instructions:
1. Understand query intent (e.g. "blue water bottle near library", "lost headphones").
2. Match items based on semantic meaning, color, item type, and location even if exact words differ.
3. Return STRICT JSON ARRAY of matches sorted by relevance score (0-100):
[
  {
    "reportId": "string",
    "relevanceScore": number,
    "matchReason": "one sentence explanation why this report matches search intent"
  }
]
4. Output JSON only without markdown codeblock syntax.
`;

    let lastError: any = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        response = await model.generateContent(promptText);
        usedModel = modelName;
        break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!response) {
      throw lastError || new Error('All candidate Gemini models failed.');
    }

    const text = response.response.text().trim();
    const jsonStr = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const rawResults = JSON.parse(jsonStr);

    const results: SearchCandidate[] = rawResults.map((r: any) => ({
      reportId: String(r.reportId),
      relevanceScore: Math.min(Math.max(Number(r.relevanceScore) || 0, 0), 100),
      matchReason: String(r.matchReason || 'Matches search query parameters.')
    }));

    return { results, isAiGenerated: true, modelUsed: usedModel };
  } catch (error) {
    console.error('[Gemini Search Error]', error);
    return { results: fallbackSearch(query, reports), isAiGenerated: false, modelUsed: 'fallback' };
  }
}
