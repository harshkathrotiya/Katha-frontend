"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Book, ScrollText } from "lucide-react";

export default function DashboardPage() {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const categories = [
        {
            title: "Katha collection",
            href: "/katha",
            image: "/images/Katha.png",
        },
        {
            title: "Granth",
            href: "/granth",
            image: "/images/Granth.png",
        },
        {
            title: "Book",
            href: "/book",
            image: "/images/Book.png",
        },
    ];

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* Top Stat Boxes */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-16">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-24 md:h-32 bg-[#eeeeee] dark:bg-slate-900 rounded-[16px] md:rounded-[24px] hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-slate-900/50 transition-all duration-500 cursor-pointer group flex items-center justify-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-lg group-hover:text-[#8b1D1D] dark:group-hover:text-[#a32b2b] group-hover:scale-110 transition-all duration-500 text-center px-2">
                            {i === 1 && "Total Katha"}
                            {i === 2 && "New Granths"}
                            {i === 3 && "Daily Books"}
                            {i === 4 && "Active Users"}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 z-10 max-w-6xl mx-auto w-full px-2 md:px-4">
                {categories.map((cat, idx) => (
                    <Link
                        key={idx}
                        href={cat.href}
                        className="group relative bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden block border border-slate-100 dark:border-slate-800"
                    >
                        <Image
                            src={cat.image}
                            alt={cat.title}
                            width={800}
                            height={600}
                            className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                    </Link>
                ))}
            </div>

            {/* Bottom Visual Elements */}
            <div className="mt-auto pt-12 md:pt-24 pb-4 flex flex-col items-center justify-center">
                {/* Silhouette Effect */}
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-full max-w-[1600px] opacity-[0.11] dark:opacity-[0.2] pointer-events-none select-none invert dark:invert-0 z-0 overflow-visible h-48 md:h-[420px]">
                    <Image
                        src="/images/SGVP-building.png"
                        alt="Temple Silhouette"
                        width={1600}
                        height={500}
                        className="w-full h-full object-bottom md:object-contain scale-[1.4] md:scale-[1.25] translate-y-0"
                        priority
                    />
                </div>

                {/* Left/Right Diagonal Decor Lines (from screenshot) */}
                <div className="absolute bottom-10 left-[18%] w-[1px] h-64 bg-gradient-to-t from-slate-200 dark:from-slate-800 to-transparent rotate-[65deg] opacity-50 hidden xl:block z-10" />
                <div className="absolute bottom-10 right-[18%] w-[1px] h-64 bg-gradient-to-t from-slate-200 dark:from-slate-800 to-transparent -rotate-[65deg] opacity-50 hidden xl:block z-10" />

                {/* SGVP Logo - Centered over building silhouette */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 hover:scale-105 transition-transform duration-500 cursor-pointer">
                    <Image
                        src="/images/Logoooo.png"
                        alt="SGVP Logo"
                        width={140}
                        height={50}
                        className="h-8 md:h-12 w-auto object-contain dark:brightness-125"
                    />
                </div>
                <div className="h-24 md:h-48 w-full" /> {/* Spacer to allow absolute elements space */}
            </div>
        </div>
    );
}
