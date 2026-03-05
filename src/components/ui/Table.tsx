"use client";

import React from "react";

export function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className="w-full overflow-auto rounded-xl border border-slate-200 bg-white">
            <table className={`w-full caption-bottom text-sm ${className}`}>
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
    return <thead className="bg-slate-50 border-b border-slate-200">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
    return <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
}

export function TableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <tr className={`border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100 ${className}`}>
            {children}
        </tr>
    );
}

export function TableHead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <th className={`h-12 px-4 text-left align-middle font-semibold text-slate-800 [&:has([role=checkbox])]:pr-0 ${className}`}>
            {children}
        </th>
    );
}

export function TableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <th className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 text-slate-600 font-normal ${className}`}>
            {children}
        </th>
    );
}
