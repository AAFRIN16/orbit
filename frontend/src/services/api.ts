import axios from "axios";

const BASE = "http://localhost:8000/api";

export interface TelemetryPoint {
  timestamp: string;
  battery_level: number;
  solar_input: number;
  power_load: number;
  battery_voltage: number;
  temperature: number;
  eclipse: number;
}

export interface AnomalyResult {
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
}

export interface ExplainResult {
  shap_values: Record<string, number>;
  top_feature: string;
  top_contribution: number;
  raw_shap: Record<string, number>;
}

export interface PDFRequest {
  telemetry_snapshot: TelemetryPoint;
  anomaly_score: number;
  anomaly_count: number;
  shap_values: Record<string, number>;
  top_feature: string;
  scenario: string;
  metrics: {
    precision: number;
    recall: number;
    f1_score: number;
    total_samples: number;
    anomalies_detected: number;
  };
}

const api = {
  simulate: async (scenario: string, num_points: number): Promise<{ telemetry: TelemetryPoint[] }> => {
    const res = await axios.post(`${BASE}/simulate`, { scenario, num_points });
    return res.data;
  },
  detect: async (telemetry: TelemetryPoint[]): Promise<AnomalyResult> => {
    const res = await axios.post(`${BASE}/detect`, { telemetry });
    return res.data;
  },
  explain: async (telemetry: TelemetryPoint[], row_index: number = -1): Promise<ExplainResult> => {
    const res = await axios.post(`${BASE}/explain`, { telemetry, row_index });
    return res.data;
  },
  exportPDF: async (payload: PDFRequest): Promise<void> => {
    const res = await axios.post(`${BASE}/export-pdf`, payload, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "orbit_report.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default api;