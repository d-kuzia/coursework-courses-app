import { api } from "./client.js";

export const getUsers = () => api("/api/users");

export const updateUser = (id, data) =>
  api(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

