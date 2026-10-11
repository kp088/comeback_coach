"""Pydantic models for Comeback Coach. Mirror: frontend/src/lib/coach.ts — keep in sync."""

import uuid
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field

# "sample" = hand-written content shipped in backend/content/; "ai" = reserved for generated content.
ContentSource = Literal["sample", "ai"]
Variant = Literal["standard", "easier"]


class ExerciseVariant(BaseModel):
    prompt: str
    starter_code: str
    required_snippets: list[str]
    estimated_minutes: int


class Exercise(BaseModel):
    id: str
    goal_id: str
    order: int
    title: str
    concept: str
    source: ContentSource = "sample"
    hint: str
    easier_note: str  # what changed in the simpler version
    standard: ExerciseVariant
    easier: ExerciseVariant


class ExerciseSummary(BaseModel):
    id: str
    goal_id: str
    title: str
    concept: str
    estimated_minutes: int
    source: ContentSource


class Goal(BaseModel):
    id: str
    title: str
    description: str
    source: ContentSource = "sample"
    exercise_ids: list[str]


class Learner(BaseModel):
    id: str
    name: str
    active_goal_id: str


class GoalSelect(BaseModel):
    goal_id: str


class CheckRequest(BaseModel):
    code: str
    variant: Variant


class CheckResult(BaseModel):
    passed: bool
    found: list[str]
    missing: list[str]
    message: str


class CompletionCreate(BaseModel):
    exercise_id: str
    variant: Variant
    code: str


class Completion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    learner_id: str
    goal_id: str
    exercise_id: str
    exercise_title: str
    concept: str
    variant: Variant
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GoalProgress(BaseModel):
    goal: Goal
    completed: int
    total: int


class Dashboard(BaseModel):
    learner: Learner
    active: GoalProgress
    goals: list[Goal]
    recent: list[Completion]
    next_exercise: ExerciseSummary | None
    next_is_review: bool
    days_since_last: int | None
    total_sessions: int
