import { useState, useCallback } from "react";
import api from "../services/api";

type TelemetryPoint = {
  timestamp: string;
  battery_level: number;
  solar_input: number;
  power_load: number;
  battery_voltage: number;
  temperature: number;
  eclipse: number;
};

type AnomalyResult = {
  anomaly_scores: number[];
  anomaly_flags: number[];
  mean_score: number;
  max_score: number;
  anomaly_count: number;
  metrics: {
    precision: number;
    recall: number;
    f1_score: number;
    total_samples: number;
    anomalies_detected: number;
  };
};

type ExplainResult = {
  shap_values: Record<string, number>;
  top_feature: string;
  top_contribution: number;
  raw_shap: Record<string, number>;
};

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [anomaly, setAnomaly] = useState<AnomalyResult | null>(null);
  const [explain, setExplain] = useState<ExplainResult | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState("none");

  const runAnalysis = useCallback(async (s: string = scenario, points: number = 200) => {
    setLoading(true);
    setError(null);
    try {
      const simRes = await api.simulate(s, points);
      const data = simRes.telemetry;
      setTelemetry(data);
      setScenario(s);

      const [anomalyRes, explainRes] = await Promise.all([
        api.detect(data),
        api.explain(data, -1),
      ]);
      setAnomaly(anomalyRes);
      setExplain(explainRes);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [scenario]);

  const exportPDF = useCallback(async () => {
    if (!telemetry.length || !anomaly || !explain) return;
    setPdfLoading(true);
    setError(null);
    try {
      const snapshot = telemetry[telemetry.length - 1];
      await api.exportPDF({
        telemetry_snapshot: snapshot,
        anomaly_score: anomaly.max_score,
        anomaly_count: anomaly.anomaly_count,
        shap_values: explain.shap_values,
        top_feature: explain.top_feature,
        scenario,
        metrics: anomaly.metrics,
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Unknown error");
    } finally {
      setPdfLoading(false);
    }
  }, [telemetry, anomaly, explain, scenario]);

  return {
    telemetry,
    anomaly,
    explain,
    pdfLoading,
    loading,
    error,
    scenario,
    runAnalysis,
    exportPDF,
    setScenario,
  };
}