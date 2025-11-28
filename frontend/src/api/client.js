const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export async function api(path, options = {}) {
  const { responseType = "json", ...restOptions } = options;
  const headers = restOptions.headers
    ? new Headers(restOptions.headers)
    : new Headers();

  const hasBody =
    restOptions.body !== undefined &&
    restOptions.body !== null &&
    restOptions.body !== "" &&
    !(restOptions.body instanceof FormData);

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  } else if (
    typeof restOptions.body === "string" &&
    restOptions.body.length &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const fetchOptions = {
    ...restOptions,
    headers,
  };

  if (
    hasBody &&
    typeof restOptions.body !== "string" &&
    !(restOptions.body instanceof FormData)
  ) {
    fetchOptions.body = JSON.stringify(restOptions.body);
  }

  if (responseType) {
    delete fetchOptions.responseType;
  }

  const res = await fetch(`${API_URL}${path}`, fetchOptions);

  if (!res.ok) {
    let msg = `Request failed with status ${res.status}`;
    try {
      const data = await res.clone().json();
      if (data && data.message) msg = data.message;
    } catch {
      try {
        const text = await res.clone().text();
        if (text) msg = text;
      } catch {
        // ignore
      }
    }
    throw new Error(msg);
  }

  if (responseType === "blob") {
    return res.blob();
  }

  if (responseType === "text") {
    return res.text();
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
