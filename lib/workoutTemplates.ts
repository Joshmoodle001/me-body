// Workout templates for common training splits
// User selects a template, exercises pre-populated

export interface WorkoutTemplate {
  id: string;
  name: string;
  type: "strength" | "cardio" | "hiit" | "mobility";
  split: string; // e.g. "push", "pull", "legs", "full_body"
  exercises: TemplateExercise[];
  notes?: string;
}

export interface TemplateExercise {
  name: string;
  sets: number;
  repRange: string; // e.g. "8-12", "5-8", "12-15"
  restSec: number;
  notes?: string;
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "push",
    name: "Push Day",
    type: "strength",
    split: "push",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, repRange: "6-10", restSec: 120 },
      { name: "Incline Dumbbell Press", sets: 3, repRange: "8-12", restSec: 90 },
      { name: "Overhead Barbell Press", sets: 3, repRange: "8-12", restSec: 90 },
      { name: "Lateral Raises", sets: 3, repRange: "12-15", restSec: 60 },
      { name: "Tricep Pushdowns", sets: 3, repRange: "10-15", restSec: 60 },
      { name: "Overhead Tricep Extensions", sets: 2, repRange: "12-15", restSec: 60 },
    ],
    notes: "Chest, shoulders, and triceps. Focus on controlled negatives.",
  },
  {
    id: "pull",
    name: "Pull Day",
    type: "strength",
    split: "pull",
    exercises: [
      { name: "Deadlift", sets: 3, repRange: "5-8", restSec: 180 },
      { name: "Pull-ups (or Lat Pulldowns)", sets: 4, repRange: "8-12", restSec: 90 },
      { name: "Barbell Row", sets: 3, repRange: "8-12", restSec: 90 },
      { name: "Seated Cable Row", sets: 3, repRange: "10-15", restSec: 60 },
      { name: "Face Pulls", sets: 3, repRange: "12-15", restSec: 60 },
      { name: "Barbell Curls", sets: 3, repRange: "10-15", restSec: 60 },
    ],
    notes: "Back, biceps, and rear delts. Deadlift first while fresh.",
  },
  {
    id: "legs",
    name: "Leg Day",
    type: "strength",
    split: "legs",
    exercises: [
      { name: "Barbell Back Squat", sets: 4, repRange: "6-10", restSec: 120 },
      { name: "Romanian Deadlift", sets: 3, repRange: "8-12", restSec: 90 },
      { name: "Leg Press", sets: 3, repRange: "10-15", restSec: 90 },
      { name: "Walking Lunges", sets: 3, repRange: "10 per leg", restSec: 60 },
      { name: "Leg Curls", sets: 3, repRange: "12-15", restSec: 60 },
      { name: "Calf Raises", sets: 4, repRange: "15-20", restSec: 45 },
    ],
    notes: "Quads, hamstrings, glutes, and calves. Squat depth over weight.",
  },
  {
    id: "full_body",
    name: "Full Body",
    type: "strength",
    split: "full_body",
    exercises: [
      { name: "Barbell Back Squat", sets: 3, repRange: "8-12", restSec: 120 },
      { name: "Barbell Bench Press", sets: 3, repRange: "8-12", restSec: 90 },
      { name: "Barbell Row", sets: 3, repRange: "8-12", restSec: 90 },
      { name: "Overhead Press", sets: 2, repRange: "10-12", restSec: 90 },
      { name: "Romanian Deadlift", sets: 2, repRange: "10-12", restSec: 90 },
      { name: "Plank", sets: 2, repRange: "45-60 sec", restSec: 30 },
      { name: "Hanging Knee Raises", sets: 2, repRange: "12-15", restSec: 45 },
    ],
    notes: "For 3x/week. Hits all major muscle groups in one session.",
  },
  {
    id: "upper",
    name: "Upper Body",
    type: "strength",
    split: "upper",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, repRange: "6-10", restSec: 120 },
      { name: "Barbell Row", sets: 4, repRange: "6-10", restSec: 120 },
      { name: "Overhead Press", sets: 3, repRange: "8-12", restSec: 90 },
      { name: "Pull-ups (or Lat Pulldowns)", sets: 3, repRange: "8-12", restSec: 90 },
      { name: "Lateral Raises", sets: 3, repRange: "12-15", restSec: 60 },
      { name: "Barbell Curls", sets: 2, repRange: "10-15", restSec: 60 },
      { name: "Tricep Pushdowns", sets: 2, repRange: "10-15", restSec: 60 },
    ],
    notes: "Upper day for upper/lower split. Superset arms to save time.",
  },
  {
    id: "lower",
    name: "Lower Body",
    type: "strength",
    split: "lower",
    exercises: [
      { name: "Barbell Back Squat", sets: 4, repRange: "6-10", restSec: 120 },
      { name: "Romanian Deadlift", sets: 3, repRange: "8-12", restSec: 90 },
      { name: "Leg Press", sets: 3, repRange: "10-15", restSec: 90 },
      { name: "Bulgarian Split Squats", sets: 3, repRange: "8-12 per leg", restSec: 90 },
      { name: "Leg Curls", sets: 3, repRange: "12-15", restSec: 60 },
      { name: "Calf Raises", sets: 4, repRange: "15-20", restSec: 45 },
    ],
    notes: "Lower day for upper/lower split. Focus on progressive overload.",
  },
  {
    id: "hiit_cardio",
    name: "HIIT Cardio",
    type: "hiit",
    split: "cardio",
    exercises: [
      { name: "Jump Rope", sets: 4, repRange: "60 sec", restSec: 30 },
      { name: "Burpees", sets: 4, repRange: "30 sec", restSec: 30 },
      { name: "Mountain Climbers", sets: 4, repRange: "45 sec", restSec: 30 },
      { name: "Kettlebell Swings", sets: 3, repRange: "45 sec", restSec: 30 },
      { name: "Box Jumps", sets: 3, repRange: "30 sec", restSec: 45 },
      { name: "Battle Ropes", sets: 3, repRange: "30 sec", restSec: 30 },
    ],
    notes: "20-25 minute HIIT. 1:1 work/rest ratio. Warm up first.",
  },
  {
    id: "mobility_flow",
    name: "Mobility Flow",
    type: "mobility",
    split: "full_body",
    exercises: [
      { name: "Cat-Cow Stretch", sets: 1, repRange: "10 reps", restSec: 0 },
      { name: "World's Greatest Stretch", sets: 2, repRange: "5 per side", restSec: 15 },
      { name: "Hip 90/90 Switches", sets: 2, repRange: "10 total", restSec: 15 },
      { name: "Downward Dog to Cobra", sets: 2, repRange: "8 reps", restSec: 15 },
      { name: "Deep Squat Hold", sets: 2, repRange: "45 sec", restSec: 30 },
      { name: "Thoracic Spine Rotations", sets: 2, repRange: "8 per side", restSec: 15 },
      { name: "Pigeon Stretch", sets: 1, repRange: "60 sec per side", restSec: 0 },
    ],
    notes: "Active recovery day. Focus on breathing and range of motion.",
  },
];

export function getTemplatesBySplit(split: string): WorkoutTemplate[] {
  return WORKOUT_TEMPLATES.filter((t) => t.split === split);
}

export function getTemplate(id: string): WorkoutTemplate | undefined {
  return WORKOUT_TEMPLATES.find((t) => t.id === id);
}

export function getAllTemplates(): WorkoutTemplate[] {
  return WORKOUT_TEMPLATES;
}
