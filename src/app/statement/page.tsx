"use client";
import { useState, useEffect, useRef } from "react";
import { AppSidebar } from "@/components/ui/sidebar";
import { apiFetch, formatINR, formatDate } from "@/lib/api";
import { Download, Building2, FileText, Printer } from "lucide-react";
import jsPDF from "jspdf";
import Image from "next/image";

interface Transaction {
    transactionId: string;
    senderAccount: string;
    receiverAccount: string;
    amount: number;
    transactionType: "deposit" | "withdraw" | "transfer";
    description: string;
    date: string;
}

interface DashboardData {
    user: { name: string; email: string; accountNumber: string; balance: number; createdAt: string };
    recentTransactions: Transaction[];
    stats: { totalDeposits: number; totalWithdrawals: number; totalTransfers: number };
}

export default function StatementPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const statementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        apiFetch<DashboardData>("/account/dashboard")
            .then(setData)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const downloadPDF = () => {
        if (!data) return;
        const { user, recentTransactions, stats } = data;
        const doc = new jsPDF();
        const w = doc.internal.pageSize.getWidth();
        const getRs = (amt: number) => formatINR(amt).replace("₹", "Rs. ");
        let y = 20;

        // Header
        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, w, 40, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Paisa Bank", 15, 18);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Every Paisa Matters", 15, 26);
        doc.text("Account Statement", 15, 34);
        doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, w - 15, 26, { align: "right" });
        doc.text(`Statement ID: STM-${Date.now().toString(36).toUpperCase()}`, w - 15, 34, { align: "right" });

        y = 55;
        doc.setTextColor(30, 41, 59);

        // Account Info Box
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, y, w - 30, 50, 3, 3);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Account Details", 20, y + 12);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);

        const col1 = 20, col2 = w / 2 + 5;
        doc.text("Account Holder", col1, y + 22);
        doc.text("Account Number", col1, y + 30);
        doc.text("Account Type", col1, y + 38);
        doc.text("Email", col2, y + 22);
        doc.text("Member Since", col2, y + 30);
        doc.text("Current Balance", col2, y + 38);

        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.text(user.name, col1 + 45, y + 22);
        doc.text(user.accountNumber, col1 + 45, y + 30);
        doc.text("Savings Account", col1 + 45, y + 38);
        doc.text(user.email, col2 + 45, y + 22);
        doc.text(formatDate(user.createdAt).split(",")[0], col2 + 45, y + 30);
        doc.setTextColor(22, 101, 52);
        doc.text(getRs(user.balance), col2 + 45, y + 38);

        y += 60;

        // Summary
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Transaction Summary", 20, y);
        y += 8;

        doc.setFillColor(241, 245, 249);
        doc.roundedRect(15, y, (w - 40) / 3, 25, 2, 2, "F");
        doc.roundedRect(15 + (w - 40) / 3 + 5, y, (w - 40) / 3, 25, 2, 2, "F");
        doc.roundedRect(15 + ((w - 40) / 3 + 5) * 2, y, (w - 40) / 3, 25, 2, 2, "F");

        const boxW = (w - 40) / 3;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text("Total Deposits", 15 + boxW / 2, y + 8, { align: "center" });
        doc.text("Total Withdrawals", 15 + boxW + 5 + boxW / 2, y + 8, { align: "center" });
        doc.text("Total Transfers", 15 + (boxW + 5) * 2 + boxW / 2, y + 8, { align: "center" });

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 101, 52);
        doc.text(getRs(stats.totalDeposits), 15 + boxW / 2, y + 18, { align: "center" });
        doc.setTextColor(185, 28, 28);
        doc.text(getRs(stats.totalWithdrawals), 15 + boxW + 5 + boxW / 2, y + 18, { align: "center" });
        doc.setTextColor(30, 64, 175);
        doc.text(getRs(stats.totalTransfers), 15 + (boxW + 5) * 2 + boxW / 2, y + 18, { align: "center" });

        y += 35;

        // Transaction Table
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Transaction Details", 20, y);
        y += 8;

        // Table header
        doc.setFillColor(30, 64, 175);
        doc.rect(15, y, w - 30, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Date", 20, y + 5.5);
        doc.text("Type", 55, y + 5.5);
        doc.text("Description", 80, y + 5.5);
        doc.text("Amount", w - 20, y + 5.5, { align: "right" });
        y += 8;

        doc.setFont("helvetica", "normal");
        recentTransactions.forEach((tx, i) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            const bg = i % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
            doc.setFillColor(bg[0], bg[1], bg[2]);
            doc.rect(15, y, w - 30, 7, "F");

            doc.setTextColor(100, 116, 139);
            doc.setFontSize(7.5);
            doc.text(new Date(tx.date).toLocaleDateString("en-IN"), 20, y + 5);

            const typeColors: Record<string, number[]> = {
                deposit: [22, 101, 52],
                withdraw: [185, 28, 28],
                transfer: [30, 64, 175],
            };
            const tc = typeColors[tx.transactionType] || [30, 41, 59];
            doc.setTextColor(tc[0], tc[1], tc[2]);
            doc.text(tx.transactionType.toUpperCase(), 55, y + 5);

            doc.setTextColor(71, 85, 105);
            doc.text((tx.description || "—").replace(/\$/g, "₹").substring(0, 40), 80, y + 5);

            const isCredit = tx.transactionType === "deposit";
            doc.setTextColor(isCredit ? 22 : 185, isCredit ? 101 : 28, isCredit ? 52 : 28);
            doc.setFont("helvetica", "bold");
            doc.text(`${isCredit ? "+" : "-"}${getRs(tx.amount)}`, w - 20, y + 5, { align: "right" });
            doc.setFont("helvetica", "normal");
            y += 7;
        });

        // Footer
        y += 10;
        doc.setDrawColor(226, 232, 240);
        doc.line(15, y, w - 15, y);
        y += 8;
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text("This is a computer-generated statement from Paisa Bank.", w / 2, y, { align: "center" });
        doc.text("For queries contact: support@paisabank.in | 1800-XXX-XXXX", w / 2, y + 6, { align: "center" });

        doc.save(`PaisaBank_Statement_${user.accountNumber}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
                <AppSidebar />
                <main className="flex-1 p-8 page-fade-in flex items-center justify-center">
                    <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </main>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
                <AppSidebar />
                <main className="flex-1 p-8 page-fade-in text-center pt-24 text-gray-500">Please log in first.</main>
            </div>
        );
    }

    const { user, recentTransactions, stats } = data;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <AppSidebar />
            <main className="flex-1 p-8 page-fade-in print:p-0 print:m-0 print:w-full">
                <div className="flex items-center justify-between mb-6 print:hidden">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Account Statement</h1>
                        <p className="text-gray-500">Preview and download your bank statement</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <Printer className="h-4 w-4" /> Print
                        </button>
                        <button onClick={downloadPDF} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition shadow-md">
                            <Download className="h-4 w-4" /> Download PDF
                        </button>
                    </div>
                </div>

                {/* Statement Preview */}
                <div ref={statementRef} className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none print:max-w-none print:w-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="grid size-12 place-content-center bg-white rounded-xl shadow-inner p-1">
                                    <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Paisa Bank</h2>
                                    <p className="text-blue-200 text-sm">Every Paisa Matters</p>
                                </div>
                            </div>
                            <div className="text-right text-sm text-blue-200">
                                <p className="font-semibold text-white">Account Statement</p>
                                <p>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                                <p className="font-mono text-xs mt-1">STM-{Date.now().toString(36).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <FileText className="h-4 w-4 text-blue-500" /> Account Details
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Detail label="Account Holder" value={user.name} />
                            <Detail label="Account Number" value={user.accountNumber} />
                            <Detail label="Account Type" value="Savings Account" />
                            <Detail label="Email" value={user.email} />
                            <Detail label="Member Since" value={formatDate(user.createdAt)} />
                            <Detail label="Current Balance" value={formatINR(user.balance)} highlight />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-sm uppercase tracking-wide">Transaction Summary</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <SummaryBox label="Total Deposits" value={formatINR(stats.totalDeposits)} color="green" />
                            <SummaryBox label="Total Withdrawals" value={formatINR(stats.totalWithdrawals)} color="red" />
                            <SummaryBox label="Total Transfers" value={formatINR(stats.totalTransfers)} color="blue" />
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="px-8 py-6">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-sm uppercase tracking-wide">Transaction Details</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-blue-700 text-white text-xs uppercase">
                                    <th className="text-left px-4 py-2 rounded-tl-lg">Date</th>
                                    <th className="text-left px-4 py-2">Type</th>
                                    <th className="text-left px-4 py-2">Description</th>
                                    <th className="text-right px-4 py-2 rounded-tr-lg">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No transactions found</td></tr>
                                ) : (
                                    recentTransactions.map((tx, i) => {
                                        const isCredit = tx.transactionType === "deposit";
                                        return (
                                            <tr key={i} className={`text-sm ${i % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-900"}`}>
                                                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{new Date(tx.date).toLocaleDateString("en-IN")}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${tx.transactionType === "deposit" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : tx.transactionType === "withdraw" ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                                                        {tx.transactionType}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{(tx.description || "—").replace(/\$/g, "₹")}</td>
                                                <td className={`px-4 py-2.5 text-right font-semibold ${isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                    {isCredit ? "+" : "-"}{formatINR(tx.amount)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                        <p>This is a computer-generated statement from Paisa Bank.</p>
                        <p className="mt-1">For queries: support@paisabank.in | 1800-XXX-XXXX</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Detail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
            <p className={`text-sm font-semibold ${highlight ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>{value}</p>
        </div>
    );
}

function SummaryBox({ label, value, color }: { label: string; value: string; color: string }) {
    const colors: Record<string, string> = {
        green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
        red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
        blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    };
    return (
        <div className={`p-4 rounded-lg ${colors[color]}`}>
            <p className="text-xs opacity-70 mb-1">{label}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    );
}
