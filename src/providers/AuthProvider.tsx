"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulating auth check
        const checkAuth = async () => {
            try {
                // Mocking user for demo
                // setTimeout(() => {
                //   setUser({ id: "1", name: "Samved", email: "samved@example.com", role: "user" });
                //   setIsLoading(false);
                // }, 1000);
                setIsLoading(false);
            } catch (err) {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        // Mocking login
        setUser({ id: "1", name: "Samved", email: "samved@example.com", role: "user" });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
