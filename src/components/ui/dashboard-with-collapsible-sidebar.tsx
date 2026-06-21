"use client"
import React, { useState, useEffect, useRef } from "react";
import {
    ArrowUpRight,
    ArrowDownLeft,
    Send,
    Download,
    Receipt,
    History,
    Moon,
    Sun,
    TrendingUp,
    TrendingDown,
    Activity,
    Bell,
    User,
    Search,
    LogOut,
    CreditCard,
    DollarSign,
    Wallet,
    Building2,
    Clock,
    Shield,
    FileText,
    X,
    Check,
} from "lucide-react";
import { AppSidebar } from "@/components/ui/sidebar";
import Link from "next/link";

/* ============================================================
   Types
   ============================================================ */
interface DashboardData {
    user: {
        name: string;
        email: string;
        accountNumber: string;
        balance: number;
        createdAt: string;
    };
    recentTransactions: Transaction[];
    stats: {
        totalDeposits: number;
        totalWithdrawals: number;
        totalTransfers: number;
    };
}

interface Transaction {
    transactionId: string;
    senderAccount: string;
    receiverAccount: string;
    amount: number;
    transactionType: "deposit" | "withdraw" | "transfer";
    description: string;
    date: string;
}

/* ============================================================
   Utilities
   ============================================================ */
const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(amount);

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

import { apiFetch } from "@/lib/api";

/* ============================================================
   Main Export
   ============================================================ */
export const Example = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("darkMode");
        if (saved === "true") {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
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

    return (
        <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <AppSidebar />
            <DashboardContent isDark={isDark} toggleDark={toggleDark} />
        </div>
    );
};

/* ============================================================
   Dashboard Content
   ============================================================ */
const DashboardContent = ({
    isDark,
    toggleDark,
}: {
    isDark: boolean;
    toggleDark: () => void;
}) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Load read notifications from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("readNotifications");
        if (saved) {
            try { setReadIds(new Set(JSON.parse(saved))); } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const result = await apiFetch<DashboardData>("/account/dashboard");
                setData(result);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const markAsRead = (txId: string) => {
        setReadIds((prev) => {
            const next = new Set(prev);
            next.add(txId);
            localStorage.setItem("readNotifications", JSON.stringify([...next]));
            return next;
        });
    };

    const markAllRead = () => {
        if (!data) return;
        const allIds = data.recentTransactions.slice(0, 10).map(tx => tx.transactionId);
        const next = new Set([...readIds, ...allIds]);
        setReadIds(next);
        localStorage.setItem("readNotifications", JSON.stringify([...next]));
    };

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center space-y-4">
                    <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center space-y-4 max-w-md">
                    <Shield className="h-12 w-12 text-red-400 mx-auto" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Authentication Required</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{error || "Please log in to access your dashboard."}</p>
                    <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                        <LogOut className="h-4 w-4" /> Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const { user, recentTransactions, stats } = data;

    const filteredTx = recentTransactions.filter(
        (tx) =>
            tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.transactionType.includes(searchQuery.toLowerCase()) ||
            tx.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Notification items from recent transactions
    const notifications = recentTransactions.slice(0, 10).map((tx) => ({
        id: tx.transactionId,
        title: tx.transactionType === "deposit" ? "Deposit Received" : tx.transactionType === "withdraw" ? "Withdrawal Processed" : "Transfer Complete",
        desc: (tx.description || "Transaction").replace(/\$/g, "₹"),
        amount: formatINR(tx.amount),
        time: formatDate(tx.date),
        color: tx.transactionType === "deposit" ? "text-green-600 dark:text-green-400" : tx.transactionType === "withdraw" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400",
        isRead: readIds.has(tx.transactionId),
    }));

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 overflow-auto page-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {greeting()}, {user.name} 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Here&apos;s your financial overview
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                            className="relative p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-96 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</h4>
                                        {unreadCount > 0 && (
                                            <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] rounded-full font-bold">{unreadCount} new</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Mark all read</button>
                                        )}
                                        <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                                    {notifications.length === 0 ? (
                                        <p className="px-4 py-8 text-center text-gray-400 text-sm">No notifications</p>
                                    ) : (
                                        notifications.map((n) => (
                                            <button
                                                key={n.id}
                                                onClick={() => markAsRead(n.id)}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-start gap-3 ${!n.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                                            >
                                                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.isRead ? "bg-transparent" : "bg-blue-500"}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-sm font-medium ${n.color}`}>{n.title}</p>
                                                        <span className={`text-xs font-bold ${n.color}`}>{n.amount}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{n.desc}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className="text-[10px] text-gray-400">{n.time}</p>
                                                        {n.isRead && <Check className="h-3 w-3 text-green-500" />}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDark}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                            className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <User className="h-5 w-5" />
                        </button>
                        {showProfile && (
                            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="grid size-10 place-content-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <div className="px-3 py-2 text-xs text-gray-500"><span className="font-medium">A/C:</span> {user.accountNumber}</div>
                                    <div className="px-3 py-2 text-xs text-gray-500"><span className="font-medium">Balance:</span> {formatINR(user.balance)}</div>
                                    <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                                        <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"><FileText className="h-3.5 w-3.5" /> Settings</Link>
                                        <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login"; }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md w-full transition-colors"><LogOut className="h-3.5 w-3.5" /> Logout</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Balance Hero Card */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white p-8 mb-8 relative overflow-hidden shadow-lg">
                <div className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full bg-white/5" />
                <div className="absolute bottom-[-40px] right-10 w-32 h-32 rounded-full bg-white/5" />
                <div className="relative z-10">
                    <p className="text-blue-200 text-sm mb-1">Available Balance</p>
                    <p className="text-4xl font-bold tracking-tight mb-4">{formatINR(user.balance)}</p>
                    <div className="flex items-center gap-6 text-sm text-blue-200">
                        <span>A/C: {user.accountNumber}</span>
                        <span>•</span>
                        <span>Savings Account</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />} iconBg="bg-green-50 dark:bg-green-900/20" title="Total Deposits" value={formatINR(stats.totalDeposits)} trend="+12%" trendUp />
                <StatCard icon={<ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />} iconBg="bg-red-50 dark:bg-red-900/20" title="Total Withdrawals" value={formatINR(stats.totalWithdrawals)} trend="-3%" trendUp={false} />
                <StatCard icon={<Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />} iconBg="bg-blue-50 dark:bg-blue-900/20" title="Total Transfers" value={formatINR(stats.totalTransfers)} trend="+8%" trendUp />
                <StatCard icon={<Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />} iconBg="bg-purple-50 dark:bg-purple-900/20" title="Net Worth" value={formatINR(user.balance)} trend="Current" trendUp />
            </div>

            {/* Account Info + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-500" /> Account Information
                    </h3>
                    <div className="space-y-4">
                        <InfoRow icon={<User className="h-4 w-4" />} label="Name" value={user.name} />
                        <InfoRow icon={<FileText className="h-4 w-4" />} label="Account No" value={user.accountNumber} />
                        <InfoRow icon={<Building2 className="h-4 w-4" />} label="Account Type" value="Savings Account" />
                        <InfoRow icon={<DollarSign className="h-4 w-4" />} label="Email" value={user.email} />
                        <InfoRow icon={<Clock className="h-4 w-4" />} label="Member Since" value={formatDate(user.createdAt)} />
                        <InfoRow icon={<Shield className="h-4 w-4" />} label="Status" value="Active" badge />
                    </div>
                </div>

                <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <QuickAction href="/deposit" icon={<ArrowDownLeft className="h-5 w-5" />} label="Deposit" color="green" />
                        <QuickAction href="/withdraw" icon={<ArrowUpRight className="h-5 w-5" />} label="Withdraw" color="red" />
                        <QuickAction href="/transfer" icon={<Send className="h-5 w-5" />} label="Transfer" color="blue" />
                        <QuickAction href="/statement" icon={<Download className="h-5 w-5" />} label="Statement" color="orange" />
                        <QuickAction href="#" icon={<Receipt className="h-5 w-5" />} label="Pay Bills" color="purple" onClick={() => alert("Bill payment feature coming soon!")} />
                        <QuickAction href="/history" icon={<History className="h-5 w-5" />} label="History" color="gray" />
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="text" placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
                        </div>
                        <Link href="/history" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">View all</Link>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tx ID</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTx.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400"><Activity className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No transactions found</p></td></tr>
                            ) : (
                                filteredTx.map((tx, i) => {
                                    const isCredit = tx.transactionType === "deposit" || (tx.transactionType === "transfer" && tx.receiverAccount === user.accountNumber && tx.senderAccount !== user.accountNumber);
                                    return (
                                        <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4"><code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-600 dark:text-gray-400">{tx.transactionId?.substring(0, 8)}…</code></td>
                                            <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${tx.transactionType === "deposit" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : tx.transactionType === "withdraw" ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>{tx.transactionType}</span></td>
                                            <td className={`px-6 py-4 font-semibold text-sm ${isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{isCredit ? "+" : "-"}{formatINR(tx.amount)}</td>
                                            <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Completed</span></td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{(tx.description || "—").replace(/\$/g, "₹")}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(tx.date)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

/* ============================================================
   Reusable Sub-Components
   ============================================================ */
const StatCard = ({ icon, iconBg, title, value, trend, trendUp }: { icon: React.ReactNode; iconBg: string; title: string; value: string; trend: string; trendUp: boolean }) => (
    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
            {trendUp ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
        </div>
        <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1 text-sm">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className={`text-sm mt-1 ${trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{trend}</p>
    </div>
);

const InfoRow = ({ icon, label, value, badge }: { icon: React.ReactNode; label: string; value: string; badge?: boolean }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">{icon}{label}</div>
        {badge ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">{value}</span>
        ) : (
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</span>
        )}
    </div>
);

const QuickAction = ({ href, icon, label, color, onClick }: { href: string; icon: React.ReactNode; label: string; color: string; onClick?: () => void }) => {
    const colors: Record<string, string> = {
        green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30",
        red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30",
        blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30",
        orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30",
        purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30",
        gray: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
    };
    return (
        <Link href={href} onClick={(e) => { if (onClick) { e.preventDefault(); onClick(); } }}
            className={`flex flex-col items-center gap-3 p-5 rounded-xl transition-all duration-200 cursor-pointer ${colors[color] || colors.gray}`}>
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
};

export default Example;
