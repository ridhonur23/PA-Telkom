const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireAdmin, requireAdminOrManagement, requireAnyRole } = require('../middleware/auth');
const usersController = require('../controllers/usersController');

const router = express.Router();

// mendapatkan semua user (admin dan management dapat mengakses untuk keperluan filter)
router.get('/', authenticateToken, requireAdminOrManagement, usersController.getAllUsers);

// mendapatkan profil user saat ini
router.get('/profile', authenticateToken, requireAnyRole, usersController.getUserProfile);

// buat user (hanya admin yang dapat mengakses)
router.post('/', authenticateToken, requireAdmin, [
  body('nik').trim().isLength({ min: 1, max: 10 }).withMessage('NIK maksimal 10 digit'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username harus terdiri dari minimal 3 karakter'),
  body('password').isLength({ min: 6 }).withMessage('Password harus terdiri dari minimal 6 karakter'),
  body('fullName').trim().notEmpty().withMessage('Nama lengkap diperlukan'),
  body('role').isIn(['ADMIN', 'SECURITY_GUARD', 'MANAGEMENT']).withMessage('Role tidak valid')
], usersController.createUser);

// perbarui user (hanya admin yang dapat mengakses)
router.put('/:id', authenticateToken, requireAdmin, [
  body('nik').optional().trim().isLength({ min: 1, max: 10 }).withMessage('NIK maksimal 10 digit'),
  body('username').optional().trim().isLength({ min: 3 }).withMessage('Username harus terdiri dari minimal 3 karakter'),
  body('fullName').optional().trim().notEmpty().withMessage('Nama lengkap tidak boleh kosong'),
  body('role').optional().isIn(['ADMIN', 'SECURITY_GUARD', 'MANAGEMENT']).withMessage('Role tidak valid')
], usersController.updateUser);

// Hapus user (hanya admin yang dapat mengakses)
router.delete('/:id', authenticateToken, requireAdmin, usersController.deleteUser);

module.exports = router;
