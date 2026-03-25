"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Save, ArrowLeft, CheckCircle, AlertCircle, Loader2, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    
    // Profile State
    const [name, setName] = useState(user?.name || "");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    
    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    // Feedback State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

    useEffect(() => {
        if (user) setName(user.name);
    }, [user]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: null }), 3000);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return showToast("Name cannot be empty", "error");
        
        setIsUpdatingProfile(true);
        try {
            await api.put("/user/profile", { name: name.trim() });
            await refreshUser();
            showToast("Profile updated successfully", "success");
        } catch (err: any) {
            showToast(err.message || "Failed to update profile", "error");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            return showToast("Please fill all password fields", "error");
        }
        if (newPassword !== confirmPassword) {
            return showToast("Passwords do not match", "error");
        }
        if (newPassword.length < 6) {
            return showToast("New password must be at least 6 characters", "error");
        }

        setIsChangingPassword(true);
        try {
            await api.post("/user/change-password", { currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            showToast("Password changed successfully", "success");
        } catch (err: any) {
            showToast(err.message || "Failed to change password", "error");
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="flex-1 bg-white dark:bg-slate-950 p-4 md:p-8 lg:p-12 overflow-y-auto">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 md:mb-12">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-maroon transition-colors mb-6 group font-bold uppercase tracking-widest text-[10px]"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </button>
                
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">Account Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your personal information and security preferences.</p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                
                {/* Left Side: Profile Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-[32px] bg-maroon/10 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center mb-6">
                            <span className="text-3xl font-black text-maroon uppercase">
                                {user?.name?.charAt(0) || "U"}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h2>
                        <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
                        <div className="mt-6 px-4 py-1.5 bg-maroon/5 text-maroon text-[10px] font-black uppercase tracking-widest rounded-full border border-maroon/10">
                            {user?.role || "Standard User"}
                        </div>
                    </div>
                </div>

                {/* Right Side: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Profile Form */}
                    <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-maroon/5 dark:bg-maroon/10 flex items-center justify-center text-maroon">
                                <User size={18} />
                            </div>
                            <h3 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Profile Information</h3>
                        </div>
                        
                        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                <Input 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 focus:bg-white transition-all h-12"
                                />
                            </div>
                            
                            <div className="pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={isUpdatingProfile || name === user?.name}
                                    className="w-full md:w-auto px-10 h-11 bg-maroon hover:bg-[#6e171b] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-maroon/20 transition-all disabled:opacity-50"
                                >
                                    {isUpdatingProfile ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </section>

                    {/* Security Form */}
                    <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-maroon/5 dark:bg-maroon/10 flex items-center justify-center text-maroon">
                                <Lock size={18} />
                            </div>
                            <h3 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Security & Password</h3>
                        </div>
                        
                        <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Password</label>
                                    <Input 
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 focus:bg-white transition-all h-12"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                                        <Input 
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 focus:bg-white transition-all h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                                        <Input 
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 focus:bg-white transition-all h-12"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={isChangingPassword}
                                    className="w-full md:w-auto px-10 h-11 bg-maroon hover:bg-[#6e171b] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-maroon/20 transition-all disabled:opacity-50"
                                >
                                    {isChangingPassword ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle className="mr-2" size={16} />}
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </section>

                </div>
            </div>

            {/* Premium Toast */}
            {toast.message && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 ${
                    toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p className="font-bold text-sm tracking-tight">{toast.message}</p>
                </div>
            )}
        </div>
    );
}
