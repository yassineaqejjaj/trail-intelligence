"""Versioned skills framework + exercise catalog (reference content, not demo users)."""
FRAMEWORK_VERSION = "1.0"

LEVELS = {
    "0": "Not Assessed", "1": "Awareness", "2": "Assisted Practitioner",
    "3": "Autonomous Practitioner", "4": "Advanced Practitioner", "5": "Expert / Mentor",
}

DOMAINS = [
    ("ai-foundations", "AI Foundations"), ("prompt-engineering", "Prompt Engineering"),
    ("context-engineering", "Context Engineering"), ("ai-product-discovery", "AI Product Discovery"),
    ("ai-product-delivery", "AI Product Delivery"), ("ai-assisted-development", "AI-Assisted Development"),
    ("rag", "RAG"), ("agentic-ai", "Agentic AI"), ("ai-evaluation", "AI Evaluation"),
    ("responsible-ai", "Responsible AI"), ("ai-economics", "AI Economics"),
]

# slug, name, domain, description, prerequisites
SKILLS = [
    ("ai-concepts", "AI & LLM Concepts", "ai-foundations", "Explain how LLMs work, what they can and cannot do.", []),
    ("llm-limitations", "LLM Limitations & Failure Modes", "ai-foundations", "Anticipate hallucination, bias, and drift in real work.", ["ai-concepts"]),
    ("prompt-basics", "Prompt Fundamentals", "prompt-engineering", "Write clear, goal-oriented prompts with constraints.", ["ai-concepts"]),
    ("prompt-structured", "Structured Prompting", "prompt-engineering", "Use roles, examples, formats and iteration to get reliable output.", ["prompt-basics"]),
    ("context-design", "Context Design", "context-engineering", "Select, order and budget context so models have what they need.", ["prompt-structured"]),
    ("opportunity-framing", "AI Opportunity Framing", "ai-product-discovery", "Identify where AI creates user value and validate the problem.", ["llm-limitations"]),
    ("ai-prd", "AI Product Requirements", "ai-product-delivery", "Specify behavior, quality bars and fallbacks for AI features.", ["opportunity-framing"]),
    ("ai-ux-patterns", "AI UX Patterns", "ai-product-delivery", "Design for uncertainty: feedback, control, recovery, transparency.", ["llm-limitations"]),
    ("pair-programming", "AI Pair Programming", "ai-assisted-development", "Use AI coding assistants effectively with tests and review.", ["prompt-basics"]),
    ("ai-code-review", "Reviewing AI-Generated Code", "ai-assisted-development", "Spot defects, security flaws and hidden assumptions in generated code.", ["pair-programming"]),
    ("rag-fundamentals", "RAG Fundamentals", "rag", "Design retrieval pipelines: chunking, retrieval, grounding, citations.", ["context-design"]),
    ("agent-design", "Agent Design", "agentic-ai", "Design tool-using agents with bounded permissions and oversight.", ["rag-fundamentals"]),
    ("eval-design", "Evaluation Design", "ai-evaluation", "Build test sets, metrics and regression checks for AI behavior.", ["prompt-structured"]),
    ("risk-assessment", "AI Risk Assessment", "responsible-ai", "Identify and mitigate privacy, fairness and safety risks.", ["llm-limitations"]),
    ("cost-modeling", "AI Cost Modeling", "ai-economics", "Estimate token, infra and human costs and unit economics.", ["ai-concepts"]),
]

_LV = {"1": "Can describe the concept", "2": "Applies with guidance", "3": "Applies independently in familiar contexts",
       "4": "Adapts to novel contexts and teaches others' pitfalls", "5": "Sets standards and mentors others"}
SKILL_LEVELS = _LV

# slug, title, role, baseline, expected_level, skills, scenario, objectives, rubric dims (key,name,description)
D = lambda k, n, d: {"key": k, "name": n, "description": d, "weight": 1, "max_score": 5}

EXERCISES = [
    ("pm-baseline", "Baseline: Scope an AI feature for support triage", "Product Manager", True, 2,
     ["opportunity-framing", "ai-prd"],
     "Your support team handles 4,000 tickets/month. Leadership asks you to propose an AI-assisted triage feature. Write a one-page proposal covering the user problem, success metrics, risks, and a fallback when the model is wrong.",
     ["Frame the user problem", "Define measurable success", "Identify AI-specific risks", "Specify fallback behavior"],
     [D("problem", "Problem framing", "user problem value support tickets triage need"), D("metrics", "Success metrics", "measurable metrics baseline target accuracy resolution"), D("risks", "Risk awareness", "risks hallucination errors privacy misclassification"), D("fallback", "Fallback design", "fallback human escalation confidence threshold review")]),
    ("ux-baseline", "Baseline: Design the uncertainty states of an AI assistant", "UX/UI Designer", True, 2,
     ["ai-ux-patterns", "llm-limitations"],
     "You design a writing assistant inside an email client. The model is sometimes wrong or slow. Describe the key interaction states and how users stay in control.",
     ["Cover loading, error and low-confidence states", "Give users control and recovery", "Explain how the AI's output is made transparent"],
     [D("states", "Uncertainty states", "loading error confidence states uncertain failure"), D("control", "User control", "undo edit accept reject control override"), D("transparency", "Transparency", "transparency explain source disclose label"), D("recovery", "Recovery", "recovery retry fallback manual correction")]),
    ("dev-baseline", "Baseline: Review an AI-generated function", "Software Developer", True, 2,
     ["ai-code-review", "pair-programming"],
     "An AI assistant generated a function that parses user-supplied CSV and inserts rows into a database using string formatting. Describe the defects you would raise, the tests you would write, and how you would prompt for a fix.",
     ["Find correctness and security defects", "Propose tests", "Write an effective follow-up prompt"],
     [D("defects", "Defect detection", "injection security validation errors edge cases parameterized"), D("tests", "Test strategy", "tests unit edge cases malformed coverage"), D("prompting", "Follow-up prompt", "prompt constraints context specific example"), D("judgment", "Engineering judgment", "tradeoffs review risk maintainability")]),
    ("prompt-structured-ex", "Craft a structured prompt for meeting summaries", "Product Manager", False, 3,
     ["prompt-structured", "prompt-basics"],
     "Write a reusable prompt that turns raw meeting transcripts into decisions, owners and open questions. Include format constraints, one example and a test plan for three tricky transcripts.",
     ["Define role and format", "Include an example", "Plan tests for edge cases"],
     [D("clarity", "Clarity & constraints", "role format constraints output clear instructions"), D("examples", "Examples", "example few-shot sample input output"), D("testing", "Test plan", "tests edge cases transcripts iterate evaluate"), D("robustness", "Robustness", "ambiguity missing noisy handling fallback")]),
    ("context-budget-ex", "Design the context for a policy Q&A bot", "Software Developer", False, 3,
     ["context-design", "rag-fundamentals"],
     "Design what goes into the model context for an HR-policy Q&A assistant: sources, ordering, token budget, and what you exclude. Explain how you ground answers and cite sources.",
     ["Select and order context", "Budget tokens", "Ground and cite answers"],
     [D("selection", "Context selection", "context sources relevant retrieval selection chunks"), D("budget", "Token budget", "token budget limit truncation priority window"), D("grounding", "Grounding & citation", "grounding citation source verify answer"), D("exclusion", "Exclusions", "exclude irrelevant sensitive stale noise")]),
    ("eval-set-ex", "Build an evaluation set for a classifier", "Software Developer", False, 3,
     ["eval-design"],
     "Your team ships an LLM ticket classifier. Design an evaluation set and metrics, including how you catch regressions before each release.",
     ["Design representative test cases", "Choose metrics", "Define a regression gate"],
     [D("coverage", "Test coverage", "test cases representative edge coverage categories"), D("metrics", "Metrics", "precision recall accuracy metrics threshold"), D("regression", "Regression gate", "regression release gate baseline compare ci"), D("bias", "Bias & drift", "bias drift monitoring distribution labels")]),
    ("risk-review-ex", "Run a risk review for an AI hiring screener", "Product Manager", False, 3,
     ["risk-assessment"],
     "A vendor proposes an AI CV screener. Perform a lightweight risk review: privacy, fairness, transparency, human oversight, and your go/no-go recommendation.",
     ["Identify risks", "Propose mitigations", "Make a recommendation"],
     [D("risks", "Risk identification", "privacy fairness bias discrimination transparency risks"), D("mitigation", "Mitigations", "mitigation oversight audit consent monitoring"), D("decision", "Decision quality", "recommendation conditions go criteria decision"), D("legal", "Regulatory awareness", "gdpr regulation compliance eu act rights")]),
    ("cost-model-ex", "Model the unit economics of an AI feature", "Product Manager", False, 3,
     ["cost-modeling"],
     "Estimate monthly cost of an AI summarisation feature for 20,000 users averaging 15 summaries/month. Include token assumptions, infra, human review, and levers to cut cost.",
     ["State assumptions", "Compute costs", "Propose cost levers"],
     [D("assumptions", "Assumptions", "assumptions tokens volume average users"), D("calc", "Calculation", "cost calculation price per million monthly total"), D("levers", "Cost levers", "caching smaller model batching routing levers"), D("sensitivity", "Sensitivity", "sensitivity scenario risk range best worst")]),
    ("ux-trust-ex", "Design a trust pattern for AI recommendations", "UX/UI Designer", False, 3,
     ["ai-ux-patterns"],
     "Design how a recommendation engine in a banking app shows why it suggests something and lets users correct it. Describe flows, microcopy and metrics.",
     ["Explain recommendations", "Enable correction", "Define UX metrics"],
     [D("explain", "Explanation", "explain reason why recommendation transparent"), D("correction", "Correction flow", "feedback correct dismiss undo control"), D("copy", "Microcopy", "microcopy tone language clear wording"), D("metrics", "UX metrics", "metrics trust acceptance satisfaction measure")]),
    ("agent-guardrails-ex", "Specify guardrails for a tool-using agent", "Software Developer", False, 4,
     ["agent-design"],
     "An agent can read tickets, query a database, and issue refunds up to 50 EUR. Specify its tools, permissions, human approval points, logging and failure handling.",
     ["Bound tool permissions", "Define approval gates", "Plan observability and failure handling"],
     [D("permissions", "Permission scoping", "permissions least privilege tools scope limits"), D("approval", "Human approval", "approval human loop threshold escalate"), D("observability", "Observability", "logging audit trace monitor alert"), D("failure", "Failure handling", "failure timeout retry rollback safe")]),
]

ROLES = [
    "Product Manager", "UX/UI Designer", "Software Developer", "Data Analyst", "Marketing & Communications",
    "Customer Support", "Human Resources", "Finance & Accounting", "Legal & Compliance",
    "Sales & Business Development", "Education & Training", "Operations & Project Management",
]
