"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Book, ScrollText } from "lucide-react";

export default function DashboardPage() {
    const categories = [
        {
            title: "Katha collection",
            href: "/katha",
            icon: <BookOpen className="h-16 w-16 text-[#8b1D1D]" />,
        },
        {
            title: "Granth",
            href: "/granth",
            icon: <ScrollText className="h-16 w-16 text-[#8b1D1D]" />,
        },
        {
            title: "Book",
            href: "/book",
            icon: <Book className="h-16 w-16 text-[#8b1D1D]" />,
        },
    ];

    return (
        <div className="min-h-full flex flex-col p-8 md:p-12 relative overflow-hidden bg-white">
            {/* Top Stat Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-32 bg-[#eeeeee] rounded-[24px] hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 cursor-pointer group flex items-center justify-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="text-slate-300 font-bold text-lg group-hover:text-[#8b1D1D] group-hover:scale-110 transition-all duration-500">
                            {i === 1 && "Total Katha"}
                            {i === 2 && "New Granths"}
                            {i === 3 && "Daily Books"}
                            {i === 4 && "Active Users"}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 z-10 max-w-6xl mx-auto w-full px-4">
                {categories.map((cat, idx) => (
                    <Link
                        key={idx}
                        href={cat.href}
                        className="group relative bg-white h-52 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex items-center justify-between px-10 overflow-hidden border-y border-slate-50"
                    >
                        {/* Unique Maroon Side Borders as shown in screenshot */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3/4 bg-[#8b1D1D] rounded-r-lg shadow-[2px_0_10px_rgba(139,29,29,0.2)]" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3/4 bg-[#8b1D1D] rounded-l-lg shadow-[-2px_0_10px_rgba(139,29,29,0.2)]" />

                        {/* Title */}
                        <h2 className="text-[28px] font-bold text-[#8b1D1D] leading-[1.2] font-outfit max-w-[150px]">
                            {cat.title}
                        </h2>

                        {/* Icon */}
                        <div className="group-hover:scale-110 transition-transform duration-500 bg-slate-50 p-4 rounded-3xl group-hover:bg-maroon/5">
                            {cat.icon}
                        </div>

                        {/* Creative Hover Effect: Subtle radial glow */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-maroon/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </Link>
                ))}
            </div>

            {/* Bottom Visual Elements */}
            <div className="mt-auto pt-24 pb-4 flex flex-col items-center justify-center">
                {/* Silhouette Effect */}
                <div className="absolute bottom-0 left-0 w-full opacity-[0.05] pointer-events-none select-none">
                    <Image
                        src="/images/SGVP-building.png"
                        alt="Temple Silhouette"
                        width={1600}
                        height={500}
                        className="w-full h-auto object-bottom scale-110 translate-y-10"
                    />
                </div>

                {/* Diagonal Decor Lines (from screenshot) */}
                <div className="absolute bottom-20 left-1/4 w-[1px] h-32 bg-gradient-to-t from-slate-200 to-transparent rotate-[60deg] opacity-40 hidden lg:block" />
                <div className="absolute bottom-10 left-1/2 w-[1px] h-48 bg-gradient-to-t from-slate-200 to-transparent opacity-40 hidden lg:block" />
                <div className="absolute bottom-20 right-1/4 w-[1px] h-32 bg-gradient-to-t from-slate-200 to-transparent -rotate-[60deg] opacity-40 hidden lg:block" />

                {/* SGVP Logo */}
                <div className="relative z-20 hover:scale-105 transition-transform duration-500 cursor-pointer">
                    <Image
                        src="/images/Logoooo.png"
                        alt="SGVP Logo"
                        width={160}
                        height={60}
                        className="h-12 w-auto object-contain"
                    />
                </div>
            </div>
        </div>
    );
}
