"use client";

import React from "react";

export function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className="w-full overflow-auto rounded-xl border border-slate-100 dark:border-slate-800/20 bg-white dark:bg-[#1e293b]/20">
            <table className={`w-full caption-bottom text-sm ${className}`}>
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <thead className={`bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/40 ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <tr className={`border-b border-slate-50 dark:border-slate-800/20 transition-all duration-300 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 ${className}`}>
            {children}
        </tr>
    );
}

export function TableHead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <th className={`h-11 px-4 text-left align-middle font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 [&:has([role=checkbox])]:pr-0 ${className}`}>
            {children}
        </th>
    );
}

export function TableCell({
    children,
    className = "",
    colSpan
}: {
    children: React.ReactNode;
    className?: string;
    colSpan?: number;
}) {
    return (
        <td
            colSpan={colSpan}
            className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 text-slate-500 dark:text-slate-400 font-medium ${className}`}
        >
            {children}
        </td>
    );
}
