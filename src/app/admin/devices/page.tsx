"use client";

import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CheckCircle, XCircle, Info, ShieldCheck, AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { api } from "@/lib/api";

export default function DevicesPage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    // Status Modal State
    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "success" | "error" | "info";
    }>({ isOpen: false, title: "", message: "", type: "info" });

    const fetchDevices = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/admin/devices/pending");
            if (response.success) {
                setDevices(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch devices:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDevices();
        const handleRefresh = () => fetchDevices();
        window.addEventListener("refresh-device-list", handleRefresh);
        return () => window.removeEventListener("refresh-device-list", handleRefresh);
    }, []);

    const showStatus = (title: string, message: string, type: "success" | "error" | "info" = "success") => {
        setModal({ isOpen: true, title, message, type });
    };

    const handleApprove = async (userId: string, deviceId: string) => {
        try {
            setActionLoading(deviceId);
            const response = await api.post("/admin/devices/approve", { userId, deviceId });
            if (response.success) {
                showStatus("Approved!", "The user can now use this device to login.", "success");
                fetchDevices();
            } else {
                showStatus("Error", response.message || "Could not approve this device.", "error");
            }
        } catch (error: any) {
            showStatus("Error", error.message || "Failed to communicate with the server. Please try again later.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleBlock = () => {
        showStatus("Feature Coming Soon", "The manual block feature is currently being finalized. For now, simply leaving the request 'Pending' keeps the device blocked.", "info");
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#8b1c1c]/20 border-t-[#8b1c1c] rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium tracking-tight">Wait a moment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className={`p-4 rounded-xl border flex items-start gap-3 mb-6 transition-colors ${isDarkMode ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50/50 border-emerald-100/60"
                }`}>
                <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className={`text-sm font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-900"}`}>Security is On</h4>
                    <p className={`text-xs mt-1 max-w-2xl font-medium leading-relaxed ${isDarkMode ? "text-emerald-500/70" : "text-emerald-800/70"}`}>
                        Every new phone or computer must be approved by you here before they can login.
                    </p>
                </div>
            </div>

            <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${isDarkMode ? "bg-slate-900/40 border-slate-800/30" : "bg-white border-slate-100 shadow-sm shadow-slate-200/10"}`}>
                <Table>
                    <TableHeader className={`${isDarkMode ? "border-slate-800/20" : "border-slate-100/60"}`}>
                        <TableRow className="hover:bg-transparent transition-none border-b">
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">User</TableHead>
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Phone/PC</TableHead>
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Date</TableHead>
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Status</TableHead>
                            <TableHead className="text-right py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {devices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-24">
                                    <div className="flex flex-col items-center gap-3 opacity-30">
                                        <CheckCircle size={32} className="text-slate-400" />
                                        <p className="text-slate-500 font-bold text-sm">All clear! No new requests.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            devices.map((device) => (
                                <TableRow key={device.id} className={`transition-all duration-300 border-b last:border-0 group ${isDarkMode ? "hover:bg-slate-800/20 border-slate-800/30" : "hover:bg-slate-50/40 border-slate-50"}`}>
                                    <TableCell className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className={`font-semibold leading-tight ${isDarkMode ? "text-slate-200" : "text-slate-900"}`}>{device.user?.name || "Katha User"}</span>
                                            <span className="text-xs text-slate-400 font-medium">{device.user?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className={`px-2.5 py-1.5 rounded-lg border transition-colors ${isDarkMode ? "bg-slate-800/40 border-slate-700/30" : "bg-slate-50 border-slate-100"
                                            }`}>
                                            <p className={`font-bold text-[11px] tracking-tight ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>{device.deviceName}</p>
                                            <p className="text-[9px] text-slate-500 mt-0.5 tracking-wider uppercase">{device.deviceId}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-slate-400 font-medium text-xs tabular-nums">
                                        {new Date(device.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <span className={`px-2 py-0.5 rounded-lg text-bold text-[10px] uppercase tracking-widest border transition-colors ${device.approved
                                            ? isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : isDarkMode ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-orange-50 text-orange-600 border-orange-100"
                                            }`}>
                                            {device.approved ? "DONE" : "WAITING"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right py-4 px-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleApprove(device.userId, device.deviceId)}
                                                disabled={actionLoading === device.deviceId}
                                                className="bg-[#8b1c1c] text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#6b1515] transition-all disabled:opacity-50 shadow-sm"
                                            >
                                                {actionLoading === device.deviceId ? "Please wait..." : "Approve"}
                                            </button>
                                            <button
                                                onClick={handleBlock}
                                                className={`p-2 rounded-lg transition-all border ${isDarkMode ? "bg-slate-800 border-slate-700 text-slate-500 hover:text-red-400" : "bg-slate-50 border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50/50"
                                                    }`}
                                            >
                                                <XCircle size={15} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Global Status Modal */}
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                footer={
                    <Button variant="maroon" className="rounded-xl px-8" type="submit" form="device-status-form">
                        OK
                    </Button>
                }
            >
                <form
                    id="device-status-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        setModal({ ...modal, isOpen: false });
                    }}
                    className="flex flex-col items-center text-center py-4 gap-4"
                >
                    {modal.type === "success" && <CheckCircle size={64} className="text-emerald-500" />}
                    {modal.type === "error" && <AlertCircle size={64} className="text-red-500" />}
                    {modal.type === "info" && <Info size={64} className="text-blue-500" />}

                    <p className={`leading-relaxed font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        {modal.message}
                    </p>
                </form>
            </Modal>
        </div>
    );
}
