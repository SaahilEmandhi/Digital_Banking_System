"use client";
import { AppSidebar } from "@/components/ui/sidebar";
import { HelpCircle, Mail, Phone, MessageCircle, ExternalLink } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <AppSidebar />
            <main className="flex-1 p-8 page-fade-in">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Help & Support</h1>
                <p className="text-gray-500 mb-8">Get help with your Paisa Bank account</p>

                <div className="max-w-2xl space-y-6">
                    {/* Contact Options */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <ContactCard icon={<Mail className="h-6 w-6" />} title="Email Support" desc="support@paisabank.in" color="blue" />
                        <ContactCard icon={<Phone className="h-6 w-6" />} title="Phone Support" desc="1800-XXX-XXXX" color="green" />
                        <ContactCard icon={<MessageCircle className="h-6 w-6" />} title="Live Chat" desc="Available 9AM–6PM" color="purple" />
                    </div>

                    {/* FAQ */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-blue-500" /> Frequently Asked Questions
                        </h3>
                        <div className="space-y-4">
                            <FAQItem q="How do I transfer money to another account?" a="Go to the Transfer page, enter the recipient's account number, and the amount in INR. Click 'Send Money' to complete the transfer." />
                            <FAQItem q="How do I download my account statement?" a="Click 'Download Statement' in the sidebar or use the Statement quick action on the dashboard. A text file with your transaction history will be downloaded." />
                            <FAQItem q="Is my account secure?" a="Yes! We use JWT authentication, encrypted passwords, and secure HTTPS connections to protect your data." />
                            <FAQItem q="How do I change my password?" a="Go to Settings → Change Password. Enter your current password and new password, then click 'Update Password'." />
                            <FAQItem q="What currency does Paisa Bank use?" a="Paisa Bank uses Indian Rupees (₹ INR) for all transactions and displays." />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ContactCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
    const colors: Record<string, string> = {
        blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
        green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
        purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    };
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm text-center">
            <div className={`inline-flex p-3 rounded-xl ${colors[color]} mb-3`}>{icon}</div>
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">{title}</h4>
            <p className="text-xs text-gray-500">{desc}</p>
        </div>
    );
}

function FAQItem({ q, a }: { q: string; a: string }) {
    return (
        <details className="group">
            <summary className="flex cursor-pointer items-center justify-between py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                {q}
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="px-4 pt-2 pb-3 text-sm text-gray-600 dark:text-gray-400">{a}</p>
        </details>
    );
}
