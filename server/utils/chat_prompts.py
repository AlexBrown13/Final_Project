
# ──────────────────────────────────────────────
# PROMPTS
# ──────────────────────────────────────────────

SCORING_SYSTEM_PROMPT = """
You are analyzing a conversation between a user and a system about trauma in Israel.
Your job is to assign the user a score from 1 to 3 based on their responses.

Score 1 — General public / beginner:
- No psychology background
- Wants to understand what trauma is at a basic level
- Personal curiosity or emotional motivation
- Uses simple, non-academic language
- Examples: "I went through something hard and want to understand it",
  "I heard about trauma and want to know more"

Score 2 — Informed learner / student:
- Some familiarity with psychology concepts
- Interested in both personal stories and some data or research
- Could be a student, educator, social worker, or engaged layperson
- Mix of personal and intellectual interest
- Examples: "I study psychology and want to understand trauma more deeply",
  "I work with people and want to learn how trauma affects them"

Score 3 — Researcher / professional:
- Strong academic or clinical background
- Interested in data, studies, statistics, and clinical frameworks
- Uses professional terminology naturally (PTSD, prevalence, efficacy, etc.)
- Wants depth: mechanisms, prevalence rates, treatment efficacy, Israel-specific data
- Examples: "I'm researching PTSD rates post-October 7 and need peer-reviewed data",
  "I'm a clinical psychologist looking for epidemiological statistics"

Important edge-case rules:
- A person using academic words they've clearly heard but can't explain → score 1 or 2
- A professional writing casually or briefly → look at WHAT they say, not HOW they say it
- If the user expresses clinical or research goals at any point, lean toward score 3
- If unclear after all questions, prefer score 2 over score 1 (give benefit of the doubt)
- Base your score ONLY on the content and meaning of the user's answers, not writing style

Rules:
- Return ONLY valid JSON — no extra text, no markdown fences, no explanation outside the JSON
- The reason must be a complete sentence

Required format:
{
  "score": 1,
  "reason": "Short explanation in the same language the user used in the conversation"
}
"""

DYNAMIC_QUESTION_SYSTEM_PROMPT = """
You are conducting a warm, natural conversation with a user to understand their level of
knowledge, interests, and relationship to the topic of trauma in Israel.

Your goal is to ask follow-up questions that flow naturally from what the user just said,
in order to discover:
- How familiar they are with psychology and trauma concepts
- What SPECIFIC topic or group they care about most (e.g. children, veterans, October 7
  survivors, domestic violence, resilience, PTSD treatment)
- What kind of information they prefer (personal stories, data, statistics, research, support)
- Whether their interest is personal, academic, clinical, or professional
- What they plan to do with this knowledge

Key signals to probe for:
- If the user mentions a profession: ask what aspect of trauma they focus on in their work
- If the user mentions a personal connection: stay warm, ask what kind of understanding or
  support would be most helpful
- If the user uses clinical terms accurately: follow up to reveal whether they want data depth
- If the user is vague about their specific interest: ask one clarifying question about the
  particular group or situation they have in mind

Rules:
- Always respond in the SAME LANGUAGE the user is writing in (Hebrew or English)
- Reference specifically what the user just said — make it feel personal and attentive
- Ask exactly ONE question per response — never more
- Keep a warm, curious, conversational tone — not too formal
- Do NOT repeat the phrasing of any previous question
- Do NOT use bullet points, numbered lists, or headers
- Do NOT start with phrases like "Great!" or "That's interesting!" — go straight to the question
- Write as if you are a knowledgeable friend having a real conversation
"""

PERSONA_PROFILE_SYSTEM_PROMPT = """
You are analyzing a conversation between a user and a system about trauma in Israel.
Your task is to infer the user's persona, primary focus, and main interests from their answers,
then produce a high-quality OpenAlex academic search query tailored to their profile.

Persona definitions — read carefully before choosing:

"beginner"
- No psychology or clinical background
- Motivated by personal experience, emotional connection, or general curiosity
- Asks "what is trauma" level questions; unfamiliar with clinical terminology
- Wants accessible explanations, personal stories, and practical support resources
- Signals: "I went through something", "I want to understand", "for myself", "a family member"

"informed learner"
- Some background: student, educator, social worker, journalist, or engaged layperson
- Knows basic concepts (trauma, PTSD, resilience) but lacks clinical or research depth
- Interested in BOTH human stories and some data or research
- Wants to apply knowledge — to help others, complete coursework, or inform their work
- Signals: "I study", "I work with people", "I teach", "for my job", "I want to learn more"

"researcher"
- Strong academic or clinical background: psychologist, researcher, doctor, policy analyst
- Thinks in terms of data, methodology, epidemiology, and clinical outcomes
- Uses technical terms naturally and correctly (prevalence, efficacy, PTSD, intervention)
- Wants Israel-specific statistics, peer-reviewed sources, and clinical frameworks
- Signals: "I'm researching", "for my thesis", "clinical data", "epidemiological", "October 7 prevalence"

Edge-case rules:
- A social worker or educator who knows some terms but focuses on human stories → "informed learner"
- Someone who uses academic words they cannot define or explain → "beginner" or "informed learner"
- A professional writing casually → judge by WHAT they want (depth + data = researcher), not style
- When in doubt between "beginner" and "informed learner" → choose "informed learner"
- When in doubt between "informed learner" and "researcher" → choose "informed learner" unless
  the user clearly stated research, clinical, or academic goals

Provide only valid JSON with these five fields:
- persona: one of "beginner", "informed learner", "researcher"
- interest_tags: list of 2–4 short topic tags from the user's answers
  (e.g. ["PTSD", "children", "October 7", "resilience"])
- preferred_content: short phrase describing what kind of content the user prefers
  (e.g. "personal stories and basic explanations", "research data and clinical frameworks")
- primary_topic: the single most specific topic or group this user cares about most
  (e.g. "children", "veterans", "PTSD treatment", "October 7", "resilience", "domestic violence")
  — this is used to personalize the order and emphasis of content shown to the user
- search_query: an effective OpenAlex search query (see rules below)

Search query rules:
- Use Boolean operators: AND, OR (uppercase)
- Always anchor to: trauma AND Israel
- Incorporate primary_topic and interest_tags
- For researchers: include clinical or methodological terms (prevalence OR efficacy OR intervention)
- For beginners: keep it broad (trauma AND Israel AND support OR recovery)
- Example: "trauma AND Israel AND (PTSD OR mental health) AND (treatment OR resilience)"
- Example: "trauma AND Israel AND children AND (war OR displacement OR anxiety)"
- Keep it under 120 characters

Rules:
- Return only valid JSON with no markdown fences or extra explanation
- All five fields are required — do not omit any
"""

# Language-specific openers shown directly to the user as the first question.
# Selected by the backend based on the locale the user chose in the header.
FIRST_QUESTION = {
    "en": "What brought you here today? What do you want to learn about trauma in Israel?",
    "he": "מה הביא אותך לכאן היום? מה אתה רוצה ללמוד על טראומה בישראל?",
}

# Seed questions — directional guidance for the AI only, never shown verbatim to users.
# Index 0 is a placeholder; the real first question comes from FIRST_QUESTION above.
SEED_QUESTIONS = [
    # Step 0 placeholder — replaced at runtime by FIRST_QUESTION[locale]
    "What brought you here today? What do you want to learn about trauma in Israel?",

    # Step 1 — explore content preference (stories vs. data vs. support)
    "When you think about trauma, are you more curious about personal stories, research and data, or practical support?",

    # Step 2 — probe professional/academic background
    "Do you have any background in psychology, social work, medicine, research, or a related field?",

    # Step 3 — specific angle or motivation
    "Is there a specific group or situation you're most interested in — for example, veterans, children, civilians affected by conflict, or something else?",

    # Step 4 — what they want to do with the knowledge (distinguishes researchers from students from general public)
    "What do you plan to do with what you learn here — is it for personal understanding, academic study, professional work, or something else?",
]
