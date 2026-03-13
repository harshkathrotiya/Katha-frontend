"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                const role = localStorage.getItem("user_role");

                if (token) {
                    const name = localStorage.getItem("user_name");
                    const email = localStorage.getItem("user_email");
                    
                    setUser({
                        id: localStorage.getItem("user_id") || "current",
                        name: name || "User",
                        email: email || "user@katha.com",
                        role: role || "USER"
                    });
                }
                setIsLoading(false);
            } catch (err) {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (token) {
                // Fire and forget logout on backend
                fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/logout`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` }
                }).catch(() => { });
            }
        } catch (e) { }

        // Clear cookies
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        // Clear storage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_id");
        localStorage.removeItem("device_id");

        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, logout }}>
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
