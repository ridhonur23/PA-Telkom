const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware untuk memverifikasi token JWT dan menambahkan info user ke req.user
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token akses diperlukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { office: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Pengguna tidak ditemukan atau tidak aktif' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token tidak valid atau telah kedaluwarsa' });
  }
};

// Middleware untuk memeriksa peran pengguna
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autentikasi diperlukan' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Izin tidak mencukupi' });
    }

    next();
  };
};

const requireAdmin = requireRole(['ADMIN']);
const requireSecurityGuard = requireRole(['SECURITY_GUARD']);
const requireManagement = requireRole(['MANAGEMENT']);
const requireAdminOrManagement = requireRole(['ADMIN', 'MANAGEMENT']);
const requireAnyRole = requireRole(['ADMIN', 'SECURITY_GUARD', 'MANAGEMENT']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSecurityGuard,
  requireManagement,
  requireAdminOrManagement,
  requireAnyRole
};
