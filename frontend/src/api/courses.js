import { api } from "./client.js";

export const getCourses = ({ page = 1, limit = 9, search = "" } = {}) => {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (search) params.set("search", search);
  return api(`/api/courses?${params.toString()}`);
};
export const getCourse = (id) => api(`/api/courses/${id}`);
export const createCourse = (data) =>
  api("/api/courses", { method: "POST", body: JSON.stringify(data) });
export const updateCourse = (id, data) =>
  api(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCourse = (id) =>
  api(`/api/courses/${id}`, { method: "DELETE" });
