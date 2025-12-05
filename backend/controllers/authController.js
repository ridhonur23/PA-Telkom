const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // mencari user berdasarkan username atau NIK
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { nik: username }
        ],
        isActive: true
      },
      include: { office: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'user tidak ditemukan' });
    }

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password tidak valid' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
    );

    // hapus password dari response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login berhasil',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nik, username, password, fullName, role, officeId } = req.body;

    // Cek jika user sudah ada
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { nik: nik },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User dengan NIK atau username ini sudah ada' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // buat user
    const user = await prisma.user.create({
      data: {
        nik,
        username,
        password: hashedPassword,
        fullName,
        role,
        officeId: officeId || null
      },
      include: { office: true }
    });

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User berhasil dibuat',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};
