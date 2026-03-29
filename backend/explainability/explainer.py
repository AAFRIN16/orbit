import numpy as np
import pandas as pd
import shap
import pickle
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/isolation_forest.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "../models/scaler.pkl")

FEATURES = ["battery_level", "solar_input", "power_load", "battery_voltage", "temperature", "eclipse"]


def explain_anomaly(df: pd.DataFrame, row_index: int = -1):
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)

    X = df[FEATURES].values
    X_scaled = scaler.transform(X)

    if row_index == -1:
        row_index = len(X_scaled) - 1

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_scaled)

    row_shap = shap_values[row_index]
    abs_shap = np.abs(row_shap)
    total = abs_shap.sum()

    if total == 0:
        normalized = {f: 0.0 for f in FEATURES}
    else:
        normalized = {f: round(float(abs_shap[i] / total * 100), 2) for i, f in enumerate(FEATURES)}

    top_feature = max(normalized, key=normalized.get)

    return {
        "shap_values": normalized,
        "top_feature": top_feature,
        "top_contribution": normalized[top_feature],
        "raw_shap": {f: round(float(row_shap[i]), 6) for i, f in enumerate(FEATURES)},
    }