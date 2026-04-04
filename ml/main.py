"""
GigGuard ML Service — FastAPI entry point

Endpoints:
  GET  /                    → health check
  POST /premium/calculate   → calculate weekly premium
  POST /premium/train       → train / retrain XGBoost model
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from models.premium_engine import calculate_premium, train_model

app = FastAPI(
    title="GigGuard ML Service",
    version="0.1.0",
    description="ML microservice for premium pricing, fraud detection, and risk scoring",
)


# ── Schemas ───────────────────────────────────────────────

class PremiumRequest(BaseModel):
    zone_pincode: str = Field(..., example="560034")
    season: str = Field(..., example="monsoon")
    worker_tenure_months: int = Field(..., ge=0, example=8)
    disruption_history_count: int = Field(..., ge=0, example=3)
    platform: str = Field(..., example="zomato")


class PremiumResponse(BaseModel):
    weekly_premium: int
    currency: str
    model_used: str
    inputs: dict
    bounds: dict


# ── Routes ────────────────────────────────────────────────

@app.get("/")
def health():
    return {"service": "gigguard-ml", "status": "ok"}


@app.post("/premium/calculate", response_model=PremiumResponse)
def api_calculate_premium(req: PremiumRequest):
    try:
        result = calculate_premium(
            zone_pincode=req.zone_pincode,
            season=req.season,
            worker_tenure_months=req.worker_tenure_months,
            disruption_history_count=req.disruption_history_count,
            platform=req.platform,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/premium/train")
def api_train_model():
    try:
        train_model()
        return {"status": "ok", "message": "Model trained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Startup ───────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    """Auto-train the premium model on startup."""
    print("[ML Service] training premium engine on startup …")
    train_model()
    print("[ML Service] ready")
