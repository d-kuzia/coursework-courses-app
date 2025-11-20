import { api } from "./client";

export const enrollInCourse = (courseId) =>
  api(`/api/courses/${courseId}/enroll`, {
    method: "POST"
  });

export const getMyCourses = () => api("/api/my-courses");
