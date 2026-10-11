# Comeback Coach — SPEC

Calm learning companion for people who lost momentum: "You don't have to catch up. You just have to start again."

## Auth
None. Single demo learner `demo-learner` (name "Sam"), created lazily / by seed.py. No credentials.

## Content
- Hand-written SAMPLE content in `backend/content/sample.py` (`source: "sample"`). 3 goals:
  `python-basics` (pb-1..pb-4), `working-with-data` (db-1, db-2), `small-automations` (au-1, au-2).
- Every Exercise has `standard` + `easier` variants (prompt, starter_code, required_snippets, estimated_minutes), `hint`, `easier_note`.
- `source: "ai"` reserved for future generated content; UI shows `SourceBadge` ("Sample content" vs "AI-generated").

## Data (Mongo)
- `learners`: {id, name, active_goal_id}
- `completions`: {id, learner_id, goal_id, exercise_id, exercise_title, concept, variant: standard|easier, completed_at (UTC)}

## API (all under /api, backend/routers/coach.py)
- GET /goals · PUT /learner/goal {goal_id} (404 unknown)
- GET /dashboard → learner, active goal progress, goals, recent(5), next_exercise (first not-completed in active goal; review = first when all done), days_since_last, total_sessions
- GET /exercises/{id} (404) · POST /exercises/{id}/check {code, variant} → {passed, found, missing, message}
  (check ignores `#` comment lines, treats ' as ")
- POST /completions {exercise_id, variant, code} → 201 Completion; 400 if check doesn't pass
- GET /completions (newest first)

## Frontend routes
`/` landing · `/dashboard` · `/session` (suggested next) and `/session/:exerciseId` · `/history`
Session flow: edit code → "Check my code" → "Complete session" enabled only when check passed for current code.
"Make It Easier" swaps to easier variant (prompt + starter code + snippets), shows calm message; "Switch back to the full version" reverts.

## Seed (`cd /app/backend && python seed.py`, idempotent)
Learner Sam on python-basics; completions seed-1 (pb-1 standard, ~13 days ago), seed-2 (pb-2 easier, ~12 days ago).
