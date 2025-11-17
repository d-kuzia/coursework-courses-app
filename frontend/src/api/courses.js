import { api } from "./client.js";

export const getCourses = () => api("/api/courses");
export const getCourse = (id) => api(`/api/courses/${id}`);
export const createCourse = (data) =>
  api("/api/courses", { method: "POST", body: JSON.stringify(data) });
export const updateCourse = (id, data) =>
  api(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCourse = (id) =>
  api(`/api/courses/${id}`, { method: "DELETE" });
