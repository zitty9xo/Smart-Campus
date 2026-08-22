import { Report } from './types';
import { INITIAL_SEED_REPORTS } from './seedData';

// Global state in module scope (persists across API requests in Node server process)
let reportsStore: Report[] = [...INITIAL_SEED_REPORTS];

export function getAllReports(): Report[] {
  return [...reportsStore];
}

export function getReportById(id: string): Report | undefined {
  return reportsStore.find((r) => r.id === id);
}

export function addReport(newReportData: Omit<Report, 'id' | 'createdAt' | 'status' | 'matchedWith'>): Report {
  const newReport: Report = {
    ...newReportData,
    id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    status: 'open',
    matchedWith: null,
    createdAt: new Date().toISOString(),
  };
  reportsStore.unshift(newReport); // newest first
  return newReport;
}

export function resolveReport(id: string, matchedWithId?: string): Report | null {
  const report = reportsStore.find((r) => r.id === id);
  if (!report) return null;

  report.status = 'matched';
  if (matchedWithId) {
    report.matchedWith = matchedWithId;
    const counterpart = reportsStore.find((r) => r.id === matchedWithId);
    if (counterpart) {
      counterpart.status = 'matched';
      counterpart.matchedWith = id;
    }
  }
  return report;
}

export function resetToSeedData(): Report[] {
  reportsStore = JSON.parse(JSON.stringify(INITIAL_SEED_REPORTS));
  return [...reportsStore];
}
