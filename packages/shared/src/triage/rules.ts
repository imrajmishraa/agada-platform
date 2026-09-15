import type {
  CarePathway,
  RiskLevel,
  TriageInput,
  TriageResult,
  TriageRule,
} from './types.js';

// -----------------------------------------------------------------------------
// Thresholds — WHO / IMCI aligned
// -----------------------------------------------------------------------------
const SPO2_HIGH_RISK = 92;       // SpO2 < 92% = hypoxia
const SPO2_MEDIUM_RISK = 94;     // SpO2 92-94% = borderline
const TEMP_HIGH_RISK = 40;       // >= 40°C = hyperpyrexia
const TEMP_MEDIUM_RISK = 39;     // 39-40°C = high fever
const HR_MEDIUM_RISK = 110;      // tachycardia
const RR_ADULT_HIGH = 30;        // respiratory distress (>= 12y)
const RR_CHILD_HIGH = 40;        // respiratory distress (< 5y)
const SYSTOLIC_HIGH_RISK = 180;  // hypertensive crisis
const SYSTOLIC_MEDIUM_LOW = 90;  // hypotension

function rule(
  id: string,
  category: RiskLevel,
  triggered: boolean,
  description: string,
  detail?: string,
): TriageRule {
  return { id, category, description, detail, triggered };
}

function rrThresholdFor(ageYears: number | undefined): number {
  if (ageYears !== undefined && ageYears < 5) return RR_CHILD_HIGH;
  return RR_ADULT_HIGH;
}

export function evaluateRules(input: TriageInput): TriageRule[] {
  const { vitals, symptoms, ageYears } = input;
  const rules: TriageRule[] = [];

  // --- HIGH RISK rules ---
  rules.push(
    rule(
      'spo2-critical',
      'HIGH',
      vitals.spo2 !== undefined && vitals.spo2 < SPO2_HIGH_RISK,
      'Low oxygen saturation',
      vitals.spo2 !== undefined ? `SpO₂ ${vitals.spo2}% (below ${SPO2_HIGH_RISK}%)` : undefined,
    ),
    rule(
      'rr-critical',
      'HIGH',
      vitals.respiratoryRate !== undefined &&
        vitals.respiratoryRate > rrThresholdFor(ageYears),
      'Elevated respiratory rate',
      vitals.respiratoryRate !== undefined
        ? `RR ${vitals.respiratoryRate}/min (above ${rrThresholdFor(ageYears)})`
        : undefined,
    ),
    rule(
      'chest-pain-with-breathing',
      'HIGH',
      !!(symptoms.chestPain && symptoms.breathingDifficulty),
      'Chest pain with breathing difficulty',
      'Combination suggests possible cardiac or severe respiratory event',
    ),
    rule(
      'convulsions',
      'HIGH',
      !!symptoms.convulsions,
      'Reported convulsions',
      'Neurological emergency indicator',
    ),
    rule(
      'temp-hyperpyrexia',
      'HIGH',
      vitals.temperatureC !== undefined && vitals.temperatureC >= TEMP_HIGH_RISK,
      'Very high fever',
      vitals.temperatureC !== undefined ? `Temp ${vitals.temperatureC}°C` : undefined,
    ),
    rule(
      'bp-crisis',
      'HIGH',
      vitals.bpSystolic !== undefined && vitals.bpSystolic >= SYSTOLIC_HIGH_RISK,
      'Hypertensive crisis range',
      vitals.bpSystolic !== undefined ? `Systolic ${vitals.bpSystolic} mmHg` : undefined,
    ),
  );

  // --- MEDIUM RISK rules ---
  rules.push(
    rule(
      'spo2-borderline',
      'MEDIUM',
      vitals.spo2 !== undefined &&
        vitals.spo2 >= SPO2_HIGH_RISK &&
        vitals.spo2 <= SPO2_MEDIUM_RISK,
      'Borderline oxygen saturation',
      vitals.spo2 !== undefined ? `SpO₂ ${vitals.spo2}%` : undefined,
    ),
    rule(
      'fever-high',
      'MEDIUM',
      vitals.temperatureC !== undefined &&
        vitals.temperatureC >= TEMP_MEDIUM_RISK &&
        vitals.temperatureC < TEMP_HIGH_RISK,
      'High fever',
      vitals.temperatureC !== undefined ? `Temp ${vitals.temperatureC}°C` : undefined,
    ),
    rule(
      'tachycardia',
      'MEDIUM',
      vitals.heartRate !== undefined && vitals.heartRate > HR_MEDIUM_RISK,
      'Elevated heart rate',
      vitals.heartRate !== undefined ? `HR ${vitals.heartRate} bpm` : undefined,
    ),
    rule(
      'hypotension',
      'MEDIUM',
      vitals.bpSystolic !== undefined && vitals.bpSystolic < SYSTOLIC_MEDIUM_LOW,
      'Low blood pressure',
      vitals.bpSystolic !== undefined ? `Systolic ${vitals.bpSystolic} mmHg` : undefined,
    ),
    rule(
      'breathing-difficulty',
      'MEDIUM',
      !!symptoms.breathingDifficulty && !symptoms.chestPain,
      'Breathing difficulty',
      undefined,
    ),
    rule(
      'chest-pain',
      'MEDIUM',
      !!symptoms.chestPain && !symptoms.breathingDifficulty,
      'Chest pain reported',
      undefined,
    ),
    rule(
      'vomiting-with-weakness',
      'MEDIUM',
      !!(symptoms.vomiting && symptoms.weakness),
      'Vomiting with weakness',
      'Suggests possible dehydration',
    ),
    rule(
      'diarrhea',
      'MEDIUM',
      !!symptoms.diarrhea,
      'Diarrhea reported',
      'Monitor for dehydration',
    ),
  );

  return rules;
}

// -----------------------------------------------------------------------------
// Recommendation text
// -----------------------------------------------------------------------------
function recommendationFor(level: RiskLevel): string {
  switch (level) {
    case 'HIGH':
      return 'Urgent referral. Patient needs immediate medical attention at PHC or higher facility.';
    case 'MEDIUM':
      return 'Consultation recommended. Send to PHC or arrange teleconsultation within 24 hours.';
    case 'LOW':
      return 'Home care appropriate. Provide symptomatic treatment and schedule follow-up.';
  }
}

function nextStepsFor(level: RiskLevel): string[] {
  switch (level) {
    case 'HIGH':
      return [
        'Create urgent referral to nearest PHC / CHC',
        'Alert the receiving facility',
        'Arrange transport if needed',
        'Instruct family on warning signs to watch for',
        'Follow up within 24 hours',
      ];
    case 'MEDIUM':
      return [
        'Schedule PHC consultation or teleconsult within 24 hours',
        'Provide symptomatic home care in the meantime',
        'Advise on warning signs requiring immediate escalation',
        'Follow up in 48 hours',
      ];
    case 'LOW':
      return [
        'Advise home care and rest',
        'Provide basic symptomatic treatment',
        'Instruct on hydration and nutrition',
        'Schedule follow-up visit in 3 days',
      ];
  }
}

export function carePathwayFor(level: RiskLevel): CarePathway {
  switch (level) {
    case 'HIGH':
      return 'URGENT_REFERRAL';
    case 'MEDIUM':
      return 'PHC';
    case 'LOW':
      return 'HOME_CARE';
  }
}

// -----------------------------------------------------------------------------
// Main engine
// -----------------------------------------------------------------------------
export function assessTriage(input: TriageInput): TriageResult {
  const rules = evaluateRules(input);

  const highTriggered = rules.filter((r) => r.category === 'HIGH' && r.triggered);
  const mediumTriggered = rules.filter((r) => r.category === 'MEDIUM' && r.triggered);

  let riskLevel: RiskLevel;
  if (highTriggered.length > 0) {
    riskLevel = 'HIGH';
  } else if (mediumTriggered.length > 0) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  const reasons = rules.filter((r) => r.triggered);

  return {
    riskLevel,
    carePathway: carePathwayFor(riskLevel),
    recommendation: recommendationFor(riskLevel),
    nextSteps: nextStepsFor(riskLevel),
    reasons:
      reasons.length > 0
        ? reasons
        : [
            rule(
              'no-red-flags',
              'LOW',
              true,
              'No red flags detected',
              'Vitals and symptoms within normal ranges',
            ),
          ],
    generatedAt: new Date().toISOString(),
  };
}
