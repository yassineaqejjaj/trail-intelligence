import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    full_name: str = Field(default="", max_length=200)
    accept_terms: bool


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(max_length=128)


class ResetRequestIn(BaseModel):
    email: EmailStr


class ResetConfirmIn(BaseModel):
    token: str
    password: str = Field(min_length=10, max_length=128)


class UserOut(ORM):
    id: uuid.UUID
    email: str
    full_name: str
    role: str
    professional_role: str | None
    objectives: list
    onboarding_completed: bool
    share_with_org: bool


class OnboardingIn(BaseModel):
    professional_role: str
    objectives: list[str] = Field(default_factory=list, max_length=10)
    share_with_org: bool = False


class SettingsIn(BaseModel):
    full_name: str | None = Field(default=None, max_length=200)
    share_with_org: bool | None = None


class SkillOut(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    description: str
    domain: str
    domain_slug: str
    levels: dict
    criteria: list
    prerequisites: list[str]
    level: int = 0
    state: str = "not_assessed"
    framework_version: str


class ExerciseOut(ORM):
    id: uuid.UUID
    slug: str
    title: str
    scenario: str
    objectives: list
    resources: list
    checklist: list
    professional_role: str
    is_baseline: bool
    expected_level: int
    status: str
    skills: list[str] = []
    rubric: list[dict] = []
    rubric_version: int = 1


class ExerciseIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    scenario: str = Field(min_length=10)
    objectives: list[str] = []
    resources: list[dict] = []
    checklist: list[str] = []
    professional_role: str
    expected_level: int = Field(default=2, ge=1, le=5)
    skill_slugs: list[str] = []
    rubric: list[dict] = Field(min_length=1, max_length=10)
    status: str = Field(default="draft", pattern="^(draft|published|archived)$")


class SubmissionIn(BaseModel):
    exercise_id: uuid.UUID
    content: str = Field(max_length=20000)
    checklist_state: dict = Field(default_factory=dict)
    submit: bool = False


class SubmissionOut(ORM):
    id: uuid.UUID
    exercise_id: uuid.UUID
    content: str
    checklist_state: dict
    status: str
    updated_at: datetime
    submitted_at: datetime | None


class AssessmentOut(ORM):
    id: uuid.UUID
    submission_id: uuid.UUID
    status: str
    provisional: bool
    rubric_version: int
    prompt_version: str
    model: str
    scores: list
    overall_score: float | None
    level: int | None
    evidence: list
    strengths: list
    improvements: list
    next_actions: list
    error: str | None
    review_note: str | None
    created_at: datetime


class ReviewIn(BaseModel):
    level: int = Field(ge=1, le=5)
    justification: str = Field(min_length=10, max_length=2000)
