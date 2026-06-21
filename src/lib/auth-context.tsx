"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserData {
    name: string;
    email: string;
    accountNumber: string;
    balance: number;
    role: string;
    createdAt: string;
}

interface AuthContextType {
    user: UserData | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        // Mock authentication
        const mockUser = {
            name: email.split("@")[0],
            email: email,
            accountNumber: Math.floor(100000000 + Math.random() * 900000000).toString(),
            balance: 10000,
            role: "user",
            createdAt: new Date().toISOString()
        };
        const mockToken = "mock-jwt-token";
        
        if (!localStorage.getItem("transactions")) {
            const initialTx = {
                transactionId: "tx-init",
                transactionType: "deposit",
                amount: 10000,
                date: new Date().toISOString(),
                description: "Initial Account Funding",
                senderAccount: "system",
                receiverAccount: mockUser.accountNumber
            };
            localStorage.setItem("transactions", JSON.stringify([initialTx]));
        }

        localStorage.setItem("token", mockToken);
        localStorage.setItem("user", JSON.stringify(mockUser));
        localStorage.setItem("lastLogin", new Date().toISOString());
        setToken(mockToken);
        setUser(mockUser);
    };

    const register = async (name: string, email: string, password: string) => {
        // Mock registration
        const mockUser = {
            name: name,
            email: email,
            accountNumber: Math.floor(100000000 + Math.random() * 900000000).toString(),
            balance: 0,
            role: "user",
            createdAt: new Date().toISOString()
        };
        const mockToken = "mock-jwt-token";
        
        localStorage.setItem("transactions", JSON.stringify([]));
        localStorage.setItem("token", mockToken);
        localStorage.setItem("user", JSON.stringify(mockUser));
        localStorage.setItem("lastLogin", new Date().toISOString());
        setToken(mockToken);
        setUser(mockUser);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
