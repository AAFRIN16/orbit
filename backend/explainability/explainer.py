import numpy as np
import pandas as pd
import shap
import pickle
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/isolation_forest.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "../models/scaler.pkl")

FEATURES = ["battery_level", "solar_input", "power_load", "battery_voltage",
            "temperature", "eclipse"]

ENGINEERED_FEATURES = [
    "battery_level", "solar_input", "power_load", "battery_voltage",
    "temperature", "eclipse", "power_balance", "solar_efficiency",
    "battery_stress", "voltage_soc", "thermal_stress",
    "battery_delta", "temp_delta", "solar_delta"
]


def engineer_features(df: pd.DataFrame) -> np.ndarray:
    X = df[FEATURES].copy()
    X["power_balance"]   = X["solar_input"] - X["power_load"]
    X["solar_efficiency"]= X["solar_input"] / (X["power_load"] + 1e-6)
    X["battery_stress"]  = X["power_load"] / (X["battery_level"] + 1e-6)
    X["voltage_soc"]     = X["battery_voltage"] * X["battery_level"] / 100.0
    X["thermal_stress"]  = X["temperature"] * (1 - X["eclipse"])
    X["battery_delta"]   = X["battery_level"].diff().fillna(0)
    X["temp_delta"]      = X["temperature"].diff().fillna(0)
    X["solar_delta"]     = X["solar_input"].diff().fillna(0)
    return X.values


def explain_anomaly(df: pd.DataFrame, row_index: int = -1):
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)

    X = engineer_features(df)
    X_scaled = scaler.transform(X)

    if row_index == -1:
        row_index = len(X_scaled) - 1

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_scaled)

    row_shap = shap_values[row_index]
    abs_shap = np.abs(row_shap)
    total = abs_shap.sum()

    # Only return the original 6 features for display
    # Sum engineered feature contributions back to originals
    original_count = len(FEATURES)
    orig_abs = abs_shap[:original_count].copy()

    # Add engineered contributions back proportionally
    eng_abs = abs_shap[original_count:]
    eng_names = ENGINEERED_FEATURES[original_count:]
    for i, fname in enumerate(eng_names):
        if "solar" in fname:
            orig_abs[1] += eng_abs[i]
        elif "battery" in fname or "voltage" in fname:
            orig_abs[0] += eng_abs[i]
        elif "thermal" in fname or "temp" in fname:
            orig_abs[4] += eng_abs[i]
        elif "power" in fname or "load" in fname:
            orig_abs[2] += eng_abs[i]

    total_orig = orig_abs.sum()
    if total_orig == 0:
        normalized = {f: 0.0 for f in FEATURES}
    else:
        normalized = {
            f: round(float(orig_abs[i] / total_orig * 100), 2)
            for i, f in enumerate(FEATURES)
        }

    top_feature = max(normalized, key=normalized.get)

    return {
        "shap_values":      normalized,
        "top_feature":      top_feature,
        "top_contribution": normalized[top_feature],
        "raw_shap": {
            f: round(float(row_shap[i]), 6)
            for i, f in enumerate(FEATURES)
        },
    }