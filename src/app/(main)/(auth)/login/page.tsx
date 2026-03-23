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

            // device_id is non-sensitive — safe in localStorage (no tokens here)
            let deviceId = localStorage.getItem("device_id");
            if (!deviceId) {
                deviceId = `web-${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;
                localStorage.setItem("device_id", deviceId);
            }

            const response = await api.post("/auth/login", {
                email,
                password,
                deviceId,
                deviceName: "Web Browser",
                platform: "web",
            });

            if (response.success) {
                const { user } = response.data;

                // Tokens are set as HttpOnly cookies by the server — never stored here.
                // Only store non-sensitive display data.
                localStorage.setItem("user_name", user.name);
                localStorage.setItem("user_email", user.email);

                setIsLoading(false);

                if (user.role === "ADMIN") {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/user");
                }
            }
        } catch (err: any) {
            console.error("Login failed:", err);

            let errorMessage = err.message || "Invalid credentials or device pending approval";
            if (err.error?.code === "VALIDATION_ERROR" && err.error.details) {
                const fieldMap: Record<string, string> = {
                    password: "Password",
                    email: "Email Address",
                };
                errorMessage = err.error.details
                    .map((d: any) => {
                        const fieldName = fieldMap[d.path[0]] || "Field";
                        return d.message.replace(/^String/, fieldName);
                    })
                    .join(". ");
            }

            setError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-[12px] tracking-[1px] text-[#666] mb-[10px] uppercase font-medium">
                || Jay Swaminarayan ||
            </p>

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
                        type="submit"
                        variant="maroon"
                        disabled={isLoading}
                        className="w-full h-[55px] border-none rounded-[12px] text-[18px] font-medium shadow-lg"
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
