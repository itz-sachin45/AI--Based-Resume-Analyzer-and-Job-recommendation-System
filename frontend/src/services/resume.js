import api from "./api";

export async function uploadResume(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/api/resume/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getResumes() {
  const res = await api.get("/api/resume/");
  return res.data;
}

export async function getResume(id) {
  const res = await api.get(`/api/resume/${id}`);
  return res.data;
}

export async function getLatestSummary() {
  const res = await api.get("/api/resume/latest/summary");
  return res.data;
}
