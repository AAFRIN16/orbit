🛰️ ORBIT — Cognitive Digital Twin

A smart system that monitors the health of a satellite’s power subsystem using machine learning. It simulates real-time telemetry data, detects unusual behavior, and explains the root cause of faults in a clear, understandable way.

🚀 Tech Stack
Backend: Python, FastAPI, Scikit-learn, SHAP, ReportLab
Frontend: React, TypeScript, Vite, Recharts, Tailwind CSS
⚙️ How to Run
Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
Frontend
cd frontend
npm install
npm run dev
✨ Key Features
🛰️ Simulates real-time satellite telemetry data
🤖 Detects anomalies using Isolation Forest
🔍 Explains faults using SHAP (no black-box guessing)
📊 Generates detailed PDF reports
⚡ Supports multiple fault scenarios for testing
💡 What makes it special

Instead of just detecting that something is wrong, ORBIT goes a step further and explains why it’s happening — making it useful for analysis, debugging, and decision-making in space systems.
