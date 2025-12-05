const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Login
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username diperlukan'),
  body('password').notEmpty().withMessage('Password diperlukan')
], authController.login);

// register (hanya admin yang dapat mengakses)
router.post('/register', [
  body('nik').trim().isLength({ min: 1, max: 10 }).withMessage('NIK maksimal 10 digit'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username harus memiliki setidaknya 3 karakter'),
  body('password').isLength({ min: 6 }).withMessage('Password harus memiliki setidaknya 6 karakter'),
  body('fullName').trim().notEmpty().withMessage('Nama lengkap diperlukan'),
  body('role').isIn(['ADMIN', 'SECURITY_GUARD']).withMessage('Peran tidak valid')
], authController.register);

module.exports = router;
