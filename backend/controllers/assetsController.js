const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

exports.getAllAssets = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', categoryId = '', officeId = '', isAvailable, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Filter berdasarkan kantor untuk Security Guard
    const baseWhere = req.user.role === 'SECURITY_GUARD' 
      ? { officeId: req.user.officeId }
      : {};

    const where = {
      ...baseWhere,
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { code: { contains: search } },
            { description: { contains: search } }
          ]
        } : {},
        categoryId ? { categoryId: parseInt(categoryId) } : {},
        officeId && req.user.role === 'ADMIN' ? { officeId: parseInt(officeId) } : {},
        isAvailable !== undefined ? { isAvailable: isAvailable === 'true' } : {},
        isActive !== undefined ? { isActive: isActive === 'true' } : {}
      ]
    };

    const [allAssets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          category: true,
          office: true,
          _count: {
            select: {
              loans: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.asset.count({ where })
    ]);

    // Filter berdasarkan allowedRoles dari kategori
    const assets = allAssets.filter(asset => {
      if (!asset.category || !asset.category.allowedRoles) return true;
      const allowedRoles = asset.category.allowedRoles.split(',');
      return allowedRoles.includes(req.user.role);
    });

    // Hitung total setelah filter allowedRoles
    const filteredTotal = assets.length;

    res.json({
      assets,
      pagination: {
        total: filteredTotal,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredTotal / parseInt(limit))
      },
    });

  } catch (error) {
    console.error('Error Mendapatkan Semua Asset:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id: parseInt(id) };

    // Filter kantor untuk Security Guard
    if (req.user.role === 'SECURITY_GUARD') {
      where.officeId = req.user.officeId;
    }

    const asset = await prisma.asset.findFirst({
      where,
      include: {
        category: true,
        office: true,
        loans: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Aset tidak ditemukan' });
    }

    // Cek allowedRoles dari kategori
    if (asset.category && asset.category.allowedRoles) {
      const allowedRoles = asset.category.allowedRoles.split(',');
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Anda tidak memiliki akses ke aset ini' });
      }
    }

    res.json(asset);

  } catch (error) {
    console.error('Error Mendapatkan Asset:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// membuat aset baru
exports.createAsset = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, categoryId, officeId, description } = req.body;

    // Cek jika kode aset sudah ada
    const existingAsset = await prisma.asset.findUnique({
      where: { code }
    });

    if (existingAsset) {
      return res.status(400).json({ error: 'Aset dengan kode ini sudah ada' });
    }

    // Verifikasi kategori dan kantor ada
    const [category, office] = await Promise.all([
      prisma.category.findUnique({ where: { id: parseInt(categoryId) } }),
      prisma.office.findUnique({ where: { id: parseInt(officeId) } })
    ]);

    if (!category) {
      return res.status(400).json({ error: 'kategori tidak ditemukan' });
    }

    if (!office) {
      return res.status(400).json({ error: 'kantor tidak ditemukan' });
    }

    // buat aset
    const asset = await prisma.asset.create({
      data: {
        name,
        code: code.toUpperCase(),
        categoryId: parseInt(categoryId),
        officeId: parseInt(officeId),
        description: description || null
      },
      include: {
        category: true,
        office: true
      }
    });

    res.status(201).json({
      message: 'Aset berhasil dibuat',
      asset
    });

  } catch (error) {
    console.error('Error Membuat Aset:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, code, categoryId, officeId, description, isAvailable, isActive } = req.body;

    // Cek jika aset ada
    const existingAsset = await prisma.asset.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAsset) {
      return res.status(404).json({ error: 'Aset tidak ditemukan' });
    }

    // cek duplikat kode (kecuali aset saat ini)
    if (code) {
      const duplicateAsset = await prisma.asset.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(id) } },
            { code: code.toUpperCase() }
          ]
        }
      });

      if (duplicateAsset) {
        return res.status(400).json({ error: 'Aset dengan kode ini sudah ada' });
      }
    }

    // Verifikasi kategori dan kantor ada jika diberikan
    if (categoryId) {
      const category = await prisma.category.findUnique({ 
        where: { id: parseInt(categoryId) } 
      });
      if (!category) {
        return res.status(400).json({ error: 'kategori tidak ditemukan' });
      }
    }

    if (officeId) {
      const office = await prisma.office.findUnique({ 
        where: { id: parseInt(officeId) } 
      });
      if (!office) {
        return res.status(400).json({ error: 'kantor tidak ditemukan' });
      }
    }

    // persiapkan data pembaruan
    const updateData = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code.toUpperCase();
    if (categoryId) updateData.categoryId = parseInt(categoryId);
    if (officeId) updateData.officeId = parseInt(officeId);
    if (description !== undefined) updateData.description = description || null;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update aset
    const asset = await prisma.asset.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        office: true
      }
    });

    res.json({
      message: 'Aset berhasil diperbarui',
      asset
    });

  } catch (error) {
    console.error('Error Memperbarui Aset:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek jika aset ada
    const existingAsset = await prisma.asset.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAsset) {
      return res.status(404).json({ error: 'Aset tidak ditemukan' });
    }

    // Cek jika aset memiliki pinjaman aktif
    const activeLoanCount = await prisma.loan.count({
      where: {
        assetId: parseInt(id),
        status: 'BORROWED'
      }
    });

    if (activeLoanCount > 0) {
      return res.status(400).json({
        error: 'Tidak dapat menghapus aset dengan pinjaman aktif. Harap proses semua pengembalian terlebih dahulu.'
      });
    }

    // hapus aset secara permanen
    await prisma.asset.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Aset berhasil dihapus' });

  } catch (error) {
    console.error('Error Menghapus Aset:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};
