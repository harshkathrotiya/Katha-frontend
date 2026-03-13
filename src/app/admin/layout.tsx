"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Smartphone,
    Database,
    Settings,
    LogOut,
    ChevronRight,
    Library,
    Menu,
    Moon,
    Sun,
    UserCircle,
    ChevronLeft
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "next-themes";

const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Approve Devices", href: "/admin/devices", icon: Smartphone },
    { name: "Storage Space", href: "/admin/storage", icon: Database },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const [mounted, setMounted] = React.useState(false);

    // Prevent hydration mismatch
    React.useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const isDark = theme === "dark";

    return (
        <div className={`flex h-screen w-full transition-colors duration-500 ${isDark ? "bg-[#0b1222] text-slate-400" : "bg-white text-slate-500"} font-outfit overflow-hidden`}>
            {/* Professional Minimalist Sidebar - Icon Collapsible */}
            <aside
                className={`
                    flex-shrink-0 transition-all duration-300 ease-in-out h-full border-r flex flex-col z-40
                    ${isSidebarOpen ? "w-[240px]" : "w-[72px]"}
                    ${isDark ? "bg-[#0f172a] border-slate-800/30" : "bg-white border-slate-100/60"}
                `}
            >
                {/* Brand & Toggle Container */}
                <div className={`h-16 flex items-center px-6 shrink-0 ${isSidebarOpen ? "justify-between" : "justify-center"}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-[#8b1c1c] rounded-md flex items-center justify-center text-white shrink-0">
                            <Library size={15} strokeWidth={2.5} />
                        </div>
                        {isSidebarOpen && (
                            <span className={`text-[15px] font-bold tracking-tight uppercase tracking-[0.1em] ${isDark ? "text-slate-100" : "text-slate-900"} whitespace-nowrap animate-in fade-in duration-500`}>
                                Katha Admin
                            </span>
                        )}
                    </div>
                    {isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className={`p-1.5 rounded-lg transition-all ${isDark ? "text-slate-500 hover:bg-slate-800/50 hover:text-slate-200" : "text-slate-300 hover:bg-slate-50 hover:text-slate-600"}`}
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>

                {!isSidebarOpen && (
                    <div className="flex justify-center py-2">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={`p-2 rounded-lg transition-all ${isDark ? "text-slate-500 hover:bg-slate-800/50 hover:text-slate-200" : "text-slate-300 hover:bg-slate-50 hover:text-slate-600"}`}
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                )}

                {/* Main Navigation */}
                <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto scrollbar-hide">
                    <div>
                        {isSidebarOpen && (
                            <p className="px-2 mb-3 text-[10px] font-bold text-slate-400/60 uppercase tracking-[0.2em] animate-in fade-in">Management</p>
                        )}
                        <nav className={`space-y-1 ${!isSidebarOpen ? "flex flex-col items-center" : ""}`}>
                            {menuItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        title={!isSidebarOpen ? item.name : ""}
                                        className={`flex items-center rounded-lg transition-all relative group ${isSidebarOpen ? "px-3 py-2.5 gap-3 w-full" : "p-2.5 justify-center w-10 h-10"
                                            } ${isActive
                                                ? isDark ? "bg-[#8b1c1c]/10 text-white" : "bg-[#8b1c1c]/5 text-[#8b1c1c]"
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                            }`}
                                    >
                                        {isActive && isSidebarOpen && (
                                            <div className="absolute left-0 w-1 h-4 bg-[#8b1c1c] rounded-full" />
                                        )}
                                        <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[#8b1c1c] dark:text-white" : "text-slate-400/80 group-hover:text-slate-500"} />
                                        {isSidebarOpen && (
                                            <span className={`text-[13px] font-medium leading-none whitespace-nowrap ${isActive ? "font-bold" : ""}`}>{item.name}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div>
                        {isSidebarOpen && (
                            <p className="px-2 mb-3 text-[10px] font-bold text-slate-400/60 uppercase tracking-[0.2em] animate-in fade-in">Preferences</p>
                        )}
                        <div className={`space-y-1 ${!isSidebarOpen ? "flex flex-col items-center" : ""}`}>
                            <button
                                onClick={() => setTheme(isDark ? "light" : "dark")}
                                title={!isSidebarOpen ? "Toggle Theme" : ""}
                                className={`flex items-center transition-all group ${isSidebarOpen ? "w-full justify-between px-3 py-2.5 rounded-lg" : "p-2.5 justify-center w-10 h-10 rounded-lg"
                                    } text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/30`}
                            >
                                <div className="flex items-center gap-3">
                                    {isDark ? <Moon size={18} /> : <Sun size={18} />}
                                    {isSidebarOpen && <span className="text-[13px] font-medium leading-none whitespace-nowrap">Appearance</span>}
                                </div>
                                {isSidebarOpen && (
                                    <div className={`w-8 h-4 rounded-full transition-all relative flex items-center px-0.5 ${isDark ? "bg-[#8b1c1c]" : "bg-slate-200"}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full transition-all transform ${isDark ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                )}
                            </button>
                            <Link
                                href="/admin/settings"
                                title={!isSidebarOpen ? "Settings" : ""}
                                className={`flex items-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all group ${isSidebarOpen ? "px-3 py-2.5 gap-3 w-full" : "p-2.5 justify-center w-10 h-10"
                                    } hover:bg-slate-50/50 dark:hover:bg-slate-800/30`}
                            >
                                <Settings size={18} />
                                {isSidebarOpen && <span className="text-[13px] font-medium leading-none whitespace-nowrap">Settings</span>}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar Footer - Professional Profile */}
                <div className={`mt-auto p-4 border-t transition-colors ${isDark ? "border-slate-800/30" : "border-slate-50"}`}>
                    <div className={`flex items-center gap-3 px-2 mb-4 ${!isSidebarOpen ? "justify-center" : ""}`}>
                        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white ring-1 ring-white/10 shrink-0">
                            <UserCircle size={20} strokeWidth={1.5} />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0 animate-in fade-in">
                                <p className={`text-xs font-bold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>{user?.name || "Admin"}</p>
                                <p className="text-[9px] text-slate-400 font-medium tracking-wide truncate">{user?.email || "admin@katha.com"}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={logout}
                        title={!isSidebarOpen ? "Logout" : ""}
                        className={`flex items-center rounded-lg transition-all text-red-500 group ${isSidebarOpen ? "w-full gap-2.5 px-3 py-2.5" : "p-2.5 justify-center w-10 h-10 mx-auto"
                            } hover:bg-red-50/50 dark:hover:bg-red-950/20`}
                    >
                        <LogOut size={16} strokeWidth={2.5} className="text-red-400/80" />
                        {isSidebarOpen && <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Workspace Area */}
            <main className="flex-1 flex flex-col min-w-0 h-full">
                {/* Smooth Topbar */}
                <header className={`h-16 flex items-center justify-between px-8 border-b transition-all shrink-0 ${isDark ? "bg-[#0f172a] border-slate-800/40" : "bg-white border-slate-100/60"}`}>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                                {menuItems.find(i => pathname.startsWith(i.href))?.name || "Home"}
                            </h2>
                            <span className="w-1 h-3 rounded-full bg-slate-200/50" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">System Online</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {pathname === "/admin/users" && (
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent("open-add-user-modal"))}
                                className="bg-[#8b1c1c] text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#6b1515] transition-all flex items-center gap-2 shadow-sm"
                            >
                                <Users size={14} />
                                Add User
                            </button>
                        )}

                        {pathname === "/admin/devices" && (
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent("refresh-device-list"))}
                                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${isDark ? "bg-slate-800/20 border-slate-700/30 hover:bg-slate-700/30 text-slate-300" : "bg-white border-slate-100 hover:bg-slate-50 text-slate-500"
                                    }`}
                            >
                                Update
                            </button>
                        )}

                        {pathname === "/admin/storage" && (
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent("refresh-storage-stats"))}
                                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm ${isDark ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50" : "bg-slate-900 text-white hover:bg-slate-800"
                                    } flex items-center gap-2`}
                            >
                                <Database size={14} />
                                Update
                            </button>
                        )}
                    </div>
                </header>

                {/* Content Workspace */}
                <div className={`flex-1 overflow-y-auto ${isDark ? "bg-[#0b1222]" : "bg-white"}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
