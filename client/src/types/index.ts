export type CriteriaType = "benefit" | "cost";

export interface Criteria {
  id: number;
  code?: string;
  name: string;
  description?: string;
  type: CriteriaType;
  unit?: string;
  weightRef?: number;
  status?: "active" | "inactive";
  createdAt: string;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  education?: string;
  major?: string;
  expertise?: string;
  photoUrl?: string;
  status: "active" | "inactive";
  createdAt: string;
  completionRate?: number;
}

export interface SubCriteria {
  id: number;
  criteriaId: number;
  name: string;
  weight: number;
  displayOrder: number;
  createdAt: string;
}

export interface Score {
  id: number;
  candidateId: number;
  criteriaId: number;
  value: number;
  subCriteriaId?: number;
  subCriteriaName?: string;
  subCriteriaWeight?: number;
  notes?: string;
}

export interface DecisionMatrix {
  candidates: Candidate[];
  criteria: Criteria[];
  matrix: number[][];
}

export interface NormalizedMatrix {
  matrix: number[][];
  method: ("max" | "min")[];
}

export interface PSICalculationDetail {
  normalizedMatrix: number[][];
  rawMatrix?: number[][];
  meanValues: number[];
  preferenceVariation: number[];
  deviationPreference: number[];
  overallPreference: number[];
  psiScores: number[];
}

export interface PSIResult {
  sessionId: number;
  sessionName: string;
  rankings: {
    rank: number;
    candidate: Candidate;
    psiScore: number;
    isRecommended: boolean;
  }[];
  calculationDetail: PSICalculationDetail;
  calculatedAt: string;
  candidateCount?: number;
}

export interface AppSettings {
  app_name?: string;
  institution?: string;
}

export interface ExportData {
  appSettings: { key: string; value: string }[];
  criteria: Criteria[];
  subCriteria: SubCriteria[];
  candidates: Candidate[];
  scores: Score[];
  psiSessions: PSIResult[];
  psiResults: Record<string, unknown>[];
  psiDetails: Record<string, unknown>[];
  exportedAt: string;
}

export interface DashboardStats {
  totalCandidates: number;
  totalCriteria: number;
  totalSessions: number;
}
