"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Moon, Sun, User, ChevronDown, LogOut, Heart,
  BookOpen, Library, Book, ScrollText, LayoutDashboard, X, Menu
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/providers/AuthProvider";

// Primary nav sections
const NAV_SECTIONS = [
  { href: "/user",   label: "Dashboard", icon: LayoutDashboard },
  { href: "/katha",  label: "Katha",     icon: ScrollText },
  { href: "/granth", label: "Granth",    icon: Library },
  { href: "/book",   label: "Books",     icon: Book },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const isActive = (href: string) =>
    href === "/user" ? pathname === "/user" : pathname.startsWith(href);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">

      {/* ── Top Nav ── */}
      <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50">

        {/* Left: Logo + Section Nav */}
        <div className="flex items-center gap-0">
          {/* Logo */}
          <Link href="/user" className="flex items-center gap-2 mr-4 md:mr-6">
            <div className="w-7 h-7 bg-maroon rounded-lg flex items-center justify-center">
              <BookOpen size={14} className="text-white" />
            </div>
            <span className="text-base font-black text-[#8b1D1D] dark:text-[#c0403a] font-outfit tracking-tight whitespace-nowrap hidden sm:block">
              Satsang Katha
            </span>
          </Link>

          {/* Section tabs – desktop */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_SECTIONS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                  ${isActive(href)
                    ? "bg-maroon/8 text-maroon dark:text-[#c0403a] border border-maroon/15"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
              >
                <Icon size={13} strokeWidth={2.5} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 md:gap-2">

          {/* Favourites pill */}
          <Link
            href="/favorites"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
              ${isActive("/favorites")
                ? "bg-maroon text-white shadow-lg shadow-maroon/20"
                : "text-slate-500 dark:text-slate-400 hover:text-maroon hover:bg-maroon/5 border border-transparent hover:border-maroon/15"
              }`}
          >
            <Heart size={13} strokeWidth={2.5} className={isActive("/favorites") ? "fill-white" : ""} />
            <span>Favourites</span>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            aria-label="Toggle theme"
          >
            {isDark
              ? <Sun size={16} className="text-amber-400" />
              : <Moon size={16} />}
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
            >
              <div className="w-7 h-7 rounded-full bg-maroon/10 border border-maroon/20 flex items-center justify-center">
                <span className="text-[11px] font-black text-maroon uppercase">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden md:block max-w-[100px] truncate">
                {user?.name || "User"}
              </span>
              <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-800 mb-1">
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={13} />
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative ml-auto w-64 h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100 dark:border-slate-800">
              <span className="font-black text-maroon font-outfit tracking-tight">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_SECTIONS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${isActive(href)
                      ? "bg-maroon text-white shadow-lg shadow-maroon/20"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              ))}
              <Link
                href="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
                  ${isActive("/favorites")
                    ? "bg-maroon text-white shadow-lg shadow-maroon/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
              >
                <Heart size={16} />
                <span>Favourites</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-0">
        {children}
      </main>
    </div>
  );
}
