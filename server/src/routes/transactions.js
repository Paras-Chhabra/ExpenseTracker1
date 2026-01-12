const express = require('express');
const { body } = require('express-validator');
const {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

const transactionValidation = [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').notEmpty().withMessage('Category is required')
];

router.route('/')
    .get(getTransactions)
    .post(transactionValidation, createTransaction);

router.route('/:id')
    .get(getTransaction)
    .put(transactionValidation, updateTransaction)
    .delete(deleteTransaction);

module.exports = router;
