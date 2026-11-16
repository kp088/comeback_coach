// Showcase mode: the whole Comeback Coach API, running in the browser.
// Mirrors backend/routers/coach.py route for route; data lives in localStorage, so each
// visitor gets their own private copy and nothing is sent to a server.
import type {
  CheckRequest,
  CheckResult,
  Completion,
  CompletionCreate,
  Dashboard,
  Exercise,
  ExerciseSummary,
  GoalSelect,
  Learner,
  Variant,
} from "./coach";
import { DEFAULT_GOAL_ID, EXERCISES, GOALS } from "./demoContent";

const STORE_KEY = "comeback-coach-demo-v1";
const LEARNER_ID = "demo-learner";
const DAY_MS = 24 * 60 * 60 * 1000;

interface Store {
  learner: Learner;
  completions: Completion[];
}

export class DemoHttpError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.body = { detail };
  }
}

const getGoal = (id: string) => GOALS.find((g) => g.id === id);
const getExercise = (id: string) => EXERCISES.find((e) => e.id === id);

// Same starting state as backend/seed.py: two sessions from about 12 days ago, so the
// dashboard opens in its "coming back" state.
function seed(): Store {
  const base = Date.now() - 12 * DAY_MS;
  const mk = (
    id: string, exercise_id: string, exercise_title: string, concept: string, variant: Variant, when: number,
  ): Completion => ({
    id, learner_id: LEARNER_ID, goal_id: "python-basics", exercise_id, exercise_title, concept, variant,
    completed_at: new Date(when).toISOString(),
  });
  return {
    learner: { id: LEARNER_ID, name: "Sam", active_goal_id: DEFAULT_GOAL_ID },
    completions: [
      mk("seed-1", "pb-1", "Say it out loud", "Variables & print", "standard", base - DAY_MS),
      mk("seed-2", "pb-2", "Small list, real count", "Lists & len()", "easier", base),
    ],
  };
}

// In-memory fallback keeps the demo working where localStorage is blocked (private modes).
let memory: Store | null = null;

function load(): Store {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Store;
      if (parsed?.learner && Array.isArray(parsed.completions)) return (memory = parsed);
    }
  } catch {
    // unreadable or blocked storage: fall through to a fresh seed
  }
  memory = seed();
  save(memory);
  return memory;
}

function save(store: Store): void {
  memory = store;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // storage blocked or full: progress lasts until the tab closes
  }
}

/** Wipe showcase progress back to the seeded starting state. */
export function resetDemo(): void {
  save(seed());
}

function normalise(code: string): string {
  return code
    .split(/\r?\n/)
    .filter((ln) => !ln.trim().startsWith("#"))
    .join("\n")
    .replaceAll("'", '"');
}

const newestFirst = (list: Completion[]) =>
  [...list].sort((a, b) => b.completed_at.localeCompare(a.completed_at));

const utcDay = (iso: string | number) => Math.floor(new Date(iso).getTime() / DAY_MS);

function summary(ex: Exercise): ExerciseSummary {
  return {
    id: ex.id, goal_id: ex.goal_id, title: ex.title, concept: ex.concept,
    estimated_minutes: ex.standard.estimated_minutes, source: ex.source,
  };
}

function dashboard(): Dashboard {
  const { learner, completions } = load();
  const goal = getGoal(learner.active_goal_id) ?? getGoal(DEFAULT_GOAL_ID)!;
  const done = new Set(completions.filter((c) => c.goal_id === goal.id).map((c) => c.exercise_id));
  const pending = goal.exercise_ids.filter((id) => !done.has(id));
  const nextEx = getExercise(pending[0] ?? goal.exercise_ids[0]);
  const sorted = newestFirst(completions);
  return {
    learner,
    active: { goal, completed: goal.exercise_ids.filter((id) => done.has(id)).length, total: goal.exercise_ids.length },
    goals: GOALS,
    recent: sorted.slice(0, 5),
    next_exercise: nextEx ? summary(nextEx) : null,
    next_is_review: pending.length === 0,
    days_since_last: sorted.length ? utcDay(Date.now()) - utcDay(sorted[0].completed_at) : null,
    total_sessions: completions.length,
  };
}

function requireExercise(id: string): Exercise {
  const ex = getExercise(id);
  if (!ex) throw new DemoHttpError(404, "Exercise not found");
  return ex;
}

function check(exerciseId: string, body: CheckRequest): CheckResult {
  const ex = requireExercise(exerciseId);
  const code = normalise(body.code);
  const snippets = ex[body.variant].required_snippets;
  const found = snippets.filter((s) => code.includes(s));
  const missing = snippets.filter((s) => !code.includes(s));
  const message = !missing.length
    ? "All the key pieces are there. Mark it complete when you're ready."
    : found.length
      ? "Partway there. A couple of pieces are still missing."
      : "Nothing to match yet. Start with one line — the hint can help.";
  return { passed: !missing.length, found, missing, message };
}

function complete(body: CompletionCreate): Completion {
  const ex = requireExercise(body.exercise_id);
  const code = normalise(body.code);
  if (ex[body.variant].required_snippets.some((s) => !code.includes(s))) {
    throw new DemoHttpError(400, "The check hasn't passed yet");
  }
  const completion: Completion = {
    id: globalThis.crypto?.randomUUID?.() ?? `c-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    learner_id: LEARNER_ID, goal_id: ex.goal_id, exercise_id: ex.id, exercise_title: ex.title,
    concept: ex.concept, variant: body.variant, completed_at: new Date().toISOString(),
  };
  const store = load();
  save({ ...store, completions: [...store.completions, completion] });
  return completion;
}

function selectGoal(body: GoalSelect): Learner {
  if (!getGoal(body.goal_id)) throw new DemoHttpError(404, "Goal not found");
  const store = load();
  const learner = { ...store.learner, active_goal_id: body.goal_id };
  save({ ...store, learner });
  return learner;
}

/** Answer one API call locally. `path` is what the pages pass to apiGet/apiPost, e.g. "/dashboard". */
export async function demoRequest(method: string, path: string, body?: unknown): Promise<unknown> {
  const route = `${method} ${path.split("?")[0]}`;
  let m: RegExpMatchArray | null;
  if (route === "GET /goals") return GOALS;
  if (route === "GET /dashboard") return dashboard();
  if (route === "PUT /learner/goal") return selectGoal(body as GoalSelect);
  if (route === "GET /completions") return newestFirst(load().completions);
  if (route === "POST /completions") return complete(body as CompletionCreate);
  if (route === "GET /health") return { status: "ok" };
  if ((m = route.match(/^POST \/exercises\/([^/]+)\/check$/))) return check(decodeURIComponent(m[1]), body as CheckRequest);
  if ((m = route.match(/^GET \/exercises\/([^/]+)$/))) return requireExercise(decodeURIComponent(m[1]));
  throw new DemoHttpError(404, "Not Found");
}
