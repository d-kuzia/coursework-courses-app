const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export async function api(path, options = {}) {
  const headers = options.headers
    ? new Headers(options.headers)
    : new Headers();
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let msg = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data && data.message) msg = data.message;
    } catch (_) {
      // якщо відповіді без JSON - ігнор
    }
    throw new Error(msg);
  }

  return res.json();
}
