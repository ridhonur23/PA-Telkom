const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireAdminOrManagement, requireAnyRole } = require('../middleware/auth');
const assetsController = require('../controllers/assetsController');

const router = express.Router();

// mendapatkan semua asset
router.get('/', authenticateToken, requireAnyRole, assetsController.getAllAssets);

// mendapatkan asset berdasarkan ID
router.get('/:id', authenticateToken, requireAnyRole, assetsController.getAssetById);

// buat asset (Admin dan Management dapat mengakses)
router.post('/', authenticateToken, requireAdminOrManagement, [
  body('name').trim().notEmpty().withMessage('Nama asset diperlukan'),
  body('code').trim().notEmpty().withMessage('Kode asset diperlukan'),
  body('categoryId').isInt({ min: 1 }).withMessage('ID kategori yang valid diperlukan'),
  body('officeId').isInt({ min: 1 }).withMessage('ID kantor yang valid diperlukan'),
  body('description').optional().trim()
], assetsController.createAsset);

// perbarui aset (Admin dan Management dapat mengakses)
router.put('/:id', authenticateToken, requireAdminOrManagement, [
  body('name').optional().trim().notEmpty().withMessage('Nama asset tidak boleh kosong'),
  body('code').optional().trim().notEmpty().withMessage('Kode asset tidak boleh kosong'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('ID kategori yang valid diperlukan'),
  body('officeId').optional().isInt({ min: 1 }).withMessage('ID kantor yang valid diperlukan'),
  body('description').optional().trim(),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable harus berupa boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive harus berupa boolean')
], assetsController.updateAsset);

// hapus asset (Admin dan Management dapat mengakses)
router.delete('/:id', authenticateToken, requireAdminOrManagement, assetsController.deleteAsset);

module.exports = router;
