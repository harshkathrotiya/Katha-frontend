"use client";

import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { HardDrive, AlertTriangle, RefreshCcw, CheckCircle2, CloudLightning } from "lucide-react";
import { useTheme } from "next-themes";
import { api } from "@/lib/api";

export default function StoragePage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [stats, setStats] = useState({ totalUsed: 0, totalQuota: 0 });
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    // Modal State
    const [modal, setModal] = useState<{
        isOpen: boolean;
        user: any;
        newQuota: string;
    }>({ isOpen: false, user: null, newQuota: "" });

    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({ isOpen: false, title: "", message: "" });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/admin/users");
            if (response.success) {
                setUsers(response.data);
                const used = response.data.reduce((acc: number, u: any) => acc + Number(u.storageUsed), 0);
                const quota = response.data.reduce((acc: number, u: any) => acc + Number(u.storageQuotaBytes), 0);
                setStats({ totalUsed: used, totalQuota: quota });
            }
        } catch (error) {
            console.error("Failed to fetch storage data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
        const handleRefresh = () => fetchData();
        window.addEventListener("refresh-storage-stats", handleRefresh);
        return () => window.removeEventListener("refresh-storage-stats", handleRefresh);
    }, []);

    const handleUpgradeClick = (user: any) => {
        setModal({
            isOpen: true,
            user,
            newQuota: (Number(user.storageQuotaBytes) / (1024 * 1024 * 1024)).toString()
        });
    };

    const handleUpdateQuota = async () => {
        try {
            setIsUpdating(true);
            const response = await api.put(`/admin/users/${modal.user.id}/quota`, {
                quotaGB: Number(modal.newQuota)
            });

            if (response.success) {
                setModal({ ...modal, isOpen: false });
                setStatusModal({
                    isOpen: true,
                    title: "Quota Updated",
                    message: `Storage limit for ${modal.user.name} has been increased to ${modal.newQuota} GB.`
                });
                fetchData();
            }
        } catch (error: any) {
            alert(error.message || "Failed to update quota");
        } finally {
            setIsUpdating(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#8b1c1c]/20 border-t-[#8b1c1c] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className={`mb-6 p-6 rounded-xl border flex items-center gap-5 transition-all duration-300 ${isDarkMode ? "bg-slate-900/40 border-slate-800/30" : "bg-white border-slate-100 shadow-sm shadow-slate-200/5"
                }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? "bg-[#8b1c1c]/10 text-[#8b1c1c]" : "bg-[#8b1c1c]/5 text-[#8b1c1c]"
                    }`}>
                    <CloudLightning size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Infrastructure Capacity</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-slate-200" : "text-slate-900"}`}>{formatBytes(stats.totalUsed)}</span>
                        <span className="text-slate-300 font-medium">/</span>
                        <span className="text-slate-400 font-semibold">{formatBytes(stats.totalQuota)}</span>
                    </div>
                </div>
            </div>

            <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${isDarkMode ? "bg-slate-900/40 border-slate-800/30" : "bg-white border-slate-100 shadow-sm shadow-slate-200/10"}`}>
                <Table>
                    <TableHeader className={`${isDarkMode ? "border-slate-800/20" : "border-slate-100/60"}`}>
                        <TableRow className="hover:bg-transparent transition-none border-b">
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Account</TableHead>
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Live Usage</TableHead>
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Allocation</TableHead>
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Status</TableHead>
                            <TableHead className="text-right py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => {
                            const percent = (user.storageUsed / user.storageQuotaBytes) * 100;
                            const isNearLimit = percent > 85;

                            return (
                                <TableRow key={user.id} className={`transition-all duration-300 border-b last:border-0 group ${isDarkMode ? "hover:bg-slate-800/20 border-slate-800/30" : "hover:bg-slate-50/40 border-slate-50"}`}>
                                    <TableCell className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className={`font-semibold leading-tight ${isDarkMode ? "text-slate-200" : "text-slate-900"}`}>{user.name}</span>
                                            <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="flex flex-col gap-1.5 min-w-[200px]">
                                            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                                <span>{formatBytes(user.storageUsed)}</span>
                                                <span className={isNearLimit ? "text-red-500" : ""}>{Math.round(percent)}% UTILIZED</span>
                                            </div>
                                            <div className={`w-full h-1.5 rounded-full overflow-hidden p-0.5 border ${isDarkMode ? "bg-slate-800/50 border-slate-700/30" : "bg-slate-50 border-slate-100"
                                                }`}>
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${isNearLimit ? "bg-red-500" : "bg-[#8b1c1c]"}`}
                                                    style={{ width: `${Math.min(100, percent)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className={`py-4 px-6 font-bold text-xs tabular-nums ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                                        {formatBytes(user.storageQuotaBytes)}
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        {isNearLimit ? (
                                            <div className="flex items-center gap-1.5 text-red-500 font-bold text-[9px] uppercase tracking-widest bg-red-500/5 px-2 py-0.5 rounded-lg border border-red-500/20 inline-flex">
                                                <AlertTriangle size={10} />
                                                Action Required
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[9px] uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/20 inline-flex">
                                                <CheckCircle2 size={10} />
                                                Optimized
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right py-4 px-6">
                                        <button
                                            onClick={() => handleUpgradeClick(user)}
                                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-900 text-white hover:bg-slate-800"
                                                }`}
                                        >
                                            Modify Quota
                                        </button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Upgrade Modal */}
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title="Manage Storage Quota"
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <Button variant="outline" className="rounded-xl px-6" onClick={() => setModal({ ...modal, isOpen: false })} type="button">Cancel</Button>
                        <Button variant="maroon" className="rounded-xl px-8" form="storage-quota-form" type="submit" disabled={isUpdating}>
                            {isUpdating ? "Saving..." : "Update Quota"}
                        </Button>
                    </div>
                }
            >
                <form
                    id="storage-quota-form"
                    className="space-y-6 py-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateQuota();
                    }}
                >
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/30 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <HardDrive size={24} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{modal.user?.name}</p>
                            <p className="text-xs text-slate-500">Current Usage: {formatBytes(modal.user?.storageUsed || 0)}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">New Allocation (GB)</label>
                        <Input
                            type="number"
                            value={modal.newQuota}
                            className="text-lg font-bold rounded-xl h-14 border-slate-200 dark:border-slate-700 px-5 focus:ring-maroon"
                            onChange={(e) => setModal({ ...modal, newQuota: e.target.value })}
                        />
                        <p className="text-[11px] text-slate-400 ml-1 italic font-medium">Enter the total capacity in Gigabytes</p>
                    </div>
                </form>
            </Modal>

            {/* Success Status Modal */}
            <Modal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                title="Operation Successful"
                footer={
                    <Button variant="maroon" className="rounded-xl px-10 h-10 text-[10px] font-bold uppercase tracking-wider" type="submit" form="storage-success-form">
                        Excellent
                    </Button>
                }
            >
                <form
                    id="storage-success-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        setStatusModal({ ...statusModal, isOpen: false });
                    }}
                    className="flex flex-col items-center text-center py-6 gap-4"
                >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors ${isDarkMode ? "bg-emerald-900/20 text-emerald-500" : "bg-emerald-50 text-emerald-500"
                        }`}>
                        <CheckCircle2 size={40} />
                    </div>
                    <p className={`font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        {statusModal.message}
                    </p>
                </form>
            </Modal>
        </div>
    );
}
