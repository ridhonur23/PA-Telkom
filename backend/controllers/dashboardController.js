const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mendapatkan statistik untuk dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('[Dashboard] getDashboardStats', { userId: req.user.id, role: req.user.role });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // filter berdasarkan kantor untuk security guard
    const whereClause = req.user.role === 'SECURITY_GUARD' 
      ? { asset: { officeId: req.user.officeId } }
      : {};
// Mendapatkan statistik untuk dashboard
    const [
      totalCategories,
      totalAssets,
      loansToday,
      activeLoanCount,
      returnedTodayCount,
      overdueLoanCount
    ] = await Promise.all([
      // Total kategori
      prisma.category.count({
        where: { isActive: true }
      }),

      // Total aset
      prisma.asset.count({
        where: { 
          isActive: true,
          ...(req.user.role === 'SECURITY_GUARD' ? { officeId: req.user.officeId } : {})
        }
      }),

      // peminjaman hari ini
      prisma.loan.count({
        where: {
          ...whereClause,
          loanDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // saat ini dipinjam (belum dikembalikan)
      prisma.loan.count({
        where: {
          ...whereClause,
          status: 'BORROWED'
        }
      }),

      // Dikembalikan hari ini
      prisma.loan.count({
        where: {
          ...whereClause,
          actualReturnDate: {
            gte: today,
            lt: tomorrow
          },
          status: 'RETURNED'
        }
      }),

      // Peminjaman terlambat
      prisma.loan.count({
        where: {
          ...whereClause,
          status: 'OVERDUE'
        }
      })
    ]);

    // peminjaman terbaru
    const recentLoans = await prisma.loan.findMany({
      where: whereClause,
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
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Ketersediaan aset
    const assetsAvailability = await prisma.asset.groupBy({
      by: ['isAvailable'],
      where: {
        isActive: true,
        ...(req.user.role === 'SECURITY_GUARD' ? { officeId: req.user.officeId } : {})
      },
      _count: {
        id: true
      }
    });

    const availableAssets = assetsAvailability.find(item => item.isAvailable)?._count.id || 0; // Jumlah aset yang tersedia
    const unavailableAssets = assetsAvailability.find(item => !item.isAvailable)?._count.id || 0; // Jumlah aset yang tidak tersedia

    res.json({
      stats: {
        totalCategories,
        totalAssets,
        loansToday,
        activeLoanCount,
        returnedTodayCount,
        overdueLoanCount,
        availableAssets,
        unavailableAssets
      },
      recentLoans
    });

  } catch (error) {
    console.error('Kesalahan statistik dasbor :', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};

// Mendapatkan data chart peminjaman harian
exports.getLoansChart = async (req, res) => {
  try {
    console.log('[Dashboard] getLoansChart', { userId: req.user.id, role: req.user.role });
    const days = [];
    const loansData = [];

    // filter berdasarkan kantor untuk security guard
    const whereClause = req.user.role === 'SECURITY_GUARD' 
      ? { asset: { officeId: req.user.officeId } }
      : {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await prisma.loan.count({
        where: {
          ...whereClause,
          loanDate: {
            gte: date,
            lt: nextDate
          }
        }
      });

      days.push(date.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short' 
      }));
      loansData.push(count);
    }

    res.json({
      labels: days,
      datasets: [{
        label: 'Peminjaman Harian',
        data: loansData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }]
    });

  } catch (error) {
    console.error('Kesalahan data chart:', error);
    res.status(500).json({ error: 'Kesalahan server internal' });
  }
};
