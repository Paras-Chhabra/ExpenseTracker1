'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navbar */}
            <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <Link href="/dashboard" className="text-xl font-bold text-white">
                                💰 ExpenseTracker
                            </Link>
                            <div className="hidden md:flex space-x-4">
                                <Link
                                    href="/dashboard"
                                    className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/dashboard/transactions"
                                    className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition"
                                >
                                    Transactions
                                </Link>
                                <Link
                                    href="/dashboard/analytics"
                                    className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition"
                                >
                                    Analytics
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-300 hidden sm:block">
                                Hi, {user.name}
                            </span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/50 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile nav */}
            <div className="md:hidden bg-white/5 border-b border-white/10 px-4 py-2">
                <div className="flex space-x-2">
                    <Link
                        href="/dashboard"
                        className="text-gray-300 text-sm px-3 py-1 rounded-lg hover:bg-white/10"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/dashboard/transactions"
                        className="text-gray-300 text-sm px-3 py-1 rounded-lg hover:bg-white/10"
                    >
                        Transactions
                    </Link>
                    <Link
                        href="/dashboard/analytics"
                        className="text-gray-300 text-sm px-3 py-1 rounded-lg hover:bg-white/10"
                    >
                        Analytics
                    </Link>
                </div>
            </div>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
