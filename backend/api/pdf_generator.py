from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from datetime import datetime


def generate_pdf(
    telemetry_snapshot: dict,
    anomaly_score: float,
    anomaly_count: int,
    shap_values: dict,
    top_feature: str,
    scenario: str,
    metrics: dict,
) -> bytes:
    from io import BytesIO
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # --- Background ---
    c.setFillColor(colors.HexColor("#070b14"))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # --- Header Bar ---
    c.setFillColor(colors.HexColor("#0d1424"))
    c.rect(0, height - 60, width, 60, fill=1, stroke=0)

    # --- Teal top accent line ---
    c.setFillColor(colors.HexColor("#6bc3c9"))
    c.rect(0, height - 4, width, 4, fill=1, stroke=0)

    # --- Title ---
    c.setFillColor(colors.HexColor("#ffffff"))
    c.setFont("Helvetica-Bold", 22)
    c.drawString(20 * mm, height - 40, "ORBIT — Satellite Power Subsystem Report")

    # --- Timestamp ---
    c.setFillColor(colors.HexColor("#6bc3c9"))
    c.setFont("Helvetica", 9)
    c.drawRightString(width - 20 * mm, height - 25, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    c.drawRightString(width - 20 * mm, height - 38, f"Scenario: {scenario.upper()}")

    y = height - 80

    def section_title(title, color="#6bc3c9"):
        nonlocal y
        y -= 10
        c.setFillColor(colors.HexColor(color))
        c.setFont("Helvetica-Bold", 11)
        c.drawString(20 * mm, y, title)
        c.setFillColor(colors.HexColor(color))
        c.setLineWidth(0.5)
        c.setStrokeColor(colors.HexColor(color))
        c.line(20 * mm, y - 3, width - 20 * mm, y - 3)
        y -= 14

    def row(label, value, label_color="#aadbde", value_color="#ffffff"):
        nonlocal y
        c.setFillColor(colors.HexColor(label_color))
        c.setFont("Helvetica", 9)
        c.drawString(25 * mm, y, label)
        c.setFillColor(colors.HexColor(value_color))
        c.setFont("Helvetica-Bold", 9)
        c.drawString(90 * mm, y, str(value))
        y -= 13

    def badge(label, color):
        nonlocal y
        c.setFillColor(colors.HexColor(color))
        c.roundRect(25 * mm, y - 2, 40 * mm, 12, 4, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#ffffff"))
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(45 * mm, y + 2, label)
        y -= 18

    # --- Anomaly Status ---
    section_title("ANOMALY STATUS", "#d46981")
    score_pct = round(anomaly_score * 100, 1)
    health = max(0, min(100, round((1 - anomaly_score) * 100)))
    status = "CRITICAL" if anomaly_score > 0.65 else "ELEVATED" if anomaly_score > 0.4 else "NOMINAL"
    status_color = "#ef4444" if status == "CRITICAL" else "#f59e0b" if status == "ELEVATED" else "#10b981"
    badge(status, status_color)
    row("Anomaly Score:", f"{score_pct}%", value_color="#d46981")
    row("Health Score:", f"{health}/100")
    row("Anomalies Detected:", str(anomaly_count))
    row("Top Anomaly Driver:", top_feature, value_color="#6bc3c9")

    y -= 5

    # --- Telemetry Snapshot ---
    section_title("TELEMETRY SNAPSHOT", "#6bc3c9")
    row("Battery Level:", f"{telemetry_snapshot.get('battery_level', 'N/A')} %")
    row("Solar Input:", f"{telemetry_snapshot.get('solar_input', 'N/A')} W")
    row("Power Load:", f"{telemetry_snapshot.get('power_load', 'N/A')} W")
    row("Battery Voltage:", f"{telemetry_snapshot.get('battery_voltage', 'N/A')} V")
    row("Temperature:", f"{telemetry_snapshot.get('temperature', 'N/A')} °C")
    row("Eclipse:", "YES" if telemetry_snapshot.get('eclipse') else "NO")

    y -= 5

    # --- SHAP Feature Contributions ---
    section_title("SHAP FEATURE CONTRIBUTIONS", "#6bc3c9")
    sorted_shap = sorted(shap_values.items(), key=lambda x: x[1], reverse=True)
    bar_max = sorted_shap[0][1] if sorted_shap else 1
    for feat, val in sorted_shap:
        c.setFillColor(colors.HexColor("#aadbde"))
        c.setFont("Helvetica", 9)
        c.drawString(25 * mm, y, feat)
        # Bar background
        c.setFillColor(colors.HexColor("#161e30"))
        c.rect(75 * mm, y, 80 * mm, 8, fill=1, stroke=0)
        # Bar fill
        bar_color = "#d46981" if feat == top_feature else "#6bc3c9"
        c.setFillColor(colors.HexColor(bar_color))
        bar_width = (val / bar_max) * 80 * mm if bar_max > 0 else 0
        c.rect(75 * mm, y, bar_width, 8, fill=1, stroke=0)
        # Value
        c.setFillColor(colors.HexColor("#ffffff"))
        c.setFont("Helvetica-Bold", 8)
        c.drawString(158 * mm, y, f"{val:.1f}%")
        y -= 14

    y -= 5

    # --- Model Performance ---
    section_title("MODEL PERFORMANCE", "#6bc3c9")
    row("Precision:", f"{round(metrics.get('precision', 0) * 100, 1)}%")
    row("Recall:", f"{round(metrics.get('recall', 0) * 100, 1)}%")
    row("F1 Score:", f"{round(metrics.get('f1_score', 0) * 100, 1)}%")
    row("Total Samples:", str(metrics.get('total_samples', 0)))

    y -= 5

    # --- Footer ---
    c.setFillColor(colors.HexColor("#0d1424"))
    c.rect(0, 0, width, 20 * mm, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#6bc3c9"))
    c.rect(0, 20 * mm, width, 0.5, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#6bc3c9"))
    c.setFont("Helvetica", 8)
    c.drawString(20 * mm, 10 * mm, "ORBIT — Cognitive Digital Twin for Satellite Power Subsystem Health Monitoring")
    c.drawRightString(width - 20 * mm, 10 * mm, "CONFIDENTIAL")

    c.save()
    buffer.seek(0)
    return buffer.read()