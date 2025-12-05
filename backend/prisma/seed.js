const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Seed Offices
  const offices = await Promise.all([
    prisma.office.create({
      data: {
        name: 'Kantor Telkom Bojonegoro Pusat',
        address: 'Jl. Ahmad Yani No. 1, Bojonegoro'
      }
    }),
    prisma.office.create({
      data: {
        name: 'Kantor Telkom Bojonegoro Timur',
        address: 'Jl. Veteran No. 15, Bojonegoro'
      }
    }),
    prisma.office.create({
      data: {
        name: 'Kantor Telkom Bojonegoro Barat',
        address: 'Jl. Diponegoro No. 20, Bojonegoro'
      }
    }),
    prisma.office.create({
      data: {
        name: 'Kantor Telkom Bojonegoro Utara',
        address: 'Jl. Sudirman No. 25, Bojonegoro'
      }
    }),
    prisma.office.create({
      data: {
        name: 'Kantor Telkom Bojonegoro Selatan',
        address: 'Jl. Gajah Mada No. 30, Bojonegoro'
      }
    })
  ]);

  console.log('✅ Offices created');

  // Seed Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Kendaraan Operasional',
        description: 'Kendaraan untuk keperluan operasional sehari-hari',
        type: 'VEHICLE'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Kendaraan Dinas',
        description: 'Kendaraan untuk keperluan dinas resmi',
        type: 'VEHICLE'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Kunci Ruang Server',
        description: 'Kunci untuk ruang server dan teknis',
        type: 'ROOM_KEY'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Kunci Ruang Kantor',
        description: 'Kunci untuk ruang kantor dan meeting',
        type: 'ROOM_KEY'
      }
    })
  ]);

  console.log('✅ Categories created');

  // Hash password for users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed Admin User
  const admin = await prisma.user.create({
    data: {
      nik: '0000000001',
      username: 'admin',
      password: hashedPassword,
      fullName: 'Administrator Sistem',
      role: 'ADMIN'
    }
  });

  // Seed Management User
  const management = await prisma.user.create({
    data: {
      nik: '0000000002',
      username: 'manager',
      password: hashedPassword,
      fullName: 'Manajer Operasional',
      role: 'MANAGEMENT',
      officeId: offices[0].id
    }
  });

  // Seed Security Guards for each office
  const securityGuards = await Promise.all([
    prisma.user.create({
      data: {
        nik: '0000000003',
        username: 'satpam_pusat',
        password: hashedPassword,
        fullName: 'Satpam Kantor Pusat',
        role: 'SECURITY_GUARD',
        officeId: offices[0].id
      }
    }),
    prisma.user.create({
      data: {
        nik: '0000000004',
        username: 'satpam_timur',
        password: hashedPassword,
        fullName: 'Satpam Kantor Timur',
        role: 'SECURITY_GUARD',
        officeId: offices[1].id
      }
    }),
    prisma.user.create({
      data: {
        nik: '0000000005',
        username: 'satpam_barat',
        password: hashedPassword,
        fullName: 'Satpam Kantor Barat',
        role: 'SECURITY_GUARD',
        officeId: offices[2].id
      }
    }),
    prisma.user.create({
      data: {
        nik: '0000000006',
        username: 'satpam_utara',
        password: hashedPassword,
        fullName: 'Satpam Kantor Utara',
        role: 'SECURITY_GUARD',
        officeId: offices[3].id
      }
    }),
    prisma.user.create({
      data: {
        nik: '0000000007',
        username: 'satpam_selatan',
        password: hashedPassword,
        fullName: 'Satpam Kantor Selatan',
        role: 'SECURITY_GUARD',
        officeId: offices[4].id
      }
    })
  ]);

  console.log('✅ Users created');

  // Seed Assets
  const assets = await Promise.all([
    // Vehicles
    prisma.asset.create({
      data: {
        name: 'Toyota Avanza',
        code: 'L 1234 AB',
        description: 'Mobil operasional kantor pusat',
        categoryId: categories[0].id,
        officeId: offices[0].id
      }
    }),
    prisma.asset.create({
      data: {
        name: 'Honda Beat',
        code: 'L 5678 CD',
        description: 'Motor untuk keperluan cepat',
        categoryId: categories[0].id,
        officeId: offices[0].id
      }
    }),
    // Room Keys
    prisma.asset.create({
      data: {
        name: 'Kunci Server Room A',
        code: 'SRV-A-001',
        description: 'Kunci ruang server utama',
        categoryId: categories[2].id,
        officeId: offices[0].id
      }
    }),
    prisma.asset.create({
      data: {
        name: 'Kunci Meeting Room 1',
        code: 'MTG-1-001',
        description: 'Kunci ruang meeting lantai 1',
        categoryId: categories[3].id,
        officeId: offices[0].id
      }
    })
  ]);

  console.log('✅ Assets created');

  console.log('🌱 Seed completed successfully!');
  console.log('📝 Login credentials:');
  console.log('   Admin: admin (NIK: 0000000001) / password123');
  console.log('   Management: manager (NIK: 0000000002) / password123');
  console.log('   Satpam: satpam_pusat (NIK: 0000000003) / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
