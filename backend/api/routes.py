from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import io
from datetime import datetime

from simulation.simulator import simulate_orbit
from models.anomaly_detector import detect_anomalies, evaluate_model, load_model
from explainability.explainer import explain_anomaly
from api.pdf_generator import generate_pdf

router = APIRouter()


class SimulateRequest(BaseModel):
    scenario: str = "none"
    num_points: int = 200


class DetectRequest(BaseModel):
    telemetry: list
    scenario: Optional[str] = "none"


class ExplainRequest(BaseModel):
    telemetry: list
    row_index: int = -1


class PDFRequest(BaseModel):
    telemetry_snapshot: dict
    anomaly_score: float
    anomaly_count: int
    shap_values: dict
    top_feature: str
    scenario: str
    metrics: dict


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "ORBIT Backend"}


@router.post("/simulate")
def simulate(req: SimulateRequest):
    try:
        df = simulate_orbit(req.scenario, req.num_points)
        return {"telemetry": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect")
def detect(req: DetectRequest):
    try:
        df = pd.DataFrame(req.telemetry)
        result = detect_anomalies(df)
        metrics = evaluate_model()
        return {**result, "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explain")
def explain(req: ExplainRequest):
    try:
        df = pd.DataFrame(req.telemetry)
        result = explain_anomaly(df, req.row_index)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/export-pdf")
def export_pdf(req: PDFRequest):
    try:
        pdf_bytes = generate_pdf(
            req.telemetry_snapshot,
            req.anomaly_score,
            req.anomaly_count,
            req.shap_values,
            req.top_feature,
            req.scenario,
            req.metrics,
        )
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=orbit_report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))