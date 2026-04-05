from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph as RLParagraph
from datetime import datetime


def generate_pdf(
    telemetry_snapshot: dict,
    anomaly_score: float,
    mean_score: float,
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

    # --- White Background ---
    c.setFillColor(colors.white)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # --- Header Bar ---
    c.setFillColor(colors.HexColor("#1F3864"))
    c.rect(0, height - 70, width, 70, fill=1, stroke=0)

    # --- Title in header ---
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(20 * mm, height - 38, "ORBIT — Satellite Power Subsystem Report")

    # --- Timestamp and scenario BELOW title, not overlapping ---
    c.setFillColor(colors.HexColor("#a8d8ea"))
    c.setFont("Helvetica", 8)
    c.drawString(20 * mm, height - 54, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    c.drawString(20 * mm, height - 64, f"Scenario: {scenario.upper()}")

    y = height - 90

    def section_title(title, color="#1F3864"):
        nonlocal y
        y -= 8
        c.setFillColor(colors.HexColor(color))
        c.setFont("Helvetica-Bold", 11)
        c.drawString(20 * mm, y, title)
        c.setStrokeColor(colors.HexColor(color))
        c.setLineWidth(0.8)
        c.line(20 * mm, y - 4, width - 20 * mm, y - 4)
        y -= 16

    def row(label, value, label_color="#444444", value_color="#111111"):
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
        c.roundRect(25 * mm, y - 2, 45 * mm, 14, 4, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(47.5 * mm, y + 3, label)
        y -= 22

    # --- Anomaly Status ---
    section_title("ANOMALY STATUS", "#1F3864")
    score_pct = round(anomaly_score * 100, 1)
    health = max(0, min(100, round((1 - mean_score) * 100)))
    status = "CRITICAL" if anomaly_score > 0.65 else "ELEVATED" if anomaly_score > 0.4 else "NOMINAL"
    status_color = "#c0392b" if status == "CRITICAL" else "#e67e22" if status == "ELEVATED" else "#27ae60"
    badge(f"STATUS: {status}", status_color)
    row("Anomaly Score:", f"{score_pct}%", value_color="#c0392b" if status != "NOMINAL" else "#27ae60")
    row("Health Score:", f"{health} / 100")
    row("Anomalies Detected:", str(anomaly_count))
    row("Top Anomaly Driver:", top_feature, value_color="#2E75B6")

    y -= 6

    # --- Telemetry Snapshot ---
    section_title("TELEMETRY SNAPSHOT", "#1F3864")
    row("Battery Level:", f"{telemetry_snapshot.get('battery_level', 'N/A')} %")
    row("Solar Input:", f"{telemetry_snapshot.get('solar_input', 'N/A')} W")
    row("Power Load:", f"{telemetry_snapshot.get('power_load', 'N/A')} W")
    row("Battery Voltage:", f"{telemetry_snapshot.get('battery_voltage', 'N/A')} V")
    row("Temperature:", f"{telemetry_snapshot.get('temperature', 'N/A')} °C")
    row("Eclipse:", "YES" if telemetry_snapshot.get('eclipse') else "NO")

    y -= 6

    # --- SHAP Feature Contributions ---
    section_title("SHAP FEATURE CONTRIBUTIONS", "#1F3864")
    sorted_shap = sorted(shap_values.items(), key=lambda x: x[1], reverse=True)
    bar_max = sorted_shap[0][1] if sorted_shap else 1
    for feat, val in sorted_shap:
        c.setFillColor(colors.HexColor("#333333"))
        c.setFont("Helvetica", 9)
        c.drawString(25 * mm, y, feat)
        # Bar background
        c.setFillColor(colors.HexColor("#e8e8e8"))
        c.rect(75 * mm, y - 1, 85 * mm, 9, fill=1, stroke=0)
        # Bar fill
        bar_color = "#c0392b" if feat == top_feature else "#2E75B6"
        c.setFillColor(colors.HexColor(bar_color))
        bar_width = (val / bar_max) * 85 * mm if bar_max > 0 else 0
        c.rect(75 * mm, y - 1, bar_width, 9, fill=1, stroke=0)
        # Value label
        c.setFillColor(colors.HexColor("#111111"))
        c.setFont("Helvetica-Bold", 8)
        c.drawString(163 * mm, y, f"{val:.1f}%")
        y -= 14

    y -= 6

    # --- Model Performance ---
    section_title("MODEL PERFORMANCE", "#1F3864")
    row("Precision:", f"{round(metrics.get('precision', 0) * 100, 1)}%")
    row("Recall:", f"{round(metrics.get('recall', 0) * 100, 1)}%")
    row("F1 Score:", f"{round(metrics.get('f1_score', 0) * 100, 1)}%")
    row("Total Samples Evaluated:", str(metrics.get('total_samples', 0)))

    y -= 6

    # --- Plain English Explanation ---
    section_title("WHAT THIS MEANS — PLAIN ENGLISH", "#2E75B6")
    explanation = (
        f"This report summarizes the health of a simulated satellite's power system. "
        f"The satellite was analyzed under the '{scenario.upper()}' scenario. "
        f"An anomaly score of {score_pct}% was detected — "
        f"{'this is a serious concern and immediate attention is recommended.' if status == 'CRITICAL' else 'this is slightly above normal and should be monitored.' if status == 'ELEVATED' else 'this is within normal operating range.'} "
        f"The most significant factor contributing to this reading was '{top_feature}', "
        f"meaning that this particular sensor showed the most unusual behavior compared to normal operation. "
        f"The overall health score of {health}/100 "
        f"{'indicates the system is in good health.' if health > 75 else 'suggests the system needs attention.' if health > 50 else 'indicates a critical situation requiring immediate action.'}"
    )

    styles = getSampleStyleSheet()
    plain_style = ParagraphStyle(
        'Plain',
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=colors.HexColor("#333333"),
        spaceAfter=6,
    )
    p = RLParagraph(explanation, plain_style)
    p_width = width - 45 * mm
    p_height = p.wrap(p_width, 200)[1]
    p.drawOn(c, 25 * mm, y - p_height)
    y -= p_height + 10

    # --- Footer ---
    c.setFillColor(colors.HexColor("#f0f0f0"))
    c.rect(0, 0, width, 18 * mm, fill=1, stroke=0)
    c.setStrokeColor(colors.HexColor("#1F3864"))
    c.setLineWidth(1)
    c.line(0, 18 * mm, width, 18 * mm)
    c.setFillColor(colors.HexColor("#555555"))
    c.setFont("Helvetica", 8)
    c.drawString(20 * mm, 10 * mm, "ORBIT — Cognitive Digital Twin for Satellite Power Subsystem Health Monitoring")
    c.drawRightString(width - 20 * mm, 10 * mm, "CONFIDENTIAL")

    c.save()
    buffer.seek(0)
    return buffer.read()