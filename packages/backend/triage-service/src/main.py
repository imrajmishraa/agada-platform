from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os

app = FastAPI(title="Agada Triage Service", version="1.0.0")

# Health check endpoint
@app.get("/healthz")
async def health():
    return {"status": "ok", "service": "triage-service"}

# Triage request model
class TriageRequest(BaseModel):
    patient_id: str
    symptoms: List[str]
    vital_signs: dict
    risk_factors: Optional[List[str]] = []

# Triage endpoint (placeholder)
@app.post("/triage")
async def triage(request: TriageRequest):
    # TODO: Implement ML-based triage logic
    return {
        "patient_id": request.patient_id,
        "score": 5,
        "category": "MEDIUM",
        "recommendation": "Teleconsultation within 4 hours"
    }

if __name__ == "__main__":
    port = int(os.getenv("TRIAGE_SERVICE_PORT", 3003))
    uvicorn.run(app, host="0.0.0.0", port=port)