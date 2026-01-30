"""
AI Service for Quote Generation using Ollama/Llama
"""

import os
import json
import re
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import (
    QuoteRequest,
    QuoteResponse,
    QuoteContent,
    QuoteService,
    HealthResponse,
)
from prompts import get_system_prompt, get_user_prompt

# Load environment variables
load_dotenv()

# Configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "60"))

# Global HTTP client
http_client: httpx.AsyncClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan."""
    global http_client
    http_client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT)
    yield
    await http_client.aclose()


# Initialize FastAPI app
app = FastAPI(
    title="Anclora AI Service",
    description="AI-powered quote generation service using Ollama/Llama",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


async def check_ollama_available() -> bool:
    """Check if Ollama is available."""
    try:
        response = await http_client.get(f"{OLLAMA_URL}/api/tags")
        return response.status_code == 200
    except Exception:
        return False


async def generate_with_ollama(system_prompt: str, user_prompt: str) -> str:
    """Generate text using Ollama API."""
    try:
        response = await http_client.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": user_prompt,
                "system": system_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 2048,
                },
            },
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Ollama returned status {response.status_code}"
            )

        result = response.json()
        return result.get("response", "")

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Request to Ollama timed out. Try again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error communicating with Ollama: {str(e)}"
        )


def extract_json_from_response(response: str) -> dict:
    """Extract JSON object from LLM response."""
    # Try to find JSON in the response
    # First, try direct parsing
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        pass

    # Try to find JSON within markdown code blocks
    code_block_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response)
    if code_block_match:
        try:
            return json.loads(code_block_match.group(1))
        except json.JSONDecodeError:
            pass

    # Try to find JSON object pattern
    json_match = re.search(r'\{[\s\S]*\}', response)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    raise ValueError("Could not extract valid JSON from response")


def validate_and_fix_services(
    generated_services: list[dict],
    input_services: list[dict]
) -> list[QuoteService]:
    """Validate and fix services to match input data."""
    result = []

    for i, input_svc in enumerate(input_services):
        # Find matching generated service or use input
        gen_svc = generated_services[i] if i < len(generated_services) else {}

        # Use generated description if available, otherwise create one
        description = gen_svc.get("description", input_svc["description"])

        # Always use input values for numerical data
        hours = input_svc["estimated_hours"]
        hourly_rate = input_svc["hourly_rate"]
        amount = hours * hourly_rate

        result.append(QuoteService(
            name=input_svc["name"],
            description=description,
            hours=hours,
            hourly_rate=hourly_rate,
            amount=amount,
        ))

    return result


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    ollama_available = await check_ollama_available()
    return HealthResponse(
        status="healthy" if ollama_available else "degraded",
        ollama_available=ollama_available,
        model=OLLAMA_MODEL,
    )


@app.post("/api/generate-quote", response_model=QuoteResponse)
async def generate_quote(request: QuoteRequest):
    """Generate a professional quote using AI."""

    # Check Ollama availability
    if not await check_ollama_available():
        raise HTTPException(
            status_code=503,
            detail="AI service (Ollama) is not available. Please try again later."
        )

    # Prepare prompts
    system_prompt = get_system_prompt(
        language=request.language.value,
        tone=request.tone.value,
        technical_depth=request.technical_depth,
    )

    services_dict = [
        {
            "name": s.name,
            "description": s.description,
            "estimated_hours": s.estimated_hours,
            "hourly_rate": s.hourly_rate,
        }
        for s in request.services
    ]

    user_prompt = get_user_prompt(
        client_name=request.client_name,
        project_name=request.project_name,
        project_description=request.project_description,
        services=services_dict,
        custom_instructions=request.custom_instructions,
    )

    # Generate with Ollama
    try:
        raw_response = await generate_with_ollama(system_prompt, user_prompt)

        # Extract and parse JSON
        content_dict = extract_json_from_response(raw_response)

        # Validate and fix services
        fixed_services = validate_and_fix_services(
            content_dict.get("services", []),
            services_dict,
        )

        # Create response
        content = QuoteContent(
            introduction=content_dict.get("introduction", ""),
            services=fixed_services,
            timeline=content_dict.get("timeline", "A determinar según disponibilidad"),
            payment_terms=content_dict.get("payment_terms", "50% al inicio, 50% a la entrega"),
            conclusion=content_dict.get("conclusion", ""),
        )

        return QuoteResponse(
            success=True,
            content=content,
            raw_response=raw_response,
        )

    except ValueError as e:
        return QuoteResponse(
            success=False,
            error=f"Failed to parse AI response: {str(e)}",
            raw_response=raw_response if 'raw_response' in locals() else None,
        )
    except HTTPException:
        raise
    except Exception as e:
        return QuoteResponse(
            success=False,
            error=f"Unexpected error: {str(e)}",
        )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Anclora AI Service",
        "version": "1.0.0",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
