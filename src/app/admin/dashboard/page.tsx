"use client";

import React from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminDashboard() {
    const [stats, setStats] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/admin/stats");
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatBytes = (bytes: number) => {
        if (!bytes) return "0 GB";
        const gb = bytes / (1024 * 1024 * 1024);
        return gb.toFixed(2) + " GB";
    };

    if (isLoading) {
        return <div className="p-8 animate-pulse text-slate-400 font-bold">Please wait...</div>;
    }

    const statCards = [
        { label: "Total Users", value: stats?.totalUsers || "0", color: "bg-blue-50" },
        { label: "New Requests", value: stats?.pendingApprovals || "0", color: "bg-orange-50" },
        { label: "Total Files", value: stats?.totalFiles || "0", color: "bg-green-50" },
        { label: "Storage Used", value: formatBytes(stats?.totalStorageUsed), color: "bg-purple-50" },
    ];

    return (
        <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className={`${stat.color} p-6 rounded-2xl shadow-sm border border-slate-100`}>
                        <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-bold mt-2 text-slate-800">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold mb-6 text-slate-700">Go to:</h2>
                <div className="flex flex-wrap gap-4">
                    <Link href="/admin/devices" className="bg-[#8b1c1c] text-white px-6 py-3 rounded-xl hover:bg-red-900 transition-colors font-bold shadow-lg shadow-red-900/10">
                        Approve Phones/PCs
                    </Link>
                    <Link href="/admin/users" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-900 transition-colors font-bold shadow-lg shadow-slate-900/10">
                        See All Users
                    </Link>
                    <Link href="/admin/storage" className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors font-bold">
                        Check Storage
                    </Link>
                </div>
            </div>
        </div>
    );
}
