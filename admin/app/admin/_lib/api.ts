export const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

function getAdminToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("homes_admin_token");
}

export async function adminApiRequest<T>(path: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message ?? "Request failed");
  }

  return body as T;
}
