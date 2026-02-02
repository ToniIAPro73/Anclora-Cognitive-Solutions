from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Language(str, Enum):
    ES = "es"
    EN = "en"
    CA = "ca"


class Tone(str, Enum):
    FORMAL = "formal"
    PROFESSIONAL = "professional"
    FRIENDLY = "friendly"
    TECHNICAL = "technical"
    CONCISE = "concise"
    DETAILED = "detailed"


class ServiceInput(BaseModel):
    name: str = Field(..., description="Service name")
    description: str = Field(..., description="Service description")
    estimated_hours: int = Field(..., description="Estimated hours", ge=1)
    hourly_rate: float = Field(..., description="Hourly rate in EUR", ge=0)


class QuoteRequest(BaseModel):
    client_name: str = Field(..., description="Client company name")
    project_name: str = Field(..., description="Project name")
    project_description: Optional[str] = Field(None, description="Project description")
    services: list[ServiceInput] = Field(..., description="List of services")
    language: Language = Field(Language.ES, description="Output language")
    tone: Tone = Field(Tone.PROFESSIONAL, description="Tone of the quote")
    technical_depth: int = Field(5, description="Technical depth 1-10", ge=1, le=10)
    custom_instructions: Optional[str] = Field(None, description="Additional instructions")


class QuoteService(BaseModel):
    name: str
    description: str
    hours: int
    hourly_rate: float
    amount: float


class QuoteContent(BaseModel):
    introduction: str
    services: list[QuoteService]
    timeline: str
    payment_terms: str
    conclusion: str


class QuoteResponse(BaseModel):
    success: bool
    content: Optional[QuoteContent] = None
    error: Optional[str] = None
    raw_response: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    ollama_available: bool
    model: str
