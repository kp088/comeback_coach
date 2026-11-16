// Typed fetch layer over the FastAPI backend. Base is the relative "/api" prefix so the
// same code works in dev (Vite proxies /api → :8001) and behind a single origin in prod.
// When the frontend is hosted separately (GitHub Pages), VITE_API_URL is the backend's
// origin, e.g. https://comeback-coach-api.onrender.com — set at build time.
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const BASE = `${API_ORIGIN}/api`;

// Showcase mode (VITE_DEMO_MODE=true at build time): no backend at all — every call is
// answered in the browser by lib/demoApi.ts and progress is kept in localStorage.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

// Fields are declared, not constructor parameter properties: tsconfig sets
// erasableSyntaxOnly, which rejects `constructor(readonly status: number)`.
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`request failed with ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type JsonBody = unknown;

async function request<T>(method: string, path: string, body?: JsonBody): Promise<T> {
  if (DEMO_MODE) {
    const { demoRequest, DemoHttpError } = await import("./demoApi");
    try {
      return (await demoRequest(method, path, body)) as T;
    } catch (err) {
      if (err instanceof DemoHttpError) throw new ApiError(err.status, err.body);
      throw err;
    }
  }

  // Auth rides the httpOnly session cookie automatically — never add auth headers here.
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // FastAPI reports request-validation failures as 422 with a {detail: [...]} body.
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new ApiError(res.status, errBody);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// The response type is yours to declare: nothing infers across the Python boundary, so a
// TS interface here mirrors the endpoint's Pydantic model by hand — keep the two in sync.
export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body?: JsonBody) => request<T>("POST", path, body ?? null);
export const apiPut = <T>(path: string, body?: JsonBody) => request<T>("PUT", path, body ?? null);
export const apiPatch = <T>(path: string, body?: JsonBody) =>
  request<T>("PATCH", path, body ?? null);
export const apiDelete = <T>(path: string) => request<T>("DELETE", path);
