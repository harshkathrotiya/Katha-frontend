"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            // Get or create a unique device ID for this browser
            let deviceId = localStorage.getItem("device_id");
            if (!deviceId) {
                deviceId = `web-${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;
                localStorage.setItem("device_id", deviceId);
            }

            // Call the login API
            const response = await api.post("/auth/login", {
                email,
                password,
                deviceId,
                deviceName: "Web Browser"
            });

            if (response.success) {
                const { user, tokens } = response.data;

                // Store tokens and identifiers for refresh logic
                localStorage.setItem("auth_token", tokens.accessToken);
                localStorage.setItem("refresh_token", tokens.refreshToken);
                localStorage.setItem("user_id", user.id);
                localStorage.setItem("user_role", user.role);
                localStorage.setItem("device_id", deviceId);

                // Set cookie for middleware (server-side protection)
                document.cookie = `auth_token=${tokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
                document.cookie = `user_role=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}`;

                setIsLoading(false);

                // Role-based redirection
                if (user.role === "ADMIN") {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/");
                }
            }
        } catch (err: any) {
            console.error("Login failed:", err);

            // Extract detailed validation errors if available
            let errorMessage = err.message || "Invalid credentials or device pending approval";
            if (err.error?.code === 'VALIDATION_ERROR' && err.error.details) {
                // Map technical Zod paths to user-friendly field names
                const fieldMap: Record<string, string> = {
                    'password': 'Password',
                    'email': 'Email Address'
                };

                const details = err.error.details.map((d: any) => {
                    const fieldName = fieldMap[d.path[0]] || 'Field';
                    return d.message.replace(/^String/, fieldName);
                }).join(". ");

                errorMessage = details;
            }

            setError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Small Header Text */}
            <p className="text-[12px] tracking-[1px] text-[#666] mb-[10px] uppercase font-medium">
                || Jay Swaminarayan ||
            </p>

            {/* Title */}
            <h1 className="text-[28px] text-[#8b1c1c] font-semibold mb-[30px] font-outfit">
                Satsang Katha
            </h1>

            <form className="w-full" onSubmit={handleLogin}>
                <div className="space-y-[15px]">
                    {error && (
                        <div className="text-red-500 text-sm font-medium text-center mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}
                    <Input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-[12px_14px] rounded-[12px] border-none bg-white text-[16px] h-[55px] focus-visible:ring-1 focus-visible:ring-maroon shadow-sm"
                        required
                        autoComplete="email"
                    />

                    <div className="relative group">
                        <Input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full p-[12px_14px] rounded-[12px] border-none bg-white text-[16px] h-[55px] focus-visible:ring-1 focus-visible:ring-maroon shadow-sm pr-12"
                            required
                            autoComplete="current-password"
                        />
                        {/* Eye Icon */}
                        <div
                            className="absolute right-[15px] top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666] cursor-pointer transition-colors p-1"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff size={20} strokeWidth={2.5} />
                            ) : (
                                <Eye size={20} strokeWidth={2.5} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-[25px] flex flex-col gap-[15px]">
                    <Button
                        type="button"
                        variant="maroon"
                        className="w-full h-[55px] border-none rounded-[12px] text-[18px] font-medium cursor-pointer shadow-lg"
                    >
                        Send Login Request
                    </Button>

                    <Button
                        type="submit"
                        variant="gray"
                        disabled={isLoading}
                        className="w-full h-[55px] border-none rounded-[12px] text-[18px] font-medium shadow-sm"
                    >
                        {isLoading ? "Signing in..." : "Login"}
                    </Button>
                </div>
            </form>

            <p className="text-[10px] text-slate-400 mt-[40px] font-medium">
                SGVP AHMEDABAD &copy; {new Date().getFullYear()}
            </p>
        </div>
    );
}
