const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireAdmin, requireAnyRole } = require('../middleware/auth');

const officesController = require('../controllers/officesController');

const router = express.Router();

// mendapatkan semua kantor
router.get('/', authenticateToken, requireAnyRole, officesController.getAllOffices);

// mendapatkan kantor berdasarkan ID
router.get('/:id', authenticateToken, requireAnyRole, officesController.getOfficeById);

// buat kantor (hanya admin yang dapat mengakses)
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().notEmpty().withMessage('Nama kantor diperlukan'),
  body('address').optional().trim()
], officesController.createOffice);

// perbarui kantor (hanya admin yang dapat mengakses)
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().trim().notEmpty().withMessage('Nama kantor tidak boleh kosong'),
  body('address').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive harus berupa boolean')
], officesController.updateOffice);

// Hapus kantor (hanya admin yang dapat mengakses)
router.delete('/:id', authenticateToken, requireAdmin, officesController.deleteOffice);

module.exports = router;
