"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/ui/sidebar";
import { User, Lock, Shield, Bell, Moon, Sun } from "lucide-react";

export default function SettingsPage() {
    const [isDark, setIsDark] = useState(false);
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        setIsDark(localStorage.getItem("darkMode") === "true");
    }, []);

    const toggleDark = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode", String(next));
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);
        if (newPwd.length < 6) { setMsg({ text: "Password must be at least 6 characters", type: "error" }); return; }
        setMsg({ text: "Password change feature will be available in a future update.", type: "success" });
        setCurrentPwd(""); setNewPwd("");
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <AppSidebar />
            <main className="flex-1 p-8 page-fade-in">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
                <p className="text-gray-500 mb-8">Manage your account preferences</p>

                <div className="max-w-2xl space-y-6">
                    {/* Profile Section */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" /> Profile Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                                <span className="text-sm text-gray-500">Name</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || "—"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                                <span className="text-sm text-gray-500">Email</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.email || "—"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                                <span className="text-sm text-gray-500">Account Number</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.accountNumber || "—"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            {isDark ? <Moon className="h-5 w-5 text-blue-500" /> : <Sun className="h-5 w-5 text-blue-500" />} Appearance
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                                <p className="text-xs text-gray-500 mt-0.5">Toggle between light and dark theme</p>
                            </div>
                            <button onClick={toggleDark} className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? "bg-blue-600" : "bg-gray-300"}`}>
                                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isDark ? "translate-x-6" : ""}`} />
                            </button>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Lock className="h-5 w-5 text-blue-500" /> Change Password
                        </h3>
                        {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"}`}>{msg.text}</div>}
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <button type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors">Update Password</button>
                        </form>
                    </div>

                    {/* Security Info */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-500" /> Security
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2"><span className="text-sm text-gray-500">Two-Factor Authentication</span><span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-medium">Coming Soon</span></div>
                            <div className="flex justify-between py-2"><span className="text-sm text-gray-500">Login Alerts</span><span className="text-xs px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">Enabled</span></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
