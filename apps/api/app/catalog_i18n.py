"""fr/ar translations of the base catalog (domains, skills, levels, the 10 base exercises).
Filled by the content pass; missing entries fall back to English."""
DOMAINS_I18N: dict[str, dict[str, str]] = {}      # slug -> {"fr": name, "ar": name}
SKILLS_I18N: dict[str, dict[str, dict]] = {}      # slug -> {"fr": {"name","description","criteria":[...]}, "ar": {...}}
LEVELS_I18N: dict[str, dict[str, str]] = {}       # "fr" -> {"1": "...", ... "5": "..."}
EXERCISES_I18N: dict[str, dict[str, dict]] = {}   # slug -> {"fr": {"title","scenario","objectives":[...],"resources":[{"title","note"}],"rubric":{key:{"name","description","keywords":[...]}}}, "ar": {...}}
