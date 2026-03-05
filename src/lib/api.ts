export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetcher(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("auth_token");

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Something went wrong fetching data");
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
