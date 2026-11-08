import json
import subprocess
import sys
from pathlib import Path


def test_reference_set_regression():
    r = subprocess.run([sys.executable, "evals/run_eval.py"], capture_output=True, text=True, check=False, env={"PYTHONPATH": ".", "LLM_PROVIDER": "mock"})
    assert r.returncode == 0, r.stdout
    assert json.loads(Path("evals/reference_set.json").read_text())["validated"] is False
