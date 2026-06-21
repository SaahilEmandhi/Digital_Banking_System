/** Fetch wrapper that auto-attaches JWT token */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let user = userStr ? JSON.parse(userStr) : null;
    
    // Get transactions from local storage, or initialize empty
    const getTransactions = () => {
        if (typeof window === "undefined") return [];
        const txStr = localStorage.getItem("transactions");
        return txStr ? JSON.parse(txStr) : [];
    };

    const saveTransaction = (tx: any) => {
        const txs = getTransactions();
        txs.unshift(tx); // Add to beginning
        localStorage.setItem("transactions", JSON.stringify(txs));
    };

    const updateBalance = (newBalance: number) => {
        if (user) {
            user.balance = newBalance;
            localStorage.setItem("user", JSON.stringify(user));
        }
    };

    await new Promise(resolve => setTimeout(resolve, 500));

    if (path === "/auth/me") return { user } as any;
    
    if (path === "/account/dashboard") {
        const allTxs = getTransactions();
        
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let totalTransfers = 0;

        allTxs.forEach((tx: any) => {
            if (tx.transactionType === "deposit") totalDeposits += tx.amount;
            if (tx.transactionType === "withdraw") totalWithdrawals += tx.amount;
            if (tx.transactionType === "transfer") totalTransfers += tx.amount;
        });

        return {
            user: user,
            recentTransactions: allTxs.slice(0, 10), // only recent for dashboard
            stats: { totalDeposits, totalWithdrawals, totalTransfers }
        } as any;
    }

    if (path === "/account/withdraw" && options?.method === "POST") {
        const body = JSON.parse(options.body as string);
        const amt = Number(body.amount);
        if (user && user.balance >= amt) {
            const newBalance = user.balance - amt;
            updateBalance(newBalance);
            saveTransaction({
                transactionId: "tx-" + Math.random().toString(36).substring(2, 9),
                transactionType: "withdraw",
                amount: amt,
                date: new Date().toISOString(),
                description: "Withdrawal",
                senderAccount: user.accountNumber,
                receiverAccount: "cash"
            });
            return { message: "Withdrawal successful", balance: newBalance } as any;
        }
        throw new Error("Insufficient funds");
    }

    if (path === "/account/deposit" && options?.method === "POST") {
        const body = JSON.parse(options.body as string);
        const amt = Number(body.amount);
        const newBalance = (user?.balance || 0) + amt;
        updateBalance(newBalance);
        saveTransaction({
            transactionId: "tx-" + Math.random().toString(36).substring(2, 9),
            transactionType: "deposit",
            amount: amt,
            date: new Date().toISOString(),
            description: "Deposit",
            senderAccount: "system",
            receiverAccount: user?.accountNumber || "123"
        });
        return { message: "Deposit successful", balance: newBalance } as any;
    }

    if (path === "/account/validate" && options?.method === "POST") return { name: "Mock Receiver" } as any;

    if (path === "/account/transfer" && options?.method === "POST") {
        const body = JSON.parse(options.body as string);
        const amt = Number(body.amount);
        if (user && user.balance >= amt) {
            const newBalance = user.balance - amt;
            updateBalance(newBalance);
            saveTransaction({
                transactionId: "tx-" + Math.random().toString(36).substring(2, 9),
                transactionType: "transfer",
                amount: amt,
                date: new Date().toISOString(),
                description: `Transfer to ${body.receiverAccountNumber}`,
                senderAccount: user.accountNumber,
                receiverAccount: body.receiverAccountNumber
            });
            return { message: "Transfer successful", balance: newBalance } as any;
        }
        throw new Error("Insufficient funds");
    }
    
    if (path.includes("transactions") || path.includes("history") || path.includes("statement")) {
        return { transactions: getTransactions() } as any;
    }

    throw new Error(`Mock API not implemented for ${path}`);
}

/** Format a number as INR currency string (₹) */
export const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(amount);

/** Format a date string into a friendly date/time */
export const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

/** Format date only (no time) */
export const formatDateShort = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
