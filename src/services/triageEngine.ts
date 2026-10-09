import triageRulesConfig from '../config/triageRules.json';

export interface TriageEvaluationInput {
  gcs?: number;
  isUnresponsive?: boolean;
  hasSevereBleeding?: boolean;
  hasChestPainWithSweating?: boolean;
  strokeFaceDroop?: boolean;
  strokeArmWeakness?: boolean;
  strokeSpeechDifficulty?: boolean;
  isMajorTrauma?: boolean;
  spo2?: number;
  mechanism?: string;
  injuries?: string;
}

export interface TriageEvaluationResult {
  category: 'RED' | 'YELLOW';
  triggeredRedFlags: string[];
  notice: string;
}

/**
 * Deterministic Triage Engine.
 * Evaluates patient handover fields against static config rules.
 * NOT AI based. Category is strictly RED or YELLOW.
 */
export function evaluateTriage(input: TriageEvaluationInput): TriageEvaluationResult {
  const triggered: string[] = [];

  // 1. Unresponsive / GCS < 13
  if (input.isUnresponsive || (input.gcs !== undefined && input.gcs > 0 && input.gcs < 13)) {
    triggered.push('Unresponsive or Low GCS (< 13)');
  }

  // 2. Severe Bleeding
  if (input.hasSevereBleeding || (input.injuries && /severe bleeding|uncontrolled bleeding|arterial bleeding|massive hemorrhage/i.test(input.injuries))) {
    triggered.push('Severe / Uncontrolled Bleeding');
  }

  // 3. Chest Pain + Sweating
  if (input.hasChestPainWithSweating || (input.mechanism && /chest pain.*sweat/i.test(input.mechanism))) {
    triggered.push('Chest Pain with Sweating / Diaphoresis');
  }

  // 4. FAST Stroke Signs
  if (input.strokeFaceDroop) {
    triggered.push('Stroke Sign: Facial Droop');
  }
  if (input.strokeArmWeakness) {
    triggered.push('Stroke Sign: Arm / Leg Weakness');
  }
  if (input.strokeSpeechDifficulty) {
    triggered.push('Stroke Sign: Speech Difficulty');
  }

  // 5. Major Trauma
  if (input.isMajorTrauma || (input.mechanism && /high[- ]speed|fall from height|height fall|penetrating|crush|major trauma/i.test(input.mechanism))) {
    triggered.push('Major Trauma Mechanism');
  }

  // 6. Oxygen Saturation < 90%
  if (input.spo2 !== undefined && input.spo2 > 0 && input.spo2 < 90) {
    triggered.push('Severe Respiratory Distress (SpO2 < 90%)');
  }

  const category = triggered.length > 0 ? 'RED' : 'YELLOW';

  return {
    category,
    triggeredRedFlags: triggered,
    notice: triageRulesConfig.notice,
  };
}
