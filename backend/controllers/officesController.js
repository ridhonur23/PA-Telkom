const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

// mendapatkan semua kantor
exports.getAllOffices = async (req, res) => {
  try {
    const { search = '', isActive } = req.query;
    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { address: { contains: search } }
          ]
        } : {},
        isActive !== undefined ? { isActive: isActive === 'true' } : {}
      ]
    };
    const offices = await prisma.office.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            assets: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(offices);
  } catch (error) {
    console.error('Gagal mendapatkan kantor:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// mendapatkan kantor berdasarkan ID
exports.getOfficeById = async (req, res) => {
  try {
    const { id } = req.params;
    const office = await prisma.office.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            username: true,
            nik: true,
            role: true,
            isActive: true
          }
        },
        assets: {
          include: {
            category: true
          }
        },
        _count: {
          select: {
            users: true,
            assets: true
          }
        }
      }
    });
    if (!office) {
      return res.status(404).json({ error: 'Kantor tidak ditemukan' });
    }
    res.json(office);
  } catch (error) {
    console.error('Gagal mendapatkan kantor:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// membuat kantor
exports.createOffice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, address } = req.body;
    const existingOffice = await prisma.office.findUnique({ where: { name } });
    if (existingOffice) {
      return res.status(400).json({ error: 'Kantor dengan nama ini sudah ada' });
    }
    const office = await prisma.office.create({
      data: {
        name,
        address: address || null
      }
    });
    res.status(201).json({ message: 'Kantor berhasil dibuat', office });
  } catch (error) {
    console.error('Kesalahan membuat kantor:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// memperbarui kantor
exports.updateOffice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { name, address, isActive } = req.body;
    const existingOffice = await prisma.office.findUnique({ where: { id: parseInt(id) } });
    if (!existingOffice) {
      return res.status(404).json({ error: 'Kantor tidak ditemukan' });
    }
    if (name) {
      const duplicateOffice = await prisma.office.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(id) } },
            { name: name }
          ]
        }
      });
      if (duplicateOffice) {
        return res.status(400).json({ error: 'Kantor dengan nama ini sudah ada' });
      }
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (address !== undefined) updateData.address = address || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    const office = await prisma.office.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.json({ message: 'Kantor berhasil diperbarui', office });
  } catch (error) {
    console.error('Kesalahan memperbarui kantor:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// hapus kantor
exports.deleteOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const existingOffice = await prisma.office.findUnique({ where: { id: parseInt(id) } });
    if (!existingOffice) {
      return res.status(404).json({ error: 'Kantor tidak ditemukan' });
    }
    const userCount = await prisma.user.count({ where: { officeId: parseInt(id) } });
    if (userCount > 0) {
      return res.status(400).json({ error: 'Tidak dapat menghapus kantor dengan pengguna. Harap alihkan atau hapus pengguna terlebih dahulu.' });
    }
    const assetCount = await prisma.asset.count({ where: { officeId: parseInt(id) } });
    if (assetCount > 0) {
      return res.status(400).json({ error: 'Tidak dapat menghapus kantor dengan aset. Harap alihkan atau hapus aset terlebih dahulu.' });
    }
    await prisma.office.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Kantor berhasil dihapus' });
  } catch (error) {
    console.error('Kesalahan menghapus kantor:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};
