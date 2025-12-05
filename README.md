# Sistem Informasi Peminjaman Kendaraan dan Kunci Ruangan
## Telkom Bojonegoro

Aplikasi manajemen peminjaman untuk kendaraan dan kunci ruangan di Kantor Telkom Wilayah Bojonegoro dengan 5 kantor cabang.

## Teknologi yang Digunakan

### Backend
- **Express.js** - Web framework untuk Node.js
- **Prisma ORM** - Database ORM dengan MySQL
- **JWT** - Authentication & Authorization
- **bcryptjs** - Password hashing
- **MySQL** - Database

### Frontend
- **React** - UI Framework
- **React Bootstrap** - UI Components
- **React Router** - Routing
- **Axios** - HTTP Client
- **Chart.js** - Data visualization
- **Moment.js** - Date manipulation

## Fitur Aplikasi

### Role: Administrator
- ✅ Membuat user untuk masing-masing kantor atau satpam
- ✅ Menambah dan mengelola kategori (kunci/kendaraan)
- ✅ Menambah dan mengelola asset (kendaraan dengan plat nomor, kunci ruangan)
- ✅ Dashboard dengan statistik lengkap
- ✅ Laporan dan export data

### Role: Satpam
- ✅ Input peminjaman kendaraan/kunci ruangan
- ✅ Konfirmasi pengembalian asset
- ✅ Tracking waktu peminjaman dan status
- ✅ Dashboard khusus untuk kantor masing-masing

### Sistem Informasi
- ✅ **Dashboard**: Statistik kategori, peminjaman hari ini, status pengembalian
- ✅ **Menu Peminjaman**: Input dan manajemen peminjaman (untuk satpam)
- ✅ **Menu Admin**: Kelola kategori, asset, dan user (khusus admin)
- ✅ **Riwayat**: History peminjaman dengan fitur download CSV
- ✅ **Multi-office**: Support untuk 5 kantor Telkom Bojonegoro

## Instalasi dan Setup

### Prasyarat
- Node.js (v16 atau lebih tinggi)
- MySQL Database
- npm atau yarn

### 1. Clone Repository
\`\`\`bash
git clone <repository-url>
cd SistemInformasiTelkom
\`\`\`

### 2. Setup Backend

\`\`\`bash
cd backend
npm install
\`\`\`

### 3. Konfigurasi Database

1. Buat database MySQL baru:
\`\`\`sql
CREATE DATABASE telkom_loan_system;
\`\`\`

2. Copy file .env.example ke .env dan sesuaikan konfigurasi:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Edit file .env:
\`\`\`env
DATABASE_URL="mysql://username:password@localhost:3306/telkom_loan_system"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
\`\`\`

### 4. Migrasi Database dan Seeding

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Seed initial data
npm run seed
\`\`\`

### 5. Setup Frontend

\`\`\`bash
cd ../frontend
npm install
\`\`\`

### 6. Menjalankan Aplikasi

#### Backend (Terminal 1):
\`\`\`bash
cd backend
npm run dev
\`\`\`
Server akan berjalan di: http://localhost:5000

#### Frontend (Terminal 2):
\`\`\`bash
cd frontend
npm start
\`\`\`
Aplikasi akan berjalan di: http://localhost:3000

## Data Login Default

Setelah menjalankan seeding, Anda dapat login dengan:

### Administrator:
- **Email**: admin@telkom.co.id
- **Password**: password123/$2a$10$O33Fi5xH4vMF4zT7jON.v.be3FirGQinzlmWsZZc8HeOz5CoOv27O

### Satpam:
- **Email**: satpam1@telkom.co.id (Kantor Pusat)
- **Password**: password123/$2a$10$O33Fi5xH4vMF4zT7jON.v.be3FirGQinzlmWsZZc8HeOz5CoOv27O

*Tersedia juga satpam2 hingga satpam5 untuk kantor lainnya*

## Struktur Database

### Tabel Utama:
- **users**: Data user (admin & satpam)
- **offices**: Data 5 kantor Telkom Bojonegoro
- **categories**: Kategori asset (kendaraan/kunci ruangan)
- **assets**: Data kendaraan dan kunci ruangan
- **loans**: Transaksi peminjaman

### Relasi:
- User belongs to Office (khusus satpam)
- Asset belongs to Category dan Office
- Loan belongs to Asset dan User

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user baru (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Statistik dashboard
- `GET /api/dashboard/chart/loans` - Data chart peminjaman

### Loans (Peminjaman)
- `GET /api/loans` - List peminjaman
- `POST /api/loans` - Buat peminjaman baru
- `PATCH /api/loans/:id/return` - Kembalikan asset
- `GET /api/loans/export/csv` - Export ke CSV

### Assets
- `GET /api/assets` - List asset
- `POST /api/assets` - Tambah asset (admin)
- `PUT /api/assets/:id` - Update asset (admin)
- `DELETE /api/assets/:id` - Hapus asset (admin)

### Categories
- `GET /api/categories` - List kategori
- `POST /api/categories` - Tambah kategori (admin)
- `PUT /api/categories/:id` - Update kategori (admin)
- `DELETE /api/categories/:id` - Hapus kategori (admin)

### Users
- `GET /api/users` - List user (admin)
- `POST /api/users` - Tambah user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Hapus user (admin)

### Offices
- `GET /api/offices` - List kantor
- `POST /api/offices` - Tambah kantor (admin)
- `PUT /api/offices/:id` - Update kantor (admin)
- `DELETE /api/offices/:id` - Hapus kantor (admin)

## Fitur Unggulan

### 🚗 Multi-Asset Support
- Kendaraan dengan plat nomor
- Kunci ruangan dengan kode khusus

### 🏢 Multi-Office Management
- 5 kantor Telkom Bojonegoro
- Satpam terbatas pada kantor masing-masing
- Admin dapat mengakses semua kantor

### 📊 Dashboard Real-time
- Statistik peminjaman harian
- Status ketersediaan asset
- Chart peminjaman 7 hari terakhir
- Peminjaman terbaru

### 📝 Comprehensive Logging
- History lengkap peminjaman
- Export ke CSV untuk laporan
- Tracking waktu peminjaman dan pengembalian
- Catatan kondisi asset saat dikembalikan

### 🔐 Role-based Access Control
- Administrator: Full access
- Satpam: Terbatas pada kantor masing-masing

### 📱 Responsive Design
- Mobile-friendly interface
- Bootstrap components
- Modern UI/UX

## Kontribusi

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## Kontak

Developer: Telkom Bojonegoro Team
Email: dev@telkom-bojonegoro.co.id

Project Link: [https://github.com/telkom-bojonegoro/loan-system](https://github.com/telkom-bojonegoro/loan-system)
