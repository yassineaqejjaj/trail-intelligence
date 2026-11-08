"""`make eval`: run the reference set through the configured assessment pipeline and summarise."""
import json
import sys
from pathlib import Path

from app import catalog
from app.ai.assessment import assess
from app.ai.llm import get_provider

data = json.loads((Path(__file__).parent / "reference_set.json").read_text())
ex = next(e for e in catalog.EXERCISES if e[0] == data["exercise"])
rubric, scenario = ex[8], ex[6]
provider = get_provider()
rows, fails = [], 0
for c in data["cases"]:
    r = assess(provider, exercise={"title": ex[1], "scenario": scenario}, rubric=rubric, submission=c["text"],
               expected_level=ex[4])
    e, ok = c["expect"], True
    ok = r.status in e["statuses"]
    if ok and "min_score" in e and r.overall_score is not None:
        ok = e["min_score"] <= r.overall_score <= e["max_score"]
    fails += not ok
    rows.append((c["id"], r.status, r.overall_score, r.level, "PASS" if ok else "FAIL"))
print(f"\nReference set (validated={data['validated']}; {data['label_source']})\nprovider={provider.name}")
print(f"{'case':16}{'status':24}{'score':>7}{'level':>6}  result")
for row in rows:
    print(f"{row[0]:16}{row[1]:24}{row[2]!s:>7}{row[3]!s:>6}  {row[4]}")
print(f"\n{len(rows) - fails}/{len(rows)} within expected ranges. NOTE: ranges are synthetic; this is a regression check, not a validity claim.")
sys.exit(1 if fails else 0)
