from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from api.routes import router
from models.anomaly_detector import load_model

app = FastAPI(title="ORBIT Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    print("🛰️  ORBIT backend starting...")
    load_model()
    print("✅  Model loaded/trained successfully")