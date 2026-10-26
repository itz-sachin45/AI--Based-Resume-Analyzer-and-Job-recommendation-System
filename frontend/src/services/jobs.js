import api from "./api";

export async function matchJob(resumeId, jobDescription) {
  const res = await api.post("/api/jobs/match", { resume_id: resumeId, job_description: jobDescription });
  return res.data;
}

export async function getRecommendations(resumeId, category) {
  const res = await api.get(`/api/jobs/recommendations/${resumeId}`, {
    params: category ? { category } : {},
  });
  return res.data;
}
