const express = require('express');
const { getSummary, getInsights } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/summary', getSummary);
router.get('/insights', getInsights);

module.exports = router;
