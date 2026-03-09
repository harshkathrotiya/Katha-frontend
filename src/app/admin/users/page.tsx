"use client";

import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import {
    AlertCircle, CheckCircle2, Trash2, Edit2,
    Library, Shield, User, Mail, Lock,
    Database, Users, Smartphone, Sun, Moon
} from "lucide-react";
import { useTheme } from "next-themes";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    const [modalConfig, setModalConfig] = useState<{
        type: "CREATE" | "EDIT" | "DELETE" | "SUCCESS" | "ERROR";
        isOpen: boolean;
        title: string;
        data?: any;
        message?: string;
    }>({ type: "CREATE", isOpen: false, title: "" });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "USER",
        password: "",
        storageQuotaGB: "10"
    });

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/admin/users");
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        const handleOpenModal = () => showModal("CREATE", "Add New User");
        window.addEventListener("open-add-user-modal", handleOpenModal);
        return () => window.removeEventListener("open-add-user-modal", handleOpenModal);
    }, []);

    const showModal = (type: any, title: string, data?: any, message?: string) => {
        if (data && type === "EDIT") {
            setFormData({
                name: data.name,
                email: data.email,
                role: data.role,
                password: "",
                storageQuotaGB: (Number(data.storageQuotaBytes) / (1024 * 1024 * 1024)).toString()
            });
        } else if (type === "CREATE") {
            setFormData({ name: "", email: "", role: "USER", password: "", storageQuotaGB: "10" });
        }
        setModalConfig({ type, isOpen: true, title, data, message });
    };

    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

    const handleCreateUser = async () => {
        try {
            const response = await api.post("/auth/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                storageQuotaBytes: Number(formData.storageQuotaGB) * 1024 * 1024 * 1024
            });
            if (response.success) {
                closeModal();
                showModal("SUCCESS", "User Added!", null, `${formData.name} is now registered in the system.`);
                fetchUsers();
            }
        } catch (error: any) {
            const title = error.error?.code === "VALIDATION_ERROR" ? "Check Details" :
                error.error?.code === "EMAIL_EXISTS" ? "Email Already Exists" : "Something Went Wrong";
            showModal("ERROR", title, null, error.message);
        }
    };

    const handleEditUser = async () => {
        try {
            const userId = modalConfig.data.id;
            const response = await api.put(`/admin/users/${userId}`, {
                name: formData.name, email: formData.email, role: formData.role,
                ...(formData.password ? { password: formData.password } : {})
            });

            const originalGB = (Number(modalConfig.data.storageQuotaBytes) / (1024 * 1024 * 1024)).toString();
            if (formData.storageQuotaGB !== originalGB) {
                await api.put(`/admin/users/${userId}/quota`, { quotaGB: Number(formData.storageQuotaGB) });
            }

            if (response.success) {
                closeModal();
                showModal("SUCCESS", "Changes Saved", null, `Information for ${formData.name} has been updated.`);
                fetchUsers();
            }
        } catch (error: any) {
            const title = error.error?.code === "LAST_ADMIN_PROTECTION" ? "Security Rule" : "Update Failed";
            showModal("ERROR", title, null, error.message);
        }
    };

    const handleDeleteUser = async () => {
        try {
            const response = await api.delete(`/admin/users/${modalConfig.data.id}`);
            if (response.success) {
                closeModal();
                showModal("SUCCESS", "User Deleted", null, "The user and their files have been removed from the system.");
                fetchUsers();
            }
        } catch (error: any) {
            const title = error.error?.code === "LAST_ADMIN_PROTECTION" ? "Security Rule" : "Delete Blocked";
            showModal("ERROR", title, null, error.message);
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return "0 Bytes";
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + ["Bytes", "KB", "MB", "GB", "TB"][i];
    };

    if (isLoading) {
        return (
            <div className="p-12 flex items-center justify-center min-h-[500px]">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-maroon/10 border-t-maroon rounded-full animate-spin" />
                    <p className="mt-4 text-slate-400 font-bold">Loading Users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${isDarkMode ? "bg-slate-900/40 border-slate-800/30" : "bg-white border-slate-100 shadow-sm shadow-slate-200/10"}`}>
                <Table>
                    <TableHeader className={`${isDarkMode ? "border-slate-800/20" : "border-slate-100/60"}`}>
                        <TableRow className="hover:bg-transparent transition-none border-b">
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Name</TableHead>
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Role</TableHead>
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Storage</TableHead>
                            <TableHead className="py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Usage</TableHead>
                            <TableHead className="text-right py-4 px-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className={`transition-all duration-300 border-b last:border-0 group ${isDarkMode ? "hover:bg-slate-800/20 border-slate-800/30" : "hover:bg-slate-50/40 border-slate-50"}`}>
                                <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base transition-colors ${isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className={`font-semibold leading-tight ${isDarkMode ? "text-slate-200" : "text-slate-900"}`}>{user.name}</p>
                                            <p className="text-xs text-slate-400 font-medium tracking-tight">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-all ${user.role === "ADMIN"
                                        ? isDarkMode ? "bg-red-500/5 text-red-500/80 border-red-500/10" : "bg-red-50 text-red-500 border-red-100/60"
                                        : isDarkMode ? "bg-slate-800/40 text-slate-500 border-slate-700/30" : "bg-slate-50 text-slate-400 border-slate-100/60"
                                        }`}>
                                        <Shield size={10} strokeWidth={2.5} />
                                        {user.role}
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 font-medium text-slate-500 tabular-nums text-sm transition-colors">{formatBytes(user.storageQuotaBytes)}</TableCell>
                                <TableCell className="py-4 px-6">
                                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-500">{Math.round((user.storageUsed / user.storageQuotaBytes) * 100)}%</span>
                                            <span className="text-[9px] font-medium text-slate-400">{formatBytes(user.storageUsed)}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${(user.storageUsed / user.storageQuotaBytes) > 0.8 ? "bg-red-500" : "bg-[#8b1c1c]"
                                                    }`}
                                                style={{ width: `${Math.min(100, (user.storageUsed / user.storageQuotaBytes) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right py-4 px-6">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => showModal("EDIT", "Edit User", user)}
                                            className={`p-2 rounded-lg transition-all ${isDarkMode ? "text-slate-500 hover:text-slate-200 hover:bg-slate-800" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100/50"}`}
                                            title="Edit user details"
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        <button
                                            onClick={() => showModal("DELETE", "Delete User", user)}
                                            className={`p-2 rounded-lg transition-all ${isDarkMode ? "text-slate-500 hover:text-red-400 hover:bg-red-500/10" : "text-slate-400 hover:text-red-600 hover:bg-red-50/50"}`}
                                            title="Remove user"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Simple Easy Modal Content */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <Button variant="outline" className="rounded-xl px-6" onClick={closeModal} type="button">Cancel</Button>
                        {modalConfig.type === "DELETE" ? (
                            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 font-bold" type="submit" form="delete-user-form">
                                Delete User
                            </Button>
                        ) : modalConfig.type === "CREATE" ? (
                            <Button variant="maroon" className="rounded-xl px-8 font-bold" form="admin-user-form" type="submit">Add User</Button>
                        ) : modalConfig.type === "EDIT" ? (
                            <Button variant="maroon" className="rounded-xl px-8 font-bold" form="admin-user-form" type="submit">Save Changes</Button>
                        ) : (
                            <Button variant="maroon" className="rounded-xl px-10 font-bold" type="submit" form="status-modal-form">Continue</Button>
                        )}
                    </div>
                }
            >
                {/* Easy Form Content */}
                {(modalConfig.type === "CREATE" || modalConfig.type === "EDIT") && (
                    <form
                        id="admin-user-form"
                        className="space-y-6 py-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            modalConfig.type === "CREATE" ? handleCreateUser() : handleEditUser();
                        }}
                    >
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2 group">
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <User size={14} className="text-slate-400" />
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                </div>
                                <Input
                                    placeholder="Enter Name"
                                    value={formData.name}
                                    className={`rounded-xl h-12 border-slate-200 text-sm font-medium ${isDarkMode ? "bg-slate-800 text-slate-200" : "bg-white text-slate-900"}`}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <Mail size={14} className="text-slate-400" />
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                </div>
                                <Input
                                    placeholder="email@address.com"
                                    type="email"
                                    value={formData.email}
                                    className={`rounded-xl h-12 border-slate-200 text-sm font-medium ${isDarkMode ? "bg-slate-800 text-slate-200" : "bg-white text-slate-900"}`}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <Shield size={14} className="text-slate-400" />
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">User Type</label>
                                    </div>
                                    <select
                                        className={`w-full h-14 rounded-2xl border-transparent px-5 text-sm font-bold focus:ring-2 focus:ring-maroon/20 outline-none appearance-none cursor-pointer ${isDarkMode ? "bg-slate-800 text-slate-200" : "bg-slate-50 text-slate-900"}`}
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="USER">Regular User</option>
                                        <option value="ADMIN">System Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <Database size={14} className="text-slate-400" />
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Storage Limit (GB)</label>
                                    </div>
                                    <Input
                                        placeholder="10"
                                        type="number"
                                        value={formData.storageQuotaGB}
                                        className={`rounded-2xl h-14 border-transparent transition-all text-sm font-bold ${isDarkMode ? "bg-slate-800 text-slate-200" : "bg-slate-50 text-slate-900 focus:bg-white"}`}
                                        onChange={(e) => setFormData({ ...formData, storageQuotaGB: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <Lock size={14} className="text-slate-400" />
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                </div>
                                <Input
                                    placeholder={modalConfig.type === "EDIT" ? "Leave empty to keep same" : "At least 6 letters"}
                                    type="password"
                                    value={formData.password}
                                    className={`rounded-2xl h-14 border-transparent transition-all text-sm font-bold placeholder:text-slate-400 ${isDarkMode ? "bg-slate-800 text-slate-200" : "bg-slate-50 text-slate-900 focus:bg-white"}`}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </form>
                )}

                {/* Simple Delete Confirmation */}
                {modalConfig.type === "DELETE" && (
                    <form
                        id="delete-user-form"
                        className="flex flex-col items-center text-center gap-6 py-8"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleDeleteUser();
                        }}
                    >
                        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center border shadow-inner transition-colors ${isDarkMode ? "bg-red-900/20 border-red-900/40 text-red-500" : "bg-red-50 border-red-100 text-red-600"}`}>
                            <Trash2 size={40} />
                        </div>
                        <div>
                            <p className={`text-lg font-bold tracking-tight ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>Are you sure?</p>
                            <p className="text-sm text-slate-500 mt-3 max-w-[320px] font-medium leading-relaxed">
                                You are deleting <span className={isDarkMode ? "text-slate-100 font-bold" : "text-slate-900 font-bold"}>{modalConfig.data?.name}</span>. This will also delete all their files. You cannot undo this action.
                            </p>
                        </div>
                    </form>
                )}

                {/* Status and Terminal Modals */}
                {(modalConfig.type === "SUCCESS" || modalConfig.type === "ERROR") && (
                    <form
                        id="status-modal-form"
                        className="flex flex-col items-center text-center gap-6 py-8"
                        onSubmit={(e) => {
                            e.preventDefault();
                            closeModal();
                        }}
                    >
                        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center border shadow-inner transition-colors ${modalConfig.type === "SUCCESS"
                                ? isDarkMode ? "bg-emerald-900/20 border-emerald-900/40 text-emerald-500" : "bg-emerald-50 border-emerald-100 text-emerald-500"
                                : isDarkMode ? "bg-red-900/20 border-red-900/40 text-red-500" : "bg-red-50 border-red-100 text-red-500"
                            }`}>
                            {modalConfig.type === "SUCCESS" ? <CheckCircle2 size={48} strokeWidth={1.5} /> : <AlertCircle size={48} strokeWidth={1.5} />}
                        </div>
                        <div>
                            <p className={`text-lg font-bold tracking-tight ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{modalConfig.title}</p>
                            <p className="text-sm text-slate-500 mt-2 font-medium tracking-tight">{modalConfig.message}</p>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
