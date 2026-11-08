"""fr/ar translations of the base catalog (domains, skills, levels, the 10 base exercises).
Missing entries fall back to English."""


def _k(words: str) -> list[str]:
    return words.split()


def _r(name: str, description: str, words: str) -> dict:
    return {"name": name, "description": description, "keywords": _k(words)}


DOMAINS_I18N: dict[str, dict[str, str]] = {
    "ai-foundations": {"fr": "Fondamentaux de l'IA", "ar": "أساسيات الذكاء الاصطناعي"},
    "prompt-engineering": {"fr": "Ingénierie des prompts", "ar": "هندسة الأوامر (Prompt Engineering)"},
    "context-engineering": {"fr": "Ingénierie du contexte", "ar": "هندسة السياق"},
    "ai-product-discovery": {"fr": "Découverte de produits IA", "ar": "استكشاف المنتجات الذكية"},
    "ai-product-delivery": {"fr": "Livraison de produits IA", "ar": "تسليم المنتجات الذكية"},
    "ai-assisted-development": {"fr": "Développement assisté par l'IA", "ar": "التطوير بمساعدة الذكاء الاصطناعي"},
    "rag": {"fr": "RAG", "ar": "RAG (التوليد المعزز بالاسترجاع)"},
    "agentic-ai": {"fr": "IA agentique", "ar": "الذكاء الاصطناعي الوكيلي"},
    "ai-evaluation": {"fr": "Évaluation de l'IA", "ar": "تقييم الذكاء الاصطناعي"},
    "responsible-ai": {"fr": "IA responsable", "ar": "الذكاء الاصطناعي المسؤول"},
    "ai-economics": {"fr": "Économie de l'IA", "ar": "اقتصاديات الذكاء الاصطناعي"},
}

LEVELS_I18N: dict[str, dict[str, str]] = {
    "fr": {
        "1": "Sait décrire le concept",
        "2": "Applique avec un accompagnement",
        "3": "Applique en autonomie dans des contextes familiers",
        "4": "S'adapte à des contextes nouveaux et enseigne les pièges aux autres",
        "5": "Définit les standards et accompagne les autres",
    },
    "ar": {
        "1": "يستطيع شرح المفهوم",
        "2": "يطبّق بمساعدة وتوجيه",
        "3": "يطبّق باستقلالية في سياقات مألوفة",
        "4": "يتكيّف مع سياقات جديدة ويعلّم الآخرين كيفية تجنّب المزالق",
        "5": "يضع المعايير ويرشد الآخرين",
    },
}


def _s(fr_name, fr_desc, ar_name, ar_desc):
    return {
        "fr": {"name": fr_name, "description": fr_desc, "criteria": [f"Démontre : {fr_desc}"]},
        "ar": {"name": ar_name, "description": ar_desc, "criteria": [f"يُظهر: {ar_desc}"]},
    }


SKILLS_I18N: dict[str, dict[str, dict]] = {
    "ai-concepts": _s(
        "Concepts de l'IA et des LLM",
        "Expliquer le fonctionnement des LLM, ce qu'ils savent faire et ce qu'ils ne savent pas faire.",
        "مفاهيم الذكاء الاصطناعي ونماذج LLM",
        "شرح كيفية عمل نماذج LLM وما تستطيع فعله وما لا تستطيع.",
    ),
    "llm-limitations": _s(
        "Limites et modes de défaillance des LLM",
        "Anticiper les hallucinations, les biais et les dérives dans le travail réel.",
        "حدود نماذج LLM وأنماط إخفاقها",
        "توقّع الهلوسة والتحيّز والانحراف في العمل الفعلي.",
    ),
    "prompt-basics": _s(
        "Fondamentaux du prompt",
        "Rédiger des prompts clairs, orientés objectif et assortis de contraintes.",
        "أساسيات كتابة الأوامر (Prompt)",
        "كتابة أوامر واضحة موجّهة نحو الهدف ومقيّدة بشروط محددة.",
    ),
    "prompt-structured": _s(
        "Prompting structuré",
        "Utiliser rôles, exemples, formats et itérations pour obtenir des résultats fiables.",
        "كتابة الأوامر المنظّمة",
        "استخدام الأدوار والأمثلة والصيغ والتحسين المتكرر للحصول على مخرجات موثوقة.",
    ),
    "context-design": _s(
        "Conception du contexte",
        "Sélectionner, ordonner et budgétiser le contexte pour que les modèles disposent de ce dont ils ont besoin.",
        "تصميم السياق",
        "اختيار السياق وترتيبه وتحديد ميزانيته بحيث يحصل النموذج على ما يحتاجه.",
    ),
    "opportunity-framing": _s(
        "Cadrage des opportunités IA",
        "Identifier où l'IA crée de la valeur pour l'utilisateur et valider le problème.",
        "تأطير فرص الذكاء الاصطناعي",
        "تحديد المواضع التي يخلق فيها الذكاء الاصطناعي قيمة للمستخدم والتحقق من صحة المشكلة.",
    ),
    "ai-prd": _s(
        "Exigences produit pour l'IA",
        "Spécifier le comportement, les seuils de qualité et les solutions de repli des fonctionnalités IA.",
        "متطلبات المنتج للذكاء الاصطناعي",
        "تحديد السلوك ومعايير الجودة والبدائل الاحتياطية لميزات الذكاء الاصطناعي.",
    ),
    "ai-ux-patterns": _s(
        "Modèles UX pour l'IA",
        "Concevoir pour l'incertitude : retour d'information, contrôle, récupération, transparence.",
        "أنماط تجربة المستخدم للذكاء الاصطناعي",
        "التصميم في ظل عدم اليقين: التغذية الراجعة والتحكم والتعافي والشفافية.",
    ),
    "pair-programming": _s(
        "Programmation en binôme avec l'IA",
        "Utiliser efficacement les assistants de code IA, avec des tests et une relecture.",
        "البرمجة الثنائية مع الذكاء الاصطناعي",
        "استخدام مساعدات البرمجة الذكية بفعالية مع الاختبارات والمراجعة.",
    ),
    "ai-code-review": _s(
        "Revue du code généré par l'IA",
        "Repérer les défauts, les failles de sécurité et les hypothèses cachées dans le code généré.",
        "مراجعة الشيفرة المولَّدة بالذكاء الاصطناعي",
        "اكتشاف العيوب والثغرات الأمنية والافتراضات الخفية في الشيفرة المولَّدة.",
    ),
    "rag-fundamentals": _s(
        "Fondamentaux du RAG",
        "Concevoir des pipelines de recherche : découpage, récupération, ancrage, citations.",
        "أساسيات RAG",
        "تصميم مسارات الاسترجاع: تقسيم النصوص والاسترجاع والإسناد إلى المصادر والاستشهاد.",
    ),
    "agent-design": _s(
        "Conception d'agents",
        "Concevoir des agents utilisant des outils, avec des permissions bornées et une supervision.",
        "تصميم الوكلاء الذكيين",
        "تصميم وكلاء يستخدمون الأدوات بصلاحيات محدودة وإشراف بشري.",
    ),
    "eval-design": _s(
        "Conception de l'évaluation",
        "Construire des jeux de test, des métriques et des contrôles de régression pour le comportement de l'IA.",
        "تصميم التقييم",
        "بناء مجموعات اختبار ومقاييس وفحوصات انحدار لسلوك الذكاء الاصطناعي.",
    ),
    "risk-assessment": _s(
        "Évaluation des risques IA",
        "Identifier et atténuer les risques liés à la vie privée, à l'équité et à la sécurité.",
        "تقييم مخاطر الذكاء الاصطناعي",
        "تحديد مخاطر الخصوصية والإنصاف والسلامة والحدّ منها.",
    ),
    "cost-modeling": _s(
        "Modélisation des coûts de l'IA",
        "Estimer les coûts en tokens, en infrastructure et en ressources humaines, ainsi que l'économie unitaire.",
        "نمذجة تكاليف الذكاء الاصطناعي",
        "تقدير تكاليف الرموز (tokens) والبنية التحتية والعنصر البشري واقتصاديات الوحدة.",
    ),
}

_RES = {
    "fr": [{"title": "Grille d'évaluation", "note": "Voir le panneau de la grille"}],
    "ar": [{"title": "سلّم التقييم", "note": "راجع لوحة سلّم التقييم"}],
}


def _e(fr, ar):
    out = {}
    for lang, d in (("fr", fr), ("ar", ar)):
        out[lang] = {**d, "resources": _RES[lang]}
    return out


EXERCISES_I18N: dict[str, dict[str, dict]] = {
    "pm-baseline": _e(
        {
            "title": "Référence : cadrer une fonctionnalité IA pour le tri du support",
            "scenario": "Votre équipe support traite 4 000 tickets par mois. La direction vous demande de proposer une fonctionnalité de tri assisté par l'IA. Rédigez une proposition d'une page couvrant le problème utilisateur, les indicateurs de succès, les risques et une solution de repli lorsque le modèle se trompe.",
            "objectives": ["Cadrer le problème utilisateur", "Définir un succès mesurable", "Identifier les risques propres à l'IA", "Spécifier le comportement de repli"],
            "rubric": {
                "problem": _r("Cadrage du problème", "Le problème utilisateur, la valeur attendue et le besoin du support sont clairement posés.", "problème utilisateur valeur besoin tickets support équipe clients délai"),
                "metrics": _r("Indicateurs de succès", "Des indicateurs mesurables, avec situation de départ et cible.", "indicateurs métriques mesurable cible précision résolution objectif taux référence délai"),
                "risks": _r("Conscience des risques", "Les risques propres à l'IA sont identifiés (erreurs, hallucinations, confidentialité).", "risques risque hallucination hallucinations erreurs erreur confidentialité données mauvaise classification"),
                "fallback": _r("Conception du repli", "Un repli clair : escalade humaine, seuil de confiance, relecture.", "repli escalade humain humaine confiance seuil relecture validation manuel manuelle"),
            },
        },
        {
            "title": "تقييم أساسي: تحديد نطاق ميزة ذكاء اصطناعي لفرز طلبات الدعم",
            "scenario": "يتعامل فريق الدعم لديك مع 4000 تذكرة شهريًا، وتطلب منك الإدارة اقتراح ميزة فرز بمساعدة الذكاء الاصطناعي. اكتب مقترحًا من صفحة واحدة يشمل مشكلة المستخدم ومؤشرات النجاح والمخاطر وحلًّا بديلًا عندما يخطئ النموذج.",
            "objectives": ["تأطير مشكلة المستخدم", "تحديد نجاح قابل للقياس", "تحديد المخاطر الخاصة بالذكاء الاصطناعي", "تحديد سلوك الحل البديل"],
            "rubric": {
                "problem": _r("تأطير المشكلة", "تُعرَض مشكلة المستخدم والقيمة المنتظرة وحاجة فريق الدعم بوضوح.", "مشكلة المشكلة المستخدم المستخدمين قيمة حاجة التذاكر الفرز الدعم العملاء"),
                "metrics": _r("مؤشرات النجاح", "مؤشرات قابلة للقياس مع خط أساس وهدف.", "مؤشرات المؤشرات مقياس قياس الدقة الأساس معدل الحل"),
                "risks": _r("الوعي بالمخاطر", "تحديد المخاطر الخاصة بالذكاء الاصطناعي كالأخطاء والهلوسة والخصوصية.", "مخاطر المخاطر هلوسة الهلوسة أخطاء الأخطاء خصوصية الخصوصية تصنيف تحيز"),
                "fallback": _r("تصميم الحل البديل", "حل بديل واضح: تصعيد بشري وعتبة ثقة ومراجعة.", "بديل البديل تصعيد بشري البشري عتبة مراجعة يدوي تدخل"),
            },
        },
    ),
    "ux-baseline": _e(
        {
            "title": "Référence : concevoir les états d'incertitude d'un assistant IA",
            "scenario": "Vous concevez un assistant de rédaction intégré à un client de messagerie. Le modèle est parfois erroné ou lent. Décrivez les principaux états d'interaction et la manière dont les utilisateurs gardent le contrôle.",
            "objectives": ["Couvrir les états de chargement, d'erreur et de faible confiance", "Donner aux utilisateurs contrôle et possibilité de récupération", "Expliquer comment la sortie de l'IA est rendue transparente"],
            "rubric": {
                "states": _r("États d'incertitude", "Les états de chargement, d'erreur et de faible confiance sont décrits.", "chargement erreur erreurs confiance états incertitude incertain échec indicateur"),
                "control": _r("Contrôle utilisateur", "L'utilisateur peut annuler, modifier, accepter ou rejeter.", "annuler annulation modifier accepter rejeter contrôle contrôler refuser corriger"),
                "transparency": _r("Transparence", "L'origine et la nature du contenu généré sont expliquées.", "transparence transparent expliquer explication source sources indiquer étiquette mention"),
                "recovery": _r("Récupération", "L'utilisateur peut se remettre d'une erreur : nouvel essai, repli, correction manuelle.", "récupération réessayer repli manuelle manuel correction corriger alternative retour"),
            },
        },
        {
            "title": "تقييم أساسي: تصميم حالات عدم اليقين في مساعد ذكاء اصطناعي",
            "scenario": "تصمّم مساعد كتابة داخل تطبيق بريد إلكتروني، والنموذج يخطئ أحيانًا أو يتباطأ. صِف حالات التفاعل الرئيسية وكيف يحتفظ المستخدمون بالتحكم.",
            "objectives": ["تغطية حالات التحميل والخطأ وانخفاض الثقة", "منح المستخدمين التحكم وإمكانية التعافي", "شرح كيفية جعل مخرجات الذكاء الاصطناعي شفافة"],
            "rubric": {
                "states": _r("حالات عدم اليقين", "وصف حالات التحميل والخطأ وانخفاض الثقة.", "تحميل أخطاء الثقة حالات حالة اليقين مؤشر"),
                "control": _r("تحكم المستخدم", "يستطيع المستخدم التراجع والتعديل والقبول والرفض.", "تراجع تعديل قبول تحكم التحكم تجاوز تصحيح إلغاء"),
                "transparency": _r("الشفافية", "توضيح مصدر المحتوى المولَّد وطبيعته.", "شفافية الشفافية توضيح مصدر المصدر المصادر إفصاح"),
                "recovery": _r("التعافي", "قدرة المستخدم على التعافي من الخطأ: إعادة المحاولة أو بديل أو تصحيح يدوي.", "تعافي التعافي إعادة المحاولة بديل يدوي تصحيح استرجاع رجوع"),
            },
        },
    ),
    "dev-baseline": _e(
        {
            "title": "Référence : relire une fonction générée par l'IA",
            "scenario": "Un assistant IA a généré une fonction qui analyse un CSV fourni par l'utilisateur et insère les lignes en base de données par formatage de chaînes. Décrivez les défauts que vous soulèveriez, les tests que vous écririez et la manière de formuler un prompt pour obtenir une correction.",
            "objectives": ["Trouver les défauts de correction et de sécurité", "Proposer des tests", "Rédiger un prompt de suivi efficace"],
            "rubric": {
                "defects": _r("Détection des défauts", "Injection SQL, validation absente, cas limites, requêtes paramétrées.", "injection sécurité validation erreurs erreur limites paramétrées paramétrée requêtes échappement"),
                "tests": _r("Stratégie de test", "Tests unitaires, cas limites, données malformées, couverture.", "tests unitaires unitaire limites malformé malformées couverture fichiers"),
                "prompting": _r("Prompt de suivi", "Prompt précis avec contraintes, contexte et exemple.", "prompt contraintes contrainte contexte précis précise exemple demander consignes"),
                "judgment": _r("Jugement d'ingénieur", "Arbitrages, risques et maintenabilité sont discutés.", "compromis arbitrages relecture risque risques maintenabilité qualité revue jugement"),
            },
        },
        {
            "title": "تقييم أساسي: مراجعة دالة مولَّدة بالذكاء الاصطناعي",
            "scenario": "ولّد مساعد ذكاء اصطناعي دالة تحلّل ملف CSV يقدّمه المستخدم وتُدخل الصفوف في قاعدة بيانات باستخدام تنسيق النصوص. صِف العيوب التي ستثيرها والاختبارات التي ستكتبها وكيف ستصوغ أمرًا (prompt) لطلب الإصلاح.",
            "objectives": ["اكتشاف عيوب الصحة والأمان", "اقتراح الاختبارات", "كتابة أمر متابعة فعّال"],
            "rubric": {
                "defects": _r("اكتشاف العيوب", "حقن SQL وغياب التحقق والحالات الحدّية والاستعلامات المُعامَلة.", "أمان الأمان تحقق التحقق أخطاء الحالات الحدية استعلامات ثغرات"),
                "tests": _r("استراتيجية الاختبار", "اختبارات الوحدة والحالات الحدّية والبيانات المشوهة والتغطية.", "اختبارات الاختبارات وحدة الحدية مشوهة تغطية حالات ملفات"),
                "prompting": _r("أمر المتابعة", "أمر محدد يتضمن قيودًا وسياقًا ومثالًا.", "قيود القيود سياق السياق محدد مثال تعليمات"),
                "judgment": _r("الحكم الهندسي", "مناقشة المفاضلات والمخاطر وقابلية الصيانة.", "مفاضلات مراجعة المراجعة مخاطر المخاطر صيانة الصيانة جودة موازنة"),
            },
        },
    ),
    "prompt-structured-ex": _e(
        {
            "title": "Rédiger un prompt structuré pour des comptes rendus de réunion",
            "scenario": "Rédigez un prompt réutilisable qui transforme des transcriptions brutes de réunion en décisions, responsables et questions ouvertes. Incluez des contraintes de format, un exemple et un plan de test sur trois transcriptions délicates.",
            "objectives": ["Définir le rôle et le format", "Inclure un exemple", "Planifier des tests pour les cas limites"],
            "rubric": {
                "clarity": _r("Clarté et contraintes", "Rôle, format de sortie et consignes clairs.", "rôle format contraintes contrainte sortie clair claires consignes instructions structure"),
                "examples": _r("Exemples", "Un exemple d'entrée et de sortie illustre le résultat attendu.", "exemple exemples entrée sortie illustration modèle échantillon attendu"),
                "testing": _r("Plan de test", "Tests sur les cas limites et itérations d'amélioration.", "tests test limites transcriptions itérer itération évaluer vérifier"),
                "robustness": _r("Robustesse", "Gestion de l'ambiguïté, des informations manquantes et du bruit.", "ambiguïté manquantes manquant bruit bruitées gérer gestion repli incomplet"),
            },
        },
        {
            "title": "صياغة أمر منظَّم لتلخيص الاجتماعات",
            "scenario": "اكتب أمرًا (prompt) قابلًا لإعادة الاستخدام يحوّل محاضر الاجتماعات الخام إلى قرارات ومسؤولين وأسئلة مفتوحة. ضمّنه قيودًا على الصيغة ومثالًا واحدًا وخطة اختبار على ثلاثة محاضر صعبة.",
            "objectives": ["تحديد الدور والصيغة", "تضمين مثال", "التخطيط لاختبار الحالات الحدّية"],
            "rubric": {
                "clarity": _r("الوضوح والقيود", "دور وصيغة مخرجات وتعليمات واضحة.", "الدور صيغة الصيغة قيود القيود مخرجات واضحة تعليمات بنية"),
                "examples": _r("الأمثلة", "مثال للمدخلات والمخرجات يوضح النتيجة المتوقعة.", "مثال أمثلة مدخلات المدخلات مخرجات المخرجات نموذج عينة المتوقعة"),
                "testing": _r("خطة الاختبار", "اختبارات للحالات الحدّية وتحسينات متكررة.", "اختبارات اختبار الحدية محاضر تكرار تحسين تقييم حالات"),
                "robustness": _r("المتانة", "التعامل مع الغموض والمعلومات الناقصة والضوضاء.", "غموض الغموض ناقصة الناقصة ضوضاء تعامل معالجة بديل مكتملة"),
            },
        },
    ),
    "context-budget-ex": _e(
        {
            "title": "Concevoir le contexte d'un bot de questions-réponses sur les politiques RH",
            "scenario": "Concevez ce qui entre dans le contexte du modèle pour un assistant de questions-réponses sur les politiques RH : sources, ordre, budget de tokens et ce que vous excluez. Expliquez comment vous ancrez les réponses et citez les sources.",
            "objectives": ["Sélectionner et ordonner le contexte", "Budgétiser les tokens", "Ancrer et citer les réponses"],
            "rubric": {
                "selection": _r("Sélection du contexte", "Choix de sources pertinentes et de passages récupérés.", "contexte sources source pertinent pertinents récupération sélection passages extraits documents"),
                "budget": _r("Budget de tokens", "Limite de la fenêtre, priorisation et troncature.", "tokens budget limite troncature priorité fenêtre priorisation taille contexte"),
                "grounding": _r("Ancrage et citation", "Réponses ancrées dans les sources, citées et vérifiables.", "ancrage ancrer citation citer source sources vérifier réponse référence"),
                "exclusion": _r("Exclusions", "Contenus exclus : non pertinents, sensibles, obsolètes, bruités.", "exclure exclusion exclus pertinent sensibles sensible obsolète obsolètes bruit confidentiel"),
            },
        },
        {
            "title": "تصميم سياق روبوت أسئلة وأجوبة عن سياسات الموارد البشرية",
            "scenario": "صمّم ما يدخل في سياق النموذج لمساعد يجيب عن أسئلة سياسات الموارد البشرية: المصادر والترتيب وميزانية الرموز (tokens) وما تستبعده. اشرح كيف تُسنِد الإجابات إلى مصادرها وتستشهد بها.",
            "objectives": ["اختيار السياق وترتيبه", "تحديد ميزانية الرموز", "إسناد الإجابات إلى المصادر والاستشهاد بها"],
            "rubric": {
                "selection": _r("اختيار السياق", "اختيار مصادر ومقاطع ذات صلة.", "سياق السياق مصادر المصادر مصدر استرجاع اختيار مقاطع وثائق"),
                "budget": _r("ميزانية الرموز", "حدّ النافذة والأولويات والاقتطاع.", "رموز الرموز ميزانية الحد اقتطاع أولوية الأولوية نافذة"),
                "grounding": _r("الإسناد والاستشهاد", "إجابات مسندة إلى المصادر ومستشهَد بها وقابلة للتحقق.", "إسناد الإسناد استشهاد الاستشهاد مصدر المصادر تحقق الإجابة مرجع"),
                "exclusion": _r("الاستبعادات", "استبعاد المحتوى غير ذي الصلة والحساس والقديم والمشوَّش.", "استبعاد حساسة الحساسة قديمة القديمة ضوضاء سرية"),
            },
        },
    ),
    "eval-set-ex": _e(
        {
            "title": "Construire un jeu d'évaluation pour un classifieur",
            "scenario": "Votre équipe livre un classifieur de tickets basé sur un LLM. Concevez un jeu d'évaluation et des métriques, en précisant comment vous détectez les régressions avant chaque mise en production.",
            "objectives": ["Concevoir des cas de test représentatifs", "Choisir des métriques", "Définir un seuil de régression bloquant"],
            "rubric": {
                "coverage": _r("Couverture des tests", "Cas représentatifs, cas limites et toutes les catégories.", "test tests représentatifs représentatif limites couverture catégories exemples"),
                "metrics": _r("Métriques", "Précision, rappel, exactitude et seuils.", "précision rappel exactitude métriques métrique seuil seuils score mesure"),
                "regression": _r("Seuil de régression", "Comparaison à une référence avant mise en production, en CI.", "régression régressions mise production référence comparer comparaison seuil bloquant"),
                "bias": _r("Biais et dérive", "Surveillance des biais, de la dérive et de la distribution des étiquettes.", "biais dérive surveillance monitoring distribution étiquettes étiquette suivi dérives"),
            },
        },
        {
            "title": "بناء مجموعة تقييم لمصنِّف",
            "scenario": "يُطلق فريقك مصنِّفًا للتذاكر قائمًا على LLM. صمّم مجموعة تقييم ومقاييس، مع بيان كيف تكتشف حالات الانحدار قبل كل إصدار.",
            "objectives": ["تصميم حالات اختبار تمثيلية", "اختيار المقاييس", "تحديد بوابة للانحدار"],
            "rubric": {
                "coverage": _r("تغطية الاختبار", "حالات تمثيلية وحدّية تشمل جميع الفئات.", "حالات اختبار الاختبار تمثيلية الحدية تغطية فئات الفئات أمثلة"),
                "metrics": _r("المقاييس", "الدقة والاستدعاء والصحة والعتبات.", "الدقة استدعاء مقاييس المقاييس عتبة العتبات معيار نتيجة"),
                "regression": _r("بوابة الانحدار", "مقارنة بخط أساس قبل الإصدار ضمن خط التكامل المستمر.", "انحدار الانحدار إصدار الإصدار أساس مقارنة بوابة التكامل"),
                "bias": _r("التحيز والانحراف", "مراقبة التحيز والانحراف وتوزيع التصنيفات.", "تحيز التحيز انحراف الانحراف مراقبة توزيع التصنيفات تصنيفات متابعة"),
            },
        },
    ),
    "risk-review-ex": _e(
        {
            "title": "Mener une revue des risques pour un outil IA de présélection de CV",
            "scenario": "Un fournisseur propose un outil IA de présélection de CV. Menez une revue de risques allégée : vie privée, équité, transparence, supervision humaine, puis votre recommandation go/no-go.",
            "objectives": ["Identifier les risques", "Proposer des mesures d'atténuation", "Formuler une recommandation"],
            "rubric": {
                "risks": _r("Identification des risques", "Vie privée, équité, biais, discrimination, transparence.", "confidentialité équité biais discrimination transparence risques risque candidats données"),
                "mitigation": _r("Mesures d'atténuation", "Supervision, audit, consentement et suivi.", "atténuation atténuer supervision audit consentement surveillance contrôle humain mesures"),
                "decision": _r("Qualité de la décision", "Recommandation claire, conditions et critères go/no-go.", "recommandation conditions condition critères critère décision refus accord"),
                "legal": _r("Conscience réglementaire", "RGPD, réglementation européenne, conformité et droits des personnes.", "rgpd règlement réglementation conformité européen droits droit personnes législation"),
            },
        },
        {
            "title": "إجراء مراجعة مخاطر لأداة ذكاء اصطناعي لفرز السير الذاتية",
            "scenario": "يقترح مورّد أداة ذكاء اصطناعي لفرز السير الذاتية. أجرِ مراجعة مخاطر مبسّطة تشمل الخصوصية والإنصاف والشفافية والإشراف البشري، ثم قدّم توصيتك بالموافقة أو الرفض.",
            "objectives": ["تحديد المخاطر", "اقتراح إجراءات التخفيف", "تقديم توصية"],
            "rubric": {
                "risks": _r("تحديد المخاطر", "الخصوصية والإنصاف والتحيز والتمييز والشفافية.", "خصوصية الخصوصية إنصاف تحيز التحيز تمييز شفافية مخاطر المخاطر مرشحين"),
                "mitigation": _r("إجراءات التخفيف", "الإشراف والتدقيق والموافقة والمتابعة.", "تخفيف إشراف الإشراف تدقيق موافقة مراقبة رقابة بشري إجراءات"),
                "decision": _r("جودة القرار", "توصية واضحة وشروط ومعايير للقبول أو الرفض.", "توصية شروط الشروط معايير قرار القرار قبول موافقة"),
                "legal": _r("الوعي التنظيمي", "اللائحة الأوروبية GDPR والامتثال وحقوق الأفراد.", "لائحة اللائحة امتثال الامتثال أوروبي حقوق الحقوق تشريعات قانون الأفراد"),
            },
        },
    ),
    "cost-model-ex": _e(
        {
            "title": "Modéliser l'économie unitaire d'une fonctionnalité IA",
            "scenario": "Estimez le coût mensuel d'une fonctionnalité de synthèse par IA pour 20 000 utilisateurs réalisant en moyenne 15 synthèses par mois. Incluez les hypothèses de tokens, l'infrastructure, la relecture humaine et les leviers de réduction des coûts.",
            "objectives": ["Énoncer les hypothèses", "Calculer les coûts", "Proposer des leviers de réduction"],
            "rubric": {
                "assumptions": _r("Hypothèses", "Hypothèses explicites : tokens, volume, moyennes, utilisateurs.", "hypothèses hypothèse tokens volume moyenne moyen utilisateurs entrée sortie"),
                "calc": _r("Calcul", "Calcul du coût : prix par million de tokens, total mensuel.", "calcul coût coûts prix million mensuel total tarif euros"),
                "levers": _r("Leviers de coût", "Cache, modèle plus petit, traitement par lots, routage.", "cache caching modèle petit lots routage leviers levier réduire optimiser"),
                "sensitivity": _r("Sensibilité", "Scénarios, plages de valeurs, meilleur et pire cas.", "sensibilité scénario scénarios risque plage fourchette optimiste pessimiste variation"),
            },
        },
        {
            "title": "نمذجة اقتصاديات الوحدة لميزة ذكاء اصطناعي",
            "scenario": "قدّر التكلفة الشهرية لميزة تلخيص بالذكاء الاصطناعي لـ 20,000 مستخدم بمعدل 15 تلخيصًا شهريًا لكل مستخدم. ضمّن افتراضات الرموز (tokens) والبنية التحتية والمراجعة البشرية وسبل خفض التكلفة.",
            "objectives": ["توضيح الافتراضات", "حساب التكاليف", "اقتراح سبل خفض التكلفة"],
            "rubric": {
                "assumptions": _r("الافتراضات", "افتراضات صريحة: الرموز والحجم والمتوسطات والمستخدمون.", "افتراضات الافتراضات رموز الرموز متوسط المتوسط مستخدمين المستخدمين"),
                "calc": _r("الحساب", "حساب التكلفة: السعر لكل مليون رمز والإجمالي الشهري.", "حساب الحساب تكلفة التكلفة التكاليف مليون شهري إجمالي الإجمالي"),
                "levers": _r("سبل خفض التكلفة", "التخزين المؤقت ونموذج أصغر والمعالجة بالدفعات والتوجيه.", "تخزين مؤقت أصغر دفعات توجيه تقليل تحسين"),
                "sensitivity": _r("الحساسية", "سيناريوهات ونطاقات قيم وأفضل وأسوأ حالة.", "حساسية سيناريو سيناريوهات نطاق أفضل أسوأ تفاؤلي تشاؤمي تباين"),
            },
        },
    ),
    "ux-trust-ex": _e(
        {
            "title": "Concevoir un modèle de confiance pour les recommandations IA",
            "scenario": "Concevez la manière dont un moteur de recommandation d'une application bancaire explique pourquoi il suggère quelque chose et permet à l'utilisateur de le corriger. Décrivez les parcours, les microtextes et les indicateurs.",
            "objectives": ["Expliquer les recommandations", "Permettre la correction", "Définir des indicateurs UX"],
            "rubric": {
                "explain": _r("Explication", "Explication claire de la raison d'une recommandation.", "expliquer explication raison pourquoi recommandation recommandations transparent justification"),
                "correction": _r("Parcours de correction", "Retour utilisateur, correction, rejet, annulation.", "retour corriger correction rejeter ignorer annuler contrôle signaler modifier"),
                "copy": _r("Microtexte", "Ton, langage et formulations claires.", "microtexte langage formulation clair clairs libellé message mots"),
                "metrics": _r("Indicateurs UX", "Confiance, taux d'acceptation, satisfaction et mesure.", "indicateurs confiance acceptation satisfaction mesurer mesure taux métriques"),
            },
        },
        {
            "title": "تصميم نمط للثقة في توصيات الذكاء الاصطناعي",
            "scenario": "صمّم كيف يعرض محرّك توصيات في تطبيق مصرفي سبب اقتراحه لأمرٍ ما ويتيح للمستخدم تصحيحه. صِف المسارات والنصوص المصغّرة والمؤشرات.",
            "objectives": ["شرح التوصيات", "إتاحة التصحيح", "تحديد مؤشرات تجربة المستخدم"],
            "rubric": {
                "explain": _r("الشرح", "شرح واضح لسبب التوصية.", "اشرح لماذا توصية التوصية التوصيات شفاف تبرير"),
                "correction": _r("مسار التصحيح", "ملاحظات المستخدم والتصحيح والرفض والتراجع.", "ملاحظات تصحيح تجاهل تراجع تحكم إبلاغ تعديل"),
                "copy": _r("النصوص المصغّرة", "نبرة ولغة وصياغة واضحة.", "نصوص المصغرة نبرة صياغة واضحة عبارات رسالة كلمات"),
                "metrics": _r("مؤشرات تجربة المستخدم", "الثقة ومعدل القبول والرضا والقياس.", "مؤشرات الثقة قبول القبول الرضا قياس معدل مقاييس"),
            },
        },
    ),
    "agent-guardrails-ex": _e(
        {
            "title": "Spécifier les garde-fous d'un agent utilisant des outils",
            "scenario": "Un agent peut lire des tickets, interroger une base de données et émettre des remboursements jusqu'à 50 EUR. Spécifiez ses outils, ses permissions, ses points d'approbation humaine, sa journalisation et sa gestion des défaillances.",
            "objectives": ["Borner les permissions des outils", "Définir des points d'approbation", "Planifier l'observabilité et la gestion des défaillances"],
            "rubric": {
                "permissions": _r("Périmètre des permissions", "Moindre privilège, outils autorisés et limites.", "permissions permission privilège moindre outils périmètre limites limite accès"),
                "approval": _r("Approbation humaine", "Validation humaine au-delà d'un seuil, avec escalade.", "approbation humaine humain validation seuil escalade boucle intervention accord"),
                "observability": _r("Observabilité", "Journalisation, audit, traçabilité, supervision et alertes.", "journalisation journaux audit traçabilité trace supervision surveillance alerte alertes"),
                "failure": _r("Gestion des défaillances", "Délai d'attente, nouvelle tentative, annulation et état sûr.", "défaillance échec délai tentative réessai annulation sécurisé panne reprise"),
            },
        },
        {
            "title": "تحديد ضوابط الحماية لوكيل يستخدم الأدوات",
            "scenario": "يستطيع وكيل قراءة التذاكر والاستعلام من قاعدة بيانات وإصدار مبالغ مستردة حتى 50 يورو. حدّد أدواته وصلاحياته ونقاط الموافقة البشرية والتسجيل وآلية التعامل مع الأعطال.",
            "objectives": ["تقييد صلاحيات الأدوات", "تحديد بوابات الموافقة", "التخطيط للمراقبة والتعامل مع الأعطال"],
            "rubric": {
                "permissions": _r("نطاق الصلاحيات", "أقل صلاحية ممكنة والأدوات المسموحة والحدود.", "صلاحيات الصلاحيات صلاحية الأدوات أدوات نطاق حدود الحدود وصول"),
                "approval": _r("الموافقة البشرية", "موافقة بشرية عند تجاوز عتبة مع تصعيد.", "موافقة الموافقة بشرية البشرية عتبة تصعيد تدخل اعتماد مراجعة"),
                "observability": _r("المراقبة", "التسجيل والتدقيق والتتبع والمراقبة والتنبيهات.", "تسجيل سجلات تدقيق تتبع مراقبة تنبيه تنبيهات"),
                "failure": _r("التعامل مع الأعطال", "مهلة انتهاء وإعادة محاولة وتراجع وحالة آمنة.", "أعطال مهلة محاولة إعادة تراجع آمنة استرجاع تعطل"),
            },
        },
    ),
}
