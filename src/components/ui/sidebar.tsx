"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Home, ArrowDownLeft, ArrowUpRight, Send, History, Download, Receipt,
    Settings, HelpCircle, Building2, ChevronDown, ChevronsRight, LogOut,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/deposit", icon: ArrowDownLeft, label: "Deposit" },
    { href: "/withdraw", icon: ArrowUpRight, label: "Withdraw" },
    { href: "/transfer", icon: Send, label: "Transfer" },
    { href: "/history", icon: History, label: "Transactions" },
];

export function AppSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <nav className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${open ? "w-64" : "w-16"} border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm flex flex-col`}>
            {/* Brand */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
                <div
                    onClick={() => setOpen(!open)}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-white shadow-sm p-1 border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
                            <Image src="/logo.png" alt="Paisa Bank Logo" width={32} height={32} className="object-contain rounded-md" />
                        </div>
                        {open && (
                            <div>
                                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Paisa Bank</span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">Every Paisa Matters</span>
                            </div>
                        )}
                    </div>
                    {open && <ChevronsRight className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />}
                </div>
            </div>

            {/* Main Nav */}
            <div className="space-y-1 mb-6">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;
                    return (
                        <Link key={href} href={href} className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${isActive ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"}`}>
                            <div className="grid h-full w-12 place-content-center"><Icon className="h-4 w-4" /></div>
                            {open && <span className="text-sm font-medium">{label}</span>}
                        </Link>
                    );
                })}
            </div>

            {/* Banking */}
            {open && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Banking</div>
                    <Link href="/statement" className="flex h-11 w-full items-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-all">
                        <div className="grid h-full w-12 place-content-center"><Download className="h-4 w-4" /></div>
                        <span className="text-sm font-medium">Download Statement</span>
                    </Link>
                    <SideLink icon={Receipt} label="Pay Bills" onClick={() => alert("Bill payment feature coming soon!")} />
                </div>
            )}

            {/* Account */}
            {open && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4 space-y-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Account</div>
                    <Link href="/settings" className="flex h-11 w-full items-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-all">
                        <div className="grid h-full w-12 place-content-center"><Settings className="h-4 w-4" /></div>
                        <span className="text-sm font-medium">Settings</span>
                    </Link>
                    <Link href="/help" className="flex h-11 w-full items-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-all">
                        <div className="grid h-full w-12 place-content-center"><HelpCircle className="h-4 w-4" /></div>
                        <span className="text-sm font-medium">Help & Support</span>
                    </Link>
                </div>
            )}

            {/* Logout at bottom */}
            <div className="mt-auto border-t border-gray-200 dark:border-gray-800 pt-2">
                <button onClick={handleLogout} className="flex h-11 w-full items-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all">
                    <div className="grid h-full w-12 place-content-center"><LogOut className="h-4 w-4" /></div>
                    {open && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </nav>
    );
}

function SideLink({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
    return (
        <button onClick={onClick} className="flex h-11 w-full items-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-all">
            <div className="grid h-full w-12 place-content-center"><Icon className="h-4 w-4" /></div>
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}
