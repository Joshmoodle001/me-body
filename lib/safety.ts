import type { DBProfile } from "@/db/localDb";

export type SafetySeverity = "info" | "warning" | "danger" | "emergency";
export type SafetyAction = "pause" | "modify" | "refer" | "emergency";

export interface ContraindicationRule {
  id: string;
  condition: string;
  matches: (profile: DBProfile) => boolean;
  riskLevel: SafetySeverity;
  avoid: string[];
  modify: string[];
  referWhen: string[];
  message: string;
  sourceRefs: string[];
}

export interface RedFlagCheck {
  id: string;
  flagType: string;
  condition: string;
  severity: SafetySeverity;
  action: SafetyAction;
  message: string;
  check: (profile: DBProfile) => boolean;
  sourceRefs: string[];
}

const CONTRAINDICATIONS: ContraindicationRule[] = [
  {
    id: "contra.pregnancy-exercise",
    condition: "pregnancy",
    matches: (p) => p.pregnancyStatus === "pregnant",
    riskLevel: "warning",
    avoid: ["high-impact contacts", "fall-risk exercises", "hot exercise conditions"],
    modify: ["lower intensity", "stop if dizzy, short of breath, or in pain"],
    referWhen: ["chest pain", "dizziness", "severe shortness of breath", "vaginal bleeding", "contractions"],
    message: "During pregnancy, gentle movement is encouraged but certain activities need modification. Stop and seek help for any warning signs.",
    sourceRefs: ["acog-pregnancy-exercise", "who-physical-activity-2020"],
  },
  {
    id: "contra.diabetes-hypoglycaemia",
    condition: "diabetes_on_insulin_or_sulfonylurea",
    matches: (p) => p.chronicConditions.includes("diabetes") && p.medications.some((m) => ["insulin", "sulfonylurea", "glipizide", "glyburide", "glimepiride"].includes(m.toLowerCase())),
    riskLevel: "danger",
    avoid: ["unplanned fasting exercise without checking glucose"],
    modify: ["carry rapid carbohydrate", "start with lower-intensity sessions", "align timing with meals and clinical advice"],
    referWhen: ["frequent low blood glucose", "ketones", "confusion", "fainting"],
    message: "Some diabetes medications can cause low blood glucose during exercise. Adjust timing and monitor carefully.",
    sourceRefs: ["nih-diabetes-physical-activity", "ada-exercise-guidelines"],
  },
  {
    id: "contra.hypertension-severe",
    condition: "uncontrolled_hypertension",
    matches: (p) => p.chronicConditions.includes("hypertension"),
    riskLevel: "warning",
    avoid: ["heavy resistance straining", "isometric holds", "extreme hot-weather exertion"],
    modify: ["lower intensity", "avoid breath-holding", "monitor for headache or dizziness"],
    referWhen: ["chest pain", "severe headache", "dizziness", "blurred vision"],
    message: "Exercise helps manage blood pressure, but straining and extreme effort should be avoided if your pressure is uncontrolled.",
    sourceRefs: ["nhlbi-hypertension", "who-cardiovascular-guidance"],
  },
  {
    id: "contra.ckd",
    condition: "chronic_kidney_disease",
    matches: (p) => p.chronicConditions.includes("ckd") || p.chronicConditions.includes("kidney_disease"),
    riskLevel: "warning",
    avoid: ["dehydration risk", "excessive protein intake without clinical guidance"],
    modify: ["low-to-moderate intensity", "increase gradually"],
    referWhen: ["severe fatigue", "swelling changes", "shortness of breath"],
    message: "Regular compatible exercise can help with chronic kidney disease, but intensity and hydration must be managed carefully.",
    sourceRefs: ["niddk-ckd", "ckd-exercise-guidance"],
  },
  {
    id: "contra.psychotropic-meds",
    condition: "weight_affecting_medication",
    matches: (p) => p.medications.some((m) => ["olanzapine", "clozapine", "quetiapine", "risperidone", "lithium", "valproate", "mirtazapine", "paroxetine", "prednisone", "prednisolone", "dexamethasone"].includes(m.toLowerCase())),
    riskLevel: "info",
    avoid: [],
    modify: ["this medicine may change appetite, fluid balance, or weight trend"],
    referWhen: ["rapid unexplained weight change", "new concerning symptoms"],
    message: "Some medicines can change appetite, fluid balance, glucose, or weight trend. That is a body response, not a failure. We will adapt the plan around that.",
    sourceRefs: ["medication-weight-review", "nih-medication-guidance"],
  },
];

const RED_FLAGS: RedFlagCheck[] = [
  {
    id: "redflag.chest-pain",
    flagType: "medical_emergency",
    condition: "chest_pain_during_exercise",
    severity: "emergency",
    action: "emergency",
    message: "Stop exercising immediately. Chest pain, pressure, or discomfort during activity needs urgent medical attention. Call emergency services.",
    check: () => false,
    sourceRefs: ["nhlbi-heart-attack-symptoms", "aha-emergency-guidance"],
  },
  {
    id: "redflag.syncope",
    flagType: "medical_emergency",
    condition: "fainting_during_exercise",
    severity: "emergency",
    action: "emergency",
    message: "Fainting or near-fainting during or after exercise is serious. Stop and get immediate medical help.",
    check: () => false,
    sourceRefs: ["nhlbi-syncope", "aha-emergency-guidance"],
  },
  {
    id: "redflag.severe-hypoglycaemia",
    flagType: "diabetes_emergency",
    condition: "severe_low_blood_glucose",
    severity: "emergency",
    action: "emergency",
    message: "If you have severe low blood glucose with confusion, inability to swallow, or loss of consciousness, this is an emergency. Someone should call for help and give glucagon if prescribed.",
    check: (p) => p.chronicConditions.includes("diabetes"),
    sourceRefs: ["ada-hypoglycaemia", "nih-diabetes-emergency"],
  },
  {
    id: "redflag.pregnancy-warning",
    flagType: "pregnancy_warning",
    condition: "pregnancy_warning_signs",
    severity: "emergency",
    action: "emergency",
    message: "Warning signs in pregnancy: severe headache, vision changes, sudden swelling, chest pain, trouble breathing, decreased fetal movement, vaginal bleeding, contractions, or fluid leaking. Get urgent medical help.",
    check: (p) => p.pregnancyStatus === "pregnant",
    sourceRefs: ["acog-warning-signs", "who-maternal-health"],
  },
  {
    id: "redflag.rapid-weight-loss",
    flagType: "unexplained_change",
    condition: "rapid_unexplained_weight_loss",
    severity: "warning",
    action: "refer",
    message: "Your recent weight change is faster than expected. Rapid unintentional weight loss can have medical causes. Please check with your healthcare provider.",
    check: () => false,
    sourceRefs: ["niddk-weight-management", "nih-unintentional-weight-loss"],
  },
  {
    id: "redflag.severe-hypertension-symptoms",
    flagType: "hypertension_urgency",
    condition: "severe_hypertension_with_symptoms",
    severity: "danger",
    action: "refer",
    message: "If you have a blood pressure reading over 180/120 with headache, chest pain, shortness of breath, or vision changes, seek urgent medical care.",
    check: (p) => p.chronicConditions.includes("hypertension"),
    sourceRefs: ["nhlbi-high-blood-pressure", "aha-hypertensive-urgency"],
  },
];

export function getContraindicationsForProfile(profile: DBProfile): ContraindicationRule[] {
  return CONTRAINDICATIONS.filter((c) => c.matches(profile));
}

export function getActiveRedFlags(profile: DBProfile): RedFlagCheck[] {
  return RED_FLAGS.filter((r) => r.check(profile));
}

export function getEmergencyRedFlag(flagType: string): RedFlagCheck | undefined {
  return RED_FLAGS.find((r) => r.flagType === flagType && r.severity === "emergency");
}

export function getSafetySummary(profile: DBProfile): {
  conditions: string[];
  medications: string[];
  activeWarnings: ContraindicationRule[];
  activeRedFlags: RedFlagCheck[];
  hasEmergencyFlags: boolean;
} {
  const contraindications = getContraindicationsForProfile(profile);
  const redFlags = getActiveRedFlags(profile);
  return {
    conditions: profile.chronicConditions,
    medications: profile.medications,
    activeWarnings: contraindications,
    activeRedFlags: redFlags,
    hasEmergencyFlags: redFlags.some((r) => r.severity === "emergency"),
  };
}

export function getRecommendedModifications(profile: DBProfile): string[] {
  const mods = new Set<string>();
  for (const c of getContraindicationsForProfile(profile)) {
    for (const m of c.modify) mods.add(m);
  }
  return [...mods];
}

export { CONTRAINDICATIONS, RED_FLAGS };
