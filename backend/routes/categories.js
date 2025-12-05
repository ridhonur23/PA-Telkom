const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireAdmin, requireAnyRole } = require('../middleware/auth');
const categoriesController = require('../controllers/categoriesController');

const router = express.Router();

// dapatkan semua kategori
router.get('/', authenticateToken, requireAnyRole, categoriesController.getAllCategories);

// dapatkan kategori berdasarkan ID
router.get('/:id', authenticateToken, requireAnyRole, categoriesController.getCategoryById);

// buat kategori (hanya admin yang dapat mengakses)
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().notEmpty().withMessage('Nama kategori diperlukan'),
  body('type').isIn(['VEHICLE', 'ROOM_KEY', 'DEVICE', 'OTHER']).withMessage('Type harus VEHICLE, ROOM_KEY, DEVICE, atau OTHER'),
  body('description').optional().trim(),
  body('allowedRoles').optional().trim()
], categoriesController.createCategory);

// perbarui kategori (hanya admin yang dapat mengakses)
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().trim().notEmpty().withMessage('nama kategori tidak boleh kosong'),
  body('type').optional().isIn(['VEHICLE', 'ROOM_KEY', 'DEVICE', 'OTHER']).withMessage('Type harus VEHICLE, ROOM_KEY, DEVICE, atau OTHER'),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive harus berupa boolean'),
  body('allowedRoles').optional().trim()
], categoriesController.updateCategory);

// hapus kategori (hanya admin yang dapat mengakses)
router.delete('/:id', authenticateToken, requireAdmin, categoriesController.deleteCategory);

module.exports = router;
