import { api } from "./client";

export const enrollInCourse = (courseId) =>
  api(`/api/courses/${courseId}/enroll`, {
    method: "POST",
  });

export const getMyCourses = () => api("/api/my-courses");

export const getCourseEnrollments = (courseId) =>
  api(`/api/courses/${courseId}/enrollments`);

export const downloadCertificate = (courseId) =>
  api(`/api/courses/${courseId}/certificate`, {
    responseType: "blob",
  });
