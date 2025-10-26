"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, LogIn, TestTube, Copy, Check, ChevronDown } from "lucide-react";

const testAccounts = [
    {
        role: "Manager",
        email: "tranphuoc1005@gmail.com",
        password: "admin",
        color: "from-blue-500 to-indigo-500",
        description: "Team management",
    },
    {
        role: "Employee",
        email: "phuocpin97@gmail.com",
        password: "123456",
        color: "from-gray-500 to-slate-500",
        description: "Basic access",
    },
];

export default function LoginPage() {
    const [email, setEmail] = useState("tranphuoc1005@gmail.com");
    const [password, setPassword] = useState("admin");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showTestAccounts, setShowTestAccounts] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    const handleQuickLogin = async (testEmail: string, testPassword: string) => {
        setEmail(testEmail);
        setPassword(testPassword);
        setLoading(true);
        setError("");

        const { error } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md">
                {/* Main Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            TaskPro THP
                        </h2>
                        <p className="mt-2 text-slate-500 text-sm">Sign in to your workspace</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm text-center">
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email" className="text-slate-700">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="mt-1 focus-visible:ring-blue-500"
                                />
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-slate-700">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="mt-1 focus-visible:ring-blue-500"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <LogIn className="w-4 h-4" />
                                    Sign in
                                </span>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Test Accounts Toggle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4">
                    <button
                        onClick={() => setShowTestAccounts(!showTestAccounts)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors border border-amber-200">
                        <TestTube className="w-4 h-4" />
                        <span className="text-sm font-medium">Test Accounts</span>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${showTestAccounts ? "rotate-180" : ""}`}
                        />
                    </button>
                </motion.div>

                {/* Test Accounts List */}
                <AnimatePresence>
                    {showTestAccounts && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 space-y-2 overflow-hidden">
                            {testAccounts.map((account, index) => (
                                <motion.div
                                    key={account.email}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center text-white font-bold text-sm`}>
                                                {account.role.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 text-sm">{account.role}</h3>
                                                <p className="text-xs text-slate-500">{account.description}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleQuickLogin(account.email, account.password)}
                                            disabled={loading}
                                            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-xs">
                                            Quick Login
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-slate-50 rounded px-3 py-1.5 border border-slate-200">
                                                <p className="text-xs text-slate-500 mb-0.5">Email</p>
                                                <p className="text-xs font-mono text-slate-900">{account.email}</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(account.email, `email-${index}`)}
                                                className="p-2 hover:bg-slate-100 rounded transition-colors">
                                                {copiedField === `email-${index}` ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-slate-400" />
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-slate-50 rounded px-3 py-1.5 border border-slate-200">
                                                <p className="text-xs text-slate-500 mb-0.5">Password</p>
                                                <p className="text-xs font-mono text-slate-900">{account.password}</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(account.password, `pass-${index}`)}
                                                className="p-2 hover:bg-slate-100 rounded transition-colors">
                                                {copiedField === `pass-${index}` ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-slate-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    Demo environment • All data is for testing purposes
                </p>
            </motion.div>
        </div>
    );
}
