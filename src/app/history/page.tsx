"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/ui/sidebar";
import { apiFetch, formatINR, formatDate } from "@/lib/api";
import { Activity, Search } from "lucide-react";

interface Transaction {
    transactionId: string;
    senderAccount: string;
    receiverAccount: string;
    amount: number;
    transactionType: "deposit" | "withdraw" | "transfer";
    description: string;
    date: string;
}

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const loadTx = async () => {
            setLoading(true);
            try {
                const endpoint = filter === "all" ? "/account/transactions" : `/account/transactions?type=${filter}`;
                const data = await apiFetch<{ transactions: Transaction[] }>(endpoint);
                setTransactions(data.transactions);
            } catch { /* ignore */ }
            finally { setLoading(false); }
        };
        loadTx();
    }, [filter]);

    const filtered = transactions.filter(tx =>
        (tx.description || "").toLowerCase().includes(search.toLowerCase()) ||
        tx.transactionType.includes(search.toLowerCase()) ||
        tx.transactionId.toLowerCase().includes(search.toLowerCase())
    );

    const tabs = [
        { key: "all", label: "All" },
        { key: "deposit", label: "Deposits" },
        { key: "withdraw", label: "Withdrawals" },
        { key: "transfer", label: "Transfers" },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <AppSidebar />
            <main className="flex-1 p-8 page-fade-in">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Transaction History</h1>
                <p className="text-gray-500 mb-8">View and filter all your past transactions</p>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setFilter(t.key)}
                            className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${filter === t.key ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-400"}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{filtered.length} transactions</span>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                                className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">From / To</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400"><div className="h-6 w-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" /><p>Loading...</p></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400"><Activity className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No transactions found</p></td></tr>
                                ) : (
                                    filtered.map((tx, i) => {
                                        const isCredit = tx.transactionType === "deposit" || (tx.transactionType === "transfer" && tx.receiverAccount === user?.accountNumber && tx.senderAccount !== user?.accountNumber);
                                        let counterparty = "—";
                                        if (tx.transactionType === "transfer") {
                                            counterparty = tx.senderAccount === user?.accountNumber ? `To: ${tx.receiverAccount}` : `From: ${tx.senderAccount}`;
                                        }
                                        return (
                                            <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${tx.transactionType === "deposit" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : tx.transactionType === "withdraw" ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>{tx.transactionType}</span></td>
                                                <td className={`px-6 py-4 font-semibold text-sm ${isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{isCredit ? "+" : "-"}{formatINR(tx.amount)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{counterparty}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{(tx.description || "—").replace(/\$/g, "₹")}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(tx.date)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
