import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler

MODEL_PATH = os.path.join(os.path.dirname(__file__), "isolation_forest.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

FEATURES = ["battery_level", "solar_input", "power_load", "battery_voltage", "temperature", "eclipse"]


def generate_normal_samples(n=400) -> pd.DataFrame:
    from simulation.simulator import simulate_orbit
    df = simulate_orbit("none", n)
    return df


def train_model():
    df = generate_normal_samples(400)
    X = df[FEATURES].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
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
    X = df[FEATURES].values
    X_scaled = scaler.transform(X)

    raw_scores = model.decision_function(X_scaled)
    predictions = model.predict(X_scaled)

    min_s, max_s = raw_scores.min(), raw_scores.max()
    if max_s == min_s:
        normalized = np.zeros_like(raw_scores)
    else:
        normalized = 1 - (raw_scores - min_s) / (max_s - min_s)

    anomaly_flags = (predictions == -1).astype(int)

    return {
        "anomaly_scores": normalized.tolist(),
        "anomaly_flags": anomaly_flags.tolist(),
        "mean_score": float(np.mean(normalized)),
        "max_score": float(np.max(normalized)),
        "anomaly_count": int(anomaly_flags.sum()),
    }


def evaluate_model():
    from simulation.simulator import simulate_orbit
    model, scaler = load_model()

    normal_df = simulate_orbit("none", 200)
    anomaly_df = simulate_orbit("solar_failure", 200)

    X_normal = scaler.transform(normal_df[FEATURES].values)
    X_anomaly = scaler.transform(anomaly_df[FEATURES].values)

    y_true_normal = np.zeros(len(X_normal))
    y_true_anomaly = np.ones(len(X_anomaly))

    pred_normal = (model.predict(X_normal) == -1).astype(int)
    pred_anomaly = (model.predict(X_anomaly) == -1).astype(int)

    y_true = np.concatenate([y_true_normal, y_true_anomaly])
    y_pred = np.concatenate([pred_normal, pred_anomaly])

    return {
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 3),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 3),
        "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 3),
        "total_samples": int(len(y_true)),
        "anomalies_detected": int(y_pred.sum()),
    }