"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/ui/sidebar";
import { apiFetch, formatINR } from "@/lib/api";
import { Send, IndianRupee, User, CheckCircle } from "lucide-react";

export default function TransferPage() {
    const [receiverAccount, setReceiverAccount] = useState("");
    const [receiverName, setReceiverName] = useState("");
    const [amount, setAmount] = useState("");
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        apiFetch<{ user: { balance: number } }>("/auth/me").then(d => setBalance(d.user.balance)).catch(() => { });
    }, []);

    const validateReceiver = async () => {
        const acc = receiverAccount.trim();
        if (!acc) { setReceiverName(""); return; }
        setValidating(true);
        try {
            const data = await apiFetch<{ name: string }>("/account/validate", { method: "POST", body: JSON.stringify({ accountNumber: acc }) });
            setReceiverName(data.name);
        } catch {
            setReceiverName("");
            setMsg({ text: "Account not found", type: "error" });
        } finally { setValidating(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);
        const amt = parseFloat(amount);
        if (!receiverAccount.trim()) { setMsg({ text: "Enter recipient account number", type: "error" }); return; }
        if (!amt || amt <= 0) { setMsg({ text: "Enter a valid amount", type: "error" }); return; }
        setLoading(true);
        try {
            const data = await apiFetch<{ message: string; balance: number }>("/account/transfer", { method: "POST", body: JSON.stringify({ receiverAccountNumber: receiverAccount, amount: amt }) });
            setBalance(data.balance);
            setMsg({ text: data.message, type: "success" });
            setAmount(""); setReceiverAccount(""); setReceiverName("");
        } catch (err: unknown) {
            setMsg({ text: err instanceof Error ? err.message : "Transfer failed", type: "error" });
        } finally { setLoading(false); }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <AppSidebar />
            <main className="flex-1 p-8 page-fade-in">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Transfer Money</h1>
                <p className="text-gray-500 mb-8">Send funds to another Paisa Bank account</p>
                <div className="max-w-md mx-auto">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-500 mb-1">Your Balance</p>
                            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{formatINR(balance)}</p>
                        </div>
                        {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"}`}>{msg.text}</div>}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Recipient Account Number</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="text" value={receiverAccount} onChange={e => { setReceiverAccount(e.target.value); setReceiverName(""); }} onBlur={validateReceiver} placeholder="e.g. DBK12345678" required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                </div>
                                {validating && <p className="mt-1 text-xs text-gray-400">Validating...</p>}
                                {receiverName && <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Recipient: {receiverName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Amount (INR)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" min="1" step="0.01" required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-md">
                                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="h-4 w-4" /> Send Money</>}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
