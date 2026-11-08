"""Professions the platform serves, with localised labels, and a baseline exercise per added profession."""
# key (canonical English, stored on users/exercises) -> labels
ROLE_LABELS: dict[str, dict[str, str]] = {
    "Product Manager": {"en": "Product Manager", "fr": "Chef de produit", "ar": "مدير منتج"},
    "UX/UI Designer": {"en": "UX/UI Designer", "fr": "Designer UX/UI", "ar": "مصمم تجربة وواجهة المستخدم"},
    "Software Developer": {"en": "Software Developer", "fr": "Développeur logiciel", "ar": "مطوّر برمجيات"},
}

# Baseline exercises for the added professions. Shape:
# {"slug","title","role","expected_level","skills":[slug],"scenario","objectives":[str],
#  "rubric":[{"key","name","description","weight":1,"max_score":5}],
#  "i18n":{"fr":{"title","scenario","objectives":[],"rubric":{key:{"name","description","keywords":[]}}},"ar":{...}}}
NEW_EXERCISES: list[dict] = []
