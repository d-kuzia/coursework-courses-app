import { api } from "./client";

export const createLesson = (moduleId, data) =>
  api(`/api/modules/${moduleId}/lessons`, {
    method: "POST",
    body: JSON.stringify(data)
  });

export const getLesson = (id) => api(`/api/lessons/${id}`);

export const updateLesson = (id, data) =>
  api(`/api/lessons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });

export const deleteLesson = (id) =>
  api(`/api/lessons/${id}`, {
    method: "DELETE"
  });

export const getQuiz = (lessonId) => api(`/api/lessons/${lessonId}/quiz`);

export const saveQuiz = (lessonId, quiz) =>
  api(`/api/lessons/${lessonId}/quiz`, {
    method: "POST",
    body: JSON.stringify(quiz)
  });

export const submitQuiz = (lessonId, answers) =>
  api(`/api/lessons/${lessonId}/quiz/submit`, {
    method: "POST",
    body: JSON.stringify({ answers })
  });
