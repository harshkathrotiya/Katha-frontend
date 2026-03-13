"use client";

import React, { useEffect } from "react";
import { Button } from "./Button";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = "max-w-lg" }: ModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Smooth Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
            />

            {/* Minimal Professional Container */}
            <div className={`relative w-full ${maxWidth} transform transition-all duration-300 animate-in zoom-in-95 scale-95 origin-center`}>
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-xl shadow-slate-900/5 overflow-hidden">

                    {/* Header */}
                    <div className="px-6 pt-6 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-[#8b1c1c] rounded-full opacity-80" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="px-6 py-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {children}
                        </div>
                    </div>

                    {/* Footer Area */}
                    <div className="px-6 py-5 flex justify-end gap-3 border-t border-slate-50 dark:border-slate-800/30 bg-slate-50/30 dark:bg-slate-900/10">
                        {footer || (
                            <Button
                                variant="outline"
                                className="rounded-lg px-6 h-9 text-xs font-bold uppercase tracking-wider"
                                onClick={onClose}
                            >
                                Close
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
