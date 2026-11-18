"""GenAI consultation service for AeroShield AI.

Provides conversational smog mitigation advice via Google Gemini 1.5 Flash
with automatic zero-downtime deterministic fallback if the API is unavailable.
"""

from typing import List, Tuple, Callable
import google.generativeai as genai

from app.config import GEMINI_API_KEY
from app.schemas import ChatRequest, ChatResponse


def _build_deterministic_advisor_reply(
    request: ChatRequest,
) -> Tuple[str, List[str], str]:
    """Generates an expert, domain-grounded response when GenAI API is offline.

    Args:
        request: The user's query and environmental context.

    Returns:
        Tuple containing (reply_text, suggested_quick_chips, actionable_takeaway).
    """
    msg_lower = request.message.lower()

    if (
        "corsi" in msg_lower
        or "box" in msg_lower
        or "filter" in msg_lower
        or "diy" in msg_lower
    ):
        reply = (
            "To build an ultra-effective DIY Corsi-Rosenthal box for under $35:\n"
            "1. Assemble four 20x20-inch MERV-13 furnace filters into a square cube (arrows pointing inward).\n"
            "2. Tape bottom with cardboard to make an airtight base.\n"
            "3. Place a standard 20-inch box fan on top, blowing upward.\n"
            "4. Seal all perimeter seams thoroughly with duct tape.\n\n"
            "This configuration provides a CADR of ~220 CFM for PM2.5, matching or outperforming $300 commercial HEPA units."
        )
        chips = [
            "How often should I change DIY filters?",
            "Can I use a single-filter fan setup?",
            "Is MERV-11 sufficient instead of MERV-13?",
        ]
        takeaway = "Build a 4-filter Corsi-Rosenthal cube using MERV-13 filters for maximum particle capture."

    elif "ventilate" in msg_lower or "window" in msg_lower or "air out" in msg_lower:
        reply = (
            f"Under current ambient conditions (AQI {request.current_aqi}), outdoor air is hazardous to inhale directly.\n"
            "In winter, thermal inversions trap ground pollutants tightest in early morning (06:00-10:00) and evening (18:00+).\n"
            "• Keep all windows sealed shut during inversion peaks.\n"
            "• If ventilation is mandatory, restrict it to a 10-minute flush between 13:00 and 15:00 when solar convection breaks the inversion.\n"
            "• Always run indoor air filtration on high immediately after re-closing windows."
        )
        chips = [
            "How to create a positive pressure clean room?",
            "What weather signs indicate the inversion is breaking?",
            "How to test indoor air without expensive sensors?",
        ]
        takeaway = "Seal all windows during morning and evening inversions; only ventilate briefly around 13:00-15:00."

    elif (
        "child" in msg_lower
        or "kid" in msg_lower
        or "school" in msg_lower
        or "baby" in msg_lower
    ):
        reply = (
            "Children's respiratory defenses are still developing, and they inhale up to 50% more air per pound of body weight:\n"
            "1. School Commute: Provide snug, well-fitted KF94 or KN95 child-size masks.\n"
            "2. Physical Education: Outdoor sports should be moved indoors whenever AQI exceeds 150.\n"
            "3. Carpooling: Group kids into electric or hybrid carpools, and strictly enforce engine shut-off (no idling) during pickup."
        )
        chips = [
            "What mask types work best for toddlers?",
            "How to advocate for clean air zones around schools?",
            "Safe indoor active games during severe smog days?",
        ]
        takeaway = "Enforce child-sized KF94/KN95 masks and relocate all exercise to filtered indoor spaces."

    elif (
        "exercise" in msg_lower
        or "run" in msg_lower
        or "walk" in msg_lower
        or "jog" in msg_lower
    ):
        reply = (
            f"With current AQI at {request.current_aqi}, heavy outdoor cardio causes deep pulmonary alveolar deposition of fine particles:\n"
            "• Cancel outdoor jogs, cycling, or bootcamp workouts.\n"
            "• Exercise indoors with a functioning Corsi-Rosenthal or HEPA purifier running.\n"
            "• If you must commute on foot, maintain a gentle walking pace and wear a sealed N95 respirator."
        )
        chips = [
            "Indoor cardio alternatives during pollution waves?",
            "Does wearing an N95 while jogging protect lungs?",
            "How long do inhaled particulates stay in lungs?",
        ]
        takeaway = "Move all cardiovascular exercise indoors into a filtered room."

    else:
        reply = (
            f"Regarding your query on '{request.message}' for a household facing AQI {request.current_aqi}:\n"
            "1. Prioritize source control: Avoid burning candles, incense, or biomass indoors, and always use exhaust hoods when cooking.\n"
            "2. Enforce active room filtration in bedrooms and main living spaces.\n"
            "3. Consolidate outdoor vehicle trips into clean off-peak transit windows to cut community emissions.\n"
            "4. Stay hydrated and use saline nasal sprays to protect mucous membranes."
        )
        chips = [
            "How to build a Corsi-Rosenthal box under $35?",
            "When is the safest time to ventilate today?",
            "Low-emission heating alternatives for winter?",
        ]
        takeaway = "Maintain indoor air filtration and eliminate indoor particle sources like cooking smoke and candles."

    return reply, chips, takeaway


async def generate_ai_chat_response(request: ChatRequest) -> ChatResponse:
    """Generates an intelligent conversational advisory using Gemini or resilient fallback.

    Args:
        request: Validated chat input.

    Returns:
        Structured ChatResponse contract with response text and suggested chips.
    """
    # Resilient fallback path if no API key is provided
    if not GEMINI_API_KEY:
        reply, chips, takeaway = _build_deterministic_advisor_reply(request)
        return ChatResponse(
            reply=reply,
            suggested_quick_chips=chips,
            actionable_takeaway=takeaway,
        )

    try:
        configure_fn: Callable[..., None] | None = getattr(genai, "configure", None)
        model_cls: Callable[..., object] | None = getattr(
            genai, "GenerativeModel", None
        )

        if not callable(configure_fn) or not callable(model_cls):
            reply, chips, takeaway = _build_deterministic_advisor_reply(request)
            return ChatResponse(
                reply=reply,
                suggested_quick_chips=chips,
                actionable_takeaway=takeaway,
            )

        configure_fn(api_key=GEMINI_API_KEY)
        model_instance = model_cls("gemini-1.5-flash")

        system_prompt = (
            "You are AeroShield AI, an expert environmental scientist and public health consultant "
            "specializing in severe winter smog, thermal air inversions, indoor air quality (IAQ), "
            "and sustainable community low-emission routines.\n"
            f"Current Ambient AQI: {request.current_aqi}\n"
            f"Target Vulnerability: {request.vulnerability.value}\n"
            "Provide direct, highly actionable, scientifically accurate advice. "
            "Explain the direct health and emissions impact of choices. Keep the answer concise (2-4 paragraphs max)."
        )

        full_prompt = f"{system_prompt}\n\nUser Question: {request.message}"
        generate_fn = getattr(model_instance, "generate_content_async", None)

        if callable(generate_fn):
            response = await generate_fn(full_prompt)
            reply_text = (
                str(getattr(response, "text", ""))
                or "Air quality guidelines recommend indoor air filtration."
            )
            _, fallback_chips, takeaway = _build_deterministic_advisor_reply(request)

            return ChatResponse(
                reply=reply_text,
                suggested_quick_chips=fallback_chips,
                actionable_takeaway=takeaway,
            )

        reply, chips, takeaway = _build_deterministic_advisor_reply(request)
        return ChatResponse(
            reply=reply,
            suggested_quick_chips=chips,
            actionable_takeaway=takeaway,
        )
    except Exception:
        # Seamless zero-downtime fallback in case of rate limits or connectivity issues
        reply, chips, takeaway = _build_deterministic_advisor_reply(request)
        return ChatResponse(
            reply=reply,
            suggested_quick_chips=chips,
            actionable_takeaway=takeaway,
        )
