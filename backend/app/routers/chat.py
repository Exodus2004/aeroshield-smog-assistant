"""Conversational advisor router for interactive smog inquiries."""

from fastapi import APIRouter, status
from app.schemas import ChatRequest, ChatResponse
from app.services.gemini_service import generate_ai_chat_response

router = APIRouter(tags=["AI Consultation"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Interactive AI clean air consultation",
)
async def chat_consultation(request: ChatRequest) -> ChatResponse:
    """Provides conversational recommendations and quick-prompt chips.

    Args:
        request: Validated user message and environmental parameters.

    Returns:
        ChatResponse with advice, quick chips, and immediate takeaway.
    """
    return await generate_ai_chat_response(request)
