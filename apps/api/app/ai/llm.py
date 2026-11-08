"""Provider-independent LLM abstraction."""
import json
import re
import time
from dataclasses import dataclass
from typing import Protocol

import httpx

from app.core.config import get_settings


@dataclass
class LLMResult:
    text: str
    input_tokens: int
    output_tokens: int
    model: str


class LLMError(Exception):
    pass


class LLMProvider(Protocol):
    name: str

    def complete(self, system: str, user: str, timeout_s: float) -> LLMResult: ...


class AnthropicProvider:
    name = "anthropic"

    def __init__(self, api_key: str, model: str):
        self.api_key, self.model = api_key, model

    def complete(self, system: str, user: str, timeout_s: float) -> LLMResult:
        try:
            r = httpx.post(
                "https://api.anthropic.com/v1/messages",
                headers={"x-api-key": self.api_key, "anthropic-version": "2023-06-01"},
                json={"model": self.model, "max_tokens": 2000, "system": system,
                      "messages": [{"role": "user", "content": user}]},
                timeout=timeout_s,
            )
            r.raise_for_status()
            d = r.json()
            return LLMResult("".join(b.get("text", "") for b in d["content"]),
                             d["usage"]["input_tokens"], d["usage"]["output_tokens"], d.get("model", self.model))
        except (httpx.HTTPError, KeyError, ValueError) as e:
            raise LLMError(f"{type(e).__name__}") from e  # no response body / key leakage


_WORD = re.compile(r"[a-z]{4,}")


class MockProvider:
    """Deterministic heuristic evaluator used for dev/tests/CI. NOT an LLM and NOT a
    validity claim: it scores keyword coverage and structure so the pipeline is testable.
    It only reads the JSON payload in the user turn and ignores instructions inside the submission."""

    name = "mock"
    model = "mock-heuristic-v1"

    def complete(self, system: str, user: str, timeout_s: float) -> LLMResult:
        payload = json.loads(user)
        sub: str = payload["submission"]
        low = sub.lower()
        words = set(_WORD.findall(low))
        scores, evidence = [], []
        paras = [p.strip() for p in re.split(r"\n\s*\n|\n(?=[#\-*\d])", sub) if len(p.strip()) > 30]
        for i, dim in enumerate(payload["rubric"]):
            kws = {w for w in _WORD.findall((dim["name"] + " " + dim["description"]).lower())}
            hit = len(kws & words) / max(1, min(len(kws), 8))
            structure = min(1.0, len(sub) / 1200)
            frac = max(0.0, min(1.0, 0.65 * min(1.0, hit * 1.6) + 0.35 * structure))
            score = round(frac * dim["max_score"] * 2) / 2
            scores.append({"dimension": dim["key"], "score": score,
                           "rationale": f"Keyword/structure coverage for '{dim['name']}' (heuristic)."})
            if paras:
                q = paras[i % len(paras)][:160]
                evidence.append({"dimension": dim["key"], "quote": q, "comment": "Relevant passage."})
        good = [s for s in scores if s["score"] >= 0.6 * 5]
        out = {
            "scores": scores,
            "evidence": evidence,
            "strengths": [f"Covers {s['dimension']}" for s in good[:3]] or ["Submission is structured"],
            "improvements": [f"Deepen {s['dimension']} with concrete specifics"
                             for s in sorted(scores, key=lambda s: s["score"])[:2]],
            "next_actions": ["Revise the weakest dimension and resubmit"],
            "sufficient_evidence": len(sub.strip()) >= 150,
            "confidence": 0.5,
        }
        text = json.dumps(out)
        return LLMResult(text, len(user) // 4, len(text) // 4, self.model)


def get_provider() -> LLMProvider:
    s = get_settings()
    if s.llm_provider == "anthropic":
        if not s.llm_api_key:
            raise LLMError("LLM_API_KEY not configured")
        return AnthropicProvider(s.llm_api_key, s.llm_model)
    return MockProvider()


PRICES_PER_MTOK = {"claude-sonnet-5-5": (3.0, 15.0)}  # (in, out) USD; configure per provider


def estimate_cost(model: str, tin: int, tout: int) -> float:
    p = PRICES_PER_MTOK.get(model)
    return round((tin * p[0] + tout * p[1]) / 1e6, 6) if p else 0.0


def timed(fn, *a):
    t = time.perf_counter()
    r = fn(*a)
    return r, int((time.perf_counter() - t) * 1000)
