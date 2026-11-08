"""Professions the platform serves, with localised labels, and a baseline exercise per added profession."""
# key (canonical English, stored on users/exercises) -> labels
ROLE_LABELS: dict[str, dict[str, str]] = {
    "Product Manager": {"en": "Product Manager", "fr": "Chef de produit", "ar": "مدير منتج"},
    "UX/UI Designer": {"en": "UX/UI Designer", "fr": "Designer UX/UI", "ar": "مصمم تجربة وواجهة المستخدم"},
    "Software Developer": {"en": "Software Developer", "fr": "Développeur logiciel", "ar": "مطوّر برمجيات"},
    "Data Analyst": {"en": "Data Analyst", "fr": "Analyste de données", "ar": "محلل بيانات"},
    "Marketing & Communications": {
        "en": "Marketing & Communications", "fr": "Marketing et communication", "ar": "التسويق والاتصال"},
    "Customer Support": {"en": "Customer Support", "fr": "Support client", "ar": "دعم العملاء"},
    "Human Resources": {"en": "Human Resources", "fr": "Ressources humaines", "ar": "الموارد البشرية"},
    "Finance & Accounting": {"en": "Finance & Accounting", "fr": "Finance et comptabilité", "ar": "المالية والمحاسبة"},
    "Legal & Compliance": {"en": "Legal & Compliance", "fr": "Juridique et conformité", "ar": "الشؤون القانونية والامتثال"},
    "Sales & Business Development": {
        "en": "Sales & Business Development", "fr": "Ventes et développement commercial",
        "ar": "المبيعات وتطوير الأعمال"},
    "Education & Training": {"en": "Education & Training", "fr": "Éducation et formation", "ar": "التعليم والتدريب"},
    "Operations & Project Management": {
        "en": "Operations & Project Management", "fr": "Opérations et gestion de projet",
        "ar": "العمليات وإدارة المشاريع"},
}

# Baseline exercises for the added professions. Shape:
# {"slug","title","role","expected_level","skills":[slug],"scenario","objectives":[str],
#  "rubric":[{"key","name","description","weight":1,"max_score":5}],
#  "i18n":{"fr":{"title","scenario","objectives":[],"rubric":{key:{"name","description","keywords":[]}}},"ar":{...}}}


def _rub(items: list[tuple[str, str, str]]) -> list[dict]:
    return [{"key": k, "name": n, "description": d, "weight": 1, "max_score": 5} for k, n, d in items]


def _loc(title: str, scenario: str, objectives: list[str], rubric: dict[str, tuple[str, str, str]]) -> dict:
    return {
        "title": title,
        "scenario": scenario,
        "objectives": objectives,
        "rubric": {k: {"name": n, "description": d, "keywords": v.split()} for k, (n, d, v) in rubric.items()},
    }


NEW_EXERCISES: list[dict] = [
    # ------------------------------------------------------------------ Data Analyst
    {
        "slug": "da-baseline",
        "title": "Baseline: Validate an AI-generated analysis",
        "role": "Data Analyst",
        "expected_level": 2,
        "skills": ["llm-limitations", "eval-design"],
        "scenario": (
            "An AI assistant analysed a 120,000-row subscription export and concluded that churn dropped sharply "
            "after a pricing change, recommending a rollout in all markets. The export contains duplicate customer "
            "IDs and a three-week gap in one region, and the assistant did not share the code it ran. You must "
            "decide what to verify before presenting the result to leadership tomorrow."
        ),
        "objectives": [
            "Check data quality and the assistant's inputs",
            "Make the analysis reproducible",
            "Test whether the causal claim holds",
            "Communicate findings and uncertainty to leadership",
        ],
        "rubric": _rub([
            ("data_checks", "Data quality checks", "Detects duplicates, gaps and sampling issues before trusting the output."),
            ("reproducibility", "Reproducibility", "Re-runs the analysis independently with visible code and documented steps."),
            ("causal_rigor", "Causal and statistical rigor", "Questions confounders, seasonality, significance and the causal claim."),
            ("communication", "Communication of uncertainty", "Reports caveats, confidence and a recommendation proportionate to the evidence."),
        ]),
        "i18n": {
            "fr": _loc(
                "Référence : valider une analyse générée par l'IA",
                "Un assistant IA a analysé un export de 120 000 lignes d'abonnements et conclut que le churn a nettement "
                "baissé après un changement de tarif, en recommandant un déploiement sur tous les marchés. L'export "
                "contient des identifiants clients en double et un trou de trois semaines dans une région, et "
                "l'assistant n'a pas fourni le code exécuté. Vous devez décider quoi vérifier avant de présenter le "
                "résultat à la direction demain.",
                [
                    "Contrôler la qualité des données et des entrées de l'assistant",
                    "Rendre l'analyse reproductible",
                    "Tester la validité de l'affirmation causale",
                    "Communiquer les résultats et l'incertitude à la direction",
                ],
                {
                    "data_checks": ("Contrôles de qualité des données",
                                    "Détecte doublons, trous et biais d'échantillonnage avant de faire confiance au résultat.",
                                    "doublons données valeurs manquantes qualité échantillon contrôle anomalies période"),
                    "reproducibility": ("Reproductibilité",
                                        "Refait l'analyse de façon indépendante avec un code visible et des étapes documentées.",
                                        "reproduire reproductible code script documenter étapes recalculer indépendante"),
                    "causal_rigor": ("Rigueur causale et statistique",
                                     "Questionne les variables de confusion, la saisonnalité, la significativité et la causalité.",
                                     "causalité confusion saisonnalité significatif groupe témoin corrélation test hypothèse"),
                    "communication": ("Communication de l'incertitude",
                                      "Présente les limites, le niveau de confiance et une recommandation proportionnée aux preuves.",
                                      "limites incertitude confiance recommandation prudence hypothèses résultats réserves"),
                },
            ),
            "ar": _loc(
                "تقييم أساسي: التحقق من تحليل أنتجه الذكاء الاصطناعي",
                "حلّل مساعد ذكاء اصطناعي ملف اشتراكات يضم 120 ألف سطر، وخلص إلى أن معدل فقدان العملاء انخفض بشكل "
                "ملحوظ بعد تغيير التسعير، وأوصى بتعميمه على جميع الأسواق. يحتوي الملف على معرّفات عملاء مكررة وفجوة "
                "مدتها ثلاثة أسابيع في إحدى المناطق، ولم يقدّم المساعد الشيفرة التي نفّذها. عليك أن تحدد ما ستتحقق "
                "منه قبل عرض النتيجة على الإدارة غدًا.",
                [
                    "فحص جودة البيانات ومدخلات المساعد",
                    "جعل التحليل قابلًا لإعادة الإنتاج",
                    "اختبار صحة الادعاء السببي",
                    "إبلاغ الإدارة بالنتائج ودرجة عدم اليقين",
                ],
                {
                    "data_checks": ("فحوصات جودة البيانات",
                                    "يكتشف التكرار والفجوات وتحيّز العينة قبل الوثوق بالنتيجة.",
                                    "البيانات المكررة التكرار الفجوات جودة العينة الفحص القيم المفقودة"),
                    "reproducibility": ("إمكانية إعادة الإنتاج",
                                        "يعيد التحليل بصورة مستقلة بشيفرة واضحة وخطوات موثقة.",
                                        "إعادة الشيفرة توثيق الخطوات مستقل تكرار التحليل الإنتاج"),
                    "causal_rigor": ("الصرامة السببية والإحصائية",
                                     "يتساءل عن العوامل المربكة والموسمية والدلالة الإحصائية والادعاء السببي.",
                                     "السببية الموسمية الارتباط دلالة إحصائية المقارنة الفرضية العوامل مجموعة"),
                    "communication": ("إبلاغ عدم اليقين",
                                      "يعرض القيود ودرجة الثقة وتوصية تتناسب مع قوة الأدلة.",
                                      "القيود الثقة توصية الحذر النتائج الافتراضات التحفظات اليقين"),
                },
            ),
        },
    },
    # ------------------------------------------------------------------ Marketing
    {
        "slug": "mk-baseline",
        "title": "Baseline: Set up an AI content workflow with brand and fact review",
        "role": "Marketing & Communications",
        "expected_level": 2,
        "skills": ["prompt-structured", "llm-limitations"],
        "scenario": (
            "Your team publishes about 30 blog posts and 200 social posts a month for a B2B software company and "
            "wants to use an AI assistant for first drafts. A recent draft invented a customer quote and cited a "
            "market-share figure with no source. Define the workflow, the prompt brief, and the review steps that "
            "keep content on-brand, accurate and legally safe."
        ),
        "objectives": [
            "Write a structured brief that guides the AI draft",
            "Set a factual verification step",
            "Protect brand voice and consistency",
            "Address disclosure, copyright and approval",
        ],
        "rubric": _rub([
            ("workflow", "Workflow and brief", "Gives a clear, structured brief with audience, tone, format and sources."),
            ("factual_review", "Factual review", "Verifies claims, quotes and figures against sources before publication."),
            ("brand_voice", "Brand voice", "Keeps tone and messaging consistent through guidelines and human editing."),
            ("compliance", "Disclosure and rights", "Handles AI disclosure, copyright, consent for quotes and approvals."),
        ]),
        "i18n": {
            "fr": _loc(
                "Référence : mettre en place un flux de contenu IA avec revue de marque et de faits",
                "Votre équipe publie environ 30 articles de blog et 200 posts sociaux par mois pour un éditeur de "
                "logiciels B2B et souhaite utiliser un assistant IA pour les premières versions. Un brouillon récent "
                "a inventé une citation client et cité une part de marché sans source. Définissez le flux de travail, "
                "le brief de prompt et les étapes de relecture qui garantissent un contenu fidèle à la marque, exact "
                "et juridiquement sûr.",
                [
                    "Rédiger un brief structuré qui guide le brouillon de l'IA",
                    "Mettre en place une étape de vérification factuelle",
                    "Protéger la voix et la cohérence de la marque",
                    "Traiter la mention de l'IA, le droit d'auteur et la validation",
                ],
                {
                    "workflow": ("Flux de travail et brief",
                                 "Fournit un brief clair et structuré : cible, ton, format et sources.",
                                 "brief prompt cible audience tonalité format sources structuré consignes"),
                    "factual_review": ("Revue factuelle",
                                       "Vérifie les affirmations, citations et chiffres auprès de sources avant publication.",
                                       "vérifier vérification sources citations chiffres faits relecture hallucination"),
                    "brand_voice": ("Voix de marque",
                                    "Maintient un ton et des messages cohérents grâce à une charte et à une édition humaine.",
                                    "marque tonalité charte cohérence éditorial style identité relecture"),
                    "compliance": ("Mention et droits",
                                   "Gère la mention de l'IA, le droit d'auteur, le consentement pour les citations et la validation.",
                                   "droit auteur mention consentement validation conformité transparence propriété légal"),
                },
            ),
            "ar": _loc(
                "تقييم أساسي: إعداد سير عمل محتوى بالذكاء الاصطناعي مع مراجعة العلامة والوقائع",
                "ينشر فريقك نحو 30 مقالة مدونة و200 منشور اجتماعي شهريًا لشركة برمجيات موجهة للشركات، ويريد "
                "استخدام مساعد ذكاء اصطناعي في المسودات الأولى. أحد المسودات الأخيرة اختلق اقتباسًا من عميل وذكر "
                "حصة سوقية دون مصدر. حدّد سير العمل وتعليمات الطلب وخطوات المراجعة التي تضمن محتوى متسقًا مع "
                "العلامة ودقيقًا وآمنًا قانونيًا.",
                [
                    "كتابة موجز منظم يوجّه مسودة الذكاء الاصطناعي",
                    "وضع خطوة للتحقق من الوقائع",
                    "حماية صوت العلامة التجارية واتساقها",
                    "معالجة الإفصاح وحقوق النشر والاعتماد",
                ],
                {
                    "workflow": ("سير العمل والموجز",
                                 "يقدم موجزًا واضحًا ومنظمًا يحدد الجمهور والنبرة والصيغة والمصادر.",
                                 "موجز الجمهور النبرة الصيغة المصادر تعليمات منظم المسودة"),
                    "factual_review": ("المراجعة الواقعية",
                                       "يتحقق من الادعاءات والاقتباسات والأرقام بمقارنتها بالمصادر قبل النشر.",
                                       "التحقق المصادر الاقتباسات الأرقام الوقائع المراجعة اختلاق"),
                    "brand_voice": ("صوت العلامة التجارية",
                                    "يحافظ على اتساق النبرة والرسائل عبر الإرشادات والتحرير البشري.",
                                    "العلامة النبرة الإرشادات الاتساق الهوية التحرير الأسلوب"),
                    "compliance": ("الإفصاح والحقوق",
                                   "يعالج الإفصاح عن الذكاء الاصطناعي وحقوق النشر وموافقة أصحاب الاقتباسات والاعتماد.",
                                   "حقوق النشر الإفصاح الموافقة الاعتماد الامتثال الشفافية قانوني الملكية"),
                },
            ),
        },
    },
    # ------------------------------------------------------------------ Customer Support
    {
        "slug": "cs-baseline",
        "title": "Baseline: Design an AI reply-drafting workflow with escalation",
        "role": "Customer Support",
        "expected_level": 2,
        "skills": ["ai-prd", "risk-assessment"],
        "scenario": (
            "Your support desk answers about 6,000 emails a month for an online retailer, with a 24-hour reply "
            "target. You plan to let an AI assistant draft replies that agents review before sending. Describe how "
            "the workflow runs, which tickets must bypass the AI, and how you protect customer data and track reply "
            "quality."
        ),
        "objectives": [
            "Design the drafting and agent review workflow",
            "Define escalation rules for sensitive tickets",
            "Set quality controls and metrics",
            "Protect customer personal data",
        ],
        "rubric": _rub([
            ("workflow_design", "Workflow design", "Describes the draft, review and send steps with the agent staying in the loop."),
            ("escalation", "Escalation rules", "Routes complaints, refunds, legal threats and low-confidence cases to humans."),
            ("quality_control", "Quality control", "Measures accuracy, tone and resolution with sampling and feedback."),
            ("privacy", "Customer data privacy", "Limits personal data sent to the model and applies retention and access rules."),
        ]),
        "i18n": {
            "fr": _loc(
                "Référence : concevoir un flux de réponses assistées par l'IA avec escalade",
                "Votre service client traite environ 6 000 e-mails par mois pour un site de vente en ligne, avec un "
                "objectif de réponse sous 24 heures. Vous prévoyez qu'un assistant IA rédige des brouillons que les "
                "agents relisent avant envoi. Décrivez le déroulement du flux, les tickets qui doivent échapper à "
                "l'IA, et comment vous protégez les données clients et suivez la qualité des réponses.",
                [
                    "Concevoir le flux de rédaction et de relecture par l'agent",
                    "Définir les règles d'escalade pour les tickets sensibles",
                    "Fixer des contrôles qualité et des indicateurs",
                    "Protéger les données personnelles des clients",
                ],
                {
                    "workflow_design": ("Conception du flux",
                                        "Décrit les étapes de brouillon, relecture et envoi, l'agent restant dans la boucle.",
                                        "brouillon relecture agent validation envoi étapes processus modèles"),
                    "escalation": ("Règles d'escalade",
                                   "Oriente réclamations, remboursements, menaces juridiques et cas incertains vers un humain.",
                                   "escalade escalader réclamation remboursement humain sensible seuil juridique urgence"),
                    "quality_control": ("Contrôle qualité",
                                        "Mesure exactitude, ton et résolution par échantillonnage et retours des agents.",
                                        "qualité échantillonnage indicateurs satisfaction exactitude tonalité retours résolution"),
                    "privacy": ("Confidentialité des données clients",
                                "Limite les données personnelles envoyées au modèle et applique rétention et accès.",
                                "données personnelles confidentialité anonymiser rgpd rétention accès masquer consentement"),
                },
            ),
            "ar": _loc(
                "تقييم أساسي: تصميم سير عمل لصياغة الردود بالذكاء الاصطناعي مع التصعيد",
                "يتعامل مكتب الدعم لديك مع نحو 6000 رسالة بريد إلكتروني شهريًا لمتجر إلكتروني، وهدفه الرد خلال 24 "
                "ساعة. تخطط لجعل مساعد ذكاء اصطناعي يصيغ مسودات ردود يراجعها الموظفون قبل إرسالها. صِف كيف يعمل "
                "سير العمل، وما التذاكر التي يجب أن تتجاوز الذكاء الاصطناعي، وكيف تحمي بيانات العملاء وتتابع جودة "
                "الردود.",
                [
                    "تصميم سير الصياغة ومراجعة الموظف",
                    "تحديد قواعد التصعيد للتذاكر الحساسة",
                    "وضع ضوابط الجودة والمؤشرات",
                    "حماية البيانات الشخصية للعملاء",
                ],
                {
                    "workflow_design": ("تصميم سير العمل",
                                        "يصف خطوات المسودة والمراجعة والإرسال مع بقاء الموظف ضمن الحلقة.",
                                        "مسودة مراجعة الموظف اعتماد إرسال خطوات قوالب العملية"),
                    "escalation": ("قواعد التصعيد",
                                   "يحوّل الشكاوى والمبالغ المستردة والتهديدات القانونية والحالات غير المؤكدة إلى إنسان.",
                                   "التصعيد شكوى استرداد بشري حساسة الحدود قانونية عاجلة"),
                    "quality_control": ("ضبط الجودة",
                                        "يقيس الدقة والنبرة وحل المشكلة عبر أخذ عينات وملاحظات الموظفين.",
                                        "الجودة عينات مؤشرات الرضا الدقة النبرة ملاحظات الحل"),
                    "privacy": ("خصوصية بيانات العملاء",
                                "يحدّ من البيانات الشخصية المرسلة إلى النموذج ويطبق قواعد الاحتفاظ والوصول.",
                                "البيانات الشخصية الخصوصية إخفاء الاحتفاظ الوصول الموافقة حماية السرية"),
                },
            ),
        },
    },
    # ------------------------------------------------------------------ Human Resources
    {
        "slug": "hr-baseline",
        "title": "Baseline: Assess the risks of an AI candidate-screening assistant",
        "role": "Human Resources",
        "expected_level": 2,
        "skills": ["risk-assessment", "llm-limitations"],
        "scenario": (
            "Your company receives around 1,500 applications a year for 40 roles. A vendor offers an AI assistant "
            "that ranks CVs and proposes a shortlist. Its training data is undisclosed, and last year's hires were "
            "mostly from three universities. Explain the fairness and legal risks, what safeguards you require, and "
            "whether you would adopt it."
        ),
        "objectives": [
            "Identify bias and fairness risks",
            "Define human oversight of decisions",
            "Address legal and data protection obligations",
            "Plan transparency toward candidates and a recommendation",
        ],
        "rubric": _rub([
            ("bias_fairness", "Bias and fairness", "Identifies proxy variables, historical bias and a method to audit outcomes by group."),
            ("human_oversight", "Human oversight", "Keeps people accountable for decisions, with the ability to review and override."),
            ("legal_compliance", "Legal and data protection", "Considers anti-discrimination law, data protection, consent and AI regulation."),
            ("transparency", "Transparency and decision", "Informs candidates, documents criteria and gives a justified go/no-go."),
        ]),
        "i18n": {
            "fr": _loc(
                "Référence : évaluer les risques d'un assistant IA de présélection des candidatures",
                "Votre entreprise reçoit environ 1 500 candidatures par an pour 40 postes. Un fournisseur propose un "
                "assistant IA qui classe les CV et propose une présélection. Ses données d'entraînement ne sont pas "
                "divulguées, et les recrutements de l'an dernier venaient surtout de trois universités. Expliquez les "
                "risques d'équité et juridiques, les garde-fous exigés et si vous adopteriez l'outil.",
                [
                    "Identifier les risques de biais et d'équité",
                    "Définir la supervision humaine des décisions",
                    "Traiter les obligations juridiques et de protection des données",
                    "Prévoir la transparence envers les candidats et une recommandation",
                ],
                {
                    "bias_fairness": ("Biais et équité",
                                      "Repère les variables proxy, les biais historiques et une méthode d'audit des résultats par groupe.",
                                      "biais discrimination équité audit proxy groupes historique diversité"),
                    "human_oversight": ("Supervision humaine",
                                        "Maintient la responsabilité humaine, avec possibilité de revoir et de contredire l'outil.",
                                        "supervision humaine décision responsabilité contrôle recruteur révision contester"),
                    "legal_compliance": ("Juridique et protection des données",
                                         "Considère le droit anti-discrimination, la protection des données, le consentement et la réglementation IA.",
                                         "rgpd données consentement réglementation conformité légal droit candidats"),
                    "transparency": ("Transparence et décision",
                                     "Informe les candidats, documente les critères et rend un avis motivé.",
                                     "transparence informer critères documenter recommandation conditions décision explicable"),
                },
            ),
            "ar": _loc(
                "تقييم أساسي: تقييم مخاطر مساعد ذكاء اصطناعي لفرز المرشحين",
                "تتلقى شركتك نحو 1500 طلب توظيف سنويًا لشغل 40 وظيفة. يعرض مورّد مساعد ذكاء اصطناعي يرتّب السير "
                "الذاتية ويقترح قائمة مختصرة. بيانات تدريبه غير معلنة، وأغلب من تم توظيفهم العام الماضي تخرجوا من "
                "ثلاث جامعات. اشرح مخاطر الإنصاف والمخاطر القانونية، والضمانات التي تشترطها، وهل ستعتمد الأداة.",
                [
                    "تحديد مخاطر التحيز والإنصاف",
                    "تحديد الإشراف البشري على القرارات",
                    "معالجة الالتزامات القانونية وحماية البيانات",
                    "التخطيط للشفافية مع المرشحين وصياغة توصية",
                ],
                {
                    "bias_fairness": ("التحيز والإنصاف",
                                      "يحدد المتغيرات البديلة والتحيز التاريخي وطريقة لتدقيق النتائج حسب الفئات.",
                                      "التحيز التمييز الإنصاف تدقيق الفئات تاريخي التنوع متغيرات"),
                    "human_oversight": ("الإشراف البشري",
                                        "يُبقي المسؤولية على البشر مع إمكانية مراجعة نتيجة الأداة وتجاوزها.",
                                        "الإشراف بشري القرار المسؤولية المراجعة الموظف الاعتراض الرقابة"),
                    "legal_compliance": ("القانون وحماية البيانات",
                                         "يراعي قوانين مكافحة التمييز وحماية البيانات والموافقة وتنظيم الذكاء الاصطناعي.",
                                         "البيانات الموافقة القانون الامتثال التنظيم الخصوصية المرشحين التشريعات"),
                    "transparency": ("الشفافية والقرار",
                                     "يُعلم المرشحين ويوثق المعايير ويقدم قرارًا مبررًا بالقبول أو الرفض.",
                                     "الشفافية إبلاغ المعايير توثيق توصية شروط القرار تفسير"),
                },
            ),
        },
    },
    # ------------------------------------------------------------------ Finance & Accounting
    {
        "slug": "fa-baseline",
        "title": "Baseline: Set controls for AI-assisted reconciliation",
        "role": "Finance & Accounting",
        "expected_level": 2,
        "skills": ["risk-assessment", "eval-design"],
        "scenario": (
            "Your accounting team reconciles about 8,000 bank transactions each month-end, and a new AI assistant "
            "proposes matches between the bank statement and the ledger. During a pilot it matched two payments of "
            "the same amount to the wrong invoices and gave a confident explanation. Define the controls, tests and "
            "approvals required before its matches can be posted."
        ),
        "objectives": [
            "Define validation controls on AI-proposed matches",
            "Test accuracy on a known sample",
            "Maintain segregation of duties and an audit trail",
            "Protect confidential financial data",
        ],
        "rubric": _rub([
            ("controls", "Validation controls", "Sets thresholds, review of exceptions and approval before posting."),
            ("reconciliation_checks", "Accuracy testing", "Tests against a sample with known answers and tracks error rates and totals."),
            ("segregation_audit", "Segregation and audit trail", "Separates proposing from approving and logs who changed what."),
            ("data_security", "Data confidentiality", "Restricts financial data shared with the tool and checks vendor terms."),
        ]),
        "i18n": {
            "fr": _loc(
                "Référence : définir les contrôles d'un rapprochement bancaire assisté par l'IA",
                "Votre équipe comptable rapproche environ 8 000 opérations bancaires à chaque clôture mensuelle, et "
                "un nouvel assistant IA propose des correspondances entre le relevé bancaire et le grand livre. Lors "
                "d'un pilote, il a associé deux paiements de même montant aux mauvaises factures en donnant une "
                "explication assurée. Définissez les contrôles, tests et validations requis avant de comptabiliser "
                "ses rapprochements.",
                [
                    "Définir des contrôles de validation des rapprochements proposés par l'IA",
                    "Tester l'exactitude sur un échantillon connu",
                    "Assurer la séparation des tâches et une piste d'audit",
                    "Protéger la confidentialité des données financières",
                ],
                {
                    "controls": ("Contrôles de validation",
                                 "Fixe des seuils, une revue des exceptions et une approbation avant comptabilisation.",
                                 "contrôle contrôles seuil exceptions validation approbation revue écarts"),
                    "reconciliation_checks": ("Test d'exactitude",
                                              "Teste sur un échantillon aux réponses connues et suit taux d'erreur et totaux.",
                                              "échantillon exactitude erreurs totaux rapprochement test écarts taux"),
                    "segregation_audit": ("Séparation des tâches et piste d'audit",
                                          "Sépare la proposition de l'approbation et journalise qui a modifié quoi.",
                                          "séparation tâches audit traçabilité journal piste approbation responsabilité"),
                    "data_security": ("Confidentialité des données",
                                      "Limite les données financières transmises à l'outil et vérifie les conditions du fournisseur.",
                                      "confidentialité données sécurité fournisseur accès chiffrement contrat anonymiser"),
                },
            ),
            "ar": _loc(
                "تقييم أساسي: وضع ضوابط للمطابقة المحاسبية بمساعدة الذكاء الاصطناعي",
                "يطابق فريقك المحاسبي نحو 8000 عملية بنكية في نهاية كل شهر، ويقترح مساعد ذكاء اصطناعي جديد "
                "مطابقات بين كشف الحساب البنكي ودفتر الأستاذ. في تجربة أولية، ربط دفعتين بالمبلغ نفسه بفاتورتين "
                "خاطئتين وقدّم تفسيرًا واثقًا. حدّد الضوابط والاختبارات والموافقات اللازمة قبل ترحيل مطابقاته.",
                [
                    "تحديد ضوابط التحقق من المطابقات المقترحة",
                    "اختبار الدقة على عينة معروفة النتائج",
                    "الحفاظ على الفصل بين المهام وعلى مسار التدقيق",
                    "حماية سرية البيانات المالية",
                ],
                {
                    "controls": ("ضوابط التحقق",
                                 "يضع حدودًا ومراجعة للاستثناءات وموافقة قبل الترحيل.",
                                 "ضوابط الاستثناءات الموافقة المراجعة الحد الفروقات التحقق الترحيل"),
                    "reconciliation_checks": ("اختبار الدقة",
                                              "يختبر على عينة معروفة الإجابات ويتابع معدل الأخطاء والمجاميع.",
                                              "عينة الدقة الأخطاء المجاميع المطابقة اختبار معدل الفروقات"),
                    "segregation_audit": ("الفصل بين المهام ومسار التدقيق",
                                          "يفصل بين الاقتراح والاعتماد ويسجل من غيّر ماذا.",
                                          "الفصل المهام التدقيق السجل مسار الاعتماد المساءلة التتبع"),
                    "data_security": ("سرية البيانات",
                                      "يقيّد البيانات المالية المشاركة مع الأداة ويراجع شروط المورّد.",
                                      "السرية البيانات الأمن المورد الوصول التشفير العقد الصلاحيات"),
                },
            ),
        },
    },
    # ------------------------------------------------------------------ Legal & Compliance
    {
        "slug": "lg-baseline",
        "title": "Baseline: Review an AI-generated contract summary",
        "role": "Legal & Compliance",
        "expected_level": 2,
        "skills": ["llm-limitations", "risk-assessment"],
        "scenario": (
            "A colleague gives you an AI-generated summary of a 45-page supplier agreement and asks for sign-off "
            "by the end of the day. The summary says liability is capped and termination is possible with 30 "
            "days' notice, but it does not cite clauses. Explain how you verify it, which clauses you check first, "
            "and what you do about the confidentiality of the contract."
        ),
        "objectives": [
            "Verify the summary against the source text",
            "Spot missing or misstated clauses",
            "Protect confidential and privileged information",
            "Set a review process with accountability",
        ],
        "rubric": _rub([
            ("verification", "Verification against source", "Checks every claim against the contract text and requires clause references."),
            ("risk_spotting", "Risk spotting", "Prioritises liability, termination, indemnity, jurisdiction and exceptions the summary may omit."),
            ("confidentiality", "Confidentiality", "Considers privilege, client data and the tool's data handling before uploading."),
            ("process", "Review process", "Defines human sign-off, documentation and limits on relying on the summary."),
        ]),
        "i18n": {
            "fr": _loc(
                "Référence : relire un résumé de contrat généré par l'IA",
                "Un collègue vous remet un résumé, généré par une IA, d'un contrat fournisseur de 45 pages et "
                "demande votre validation avant la fin de la journée. Le résumé indique que la responsabilité est "
                "plafonnée et que la résiliation est possible avec un préavis de 30 jours, mais ne cite aucune "
                "clause. Expliquez comment vous le vérifiez, quelles clauses vous contrôlez en premier et comment "
                "vous traitez la confidentialité du contrat.",
                [
                    "Vérifier le résumé par rapport au texte source",
                    "Repérer les clauses omises ou mal restituées",
                    "Protéger les informations confidentielles et privilégiées",
                    "Établir un processus de relecture avec responsabilité",
                ],
                {
                    "verification": ("Vérification par rapport à la source",
                                     "Contrôle chaque affirmation dans le texte du contrat et exige des références de clauses.",
                                     "vérifier clauses source texte contrat références comparer citation relecture"),
                    "risk_spotting": ("Repérage des risques",
                                      "Priorise responsabilité, résiliation, indemnisation, juridiction et exceptions que le résumé peut omettre.",
                                      "responsabilité résiliation indemnisation juridiction plafond exceptions risques omissions"),
                    "confidentiality": ("Confidentialité",
                                        "Examine le secret professionnel, les données clients et le traitement des données par l'outil avant tout envoi.",
                                        "confidentialité confidentiel secret données client outil fournisseur accord protection"),
                    "process": ("Processus de relecture",
                                "Définit la validation humaine, la documentation et les limites de la confiance dans le résumé.",
                                "validation humaine documentation responsabilité processus juriste signature traçabilité"),
                },
            ),
            "ar": _loc(
                "تقييم أساسي: مراجعة ملخص عقد أنتجه الذكاء الاصطناعي",
                "يسلّمك زميل ملخصًا أنتجه الذكاء الاصطناعي لعقد توريد من 45 صفحة، ويطلب موافقتك قبل نهاية اليوم. "
                "يذكر الملخص أن المسؤولية محدودة بسقف وأن الإنهاء ممكن بإشعار مدته 30 يومًا، لكنه لا يشير إلى أي "
                "بند. اشرح كيف تتحقق منه، وأي البنود تفحصها أولًا، وكيف تتعامل مع سرية العقد.",
                [
                    "التحقق من الملخص بمقارنته بالنص الأصلي",
                    "اكتشاف البنود المغفلة أو المنقولة بشكل خاطئ",
                    "حماية المعلومات السرية والمحمية بالامتياز",
                    "وضع عملية مراجعة تحدد المسؤولية",
                ],
                {
                    "verification": ("التحقق من المصدر",
                                     "يفحص كل ادعاء في نص العقد ويشترط الإشارة إلى أرقام البنود.",
                                     "التحقق البنود النص العقد المقارنة الإشارات المصدر المراجعة"),
                    "risk_spotting": ("اكتشاف المخاطر",
                                      "يعطي الأولوية للمسؤولية والإنهاء والتعويض والاختصاص القضائي والاستثناءات التي قد يغفلها الملخص.",
                                      "المسؤولية الإنهاء التعويض الاختصاص السقف الاستثناءات المخاطر الإغفال"),
                    "confidentiality": ("السرية",
                                        "يراعي السرية المهنية وبيانات العملاء ومعالجة الأداة للبيانات قبل رفع العقد.",
                                        "السرية امتياز البيانات العميل الأداة المورد الحماية الاتفاقية"),
                    "process": ("عملية المراجعة",
                                "يحدد الاعتماد البشري والتوثيق وحدود الاعتماد على الملخص.",
                                "الاعتماد بشري التوثيق المسؤولية العملية المحامي التوقيع التتبع"),
                },
            ),
        },
    },
    # ------------------------------------------------------------------ Sales
    {
        "slug": "sa-baseline",
        "title": "Baseline: Plan an AI prospecting email workflow with compliance",
        "role": "Sales & Business Development",
        "expected_level": 2,
        "skills": ["prompt-structured", "risk-assessment"],
        "scenario": (
            "Your team of eight sales reps wants to use an AI assistant to personalise cold emails to about 2,000 "
            "prospects a month in Europe. An early test produced emails that cited a prospect's recent promotion "
            "incorrectly and promised a feature the product lacks. Design the workflow, the guardrails on claims "
            "and personal data, and how you measure whether it works."
        ),
        "objectives": [
            "Design the prospecting and personalisation workflow",
            "Control the quality and truthfulness of personalised content",
            "Respect consent, data protection and anti-spam rules",
            "Define metrics to compare with the current process",
        ],
        "rubric": _rub([
            ("workflow_design", "Workflow design", "Defines inputs, prompt template, rep review and sending steps."),
            ("personalisation_quality", "Personalisation quality", "Checks the accuracy of prospect facts and product claims before sending."),
            ("compliance", "Compliance", "Addresses lawful basis, opt-out, data sources and data minimisation."),
            ("metrics", "Metrics", "Compares reply, meeting and unsubscribe rates against a baseline with a controlled test."),
        ]),
        "i18n": {
            "fr": _loc(
                "Référence : planifier un flux d'e-mails de prospection assisté par l'IA, conforme à la réglementation",
                "Votre équipe de huit commerciaux veut utiliser un assistant IA pour personnaliser des e-mails de "
                "prospection envoyés à environ 2 000 prospects par mois en Europe. Un premier test a produit des "
                "e-mails qui citaient à tort la récente promotion d'un prospect et promettaient une fonctionnalité "
                "absente du produit. Concevez le flux, les garde-fous sur les promesses et les données personnelles, "
                "et la mesure de son efficacité.",
                [
                    "Concevoir le flux de prospection et de personnalisation",
                    "Contrôler la qualité et la véracité des contenus personnalisés",
                    "Respecter le consentement, la protection des données et les règles anti-spam",
                    "Définir des indicateurs de comparaison avec le processus actuel",
                ],
                {
                    "workflow_design": ("Conception du flux",
                                        "Définit les entrées, le modèle de prompt, la relecture par le commercial et l'envoi.",
                                        "flux prompt modèle relecture commercial prospects envoi personnalisation étapes"),
                    "personalisation_quality": ("Qualité de la personnalisation",
                                                "Vérifie l'exactitude des faits sur le prospect et des promesses produit avant envoi.",
                                                "vérifier exactitude faits promesses produit pertinence tonalité prospect"),
                    "compliance": ("Conformité",
                                   "Traite la base légale, le désabonnement, l'origine des données et la minimisation.",
                                   "rgpd consentement désinscription désabonnement données base légale conformité minimisation"),
                    "metrics": ("Indicateurs",
                                "Compare taux de réponse, de rendez-vous et de désabonnement à une référence par un test contrôlé.",
                                "taux réponse réunions conversion indicateurs référence test comparer désabonnement"),
                },
            ),
            "ar": _loc(
                "تقييم أساسي: تخطيط سير عمل رسائل استكشاف العملاء بالذكاء الاصطناعي مع الامتثال",
                "يرغب فريق مبيعات من ثمانية مندوبين في استخدام مساعد ذكاء اصطناعي لتخصيص رسائل بريد إلكتروني "
                "باردة إلى نحو 2000 عميل محتمل شهريًا في أوروبا. أنتج اختبار أولي رسائل ذكرت ترقية حديثة لأحد "
                "العملاء المحتملين بشكل خاطئ ووعدت بميزة غير موجودة في المنتج. صمّم سير العمل والضوابط على "
                "الوعود والبيانات الشخصية، وكيف تقيس فعاليته.",
                [
                    "تصميم سير عمل الاستكشاف والتخصيص",
                    "ضبط جودة المحتوى المخصص وصدقه",
                    "احترام الموافقة وحماية البيانات وقواعد البريد المزعج",
                    "تحديد مؤشرات للمقارنة مع العملية الحالية",
                ],
                {
                    "workflow_design": ("تصميم سير العمل",
                                        "يحدد المدخلات وقالب الطلب ومراجعة المندوب وخطوات الإرسال.",
                                        "العمل قالب مراجعة المندوب الإرسال التخصيص الخطوات العملاء"),
                    "personalisation_quality": ("جودة التخصيص",
                                                "يتحقق من دقة المعلومات عن العميل والوعود المتعلقة بالمنتج قبل الإرسال.",
                                                "التحقق الدقة المعلومات الوعود المنتج الملاءمة النبرة"),
                    "compliance": ("الامتثال",
                                   "يعالج الأساس القانوني وإلغاء الاشتراك ومصدر البيانات وتقليل البيانات.",
                                   "الموافقة إلغاء الاشتراك البيانات القانوني الامتثال الخصوصية المصدر"),
                    "metrics": ("المؤشرات",
                                "يقارن معدلات الرد والاجتماعات وإلغاء الاشتراك بخط أساس عبر اختبار مضبوط.",
                                "معدل الرد الاجتماعات التحويل المؤشرات الأساس اختبار المقارنة"),
                },
            ),
        },
    },
    # ------------------------------------------------------------------ Education & Training
    {
        "slug": "ed-baseline",
        "title": "Baseline: Plan AI-assisted lessons while protecting assessment integrity",
        "role": "Education & Training",
        "expected_level": 2,
        "skills": ["prompt-structured", "llm-limitations"],
        "scenario": (
            "You teach 90 students across three classes of upper-secondary history. You want AI to help prepare "
            "lesson plans and quizzes, but students already use chatbots for take-home essays, and a generated "
            "quiz recently contained a wrong date. Describe how you use AI in preparation, how you check its "
            "output, and how you redesign assessment and handle student data."
        ),
        "objectives": [
            "Use AI to design aligned lesson plans",
            "Verify the accuracy and level of generated materials",
            "Preserve assessment integrity",
            "Protect student privacy and equity of access",
        ],
        "rubric": _rub([
            ("lesson_design", "Lesson design", "Uses a structured prompt tied to learning objectives, level and constraints."),
            ("quality_review", "Quality review", "Checks facts, age-appropriateness and bias in generated materials before use."),
            ("assessment_integrity", "Assessment integrity", "Adapts assessments with oral, in-class or process-based evidence rather than relying on detectors."),
            ("student_privacy", "Privacy and equity", "Avoids entering student data and addresses unequal access to AI tools."),
        ]),
        "i18n": {
            "fr": _loc(
                "Référence : préparer des cours avec l'IA en protégeant l'intégrité des évaluations",
                "Vous enseignez l'histoire à 90 élèves répartis en trois classes de lycée. Vous voulez utiliser l'IA "
                "pour préparer vos séquences et vos quiz, mais les élèves utilisent déjà des agents conversationnels "
                "pour leurs devoirs à la maison, et un quiz généré contenait récemment une date erronée. Décrivez "
                "votre usage de l'IA en préparation, la vérification de ses productions, et comment vous repensez "
                "l'évaluation et traitez les données des élèves.",
                [
                    "Utiliser l'IA pour concevoir des séquences alignées sur les objectifs",
                    "Vérifier l'exactitude et le niveau des supports générés",
                    "Préserver l'intégrité des évaluations",
                    "Protéger la vie privée des élèves et l'égalité d'accès",
                ],
                {
                    "lesson_design": ("Conception de séquence",
                                      "Utilise un prompt structuré lié aux objectifs d'apprentissage, au niveau et aux contraintes.",
                                      "objectifs apprentissage séquence prompt niveau progression compétences consignes"),
                    "quality_review": ("Contrôle de la qualité",
                                       "Vérifie faits, adéquation à l'âge et biais des supports générés avant usage.",
                                       "vérifier exactitude faits sources biais adapté relecture erreurs"),
                    "assessment_integrity": ("Intégrité de l'évaluation",
                                             "Adapte l'évaluation par l'oral, le travail en classe ou le suivi du processus plutôt que les détecteurs.",
                                             "évaluation intégrité oral plagiat classe processus brouillons authenticité tricherie"),
                    "student_privacy": ("Vie privée et équité",
                                        "Évite de saisir des données d'élèves et traite l'inégalité d'accès aux outils.",
                                        "données élèves confidentialité anonymiser équité accès consentement parents"),
                },
            ),
            "ar": _loc(
                "تقييم أساسي: التخطيط للدروس بمساعدة الذكاء الاصطناعي مع حماية نزاهة التقييم",
                "تُدرّس التاريخ لـ 90 طالبًا موزعين على ثلاثة أقسام في المرحلة الثانوية. تريد الاستعانة بالذكاء "
                "الاصطناعي في إعداد خطط الدروس والاختبارات القصيرة، لكن الطلاب يستخدمون روبوتات المحادثة في "
                "المقالات المنزلية، وقد تضمّن اختبار مولَّد مؤخرًا تاريخًا خاطئًا. صِف كيف تستخدم الذكاء الاصطناعي "
                "في التحضير، وكيف تتحقق من مخرجاته، وكيف تعيد تصميم التقييم وتتعامل مع بيانات الطلاب.",
                [
                    "استخدام الذكاء الاصطناعي في تصميم دروس متوافقة مع الأهداف",
                    "التحقق من دقة المواد المولّدة ومناسبة مستواها",
                    "الحفاظ على نزاهة التقييم",
                    "حماية خصوصية الطلاب وتكافؤ فرص الوصول",
                ],
                {
                    "lesson_design": ("تصميم الدرس",
                                      "يستخدم طلبًا منظمًا مرتبطًا بأهداف التعلم والمستوى والقيود.",
                                      "أهداف التعلم الدرس الطلب المستوى الكفايات التدرج التعليمات"),
                    "quality_review": ("مراجعة الجودة",
                                       "يتحقق من الوقائع ومناسبة العمر والتحيز في المواد المولّدة قبل استخدامها.",
                                       "التحقق الدقة الوقائع المصادر التحيز المراجعة الأخطاء مناسب"),
                    "assessment_integrity": ("نزاهة التقييم",
                                             "يكيّف التقييم بالشفهي أو داخل الصف أو تتبع مراحل العمل بدل الاعتماد على كواشف الانتحال.",
                                             "التقييم النزاهة شفهي الانتحال الصف المسودات الأصالة الغش"),
                    "student_privacy": ("الخصوصية والإنصاف",
                                        "يتجنب إدخال بيانات الطلاب ويعالج التفاوت في الوصول إلى الأدوات.",
                                        "بيانات الطلاب الخصوصية الإنصاف الوصول الموافقة الأسر إخفاء"),
                },
            ),
        },
    },
    # ------------------------------------------------------------------ Operations & Project Management
    {
        "slug": "op-baseline",
        "title": "Baseline: Plan the AI automation of a purchase-order process",
        "role": "Operations & Project Management",
        "expected_level": 2,
        "skills": ["opportunity-framing", "cost-modeling", "risk-assessment"],
        "scenario": (
            "Your operations team handles roughly 1,200 supplier invoices and purchase orders a month, mostly by "
            "hand, with an average of two days from receipt to approval. Management asks you to propose using AI "
            "to extract data and route approvals. Present the scope, the KPIs you would track, the main risks, "
            "and a phased rollout."
        ),
        "objectives": [
            "Select and scope the process steps suited to AI",
            "Define KPIs and a baseline",
            "Identify risks and controls",
            "Plan a phased rollout with a fallback",
        ],
        "rubric": _rub([
            ("process_selection", "Process selection", "Maps the current process and picks steps where AI adds value, keeping judgement calls human."),
            ("kpis", "KPIs and baseline", "Defines cycle time, error rate, cost per document and compares to the current baseline."),
            ("risks_controls", "Risks and controls", "Identifies extraction errors, fraud, vendor dependency and sets approval limits and checks."),
            ("rollout", "Rollout plan", "Proposes a pilot, success criteria, change management and a manual fallback."),
        ]),
        "i18n": {
            "fr": _loc(
                "Référence : planifier l'automatisation par l'IA d'un processus de commandes fournisseurs",
                "Votre équipe opérations traite environ 1 200 factures fournisseurs et bons de commande par mois, "
                "surtout à la main, avec en moyenne deux jours entre la réception et l'approbation. La direction "
                "vous demande de proposer l'usage de l'IA pour extraire les données et orienter les approbations. "
                "Présentez le périmètre, les indicateurs suivis, les principaux risques et un déploiement par phases.",
                [
                    "Choisir et cadrer les étapes du processus adaptées à l'IA",
                    "Définir des indicateurs et une situation de référence",
                    "Identifier les risques et les contrôles",
                    "Planifier un déploiement par phases avec solution de repli",
                ],
                {
                    "process_selection": ("Choix du processus",
                                          "Cartographie le processus actuel et retient les étapes où l'IA apporte de la valeur, en gardant le jugement humain.",
                                          "processus étapes périmètre cartographie valeur automatiser jugement volume"),
                    "kpis": ("Indicateurs et référence",
                             "Définit délai de traitement, taux d'erreur, coût par document et compare à la situation actuelle.",
                             "indicateurs délai erreur coût référence mesure objectifs productivité"),
                    "risks_controls": ("Risques et contrôles",
                                       "Identifie erreurs d'extraction, fraude, dépendance au fournisseur et fixe seuils d'approbation et contrôles.",
                                       "risques erreurs fraude contrôles seuils dépendance approbation audit"),
                    "rollout": ("Plan de déploiement",
                                "Propose un pilote, des critères de succès, la conduite du changement et un repli manuel.",
                                "pilote phases déploiement critères changement formation repli équipe"),
                },
            ),
            "ar": _loc(
                "تقييم أساسي: التخطيط لأتمتة عملية أوامر الشراء بالذكاء الاصطناعي",
                "يعالج فريق العمليات لديك نحو 1200 فاتورة مورّدين وأمر شراء شهريًا، معظمها يدويًا، بمتوسط يومين من "
                "الاستلام حتى الاعتماد. تطلب الإدارة منك اقتراح استخدام الذكاء الاصطناعي لاستخراج البيانات وتوجيه "
                "الموافقات. اعرض النطاق والمؤشرات التي ستتابعها وأهم المخاطر وخطة طرح على مراحل.",
                [
                    "اختيار خطوات العملية المناسبة للذكاء الاصطناعي وتحديد نطاقها",
                    "تحديد المؤشرات وخط الأساس",
                    "تحديد المخاطر وضوابطها",
                    "التخطيط لطرح تدريجي مع خطة بديلة",
                ],
                {
                    "process_selection": ("اختيار العملية",
                                          "يرسم العملية الحالية ويختار الخطوات التي يضيف فيها الذكاء الاصطناعي قيمة مع إبقاء الحكم للإنسان.",
                                          "العملية الخطوات النطاق القيمة الأتمتة الحكم الحجم تحليل"),
                    "kpis": ("المؤشرات وخط الأساس",
                             "يحدد زمن المعالجة ومعدل الخطأ وتكلفة المستند ويقارنها بالوضع الحالي.",
                             "المؤشرات الزمن الخطأ التكلفة الأساس القياس الأهداف الإنتاجية"),
                    "risks_controls": ("المخاطر والضوابط",
                                       "يحدد أخطاء الاستخراج والاحتيال والاعتماد على المورّد ويضع حدود اعتماد وفحوصات.",
                                       "المخاطر الأخطاء الاحتيال الضوابط الحدود الاعتماد التدقيق الموافقة"),
                    "rollout": ("خطة الطرح",
                                "يقترح تجربة تجريبية ومعايير نجاح وإدارة التغيير وبديلًا يدويًا.",
                                "تجريبية مراحل الطرح معايير التغيير التدريب البديل الفريق"),
                },
            ),
        },
    },
]
