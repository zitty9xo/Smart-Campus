export type ReportType = 'lost' | 'found';
export type ReportStatus = 'open' | 'matched';

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  category: string;
  description: string;
  location: string;
  time: string;
  imageBase64?: string;
  status: ReportStatus;
  matchedWith?: string | null;
  contactInfo?: string;
  createdAt: string;
}

export interface MatchCandidate {
  reportId: string;
  confidence: number; // 0 to 100
  reason: string;
  report?: Report;
}

export interface MatchResponse {
  targetReportId: string;
  matches: MatchCandidate[];
  isAiGenerated: boolean;
  modelUsed?: string;
}

export interface SearchCandidate {
  reportId: string;
  relevanceScore: number; // 0 to 100
  matchReason: string;
  report?: Report;
}

export interface SearchResponse {
  query: string;
  results: SearchCandidate[];
  isAiGenerated: boolean;
  modelUsed?: string;
}
