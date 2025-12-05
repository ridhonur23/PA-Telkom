const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireAnyRole } = require('../middleware/auth');
const loansController = require('../controllers/loansController');

const router = express.Router();

// mendapatkan semua pinjaman
router.get('/', authenticateToken, requireAnyRole, loansController.getAllLoans);

// mengekspor pinjaman ke XLSX
router.get('/export/xlsx', authenticateToken, requireAnyRole, loansController.exportToXLSX);

// mendapatkan pinjaman berdasarkan ID
router.get('/:id', authenticateToken, requireAnyRole, loansController.getLoanById);

// buat pinjaman (hanya security guard yang dapat mengakses)
router.post('/', authenticateToken, requireAnyRole, [
  body('assetId').isInt({ min: 1 }).withMessage('ID aset yang valid diperlukan'),
  body('borrowerName').trim().notEmpty().withMessage('Nama peminjam diperlukan'),
  body('borrowerPhone').optional().trim(),
  body('purpose').optional().trim(),
  body('returnDate').optional().isISO8601().withMessage('Tanggal pengembalian harus berupa tanggal yang valid')
], loansController.createLoan);

// Kembalikan aset
router.patch('/:id/return', authenticateToken, requireAnyRole, [
  body('notes').optional().trim()
], loansController.returnAsset);

// update peminjaman ke status terlambat
router.patch('/:id/overdue', authenticateToken, requireAnyRole, loansController.markAsOverdue);

module.exports = router;
