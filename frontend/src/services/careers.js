import api from "./api";

export async function getCareers(category) {
  const res = await api.get("/api/careers/", { params: category ? { category } : {} });
  return res.data;
}

export async function getCareer(id) {
  const res = await api.get(`/api/careers/${id}`);
  return res.data;
}

export async function computeSkillGap(resumeId, careerId) {
  const res = await api.post("/api/careers/skill-gap", { resume_id: resumeId, career_id: careerId });
  return res.data;
}

export async function getRoadmap(careerId) {
  const res = await api.get(`/api/careers/roadmap/${careerId}`);
  return res.data;
}

export async function updateRoadmapProgress(careerId, skill, status, stage) {
  const res = await api.post("/api/careers/roadmap/progress", { career_id: careerId, skill, status, stage });
  return res.data;
}
