import api from "./api";

export async function getDashboard() {
  const res = await api.get("/api/dashboard");
  return res.data;
}

export async function getHistory(analysisType) {
  const res = await api.get("/api/history", { params: analysisType ? { analysis_type: analysisType } : {} });
  return res.data;
}
