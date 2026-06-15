import type { DBContentItem, DBProvenance } from "@/db/localDb";

function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
  return String(Math.abs(h));
}

export function buildProvenanceEntries(): Omit<DBProvenance, "createdAt" | "updatedAt">[] {
  return [
    {
      id: "prov.who-healthy-diet-2023",
      sourceId: "who-healthy-diet-2023",
      citationText: "WHO. Healthy diet. 2023.",
      sourceType: "official_guidance",
      licence: "CC-BY-NC-SA-3.0-IGO",
      url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
      jurisdiction: "international",
      version: "2023",
      retrievedAt: "2026-01-15T00:00:00.000Z",
    },
    {
      id: "prov.who-physical-activity-2020",
      sourceId: "who-physical-activity-2020",
      citationText: "WHO. WHO guidelines on physical activity and sedentary behaviour. 2020.",
      sourceType: "official_guidance",
      licence: "CC-BY-NC-SA-3.0-IGO",
      url: "https://www.who.int/publications/i/item/9789240015128",
      jurisdiction: "international",
      version: "2020",
      retrievedAt: "2026-01-15T00:00:00.000Z",
    },
    {
      id: "prov.niddk-weight-management",
      sourceId: "niddk-weight-management",
      citationText: "NIDDK. Understanding Adult Overweight & Obesity. 2024.",
      sourceType: "official_guidance",
      licence: "public-domain",
      url: "https://www.niddk.nih.gov/health-information/weight-management",
      jurisdiction: "us",
      version: "2024",
      retrievedAt: "2026-01-16T00:00:00.000Z",
    },
    {
      id: "prov.nhlbi-sleep",
      sourceId: "nhlbi-sleep",
      citationText: "NHLBI. How Sleep Works - How Much Sleep Is Enough. 2022.",
      sourceType: "official_guidance",
      licence: "public-domain",
      url: "https://www.nhlbi.nih.gov/health/sleep/how-much-sleep",
      jurisdiction: "us",
      version: "2022",
      retrievedAt: "2026-01-16T00:00:00.000Z",
    },
    {
      id: "prov.acsm-resistance-2026",
      sourceId: "acsm-resistance-2026",
      citationText: "ACSM. Resistance Training for Health — 2026 Update.",
      sourceType: "primary-guidance",
      licence: "copyright-acsm",
      url: "https://www.acsm.org",
      jurisdiction: "international",
      version: "2026",
      retrievedAt: "2026-02-01T00:00:00.000Z",
    },
    {
      id: "prov.safoods-samrc",
      sourceId: "safoods-samrc",
      citationText: "SAMRC. SAFOODS — South African Food Composition Database.",
      sourceType: "official-database",
      licence: "licensed-samrc",
      url: "https://www.samrc.ac.za",
      jurisdiction: "za",
      version: "current",
      retrievedAt: "2026-01-20T00:00:00.000Z",
    },
    {
      id: "prov.off-sa-obesity",
      sourceId: "sa-obesity-strategy",
      citationText: "South Africa National Department of Health. Strategy for the Prevention and Control of Obesity in South Africa 2015–2020.",
      sourceType: "national-strategy",
      licence: "government-public",
      url: "https://www.health.gov.za",
      jurisdiction: "za",
      version: "2015",
      retrievedAt: "2026-01-20T00:00:00.000Z",
    },
    {
      id: "prov.acog-pregnancy",
      sourceId: "acog-pregnancy-exercise",
      citationText: "ACOG. Physical Activity and Exercise During Pregnancy and the Postpartum Period. 2020.",
      sourceType: "official_guidance",
      licence: "copyright-acog",
      url: "https://www.acog.org",
      jurisdiction: "us",
      version: "2020",
      retrievedAt: "2026-01-16T00:00:00.000Z",
    },
  ];
}

export function buildContentItems(): Omit<DBContentItem, "createdAt" | "updatedAt">[] {
  const items: Omit<DBContentItem, "createdAt" | "updatedAt">[] = [];

  const fact = (slug: string, title: string, summary: string, body: string, topicTags: string[], evidenceLevel: string, confidenceScore: number, sourceRefs: string[], audienceTags: string[] = ["adult"]) => {
    items.push({
      id: `fact.${slug}.en-ZA.v1`,
      kind: "fact",
      slug,
      locale: "en-ZA",
      title,
      summary,
      body,
      topicTags,
      audienceTags,
      evidenceLevel,
      confidenceScore,
      sourceRefs,
      reviewStatus: "approved",
      version: 1,
      contentHash: hash(slug + title + body + JSON.stringify(sourceRefs)),
    });
  };

  const mealTemplate = (slug: string, name: string, mealType: string, body: string, goalTags: string[], sourceRefs: string[]) => {
    items.push({
      id: `meal.${slug}.en-ZA.v1`,
      kind: "meal_template",
      slug,
      locale: "en-ZA",
      title: name,
      summary: `${name} — ${mealType}`,
      body,
      topicTags: [mealType, "south-african", ...goalTags],
      audienceTags: ["adult"],
      evidenceLevel: "expert-consensus",
      confidenceScore: 0.84,
      sourceRefs,
      reviewStatus: "approved",
      version: 1,
      contentHash: hash(slug + name + body + JSON.stringify(sourceRefs)),
    });
  };

  const coaching = (slug: string, title: string, body: string, topicTags: string[], sourceRefs: string[]) => {
    items.push({
      id: `coach.${slug}.en-ZA.v1`,
      kind: "coaching_message",
      slug,
      locale: "en-ZA",
      title,
      summary: body.slice(0, 120),
      body,
      topicTags,
      audienceTags: ["adult"],
      evidenceLevel: "official-guidance-plus-primary",
      confidenceScore: 0.88,
      sourceRefs,
      reviewStatus: "approved",
      version: 1,
      contentHash: hash(slug + title + body + JSON.stringify(sourceRefs)),
    });
  };

  fact("sleep-hunger-link", "Short sleep can increase hunger",
    "Sleeping less than 7 hours can affect appetite regulation and make late-night eating more likely.",
    "Sleep restriction studies show increases in late-night energy intake. Short sleep has been linked with lower leptin and higher ghrelin, which may increase appetite. One inpatient study found about 553 extra kcal consumed between 22:00 and 03:59 under sleep restriction.",
    ["sleep", "appetite", "weight-regulation"],
    "official-guidance-plus-primary-support",
    0.92,
    ["nhlbi-sleep", "niddk-weight-management"]
  );

  fact("protein-during-deficit", "Higher protein helps preserve lean mass during energy deficit",
    "During energy deficit, protein intake above the RDA helps preserve lean body mass, especially when paired with exercise.",
    "While the effect size on lean-mass preservation is favourable but often modest, combining higher protein with resistance training gives the best result. Protein targets should be personalised by age, activity, and energy deficit.",
    ["protein", "muscle", "weight-loss"],
    "review-evidence",
    0.86,
    ["niddk-weight-management"]
  );

  fact("upf-overconsumption", "Ultra-processed foods can drive overeating",
    "In controlled trials, adults eating an ultra-processed diet consumed about 500 extra kcal per day compared with a minimally processed diet, despite matched calories and macros.",
    "This finding from an NIH inpatient randomised trial shows that food quality cues and meal structure matter beyond simple calorie counting.",
    ["food-quality", "processed-foods", "energy-balance"],
    "primary-study",
    0.90,
    ["niddk-weight-management"]
  );

  fact("waist-matters", "Waist circumference adds risk information beyond weight",
    "Abdominal fat distribution changes cardiometabolic risk. Waist circumference can add risk information even when BMI alone is incomplete.",
    "NHLBI and WHO materials support using waist circumference alongside body weight. Me Body prioritises trend weight, waist, and function over daily scale noise.",
    ["body-composition", "cardiovascular"],
    "official-guidance",
    0.94,
    ["who-healthy-diet-2023"]
  );

  fact("sodium-potassium-balance", "Balancing sodium and potassium matters for blood pressure",
    "WHO recommends sodium intake below 2 g/day (salt below 5 g/day) and potassium from food of at least 3,510 mg/day to reduce blood pressure and cardiovascular risk.",
    "South Africa uses mandatory fortification of maize meal and wheat flour as part of its public-health approach to micronutrients.",
    ["micronutrients", "cardiovascular", "south-african"],
    "official-guidance",
    0.95,
    ["who-healthy-diet-2023"]
  );

  fact("weight-plateau-adaptive", "Weight plateaus can involve adaptive responses",
    "As calories change, the body responds in ways that offset the deficit over time. Adaptive thermogenesis exists, although magnitude and persistence vary.",
    "This means Me Body should adjust targets from weight trend and adherence data rather than keeping a static calorie prescription forever.",
    ["metabolism", "weight-plateau", "adaptive-response"],
    "review-evidence",
    0.85,
    ["niddk-weight-management"]
  );

  fact("steps-mortality", "More daily steps are linked to lower mortality risk",
    "Evidence shows an inverse dose-response relationship between daily steps and all-cause and cardiovascular mortality, with benefits beginning below the 10,000-step threshold.",
    "Daily step goals should be personalised and progressive rather than fixed to a single universal number.",
    ["physical-activity", "steps", "cardiovascular"],
    "meta-analysis",
    0.91,
    ["who-physical-activity-2020"]
  );

  fact("cycle-individual", "Menstrual cycle response is highly individual",
    "Evidence does not support a universal phase-based training prescription for all women. Symptoms are common and personally meaningful, but individual response matters more than rigid rules.",
    "Me Body is cycle-aware but not cycle-deterministic: it tracks symptoms, allows flexible targets, and explains that individual response is key.",
    ["menstrual-cycle", "training", "female-physiology"],
    "review-evidence",
    0.82,
    ["acsm-resistance-2026"]
  );

  fact("ageing-muscle-function", "Older adults benefit from resistance training and protein",
    "After age 60, lean mass tends to decrease and fat mass increases. Resistance training plus adequate protein supports strength and function more reliably than muscle mass alone.",
    "WHO defines healthy ageing in terms of maintaining functional ability. Older adults should combine aerobic, strengthening, and balance activities.",
    ["ageing", "sarcopenia", "protein", "resistance-training"],
    "official-guidance-plus-review",
    0.88,
    ["who-physical-activity-2020", "acsm-resistance-2026"]
  );

  coaching("sleep-first-nudge",
    "Sleep-first nudge",
    "Short sleep can make hunger louder and late-night eating easier. Tonight's win is not perfection — it is protecting your sleep window.",
    ["sleep", "recovery", "weight-regulation"],
    ["nhlbi-sleep", "niddk-weight-management"]
  );

  coaching("protein-anchor-nudge",
    "Protein anchor nudge",
    "Aim for a protein anchor at the next meal. During fat loss, that helps support lean mass and keeps the meal more satisfying.",
    ["protein", "satiety", "meal-structure"],
    ["niddk-weight-management"]
  );

  coaching("plateau-context-check",
    "Plateau context check",
    "Your trend is flatter this week. Before changing calories, let's check sleep, stress, sodium, hydration, and activity consistency. Bodies do not lose weight in a straight line.",
    ["plateau", "weight-trend", "adaptive"],
    ["niddk-weight-management"]
  );

  coaching("stress-compassion",
    "Stress-compassion nudge",
    "Stress can increase hunger and reduce follow-through. Choose the smallest useful action now: water, one balanced meal, or a 10-minute walk.",
    ["stress", "self-compassion", "behaviour-change"],
    ["who-healthy-diet-2023"]
  );

  coaching("sodium-potassium-nudge",
    "Sodium-potassium nudge",
    "Today looks high in salty packaged foods. Add a potassium-rich food at the next meal — beans, spinach, potatoes, bananas, or morogo (wild spinach).",
    ["sodium", "potassium", "south-african", "micronutrients"],
    ["who-healthy-diet-2023", "safoods-samrc"]
  );

  coaching("cycle-aware-nudge",
    "Cycle-aware nudge",
    "If symptoms are up today, the goal can shift from pushing harder to staying consistent with a lighter option.",
    ["menstrual-cycle", "flexibility", "training"],
    ["acsm-resistance-2026"]
  );

  coaching("medication-aware",
    "Medication-aware coaching",
    "Some medicines can change appetite, fluid balance, glucose, or weight trend. That is a body response, not a failure. We will adapt the plan around that.",
    ["medications", "weight-regulation", "health-conditions"],
    ["niddk-weight-management"]
  );

  coaching("hydration-nudge",
    "Hydration nudge",
    "Hydration supports energy, digestion, and recovery. Aim to drink water consistently through the day, especially in hot South African weather or after exercise.",
    ["hydration", "recovery", "south-african"],
    ["who-healthy-diet-2023"]
  );

  coaching("missed-log-compassion",
    "No problem — quick estimate",
    "No problem — want a quick estimate? Your next log matters more than yesterday's gap.",
    ["self-monitoring", "behaviour-change", "compassion"],
    ["niddk-weight-management"]
  );

  mealTemplate("balanced-pap-bowl", "Balanced pap bowl", "dinner",
    JSON.stringify({
      structure: { protein: ["chicken", "lean mince", "beans", "pilchards"], starch: ["pap", "rice", "samp"], vegetables: ["chakalaka", "spinach", "cabbage", "mixed veg"], fat: ["small oil portion", "avocado"] },
      portion: { protein_anchor: "1 palm-sized portion", starch_default: "1 cupped hand", veg_default: "2 fists" },
      notes: "Familiar South African dinner base. Budget-friendly and can be rotated with different proteins and vegetables.",
    }),
    ["weight-loss", "maintenance", "family-meal"],
    ["safoods-samrc", "sa-obesity-strategy"]
  );

  mealTemplate("high-protein-breakfast", "High-protein breakfast", "breakfast",
    JSON.stringify({
      structure: { protein: ["eggs", "maas/amasi", "yoghurt"], carbs: ["oats", "wholegrain toast", "fruit"], fat: ["small nut portion", "avocado"] },
      portion: { protein_anchor: "2 eggs or 1 cup yoghurt/maas", carb: "1 slice toast or 1/2 cup oats", fruit: "1 piece" },
      notes: "Supports satiety and lean-mass retention. Quick to prepare for busy mornings.",
    }),
    ["muscle-gain", "maintenance", "fat-loss"],
    ["niddk-weight-management", "acsm-resistance-2026"]
  );

  mealTemplate("budget-diabetes-lunch", "Budget diabetes-aware lunch", "lunch",
    JSON.stringify({
      structure: { protein: ["beans", "lentils", "pilchards", "egg"], starch: ["brown bread or small starch portion"], vegetables: ["non-starchy vegetables"] },
      portion: { protein: "1/2 cup beans/lentils or 1 pilchard tin", starch: "1 slice or 1/2 cup", veg: "2 fists" },
      notes: "Cost-sensitive, high-fibre pattern that supports glucose stability. Uses shelf-stable ingredients.",
    }),
    ["maintenance", "fat-loss", "diabetes-aware"],
    ["sa-obesity-strategy", "safoods-samrc"]
  );

  mealTemplate("vegetarian-samp-supper", "Vegetarian samp and beans supper", "dinner",
    JSON.stringify({
      structure: { base: ["samp and beans", "lentil stew"], vegetables: ["carrots", "spinach", "tomato"], fat: ["small oil"] },
      portion: { base: "1 to 1.5 cups", veg: "2 fists" },
      notes: "A fibre-rich, protein-complementing South African household staple. Can be cooked in bulk.",
    }),
    ["maintenance", "family-meal", "vegetarian"],
    ["safoods-samrc", "sa-obesity-strategy"]
  );

  mealTemplate("training-breakfast", "Training day breakfast", "breakfast",
    JSON.stringify({
      structure: { protein: ["eggs", "chicken breast", "maas/amasi"], carbs: ["oats", "rice", "wholegrain bread"], fat: ["small nut butter", "avocado"] },
      portion: { protein: "30-35g protein anchor", carbs: "1 cupped hand", fat: "thumb-sized" },
      notes: "Higher carb breakfast for training days. Supports morning workouts and glycogen stores.",
    }),
    ["training", "muscle-gain", "performance"],
    ["niddk-weight-management", "acsm-resistance-2026"]
  );

  mealTemplate("training-lunch", "Training day lunch", "lunch",
    JSON.stringify({
      structure: { protein: ["chicken breast", "lean beef", "fish", "beans"], carbs: ["rice", "pasta", "potatoes", "pap"], vegetables: ["mixed veg", "salad", "chakalaka"] },
      portion: { protein: "1.5 palm-sized", carbs: "1.5 cupped hands", veg: "2 fists" },
      notes: "Main training day meal. Higher carbs to support afternoon/evening training sessions.",
    }),
    ["training", "muscle-gain", "performance"],
    ["niddk-weight-management", "acsm-resistance-2026"]
  );

  mealTemplate("training-dinner", "Training day dinner", "dinner",
    JSON.stringify({
      structure: { protein: ["chicken", "fish", "lean mince", "eggs"], carbs: ["rice", "pap", "sweet potato"], vegetables: ["spinach", "broccoli", "mixed veg"] },
      portion: { protein: "1.5 palm-sized", carbs: "1 cupped hand", veg: "2 fists" },
      notes: "Recovery-focused dinner. Protein and moderate carbs to support overnight repair.",
    }),
    ["training", "muscle-gain", "fat-loss"],
    ["niddk-weight-management", "acsm-resistance-2026"]
  );

  mealTemplate("rest-breakfast", "Rest day breakfast", "breakfast",
    JSON.stringify({
      structure: { protein: ["eggs", "maas/amasi", "protein shake"], carbs: ["fruit", "small oats portion"], fat: ["avocado", "nuts"] },
      portion: { protein: "30-35g protein anchor", carbs: "half cupped hand", fat: "thumb-sized" },
      notes: "Lower carb, higher fat breakfast for rest days. Keeps insulin steady while maintaining protein.",
    }),
    ["rest", "fat-loss", "maintenance"],
    ["niddk-weight-management"]
  );

  mealTemplate("rest-lunch", "Rest day lunch", "lunch",
    JSON.stringify({
      structure: { protein: ["chicken", "tuna", "eggs", "lentils"], vegetables: ["large salad", "roasted veg", "spinach"], fat: ["olive oil", "avocado"] },
      portion: { protein: "1.5 palm-sized", veg: "3 fists", fat: "thumb-sized" },
      notes: "Protein-forward rest day lunch. More vegetables, less starch. Keeps calories lower naturally.",
    }),
    ["rest", "fat-loss", "maintenance"],
    ["niddk-weight-management"]
  );

  mealTemplate("rest-dinner", "Rest day dinner", "dinner",
    JSON.stringify({
      structure: { protein: ["chicken", "fish", "lean mince", "beans"], vegetables: ["spinach", "cabbage", "mixed veg", "morogo"], fat: ["oil", "avocado"] },
      portion: { protein: "1.5 palm-sized", veg: "3 fists", fat: "thumb-sized", carbs: "optional half cupped hand" },
      notes: "Rest day dinner with optional carb. Focus on protein and vegetables. Add small carb portion if hungry.",
    }),
    ["rest", "fat-loss", "maintenance"],
    ["safoods-samrc", "niddk-weight-management"]
  );

  return items;
}
