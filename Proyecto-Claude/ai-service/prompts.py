"""
Prompt templates for quote generation.
"""

TONE_DESCRIPTIONS = {
    "formal": "Use formal language, avoid contractions, maintain professional distance",
    "professional": "Use professional but approachable language, balance formality with warmth",
    "friendly": "Use warm, approachable language while maintaining professionalism",
    "technical": "Include technical details and terminology appropriate for tech-savvy clients",
    "concise": "Be brief and to the point, focus on essential information",
    "detailed": "Provide comprehensive explanations and thorough descriptions",
}

LANGUAGE_INSTRUCTIONS = {
    "es": "Responde ÚNICAMENTE en español. Todo el contenido debe estar en español.",
    "en": "Respond ONLY in English. All content must be in English.",
    "ca": "Respon ÚNICAMENT en català. Tot el contingut ha d'estar en català.",
}


def get_system_prompt(language: str, tone: str, technical_depth: int) -> str:
    """Generate the system prompt based on parameters."""

    tone_desc = TONE_DESCRIPTIONS.get(tone, TONE_DESCRIPTIONS["professional"])
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["es"])

    depth_instruction = ""
    if technical_depth <= 3:
        depth_instruction = "Keep technical details minimal. Focus on business outcomes and benefits."
    elif technical_depth <= 6:
        depth_instruction = "Balance technical details with business value. Include some methodology mentions."
    else:
        depth_instruction = "Include detailed technical specifications, methodologies, and implementation details."

    return f"""You are an expert business consultant specializing in creating professional quotes and proposals for technology consulting services.

Your task is to generate a professional quote/proposal content based on the provided project and service information.

{lang_instruction}

TONE: {tone_desc}

TECHNICAL DEPTH: {depth_instruction}

You must respond with a valid JSON object with the following structure:
{{
    "introduction": "A compelling introduction paragraph that addresses the client's needs",
    "services": [
        {{
            "name": "Service name",
            "description": "Detailed description of what this service includes",
            "hours": <number of hours>,
            "hourly_rate": <rate per hour>,
            "amount": <total amount for this service>
        }}
    ],
    "timeline": "Estimated timeline for project completion",
    "payment_terms": "Payment terms and conditions",
    "conclusion": "A professional closing statement"
}}

IMPORTANT:
- The services array MUST contain exactly the same services provided in the input, with the same hours and rates
- Calculate the amount for each service as hours * hourly_rate
- The introduction should be personalized for the client and project
- The timeline should be realistic based on the total hours
- Payment terms should be professional (e.g., 50% upfront, 50% on completion)
- Keep the conclusion brief but compelling

Respond ONLY with the JSON object, no additional text or markdown formatting."""


def get_user_prompt(
    client_name: str,
    project_name: str,
    project_description: str | None,
    services: list[dict],
    custom_instructions: str | None
) -> str:
    """Generate the user prompt with project details."""

    services_text = "\n".join([
        f"- {s['name']}: {s['description']} ({s['estimated_hours']} hours at {s['hourly_rate']}€/hour)"
        for s in services
    ])

    total_hours = sum(s['estimated_hours'] for s in services)
    total_amount = sum(s['estimated_hours'] * s['hourly_rate'] for s in services)

    prompt = f"""Generate a professional quote for the following:

CLIENT: {client_name}
PROJECT: {project_name}
{f'DESCRIPTION: {project_description}' if project_description else ''}

SERVICES TO INCLUDE:
{services_text}

TOTALS:
- Total Hours: {total_hours}
- Total Amount: {total_amount}€ (before tax)

{f'ADDITIONAL INSTRUCTIONS: {custom_instructions}' if custom_instructions else ''}

Generate the quote content now as a JSON object."""

    return prompt
