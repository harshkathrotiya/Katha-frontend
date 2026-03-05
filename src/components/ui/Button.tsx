"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "maroon" | "gray";
    size?: "sm" | "md" | "lg";
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg hover:shadow-indigo-500/30",
        maroon: "bg-maroon text-white hover:opacity-90 focus:ring-maroon shadow-lg",
        gray: "bg-gray-btn text-white hover:opacity-90 focus:ring-slate-400 shadow-md",
        secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-700",
        outline: "border-2 border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
        ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-400",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
