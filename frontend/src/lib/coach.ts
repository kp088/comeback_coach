// Mirrors backend/models/coach.py by hand — keep the two in sync.

export type ContentSource = "sample" | "ai";
export type Variant = "standard" | "easier";

export interface ExerciseVariant {
  prompt: string;
  starter_code: string;
  required_snippets: string[];
  estimated_minutes: number;
}

export interface Exercise {
  id: string;
  goal_id: string;
  order: number;
  title: string;
  concept: string;
  source: ContentSource;
  hint: string;
  easier_note: string;
  standard: ExerciseVariant;
  easier: ExerciseVariant;
}

export interface ExerciseSummary {
  id: string;
  goal_id: string;
  title: string;
  concept: string;
  estimated_minutes: number;
  source: ContentSource;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  source: ContentSource;
  exercise_ids: string[];
}

export interface Learner {
  id: string;
  name: string;
  active_goal_id: string;
}

export interface GoalSelect {
  goal_id: string;
}

export interface CheckRequest {
  code: string;
  variant: Variant;
}

export interface CheckResult {
  passed: boolean;
  found: string[];
  missing: string[];
  message: string;
}

export interface CompletionCreate {
  exercise_id: string;
  variant: Variant;
  code: string;
}

export interface Completion {
  id: string;
  learner_id: string;
  goal_id: string;
  exercise_id: string;
  exercise_title: string;
  concept: string;
  variant: Variant;
  completed_at: string;
}

export interface GoalProgress {
  goal: Goal;
  completed: number;
  total: number;
}

export interface Dashboard {
  learner: Learner;
  active: GoalProgress;
  goals: Goal[];
  recent: Completion[];
  next_exercise: ExerciseSummary | null;
  next_is_review: boolean;
  days_since_last: number | null;
  total_sessions: number;
}

export const qk = {
  dashboard: ["dashboard"] as const,
  completions: ["completions"] as const,
  exercise: (id: string) => ["exercise", id] as const,
};

export const VARIANT_LABEL: Record<Variant, string> = {
  standard: "Full version",
  easier: "Simplified",
};

/** Calm, guilt-free framing of the gap since the last session. */
export function returnMessage(days: number | null): string {
  if (days === null) return "First session? Start with something small. That's the whole plan.";
  if (days === 0) return "You've already practised today. Another session is optional.";
  if (days === 1) return "You were here yesterday. Pick up right where you left off.";
  return `It's been ${days} days. No catch-up needed — today's session is the only one that matters.`;
}
