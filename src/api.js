import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTests = () => api.get("/tests").then(res => res.data);
export const getAthletes = () => api.get("/athletes").then(res => res.data);
export const getAthlete = (id) => api.get(`/athletes/${id}`).then(res => res.data);
export const getAthleteMe = () => api.get("/athletes/me").then(res => res.data);
export const getBenchmarks = () => api.get("/benchmarks").then(res => res.data);
export const submitScore = (data) => api.post("/scores", data).then(res => res.data);

export const toggleShortlist = (athlete_id) => api.post("/shortlist", { athlete_id }).then(res => res.data);
export const getShortlist = () => api.get("/shortlist").then(res => res.data);
export const sendMessage = (receiver_id, content) => api.post("/messages", { receiver_id, content }).then(res => res.data);
export const getMessages = (other_user_id) => api.get(`/messages/${other_user_id}`).then(res => res.data);
export const getCoaches = () => api.get("/coaches").then(res => res.data);

export const analyzeVideo = (file, testId = "auto") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("test_id", testId);
  return api.post("/analyze-video", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(res => res.data);
};

export const loginUser = (data) => api.post("/auth/login", data).then(res => res.data);
export const registerUser = (data) => api.post("/auth/register", data).then(res => res.data);
export const getMe = () => api.get("/auth/me").then(res => res.data);

export default api;
