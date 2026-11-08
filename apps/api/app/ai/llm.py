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


_WORD = re.compile(r"\w{4,}")


class MockProvider:
    """Deterministic heuristic evaluator used for dev/tests/CI. NOT an LLM and NOT a
    validity claim: it scores keyword coverage and structure so the pipeline is testable.
    It only reads the JSON payload in the user turn and ignores instructions inside the submission."""

    name = "mock"
    model = "mock-heuristic-v1"

    def complete(self, system: str, user: str, timeout_s: float) -> LLMResult:
        payload = json.loads(user)
        sub: str = payload["submission"]
        lang = payload.get("language", "en")
        L = MOCK_TEXT.get(lang, MOCK_TEXT["en"])
        low = sub.lower()
        words = set(_WORD.findall(low))
        scores, evidence = [], []
        paras = [p.strip() for p in re.split(r"\n\s*\n|\n(?=[#\-*\d])", sub) if len(p.strip()) > 30]
        for i, dim in enumerate(payload["rubric"]):
            text = dim["name"] + " " + dim["description"] + " " + " ".join(dim.get("keywords", []))
            kws = {w for w in _WORD.findall(text.lower())}
            hit = len(kws & words) / max(1, min(len(kws), 8))
            structure = min(1.0, len(sub) / 1200)
            frac = max(0.0, min(1.0, 0.65 * min(1.0, hit * 1.6) + 0.35 * structure))
            score = round(frac * dim["max_score"] * 2) / 2
            scores.append({"dimension": dim["key"], "score": score, "rationale": L["why"].format(name=dim["name"])})
            if paras:
                evidence.append({"dimension": dim["key"], "quote": paras[i % len(paras)][:160], "comment": L["passage"]})
        names = {d["key"]: d["name"] for d in payload["rubric"]}
        good = [s for s in scores if s["score"] >= 0.6 * 5]
        out = {
            "scores": scores,
            "evidence": evidence,
            "strengths": [L["covers"].format(d=names[s["dimension"]]) for s in good[:3]] or [L["structured"]],
            "improvements": [L["deepen"].format(d=names[s["dimension"]]) for s in sorted(scores, key=lambda s: s["score"])[:2]],
            "next_actions": [L["next"]],
            "sufficient_evidence": len(sub.strip()) >= 150,
            "confidence": 0.5,
        }
        text = json.dumps(out, ensure_ascii=False)
        return LLMResult(text, len(user) // 4, len(text) // 4, self.model)


MOCK_TEXT = {
    "en": {"why": "Keyword/structure coverage for '{name}' (heuristic).", "passage": "Relevant passage.", "covers": "Covers {d}",
           "structured": "Submission is structured", "deepen": "Deepen {d} with concrete specifics", "next": "Revise the weakest dimension and resubmit"},
    "fr": {"why": "Couverture mots-clés/structure pour « {name} » (heuristique).", "passage": "Passage pertinent.", "covers": "Couvre {d}",
           "structured": "La soumission est structurée", "deepen": "Approfondir {d} avec des éléments concrets", "next": "Reprendre la dimension la plus faible et soumettre à nouveau"},
    "ar": {"why": "تغطية الكلمات المفتاحية والبنية لـ «{name}» (تقدير استدلالي).", "passage": "مقطع ذو صلة.", "covers": "يغطي {d}",
           "structured": "الإجابة منظّمة", "deepen": "تعميق {d} بتفاصيل ملموسة", "next": "راجع البُعد الأضعف ثم أعد التقديم"},
}


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
