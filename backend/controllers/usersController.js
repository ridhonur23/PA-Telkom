const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

//mendapatkan semua user
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', officeId = '' } = req.query;
    console.log('[Users] getAllUsers', { requesterId: req.user.id, requesterRole: req.user.role, page, search, role, officeId });
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      AND: [
        search ? {
          OR: [
            { fullName: { contains: search } },
            { username: { contains: search } },
            { nik: { contains: search } }
          ]
        } : {},
        role ? { role: role } : {},
        officeId ? { officeId: parseInt(officeId) } : {}
      ]
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { office: true },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    // hapus field password dari response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    res.json({
      users: usersWithoutPasswords,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Kesalahan mendapatkan pengguna:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// mendapatkan profil user
exports.getUserProfile = async (req, res) => {
  try {
    console.log('[Users] getUserProfile', { userId: req.user.id, role: req.user.role });
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { office: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error('Kesalahan mendapatkan profil:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// membuat user baru
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nik, username, password, fullName, role, officeId } = req.body;
    console.log('[Users] createUser', { creatorId: req.user.id, creatorRole: req.user.role, newUserRole: role, username });

    // Periksa apakah pengguna sudah ada
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { nik: nik },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Pengguna dengan NIK atau username ini sudah ada' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat pengguna
    const user = await prisma.user.create({
      data: {
        nik,
        username,
        password: hashedPassword,
        fullName,
        role,
        officeId: officeId ? parseInt(officeId) : null
      },
      include: { office: true }
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Pengguna berhasil dibuat',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Kesalahan membuat pengguna:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// memperbarui pengguna
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { nik, username, password, fullName, role, officeId, isActive } = req.body;
    console.log('[Users] updateUser', { updaterId: req.user.id, updaterRole: req.user.role, targetUserId: id, username });

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    // cek duplikat nik/username (kecuali user saat ini)
    if (nik || username) {
      const whereConditions = [];
      
      // Hanya cek NIK jika berbeda dari NIK user saat ini
      if (nik && nik !== existingUser.nik) {
        whereConditions.push({ nik: nik });
      }
      
      // Hanya cek username jika berbeda dari username user saat ini
      if (username && username !== existingUser.username) {
        whereConditions.push({ username: username });
      }
      
      if (whereConditions.length > 0) {
        const duplicateUser = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: parseInt(id) } },
              { OR: whereConditions }
            ]
          }
        });

        if (duplicateUser) {
          return res.status(400).json({ error: 'Pengguna dengan NIK atau username ini sudah ada' });
        }
      }
    }

    // Siapkan data pembaruan
    const updateData = {};
    if (nik) updateData.nik = nik;
    if (username) updateData.username = username;
    if (fullName) updateData.fullName = fullName;
    if (role) updateData.role = role;
    if (officeId !== undefined) updateData.officeId = officeId ? parseInt(officeId) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    // Update user
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { office: true }
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Pengguna berhasil diperbarui',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Kesalahan memperbarui pengguna:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// menghapus user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[Users] deleteUser', { deleterId: req.user.id, deleterRole: req.user.role, targetUserId: id });

    // cek apakah user ada
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    // cegah menghapus diri sendiri
    if (existingUser.id === req.user.id) {
      return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
    }

    // cek apakah user memiliki pinjaman aktif
    const activeLoans = await prisma.loan.count({
      where: {
        userId: parseInt(id),
        status: 'BORROWED'
      }
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        error: 'Tidak dapat menghapus pengguna dengan pinjaman aktif. Harap proses semua pengembalian terlebih dahulu.'
      });
    }

    // hapus user secara permanen
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Pengguna berhasil dihapus' });

  } catch (error) {
    console.error('Kesalahan menghapus pengguna:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};
