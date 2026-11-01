const express = require('express');
const router = express.Router();
const { getAnalyticsReport, getExportReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalyticsReport);
router.get('/export', getExportReport);

module.exports = router;
