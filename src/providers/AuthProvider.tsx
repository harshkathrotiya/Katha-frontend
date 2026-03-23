"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, API_URL } from "@/lib/api";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            // Tokens live in HttpOnly cookies — the browser sends them automatically.
            // We simply call the profile endpoint; if the cookie is missing/expired
            // the server returns 401 and api.ts redirects to /login.
            const response = await api.get("/user/profile");
            if (response.success && response.data) {
                setUser({
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                    role: response.data.role,
                });
                // Keep display name cached for instant hydration on hard refresh
                localStorage.setItem("user_name", response.data.name);
                localStorage.setItem("user_email", response.data.email);
            }
        } catch {
            // 401 means no valid session — leave user as null
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // If we are on the login page, we don't need to verify the session
        // (the middleware already redirects us away if we have a valid session cookie).
        if (typeof window !== "undefined" && window.location.pathname === "/login") {
            setIsLoading(false);
            return;
        }

        // Optimistic: pre-fill from localStorage so the UI is instant,
        // then verify with the server in the background.
        const cachedName = typeof window !== "undefined" ? localStorage.getItem("user_name") : null;
        const cachedEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") : null;
        if (cachedName) {
            setUser({ id: "", name: cachedName, email: cachedEmail ?? "", role: "" });
        }
        fetchProfile();
    }, [fetchProfile]);

    const logout = useCallback(async () => {
        try {
            // Tells the server to clear the HttpOnly cookies + invalidate refresh token
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // Best-effort — proceed with client-side cleanup regardless
        }

        // Clear any cached display data
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_email");
        localStorage.removeItem("device_id");

        setUser(null);
        window.location.href = "/login";
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, logout, refreshUser: fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
