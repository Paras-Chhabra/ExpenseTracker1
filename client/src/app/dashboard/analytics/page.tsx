'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Insights {
    thisMonthExpenses: number;
    lastMonthExpenses: number;
    trend: string;
    percentChange: number;
    alerts: Array<{
        category: string;
        currentAmount: number;
        previousAmount: number;
        increasePercent: number;
    }>;
    categoryBreakdown: Record<string, number>;
}

interface Summary {
    period: string;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    categoryBreakdown: Record<string, number>;
}

export default function AnalyticsPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [insights, setInsights] = useState<Insights | null>(null);
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [summaryRes, insightsRes] = await Promise.all([
                api.get(`/analytics/summary?period=${period}`),
                api.get('/analytics/insights')
            ]);
            setSummary(summaryRes.data.data);
            setInsights(insightsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const totalExpenses = Object.values(summary?.categoryBreakdown || {}).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod('weekly')}
                        className={`px-4 py-2 rounded-lg transition ${period === 'weekly'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setPeriod('monthly')}
                        className={`px-4 py-2 rounded-lg transition ${period === 'monthly'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <p className="text-gray-400 text-sm">Total Income</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                        {formatCurrency(summary?.totalIncome || 0)}
                    </p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <p className="text-gray-400 text-sm">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">
                        {formatCurrency(summary?.totalExpenses || 0)}
                    </p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <p className="text-gray-400 text-sm">Balance</p>
                    <p className={`text-2xl font-bold mt-1 ${(summary?.balance || 0) >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                        {formatCurrency(summary?.balance || 0)}
                    </p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <p className="text-gray-400 text-sm">Spending Trend</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-2xl ${insights?.trend === 'increasing' ? 'text-red-400' : insights?.trend === 'decreasing' ? 'text-green-400' : 'text-gray-400'}`}>
                            {insights?.trend === 'increasing' ? '📈' : insights?.trend === 'decreasing' ? '📉' : '➡️'}
                        </span>
                        <span className={`font-bold ${insights?.trend === 'increasing' ? 'text-red-400' : insights?.trend === 'decreasing' ? 'text-green-400' : 'text-gray-400'}`}>
                            {insights?.percentChange || 0}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {insights?.alerts && insights.alerts.length > 0 && (
                <div className="bg-yellow-500/10 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
                    <h2 className="text-xl font-semibold text-yellow-400 mb-4">⚠️ Overspending Alerts</h2>
                    <div className="space-y-3">
                        {insights.alerts.map((alert, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <div>
                                    <p className="text-white font-medium">{alert.category}</p>
                                    <p className="text-gray-400 text-sm">
                                        {formatCurrency(alert.previousAmount)} → {formatCurrency(alert.currentAmount)}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                                    +{alert.increasePercent}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Breakdown */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-6">Spending by Category</h2>
                {Object.keys(summary?.categoryBreakdown || {}).length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No expense data for this period.</p>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(summary?.categoryBreakdown || {})
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, amount]) => {
                                const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                                return (
                                    <div key={category} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">{category}</span>
                                            <span className="text-white font-medium">{formatCurrency(amount)} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Month Comparison */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-6">Month-over-Month Comparison</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-6 bg-white/5 rounded-xl">
                        <p className="text-gray-400 text-sm mb-2">Last Month</p>
                        <p className="text-2xl font-bold text-gray-300">{formatCurrency(insights?.lastMonthExpenses || 0)}</p>
                    </div>
                    <div className="text-center p-6 bg-white/5 rounded-xl">
                        <p className="text-gray-400 text-sm mb-2">This Month</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(insights?.thisMonthExpenses || 0)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
