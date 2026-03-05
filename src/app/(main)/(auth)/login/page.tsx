"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login
        setTimeout(() => {
            // Set a dummy cookie for the middleware
            document.cookie = "auth_token=demo_token; path=/; max-age=3600";
            setIsLoading(false);
            router.push("/");
        }, 1500);
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
                    <Input
                        placeholder="Username"
                        className="w-full p-[12px_14px] rounded-[12px] border-none bg-white text-[16px] h-[55px] focus-visible:ring-1 focus-visible:ring-maroon shadow-sm"
                        required
                        autoComplete="username"
                    />

                    <div className="relative group">
                        <Input
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
