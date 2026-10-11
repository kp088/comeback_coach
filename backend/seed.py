"""Idempotent seed: demo learner + two older completions (so the app shows a 'coming back' state).

Run: cd /app/backend && python seed.py
"""

import asyncio
from datetime import datetime, timedelta, timezone

from lib.db import db, ensure_indexes

LEARNER_ID = "demo-learner"


async def main() -> None:
    await ensure_indexes()
    await db.learners.update_one(
        {"id": LEARNER_ID},
        {"$setOnInsert": {"id": LEARNER_ID, "name": "Sam", "active_goal_id": "python-basics"}},
        upsert=True,
    )
    base = datetime.now(timezone.utc) - timedelta(days=12)
    seeds = [
        ("seed-1", "pb-1", "Say it out loud", "Variables & print", "standard", base - timedelta(days=1)),
        ("seed-2", "pb-2", "Small list, real count", "Lists & len()", "easier", base),
    ]
    for sid, eid, title, concept, variant, when in seeds:
        await db.completions.update_one(
            {"id": sid},
            {"$setOnInsert": {
                "id": sid, "learner_id": LEARNER_ID, "goal_id": "python-basics", "exercise_id": eid,
                "exercise_title": title, "concept": concept, "variant": variant, "completed_at": when,
            }},
            upsert=True,
        )
    print("seeded")


if __name__ == "__main__":
    asyncio.run(main())
