export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let isRefreshing = false;
let isSessionDead = false;
let refreshSubscribers: ((ok: boolean) => void)[] = [];

function onRefreshed(ok: boolean) {
    refreshSubscribers.forEach((cb) => cb(ok));
    refreshSubscribers = [];
}

/**
 * All API calls go through here.
 * Tokens live in HttpOnly cookies — we never read them from JS.
 * The browser attaches them automatically via credentials: 'include'.
 */
export async function fetcher(url: string, options: RequestInit = {}): Promise<any> {
    // If we've already determined the session is dead, don't keep trying and looping
    if (isSessionDead && !url.includes("/auth/login")) {
        throw new Error("Session expired. Please log in again.");
    }

    const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };

    if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
        credentials: "include", // send HttpOnly cookies automatically
    });

    // Token expired — attempt silent refresh once
    if (response.status === 401 && !url.includes("/auth/refresh") && !url.includes("/auth/login")) {
        if (isSessionDead) throw new Error("Session expired");

        if (!isRefreshing) {
            isRefreshing = true;

            try {
                // deviceId is the only non-sensitive value we keep in localStorage
                const deviceId = typeof window !== "undefined"
                    ? (localStorage.getItem("device_id") ?? "web-browser")
                    : "web-browser";

                const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ deviceId }),
                });

                if (!refreshResponse.ok) throw new Error("Refresh failed");

                isRefreshing = false;
                onRefreshed(true);
            } catch {
                isRefreshing = false;
                isSessionDead = true; // Mark session as dead to stop loops
                onRefreshed(false);

                if (typeof window !== "undefined") {
                    // Force clear user_role cookie if possible (it's not HttpOnly)
                    // This helps middleware stop thinking we are logged in
                    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

                    // Only redirect/reload if we aren't already on the login page
                    if (window.location.pathname !== "/login") {
                        window.location.href = "/login";
                    }
                }
                throw new Error("Session expired. Please log in again.");
            }
        }

        // Queue the original request until refresh completes
        return new Promise((resolve, reject) => {
            refreshSubscribers.push((ok) => {
                if (!ok) return reject(new Error("Session expired"));
                resolve(fetcher(url, options));
            });
        });
    }

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const error = new Error(errorBody.message || "Something went wrong");
        (error as any).error = errorBody.error;
        (error as any).data = errorBody.data;
        throw error;
    }

    if (url.includes("/auth/login")) {
        isSessionDead = false;
    }

    return response.json();
}

export const api = {
    get: (url: string, options?: RequestInit) =>
        fetcher(url, { ...options, method: "GET" }),
    post: (url: string, body: any, options?: RequestInit) =>
        fetcher(url, { ...options, method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
    put: (url: string, body: any, options?: RequestInit) =>
        fetcher(url, { ...options, method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }),
    delete: (url: string, options?: RequestInit) =>
        fetcher(url, { ...options, method: "DELETE" }),
};
