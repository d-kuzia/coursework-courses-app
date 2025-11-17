import { api } from "./client";

export const createModule = (courseId, data) =>
  api(`/api/courses/${courseId}/modules`, {
    method: "POST",
    body: JSON.stringify(data)
  });

export const updateModule = (id, data) =>
  api(`/api/modules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });

export const deleteModule = (id) =>
  api(`/api/modules/${id}`, {
    method: "DELETE"
  });
