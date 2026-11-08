"""Deterministic, explainable recommendation engine."""
from dataclasses import dataclass

T = {
    "en": {"done": "All catalog skills have reached the target level. Raise the target or try advanced exercises.",
           "gap": "'{skill}' is at level {lv}, below target {target}.", "obj": "It matches one of your selected objectives.",
           "blocked": "Warning: some prerequisites are still below target.", "prereq": "Its prerequisites are already met.",
           "ex": "Suggested exercise: {ex}.", "noex": "No unfinished exercise covers this skill yet."},
    "fr": {"done": "Toutes les compétences du catalogue ont atteint le niveau cible. Relevez la cible ou essayez des exercices avancés.",
           "gap": "« {skill} » est au niveau {lv}, sous la cible {target}.", "obj": "Elle correspond à l'un de vos objectifs.",
           "blocked": "Attention : certains prérequis sont encore sous la cible.", "prereq": "Ses prérequis sont déjà remplis.",
           "ex": "Exercice suggéré : {ex}.", "noex": "Aucun exercice non terminé ne couvre encore cette compétence."},
    "ar": {"done": "بلغت جميع مهارات الكتالوج المستوى المستهدف. ارفع الهدف أو جرّب تمارين متقدمة.",
           "gap": "مهارة «{skill}» عند المستوى {lv}، أدنى من الهدف {target}.", "obj": "تتوافق مع أحد أهدافك المختارة.",
           "blocked": "تنبيه: بعض المتطلبات المسبقة ما زالت دون الهدف.", "prereq": "متطلباتها المسبقة مستوفاة بالفعل.",
           "ex": "التمرين المقترح: {ex}.", "noex": "لا يوجد تمرين غير منجز يغطي هذه المهارة بعد."},
}


@dataclass
class Rec:
    skill_slug: str | None
    exercise_slug: str | None
    explanation: str


def recommend(*, role: str | None, objectives: list[str], levels: dict[str, int],
              prereqs: dict[str, list[str]], skill_domains: dict[str, str],
              exercises: list[dict], done_exercises: set[str], target_level: int = 2,
              lang: str = "en", skill_names: dict[str, str] | None = None) -> Rec:
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
        return Rec(None, None, T[lang]["done"])
    obj = {o.lower() for o in objectives}
    covered = {sk for e in exercises if e["slug"] not in done_exercises for sk in e["skills"]}
    # Prefer skills we can actually practise now, then objective match, then lowest level.
    cands.sort(key=lambda s: (s not in covered, skill_domains[s].lower() not in obj, levels.get(s, 0), s))
    skill = cands[0]
    options = [e for e in exercises if skill in e["skills"] and e["slug"] not in done_exercises]
    options.sort(key=lambda e: (e["role"] != role, not e["is_baseline"], e["slug"]))
    ex = options[0] if options else None
    nm = (skill_names or {}).get(skill, skill)
    t = T.get(lang, T["en"])
    why = [t["gap"].format(skill=nm, lv=levels.get(skill, 0), target=target_level)]
    if skill_domains[skill].lower() in obj:
        why.append(t["obj"])
    if blocked:
        why.append(t["blocked"])
    elif prereqs.get(skill):
        why.append(t["prereq"])
    why.append(t["ex"].format(ex=ex["slug"]) if ex else t["noex"])
    return Rec(skill, ex["slug"] if ex else None, " ".join(why))
