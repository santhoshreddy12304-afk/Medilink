export interface AssistantRule {
  id: string;
  pattern: RegExp;
  response: string;
  suggestions?: string[];
  sources?: string[];
}

export const mockAssistantRules: AssistantRule[] = [
  {
    id: 'fever',
    pattern: /fever|temperature|pyrexia/i,
    response: 'For a mild fever in adults: stay well-hydrated, rest, and keep room temperatures comfortable. Paracetamol may help manage discomfort according to package guidelines. If fever exceeds 102°F (38.9°C), persists beyond 3 days, or is accompanied by stiff neck or shortness of breath, consult a doctor immediately.',
    suggestions: ['When to see a doctor for fever?', 'Book a General Physician consultation', 'Fever care for children'],
    sources: ['National Health Portal India - Fever Management', 'WHO Clinical Guidelines']
  },
  {
    id: 'diabetes-prep',
    pattern: /blood (sugar|glucose)|diabetes|fasting/i,
    response: 'For Fasting Blood Sugar (FBS) tests: fast for 8–10 hours overnight (water is allowed). Do not consume tea, coffee, or breakfast before sample collection. If taking diabetes medication, clarify with your doctor whether to take it before or after the test.',
    suggestions: ['What is normal fasting blood sugar?', 'Find Diagnostic Labs nearby', 'Book HbA1c consultation'],
    sources: ['ICMR Guidelines for Type 2 Diabetes', 'NABL Lab Standards']
  },
  {
    id: 'bp',
    pattern: /hypertension|blood pressure|bp/i,
    response: 'Normal resting blood pressure is generally around 120/80 mmHg. To maintain healthy BP: reduce sodium intake, engage in 30 minutes of moderate aerobic exercise daily, manage stress, and avoid smoking. If your BP reading is consistently above 140/90, consult a doctor.',
    suggestions: ['Find a Cardiologist', 'Log BP reading', 'DASH diet tips'],
    sources: ['Cardiological Society of India (CSI)', 'WHO Hypertension Guidelines']
  }
];
