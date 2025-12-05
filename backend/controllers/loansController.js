const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const moment = require('moment');
const XLSX = require('xlsx');
const prisma = new PrismaClient();

// Mendapatkan semua peminjaman
exports.getAllLoans = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      assetId = '', 
      officeId = '',
      userId = '',
      startDate = '', 
      endDate = '' 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Tentukan officeId yang akan digunakan untuk filter
    // Security guard hanya bisa melihat data dari kantornya sendiri
    // Admin bisa filter berdasarkan officeId dari query parameter
    const effectiveOfficeId = req.user.role === 'SECURITY_GUARD' 
      ? req.user.officeId 
      : (officeId ? parseInt(officeId) : null);

    console.log('Loan filters:', { officeId, effectiveOfficeId, role: req.user.role, userOfficeId: req.user.officeId });

    const where = {
      AND: [
        search ? {
          OR: [
            { borrowerName: { contains: search } },
            { borrowerPhone: { contains: search } },
            { purpose: { contains: search } },
            { asset: { name: { contains: search } } },
            { asset: { code: { contains: search } } }
          ]
        } : {},
        status ? { status: status } : {},
        assetId ? { assetId: parseInt(assetId) } : {},
        userId ? { userId: parseInt(userId) } : {},
        effectiveOfficeId ? { asset: { officeId: effectiveOfficeId } } : {},
        startDate && endDate ? {
          loanDate: {
            gte: new Date(startDate),
            lte: moment(new Date(endDate)).add(1, 'days').toDate(), // tambahkan satu hari ke tanggal akhir
          }
        } : {}
      ]
    };

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        include: {
          asset: {
            include: {
              category: true,
              office: true
            }
          },
          user: {
            select: {
              id: true,
              fullName: true,
              username: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.loan.count({ where })
    ]);

    res.json({
      loans,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Kesalahan mendapatkan peminjaman:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

exports.getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[Loans] getLoanById', { userId: req.user.id, role: req.user.role, loanId: id });
    const where = { id: parseInt(id) };
    
    // filter berdasarkan kantor untuk security guard
    if (req.user.role === 'SECURITY_GUARD') {
      where.asset = { officeId: req.user.officeId };
    }

    const loan = await prisma.loan.findFirst({
      where,
      include: {
        asset: {
          include: {
            category: true,
            office: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        }
      }
    });

    if (!loan) {
      return res.status(404).json({ error: 'Peminjaman tidak ditemukan' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Kesalahan mendapatkan peminjaman:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// Membuat peminjaman baru
exports.createLoan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assetId, borrowerName, borrowerPhone, purpose, returnDate, isThirdParty, thirdPartyName, thirdPartyAddress } = req.body;
    console.log('[Loans] createLoan', { userId: req.user.id, role: req.user.role, assetId, borrowerName, isThirdParty });

    // cek apakah asset ada dan tersedia
    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(assetId) },
      include: { office: true }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Aset tidak ditemukan' });
    }

    if (!asset.isActive) {
      return res.status(400).json({ error: 'Aset tidak aktif' });
    }

    if (!asset.isAvailable) {
      return res.status(400).json({ error: 'Aset tidak tersedia untuk peminjaman' });
    }

    // Untuk security guard, pastikan aset milik kantor mereka
    if (req.user.role === 'SECURITY_GUARD' && asset.officeId !== req.user.officeId) {
      return res.status(403).json({ error: 'Anda hanya dapat membuat peminjaman untuk aset di kantor Anda' });
    }

    // Cek apakah aset memiliki peminjaman aktif
    const activeLoan = await prisma.loan.findFirst({
      where: {
        assetId: parseInt(assetId),
        status: 'BORROWED'
      }
    });

    if (activeLoan) {
      return res.status(400).json({ error: 'Aset sedang dipinjam' });
    }

    // buat peminjaman
    const loan = await prisma.loan.create({
      data: {
        assetId: parseInt(assetId),
        userId: req.user.id,
        borrowerName,
        borrowerPhone: borrowerPhone || null,
        purpose: purpose || null,
        returnDate: returnDate ? new Date(returnDate) : null,
        isThirdParty: isThirdParty || false,
        thirdPartyName: isThirdParty ? thirdPartyName : null,
        thirdPartyAddress: isThirdParty ? thirdPartyAddress : null
      },
      include: {
        asset: {
          include: {
            category: true,
            office: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        }
      }
    });

    // memperbarui ketersediaan aset
    await prisma.asset.update({
      where: { id: parseInt(assetId) },
      data: { isAvailable: false }
    });

    res.status(201).json({
      message: 'Peminjaman berhasil dibuat',
      loan
    });

  } catch (error) {
    console.error('Kesalahan membuat peminjaman:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// pengembalian aset
exports.returnAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    console.log('[Loans] returnAsset', { userId: req.user.id, role: req.user.role, loanId: id });

    const where = { id: parseInt(id) };
    
    // filter aset id berdasarkan kantor untuk security guard
    if (req.user.role === 'SECURITY_GUARD') {
      where.asset = { officeId: req.user.officeId };
    }

    // temukan peminjaman
    const loan = await prisma.loan.findFirst({
      where,
      include: { asset: true }
    });

    if (!loan) {
      return res.status(404).json({ error: 'Peminjaman tidak ditemukan' });
    }

    if (loan.status !== 'BORROWED') {
      return res.status(400).json({ error: 'Peminjaman belum dipinjam' });
    }

    // perbarui status peminjaman
    const updatedLoan = await prisma.loan.update({
      where: { id: parseInt(id) },
      data: {
        status: 'RETURNED',
        actualReturnDate: new Date(),
        notes: notes || null
      },
      include: {
        asset: {
          include: {
            category: true,
            office: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        }
      }
    });

    // perbarui ketersediaan aset
    await prisma.asset.update({
      where: { id: loan.assetId },
      data: { isAvailable: true }
    });

    res.json({
      message: 'Aset berhasil dikembalikan',
      loan: updatedLoan
    });

  } catch (error) {
    console.error('Kesalahan mengembalikan aset:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// tandai peminjaman sebagai terlambat
exports.markAsOverdue = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[Loans] markAsOverdue', { userId: req.user.id, role: req.user.role, loanId: id });

    const loan = await prisma.loan.findUnique({
      where: { id: parseInt(id) },
      include: { asset: true }
    });

    if (!loan) {
      return res.status(404).json({ error: 'Peminjaman tidak ditemukan' });
    }

    if (loan.status !== 'BORROWED') {
      return res.status(400).json({ error: 'Peminjaman belum dipinjam' });
    }

    // perbarui status peminjaman menjadi terlambat
    const updatedLoan = await prisma.loan.update({
      where: { id: parseInt(id) },
      data: { status: 'OVERDUE' },
      include: {
        asset: {
          include: {
            category: true,
            office: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            username: true
          }
        }
      }
    });

    res.json({
      message: 'Peminjaman ditandai sebagai terlambat',
      loan: updatedLoan
    });

  } catch (error) {
    console.error('Kesalahan menandai terlambat:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// ekspor data ke XLSX
exports.exportToXLSX = async (req, res) => {
  try {
    const { startDate = '', endDate = '', status = '', officeId = '', userId = '' } = req.query;
    console.log('[Loans] exportToXLSX', { exporterId: req.user.id, role: req.user.role, status, officeId, userId });

    // Tentukan officeId yang akan digunakan untuk filter
    // Security guard hanya bisa melihat data dari kantornya sendiri
    // Admin bisa filter berdasarkan officeId dari query parameter
    const effectiveOfficeId = req.user.role === 'SECURITY_GUARD' 
      ? req.user.officeId 
      : (officeId ? parseInt(officeId) : null);

    const where = {
      AND: [
        status ? { status: status } : {},
        userId ? { userId: parseInt(userId) } : {},
        effectiveOfficeId ? { asset: { officeId: effectiveOfficeId } } : {},
        startDate && endDate ? {
          loanDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        } : {}
      ]
    };

    const loans = await prisma.loan.findMany({
      where,
      include: {
        asset: {
          include: {
            category: true,
            office: true
          }
        },
        user: {
          select: {
            fullName: true,
            username: true
          }
        }
      },
      orderBy: { loanDate: 'desc' }
    });

    // menyiapkan data untuk Excel
    const data = loans.map(loan => ({
      'Tanggal Pinjam': moment(loan.loanDate).format('DD/MM/YYYY HH:mm'),
      'Nama Peminjam': loan.borrowerName,
      'No. Telepon': loan.borrowerPhone || '',
      'Pihak Ketiga': loan.isThirdParty ? 'Ya' : 'Tidak',
      'Nama Organisasi': loan.thirdPartyName || '',
      'Alamat Pihak Ketiga': loan.thirdPartyAddress || '',
      'Asset': loan.asset.name,
      'Kode Asset': loan.asset.code,
      'Kategori': loan.asset.category.name,
      'Kantor': loan.asset.office.name,
      'Petugas': loan.user.fullName,
      'Status': loan.status,
      'Tanggal Kembali': loan.returnDate ? moment(loan.returnDate).format('DD/MM/YYYY HH:mm') : '',
      'Tanggal Aktual Kembali': loan.actualReturnDate ? moment(loan.actualReturnDate).format('DD/MM/YYYY HH:mm') : '',
      'Keperluan': loan.purpose || '',
      'Catatan': loan.notes || ''
    }));

    // buat workbook dan worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // set lebar kolom untuk keterbacaan
    const columnWidths = [
      { wch: 18 }, // Tanggal Pinjam
      { wch: 20 }, // Nama Peminjam
      { wch: 15 }, // No. Telepon
      { wch: 12 }, // Pihak Ketiga
      { wch: 25 }, // Nama Organisasi
      { wch: 30 }, // Alamat Pihak Ketiga
      { wch: 25 }, // Asset
      { wch: 15 }, // Kode Asset
      { wch: 15 }, // Kategori
      { wch: 20 }, // Kantor
      { wch: 20 }, // Petugas
      { wch: 12 }, // Status
      { wch: 18 }, // Tanggal Kembali
      { wch: 18 }, // Tanggal Aktual Kembali
      { wch: 25 }, // Keperluan
      { wch: 25 }  // Catatan
    ];
    worksheet['!cols'] = columnWidths;

    // tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Peminjaman');

    // generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // seting header respons
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=loans_${moment().format('YYYY-MM-DD')}.xlsx`);

    // Kirim file Excel
    res.send(excelBuffer);

  } catch (error) {
    console.error('Kesalahan ekspor XLSX:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};
