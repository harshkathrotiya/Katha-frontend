export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
    refreshSubscribers.map((cb) => cb(token));
    refreshSubscribers = [];
}

export async function fetcher(url: string, options: RequestInit = {}): Promise<any> {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
    });

    if (response.status === 401 && !url.includes("/auth/refresh") && !url.includes("/auth/login")) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const refreshToken = localStorage.getItem("refresh_token");
                const userId = localStorage.getItem("user_id");
                const deviceId = localStorage.getItem("device_id") || "web-browser";

                if (!refreshToken || !userId) throw new Error("No refresh token available");

                const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken, userId, deviceId }),
                });

                if (!refreshResponse.ok) throw new Error("Refresh failed");

                const refreshData = await refreshResponse.json();
                const newTokens = refreshData.data.tokens;

                localStorage.setItem("auth_token", newTokens.accessToken);
                localStorage.setItem("refresh_token", newTokens.refreshToken);

                // Update cookies for server-side middleware
                document.cookie = `auth_token=${newTokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}`;

                isRefreshing = false;
                onRefreshed(newTokens.accessToken);
            } catch (err) {
                isRefreshing = false;
                // Clear auth and logout if refresh fails
                localStorage.removeItem("auth_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user_id");
                document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

                if (typeof window !== "undefined") window.location.href = "/login";
                throw err;
            }
        }

        // Return a promise that waits for the refresh and retries
        return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
                const newHeaders = {
                    ...headers,
                    Authorization: `Bearer ${token}`,
                };
                resolve(fetcher(url, { ...options, headers: newHeaders }));
            });
        });
    }

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const error = new Error(errorBody.message || "Something went wrong fetching data");
        (error as any).error = errorBody.error;
        (error as any).data = errorBody.data;
        throw error;
    }

    return response.json();
}

export const api = {
    get: (url: string, options?: RequestInit) => fetcher(url, { ...options, method: "GET" }),
    post: (url: string, body: any, options?: RequestInit) =>
        fetcher(url, { ...options, method: "POST", body: JSON.stringify(body) }),
    put: (url: string, body: any, options?: RequestInit) =>
        fetcher(url, { ...options, method: "PUT", body: JSON.stringify(body) }),
    delete: (url: string, options?: RequestInit) => fetcher(url, { ...options, method: "DELETE" }),
};
