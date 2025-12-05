const express = require('express');
const { authenticateToken, requireAnyRole } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// dapatkan statistik dashboard
router.get('/stats', authenticateToken, requireAnyRole, dashboardController.getDashboardStats);

// dapatkan data grafik pinjaman (pinjaman harian selama 7 hari terakhir)
router.get('/chart/loans', authenticateToken, requireAnyRole, dashboardController.getLoansChart);

module.exports = router;
