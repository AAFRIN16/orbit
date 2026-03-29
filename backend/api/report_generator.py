import os
import re
from google import genai


def generate_report(telemetry_snapshot: dict, anomaly_score: float, shap_values: dict, top_feature: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in environment")

    client = genai.Client(api_key=api_key)

    prompt = f"""You are an expert satellite systems engineer writing a NASA-style mission health report.

Telemetry Snapshot:
- Battery Level: {telemetry_snapshot.get('battery_level', 'N/A')}%
- Solar Input: {telemetry_snapshot.get('solar_input', 'N/A')} W
- Power Load: {telemetry_snapshot.get('power_load', 'N/A')} W
- Battery Voltage: {telemetry_snapshot.get('battery_voltage', 'N/A')} V
- Temperature: {telemetry_snapshot.get('temperature', 'N/A')} °C
- Eclipse: {'Yes' if telemetry_snapshot.get('eclipse') else 'No'}

Anomaly Score: {anomaly_score:.2f} (0=nominal, 1=critical)
Top Anomaly Driver: {top_feature}
SHAP Feature Contributions: {shap_values}

Write a structured 5-section mission report with these EXACT section headers:
1. SITUATION SUMMARY
2. ROOT CAUSE ANALYSIS
3. SUBSYSTEM IMPACT
4. RECOMMENDED ACTIONS
5. HEALTH SCORE

For section 5, provide a health score as an integer from 0 to 100 in the format: HEALTH SCORE: [number]
Be technical, concise, and professional. Each section should be 2-4 sentences."""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    report_text = response.text

    match = re.search(r'HEALTH SCORE:\s*(\d+)', report_text, re.IGNORECASE)
    health_score = int(match.group(1)) if match else 50
    health_score = max(0, min(100, health_score))

    return {
        "report_text": report_text,
        "health_score": health_score,
    }