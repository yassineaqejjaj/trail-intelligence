"""Deterministic, explainable recommendation engine."""
from dataclasses import dataclass


@dataclass
class Rec:
    skill_slug: str | None
    exercise_slug: str | None
    explanation: str


def recommend(*, role: str | None, objectives: list[str], levels: dict[str, int],
              prereqs: dict[str, list[str]], skill_domains: dict[str, str],
              exercises: list[dict], done_exercises: set[str], target_level: int = 2) -> Rec:
    """levels: skill_slug->current level; prereqs: skill->[prereq slugs]; exercises: dicts with
    slug, role, skills[], is_baseline. Rule: among skills below target whose prerequisites are
    all >= target, prefer objective-matching domains, then lowest level, then slug (stable)."""
    def ready(s):
        return all(levels.get(p, 0) >= target_level for p in prereqs.get(s, []))

    cands = [s for s in skill_domains if levels.get(s, 0) < target_level and ready(s)]
    if not cands:
        cands = [s for s in skill_domains if levels.get(s, 0) < target_level]
        blocked = True
    else:
        blocked = False
    if not cands:
        return Rec(None, None, "All catalog skills have reached the target level. Raise the target or try advanced exercises.")
    obj = {o.lower() for o in objectives}
    covered = {sk for e in exercises if e["slug"] not in done_exercises for sk in e["skills"]}
    # Prefer skills we can actually practise now, then objective match, then lowest level.
    cands.sort(key=lambda s: (s not in covered, skill_domains[s].lower() not in obj, levels.get(s, 0), s))
    skill = cands[0]
    options = [e for e in exercises if skill in e["skills"] and e["slug"] not in done_exercises]
    options.sort(key=lambda e: (e["role"] != role, not e["is_baseline"], e["slug"]))
    ex = options[0] if options else None
    why = [f"'{skill}' is at level {levels.get(skill, 0)}, below target {target_level}."]
    if skill_domains[skill].lower() in obj:
        why.append("It matches one of your selected objectives.")
    if blocked:
        why.append("Warning: some prerequisites are still below target.")
    elif prereqs.get(skill):
        why.append("Its prerequisites are already met.")
    why.append(f"Suggested exercise: {ex['slug']}." if ex else "No unfinished exercise covers this skill yet.")
    return Rec(skill, ex["slug"] if ex else None, " ".join(why))
