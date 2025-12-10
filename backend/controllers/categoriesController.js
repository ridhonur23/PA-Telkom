const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

//mendapatkan semua kategori
exports.getAllCategories = async (req, res) => {
  try {
    const { search = '', type = '', isActive } = req.query;
    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } }
          ]
        } : {},
        type ? { type: type } : {},
        isActive !== undefined ? { isActive: isActive === 'true' } : {}
      ]
    };
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            assets: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error mendapatkan kategori:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

//mendapatkan kategori berdasarkan id
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        assets: {
          include: {
            office: true
          }
        },
        _count: {
          select: {
            assets: true
          }
        }
      }
    });
    if (!category) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error mendapatkan kategori:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};


//buat kategori baru
exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, type, description, allowedRoles } = req.body;
    const existingCategory = await prisma.category.findUnique({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ error: 'Kategori dengan nama ini sudah ada' });
    }
    const category = await prisma.category.create({
      data: {
        name,
        type,
        description: description || null,
        allowedRoles: allowedRoles || 'ADMIN,SECURITY_GUARD,MANAGEMENT'
      }
    });
    res.status(201).json({ message: 'Kategori berhasil dibuat', category });
  } catch (error) {
    console.error('Error membuat kategori:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// update kategori
exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { name, type, description, isActive } = req.body;
    const existingCategory = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!existingCategory) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan' });
    }
    if (name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(id) } },
            { name: name }
          ]
        }
      });
      if (duplicateCategory) {
        return res.status(400).json({ error: 'Kategori dengan nama ini sudah ada' });
      }
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (description !== undefined) updateData.description = description || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (req.body.allowedRoles !== undefined) updateData.allowedRoles = req.body.allowedRoles;
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.json({ message: 'Kategori berhasil diperbarui', category });
  } catch (error) {
    console.error('Error memperbarui kategori:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// hapus kategori
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCategory = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!existingCategory) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan' });
    }
    const assetCount = await prisma.asset.count({ where: { categoryId: parseInt(id) } });
    if (assetCount > 0) {
      return res.status(400).json({ error: 'Tidak dapat menghapus kategori dengan aset. Silakan alihkan atau hapus aset terlebih dahulu.' });
    }
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Error menghapus kategori:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};
