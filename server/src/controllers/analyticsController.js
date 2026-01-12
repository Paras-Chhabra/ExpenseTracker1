const Transaction = require('../models/Transaction');

// @desc    Get summary (weekly/monthly totals)
// @route   GET /api/analytics/summary
// @access  Private
exports.getSummary = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const now = new Date();
        let startDate, endDate;

        // 1. Calculate All-Time Balance (Wallet Balance)
        const balanceStats = await Transaction.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                    },
                    totalExpenses: {
                        $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                    }
                }
            }
        ]);

        const totalBalance = balanceStats.length > 0
            ? balanceStats[0].totalIncome - balanceStats[0].totalExpenses
            : 0;

        // 2. Determine Date Range for income/expense stats
        if (period === 'weekly') {
            // Last 7 days
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Allow future
        } else {
            // Current Calendar Month (1st to Last Day)
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        const transactions = await Transaction.find({
            user: req.user._id,
            date: { $gte: startDate, $lte: endDate }
        });

        const periodIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const periodExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Category breakdown (Period specific)
        const categoryBreakdown = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        res.json({
            success: true,
            data: {
                period,
                startDate,
                endDate,
                totalIncome: periodIncome,
                totalExpenses: periodExpenses,
                balance: totalBalance, // All-time balance
                periodBalance: periodIncome - periodExpenses, // Cash flow for period
                categoryBreakdown,
                transactionCount: transactions.length
            }
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get insights (overspending alerts, trends)
// @route   GET /api/analytics/insights
// @access  Private
exports.getInsights = async (req, res) => {
    try {
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // This month's transactions
        const thisMonth = await Transaction.find({
            user: req.user._id,
            date: { $gte: thisMonthStart, $lte: thisMonthEnd }
        });

        // Last month's transactions
        const lastMonth = await Transaction.find({
            user: req.user._id,
            date: { $gte: lastMonthStart, $lte: lastMonthEnd }
        });

        // 1. Calculate Daily Stats for Graph
        const daysInMonth = thisMonthEnd.getDate();
        const dailyStats = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            income: 0,
            expense: 0
        }));

        thisMonth.forEach(t => {
            const day = new Date(t.date).getDate();
            if (t.type === 'income') dailyStats[day - 1].income += t.amount;
            if (t.type === 'expense') dailyStats[day - 1].expense += t.amount;
        });

        // 2. Calculate Totals
        const thisMonthExpenses = thisMonth
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const lastMonthExpenses = lastMonth
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // 3. Category Comparison & Overspending Alerts
        const thisMonthByCategory = thisMonth
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        const lastMonthByCategory = lastMonth
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        const alerts = [];
        for (const category of Object.keys(thisMonthByCategory)) {
            const current = thisMonthByCategory[category];
            const previous = lastMonthByCategory[category] || 0;
            // Alert if spending > 20% more than last month AND amount is significant (> 500)
            if (previous > 0 && current > previous * 1.2 && current > 500) {
                alerts.push({
                    type: 'overspending',
                    category,
                    message: `Spending on ${category} is up ${Math.round(((current - previous) / previous) * 100)}% vs last month.`,
                    severity: 'warning'
                });
            }
        }

        // 4. Detect Anomalies (Unusually high transactions)
        const expenseTransactions = thisMonth.filter(t => t.type === 'expense');
        if (expenseTransactions.length > 0) {
            const avgTransaction = thisMonthExpenses / expenseTransactions.length;

            // Find Highest Expense
            const highestExpense = expenseTransactions.reduce((max, t) => t.amount > max.amount ? t : max, expenseTransactions[0]);
            alerts.push({
                type: 'insight',
                category: highestExpense.category,
                message: `Highest Expense: ${highestExpense.amount} (${highestExpense.description || highestExpense.category})`,
                severity: 'info'
            });

            expenseTransactions.forEach(t => {
                if (t.amount > avgTransaction * 2.5 && t.amount > 1000) {
                    // Avoid duplicating if it's the same as highest expense
                    if (t._id.toString() !== highestExpense._id.toString()) {
                        alerts.push({
                            type: 'anomaly',
                            category: t.category,
                            message: `Unusual High Expense: ${t.amount} for ${t.description || t.category}`,
                            severity: 'high'
                        });
                    }
                }
            });
        }

        // Spending trend
        const trend = thisMonthExpenses > lastMonthExpenses ? 'increasing' :
            thisMonthExpenses < lastMonthExpenses ? 'decreasing' : 'stable';

        res.json({
            success: true,
            data: {
                thisMonthExpenses,
                lastMonthExpenses,
                trend,
                percentChange: lastMonthExpenses > 0
                    ? Math.round(((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100)
                    : 0,
                dailyStats,
                alerts
            }
        });
    } catch (error) {
        console.error('Insights Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
