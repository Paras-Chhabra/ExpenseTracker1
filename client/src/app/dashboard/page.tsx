'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Summary {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
    categoryBreakdown: Record<string, number>;
    periodBalance: number;
}

interface Alert {
    type: 'overspending' | 'anomaly' | 'insight';
    category: string;
    message: string;
    severity: 'warning' | 'high' | 'info';
}

interface Insights {
    trend: 'increasing' | 'decreasing' | 'stable';
    percentChange: number;
    dailyStats: { day: number; income: number; expense: number }[];
    alerts: Alert[];
}

interface Transaction {
    _id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    date: string;
}

export default function DashboardPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [insights, setInsights] = useState<Insights | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [summaryRes, transactionsRes, insightsRes] = await Promise.all([
                api.get('/analytics/summary?period=monthly'),
                api.get('/transactions?limit=5'),
                api.get('/analytics/insights')
            ]);
            setSummary(summaryRes.data.data);
            setRecentTransactions(transactionsRes.data.data);
            setInsights(insightsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <Link
                    href="/dashboard/transactions/new"
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transition"
                >
                    + Add Transaction
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Balance</p>
                            <p className={`text-2xl font-bold mt-1 ${(summary?.balance || 0) >= 0 ? 'text-white' : 'text-red-400'}`}>
                                {formatCurrency(summary?.balance || 0)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
                            🏦
                        </div>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Monthly Income</p>
                            <p className="text-2xl font-bold text-green-400 mt-1">
                                {formatCurrency(summary?.totalIncome || 0)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl">
                            📈
                        </div>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Monthly Expenses</p>
                            <p className="text-2xl font-bold text-red-400 mt-1">
                                {formatCurrency(summary?.totalExpenses || 0)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-2xl">
                            📉
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts & Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Spending Trend Chart */}
                <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <h2 className="text-xl font-semibold text-white mb-6">Spending Trend (This Month)</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={insights?.dailyStats}>
                                <defs>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="#9ca3af"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: any) => [`₹${value}`, 'Amount']}
                                    labelFormatter={(label) => `Day ${label}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#f43f5e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Smart Insights & Alerts */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Monthly Summary Box */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                        <h2 className="text-xl font-semibold text-white mb-4">Monthly Overview</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Net Cash Flow</span>
                                <span className={`font-semibold ${(summary?.periodBalance || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {((summary?.periodBalance || 0) > 0 ? '+' : '')}{formatCurrency(summary?.periodBalance || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Spending Trend</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${insights?.trend === 'increasing' ? 'bg-red-500/20 text-red-300' :
                                    insights?.trend === 'decreasing' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                                    }`}>
                                    {insights?.trend === 'increasing' ? 'Spending Increased EOUT' :
                                        insights?.trend === 'decreasing' ? 'Spending Decreased 📉' : 'Stable'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Alerts Section */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Smart Alerts</h3>
                        {insights?.alerts && insights.alerts.length > 0 ? (
                            insights.alerts.map((alert, index) => (
                                <div key={index} className={`p-4 rounded-xl border ${alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                                        alert.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                            'bg-blue-500/10 border-blue-500/30'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">
                                            {alert.severity === 'high' ? '🚨' :
                                                alert.severity === 'warning' ? '⚠️' : '💡'}
                                        </span>
                                        <div>
                                            <p className={`text-sm font-semibold ${alert.severity === 'high' ? 'text-red-200' :
                                                    alert.severity === 'warning' ? 'text-yellow-200' : 'text-blue-200'
                                                }`}>
                                                {alert.type === 'anomaly' ? 'Unusual Spending' :
                                                    alert.type === 'insight' ? 'Top Expense' : 'Category Alert'}
                                            </p>
                                            <p className="text-xs text-white/70 mt-1">{alert.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                                <span className="text-xl">✅</span>
                                <p className="text-sm text-green-200">Everything looks good! No spending anomalies detected.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                    <Link href="/dashboard/transactions" className="text-purple-400 hover:text-purple-300 text-sm">
                        View all →
                    </Link>
                </div>

                {recentTransactions.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No transactions yet. Add your first one!</p>
                ) : (
                    <div className="space-y-3">
                        {recentTransactions.map((tx) => (
                            <div
                                key={tx._id}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                        {tx.type === 'income' ? '💵' : '💸'}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{tx.description || tx.category}</p>
                                        <p className="text-gray-400 text-sm">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className={`font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
