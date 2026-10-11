"""Comeback Coach API — single demo learner, no auth. Mounted under /api by server.py."""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from content.sample import DEFAULT_GOAL_ID, GOALS, get_exercise, get_goal
from lib.db import db
from models.coach import (
    CheckRequest,
    CheckResult,
    Completion,
    CompletionCreate,
    Dashboard,
    Exercise,
    ExerciseSummary,
    Goal,
    GoalProgress,
    GoalSelect,
    Learner,
)

router = APIRouter()

DEMO_LEARNER_ID = "demo-learner"


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _to_completion(doc: dict) -> Completion:
    doc["completed_at"] = _aware(doc["completed_at"])
    return Completion(**doc)


async def _get_learner() -> Learner:
    doc = await db.learners.find_one({"id": DEMO_LEARNER_ID}, {"_id": 0})
    if not doc:
        learner = Learner(id=DEMO_LEARNER_ID, name="Sam", active_goal_id=DEFAULT_GOAL_ID)
        await db.learners.update_one(
            {"id": DEMO_LEARNER_ID}, {"$setOnInsert": learner.model_dump()}, upsert=True
        )
        return learner
    return Learner(**doc)


def _normalise(code: str) -> str:
    """Drop comment lines and treat single quotes as double so checks are forgiving."""
    lines = [ln for ln in code.splitlines() if not ln.strip().startswith("#")]
    return "\n".join(lines).replace("'", '"')


def _summary(ex: Exercise) -> ExerciseSummary:
    return ExerciseSummary(
        id=ex.id, goal_id=ex.goal_id, title=ex.title, concept=ex.concept,
        estimated_minutes=ex.standard.estimated_minutes, source=ex.source,
    )


@router.get("/goals", response_model=list[Goal])
async def list_goals():
    return GOALS


@router.put("/learner/goal", response_model=Learner)
async def select_goal(body: GoalSelect):
    if not get_goal(body.goal_id):
        raise HTTPException(status_code=404, detail="Goal not found")
    await _get_learner()
    await db.learners.update_one({"id": DEMO_LEARNER_ID}, {"$set": {"active_goal_id": body.goal_id}})
    return await _get_learner()


@router.get("/dashboard", response_model=Dashboard)
async def dashboard():
    learner = await _get_learner()
    goal = get_goal(learner.active_goal_id) or get_goal(DEFAULT_GOAL_ID)
    assert goal is not None

    done_ids = set(
        await db.completions.distinct("exercise_id", {"learner_id": DEMO_LEARNER_ID, "goal_id": goal.id})
    )
    pending = [eid for eid in goal.exercise_ids if eid not in done_ids]
    next_id = pending[0] if pending else goal.exercise_ids[0]
    next_ex = get_exercise(next_id)

    recent_docs = (
        await db.completions.find({"learner_id": DEMO_LEARNER_ID}, {"_id": 0})
        .sort("completed_at", -1)
        .to_list(5)
    )
    recent = [_to_completion(d) for d in recent_docs]
    total = await db.completions.count_documents({"learner_id": DEMO_LEARNER_ID})

    days_since_last = None
    if recent:
        days_since_last = (datetime.now(timezone.utc).date() - recent[0].completed_at.date()).days

    return Dashboard(
        learner=learner,
        active=GoalProgress(goal=goal, completed=len(done_ids & set(goal.exercise_ids)), total=len(goal.exercise_ids)),
        goals=GOALS,
        recent=recent,
        next_exercise=_summary(next_ex) if next_ex else None,
        next_is_review=not pending,
        days_since_last=days_since_last,
        total_sessions=total,
    )


@router.get("/exercises/{exercise_id}", response_model=Exercise)
async def read_exercise(exercise_id: str):
    ex = get_exercise(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return ex


@router.post("/exercises/{exercise_id}/check", response_model=CheckResult)
async def check_exercise(exercise_id: str, body: CheckRequest):
    ex = get_exercise(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    code = _normalise(body.code)
    snippets = getattr(ex, body.variant).required_snippets
    found = [s for s in snippets if s in code]
    missing = [s for s in snippets if s not in code]
    if not missing:
        message = "All the key pieces are there. Mark it complete when you're ready."
    elif found:
        message = "Partway there. A couple of pieces are still missing."
    else:
        message = "Nothing to match yet. Start with one line — the hint can help."
    return CheckResult(passed=not missing, found=found, missing=missing, message=message)


@router.post("/completions", response_model=Completion, status_code=201)
async def complete_exercise(body: CompletionCreate):
    ex = get_exercise(body.exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    code = _normalise(body.code)
    if any(s not in code for s in getattr(ex, body.variant).required_snippets):
        raise HTTPException(status_code=400, detail="The check hasn't passed yet")
    completion = Completion(
        learner_id=DEMO_LEARNER_ID, goal_id=ex.goal_id, exercise_id=ex.id,
        exercise_title=ex.title, concept=ex.concept, variant=body.variant,
    )
    await db.completions.insert_one(completion.model_dump())
    return completion


@router.get("/completions", response_model=list[Completion])
async def list_completions():
    docs = (
        await db.completions.find({"learner_id": DEMO_LEARNER_ID}, {"_id": 0})
        .sort("completed_at", -1)
        .to_list(500)
    )
    return [_to_completion(d) for d in docs]
