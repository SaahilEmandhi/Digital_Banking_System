"use client";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, ArrowRight, Shield, CreditCard, Zap } from "lucide-react";

export default function HomePage() {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      redirect("/dashboard");
    } else {
      setHasToken(false);
    }
  }, []);

  if (hasToken === null) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-content-center rounded-lg bg-white shadow-sm p-1 border border-gray-100 dark:border-gray-800 dark:bg-gray-900"><Image src="/logo.png" alt="Paisa Bank Logo" width={32} height={32} className="object-contain rounded-md" /></div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Paisa Bank</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">Sign In</Link>
          <Link href="/register" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition shadow-md">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-8">
          <Zap className="h-3.5 w-3.5" /> Every Paisa Matters
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
          Your Money, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">Your Rules</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          Deposit, withdraw, and transfer funds instantly with India&apos;s modern digital banking platform. Built with ₹ rupees at heart.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl">
            Start Banking <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="px-8 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 w-fit mb-4"><Shield className="h-6 w-6 text-green-600 dark:text-green-400" /></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Secure Banking</h3>
            <p className="text-gray-500 text-sm">JWT authentication and encrypted passwords keep your account safe.</p>
          </div>
          <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 w-fit mb-4"><CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Instant Transfers</h3>
            <p className="text-gray-500 text-sm">Transfer money to any Paisa Bank account with real-time balance updates.</p>
          </div>
          <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 w-fit mb-4"><Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" /></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Indian Format</h3>
            <p className="text-gray-500 text-sm">All transactions in ₹ with Indian date formats and localized UI.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
