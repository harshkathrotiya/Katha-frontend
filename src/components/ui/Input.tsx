"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-sm font-semibold text-slate-700 ml-1">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    "flex h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm",
                    "ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    "placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
                    "disabled:opacity-50 transition-all hover:border-slate-300",
                    error && "border-red-500 focus-visible:ring-red-500",
                    !error && "focus:border-indigo-500",
                    className
                )}
                {...props}
            />
            {error && (
                <span className="text-xs font-medium text-red-500 ml-1">
                    {error}
                </span>
            )}
        </div>
    );
}
