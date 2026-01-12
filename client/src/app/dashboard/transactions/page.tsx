'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Transaction {
    _id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    date: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Salary', 'Shopping', 'Health', 'Education', 'Other'];

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: '',
        type: '',
        search: '',
        minAmount: '',
        maxAmount: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchTransactions(1);
    }, []);

    const fetchTransactions = async (page: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '10' });

            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.category) params.append('category', filters.category);
            if (filters.type) params.append('type', filters.type);
            if (filters.search) params.append('search', filters.search);
            if (filters.minAmount) params.append('minAmount', filters.minAmount);
            if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

            const res = await api.get(`/transactions?${params}`);
            setTransactions(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions(pagination?.page || 1);
        } catch (error) {
            console.error('Failed to delete transaction');
        }
    };

    const applyFilters = () => {
        fetchTransactions(1);
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            category: '',
            type: '',
            search: '',
            minAmount: '',
            maxAmount: ''
        });
        setTimeout(() => fetchTransactions(1), 0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold text-white">Transactions</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition"
                    >
                        {showFilters ? 'Hide Filters' : 'Filters'}
                    </button>
                    <Link
                        href="/dashboard/transactions/new"
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transition"
                    >
                        + Add New
                    </Link>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Search</label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Search description..."
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">End Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Min Amount</label>
                            <input
                                type="number"
                                value={filters.minAmount}
                                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Max Amount</label>
                            <input
                                type="number"
                                value={filters.maxAmount}
                                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                                placeholder="10000"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Transactions List */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        No transactions found.
                    </div>
                ) : (
                    <>
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 text-gray-400 text-sm font-medium">
                            <div className="col-span-3">Description</div>
                            <div className="col-span-2">Category</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-2">Amount</div>
                            <div className="col-span-1">Actions</div>
                        </div>
                        <div className="divide-y divide-white/10">
                            {transactions.map((tx) => (
                                <div key={tx._id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-white/5 transition">
                                    <div className="col-span-3 text-white font-medium">{tx.description || '-'}</div>
                                    <div className="col-span-2 text-gray-300">{tx.category}</div>
                                    <div className="col-span-2 text-gray-400">{new Date(tx.date).toLocaleDateString()}</div>
                                    <div className="col-span-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {tx.type}
                                        </span>
                                    </div>
                                    <div className={`col-span-2 font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </div>
                                    <div className="col-span-1 flex gap-2">
                                        <Link
                                            href={`/dashboard/transactions/${tx._id}/edit`}
                                            className="text-purple-400 hover:text-purple-300 text-sm"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(tx._id)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => fetchTransactions(page)}
                            className={`px-4 py-2 rounded-lg transition ${page === pagination.page
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
