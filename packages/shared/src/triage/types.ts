export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type CarePathway = 'HOME_CARE' | 'PHC' | 'TELECONSULT' | 'URGENT_REFERRAL';

export interface VitalSigns {
  temperatureC?: number;
  heartRate?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  spo2?: number;
  respiratoryRate?: number;
}

export interface Symptoms {
  fever?: boolean;
  cough?: boolean;
  breathingDifficulty?: boolean;
  chestPain?: boolean;
  vomiting?: boolean;
  weakness?: boolean;
  convulsions?: boolean;
  diarrhea?: boolean;
}

export interface TriageInput {
  ageYears?: number;
  vitals: VitalSigns;
  symptoms: Symptoms;
}

export interface TriageRule {
  id: string;
  category: RiskLevel;
  description: string;
  detail?: string;
  triggered: boolean;
}

export interface TriageResult {
  riskLevel: RiskLevel;
  carePathway: CarePathway;
  recommendation: string;
  nextSteps: string[];
  reasons: TriageRule[];
  generatedAt: string;
}
