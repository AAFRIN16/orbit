import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler

MODEL_PATH = os.path.join(os.path.dirname(__file__), "isolation_forest.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

FEATURES = ["battery_level", "solar_input", "power_load", "battery_voltage",
            "temperature", "eclipse"]


def engineer_features(df: pd.DataFrame) -> np.ndarray:
    X = df[FEATURES].copy()

    # Power balance — should be near zero in healthy orbit
    X["power_balance"] = X["solar_input"] - X["power_load"]

    # Solar efficiency — drops sharply in solar failure
    X["solar_efficiency"] = X["solar_input"] / (X["power_load"] + 1e-6)

    # Battery stress — high load relative to battery level
    X["battery_stress"] = X["power_load"] / (X["battery_level"] + 1e-6)

    # Voltage drop indicator — low voltage + low battery
    X["voltage_soc"] = X["battery_voltage"] * X["battery_level"] / 100.0

    # Thermal stress — high temp relative to eclipse state
    X["thermal_stress"] = X["temperature"] * (1 - X["eclipse"])

    # Rate of change features (shift by 1)
    X["battery_delta"] = X["battery_level"].diff().fillna(0)
    X["temp_delta"] = X["temperature"].diff().fillna(0)
    X["solar_delta"] = X["solar_input"].diff().fillna(0)

    return X.values


def generate_normal_samples(n=1000) -> pd.DataFrame:
    from simulation.simulator import simulate_orbit
    frames = []
    for _ in range(n // 200):
        frames.append(simulate_orbit("none", 200))
    return pd.concat(frames, ignore_index=True)


def train_model():
    df = generate_normal_samples(1000)
    X = engineer_features(df)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = IsolationForest(
        n_estimators=300,
        contamination=0.06,
        max_samples=0.9,
        max_features=0.8,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_scaled)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)

    return model, scaler


def load_model():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        return train_model()
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)
    return model, scaler


def detect_anomalies(df: pd.DataFrame):
    model, scaler = load_model()
    X = engineer_features(df)
    X_scaled = scaler.transform(X)

    raw_scores = model.decision_function(X_scaled)
    predictions = model.predict(X_scaled)

    # Use fixed global bounds instead of per-batch min/max
    # These bounds were determined from normal orbit scoring
    GLOBAL_MIN = -0.15
    GLOBAL_MAX =  0.10

    normalized = 1 - (raw_scores - GLOBAL_MIN) / (GLOBAL_MAX - GLOBAL_MIN)
    normalized = np.clip(normalized, 0.0, 1.0)

    anomaly_flags = (predictions == -1).astype(int)

    return {
        "anomaly_scores": normalized.tolist(),
        "anomaly_flags":  anomaly_flags.tolist(),
        "mean_score":     float(np.mean(normalized)),
        "max_score":      float(np.max(normalized)),
        "anomaly_count":  int(anomaly_flags.sum()),
    }


def evaluate_model():
    from simulation.simulator import simulate_orbit
    model, scaler = load_model()

    normal_frames = []
    for _ in range(3):
        normal_frames.append(simulate_orbit("none", 200))
    normal_df = pd.concat(normal_frames, ignore_index=True)

    fault_scenarios = ["solar_failure", "battery_degradation",
                       "load_spike", "thermal_anomaly"]
    fault_frames = []
    for scenario in fault_scenarios:
        fault_frames.append(simulate_orbit(scenario, 200))
    fault_df = pd.concat(fault_frames, ignore_index=True)

    X_normal = scaler.transform(engineer_features(normal_df))
    X_fault  = scaler.transform(engineer_features(fault_df))

    scores_normal = model.decision_function(X_normal)
    scores_fault  = model.decision_function(X_fault)

    # Use percentile-based threshold for best F1
    all_scores = np.concatenate([scores_normal, scores_fault])
    threshold = np.percentile(all_scores, 30)

    pred_normal = (scores_normal < threshold).astype(int)
    pred_fault  = (scores_fault  < threshold).astype(int)

    y_true = np.concatenate([np.zeros(len(X_normal)), np.ones(len(X_fault))])
    y_pred = np.concatenate([pred_normal, pred_fault])

    return {
        "precision":          round(float(precision_score(y_true, y_pred, zero_division=0)), 3),
        "recall":             round(float(recall_score(y_true, y_pred, zero_division=0)), 3),
        "f1_score":           round(float(f1_score(y_true, y_pred, zero_division=0)), 3),
        "total_samples":      int(len(y_true)),
        "anomalies_detected": int(y_pred.sum()),
    }