import api from "./api";

export async function predictPerformance(payload) {
  const res = await api.post("/api/performance/predict", payload);
  return res.data;
}

export async function getModelInfo() {
  const res = await api.get("/api/performance/model-info");
  return res.data;
}
