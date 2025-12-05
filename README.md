# Sistem Informasi Manajemen Peminjaman Aset
## PT Telkom Indonesia - Witel Bojonegoro

Aplikasi web untuk manajemen peminjaman aset (kendaraan, kunci ruangan, perangkat) di PT Telkom Indonesia Wilayah Bojonegoro dengan sistem multi-kantor dan role-based access control.



🛠 Teknologi yang Digunakan

Backend
- Node.js & Express.js** - Runtime dan web framework
- Prisma ORM - Database ORM modern untuk MySQL
- JWT (JSON Web Token)** - Authentication & Authorization
- bcryptjs** - Password hashing dan enkripsi
- express-validator** - Input validation dan sanitization
- MySQL - Relational Database Management System

Frontend
- React 18 - UI Library dengan hooks
- React Router v6 - Client-side routing
- React Bootstrap - UI Component library
- Axios - HTTP client untuk API calls
- Chart.js & react-chartjs-2 - Data visualization
- Moment.js - Date/time manipulation
- React Toastify - Toast notifications
- Font Awesome - Icon library

---

✨ Fitur Aplikasi

Role: Administrator (ADMIN)
- ✅ Manajemen User - CRUD user dengan role (Admin, Satpam, Management)
- ✅ Manajemen Kantor - CRUD kantor/pos satpam
- ✅ Manajemen Kategori - CRUD kategori aset dengan pengaturan role access
- ✅ Manajemen Aset - CRUD aset (kendaraan, kunci, perangkat, dll)
- ✅ Dashboard Lengkap - Statistik real-time semua kantor
- ✅ Laporan & Export - Download riwayat peminjaman dalam format CSV
- ✅ Full Access - Akses ke semua fitur dan data semua kantor

Role: Satpam (SECURITY_GUARD)
- ✅ Input Peminjaman - Catat peminjaman aset internal atau pihak ketiga
- ✅ Konfirmasi Pengembalian - Terima dan catat kondisi aset yang dikembalikan
- ✅ Tracking Real-time - Monitor status dan durasi peminjaman
- ✅ Dashboard Kantor - Statistik khusus untuk kantor masing-masing
- ✅ Riwayat Peminjaman - History peminjaman di kantor sendiri
- ✅ Akses Terbatas - Hanya dapat melihat data kantor yang ditugaskan

Role: Management (MANAGEMENT)
- ✅ Dashboard - Monitoring statistik peminjaman
- ✅ Riwayat Lengkap - Akses ke semua riwayat peminjaman
- ✅ Export Laporan - Download data semua kantor untuk analisis
- ✅ Input Peminjaman - Catat peminjaman aset internal atau pihak ketiga
- ✅ Konfirmasi Pengembalian - Terima dan catat kondisi aset yang dikembalikan
- ✅ Tracking Real-time - Monitor status dan durasi peminjaman

Fitur Sistem
- ✅ Multi-Asset Type: Kendaraan, Kunci Ruangan, Perangkat, dan Lainnya
- ✅ Multi-Office: Manajemen multi kantor/pos satpam
- ✅ Role-Based Access: Kontrol akses berdasarkan role dan kategori
- ✅ Real-time Dashboard: Statistik dan grafik interaktif
- ✅ Peminjaman Pihak Ketiga: Support peminjaman untuk pihak eksternal
- ✅ Export CSV/pdf: Download riwayat untuk laporan
- ✅ Responsive Design: Mobile-friendly interface

---

Instalasi dan Setup

Prasyarat
- Node.js v16.x atau lebih tinggi
- MySQL 8.0 atau lebih tinggi
- npm atau yarn package manager
- Git untuk version control

1️⃣ Clone Repository
bash
git clone https://github.com/ridhonur23/PA-Telkom.git
cd SistemInformasiTelkom


2️⃣ Setup Backend

bash
cd backend
npm install

3️⃣ Konfigurasi Database

1. Buat database MySQL:
sql
CREATE DATABASE telkom_loan_system;


2. Buat file .env di folder backend:**
bash
cp .env.example .env


3. Edit file .env dengan konfigurasi Anda
env
DATABASE_URL="mysql://username:password@localhost:3306/telkom_loan_system"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"


4️⃣ Migrasi Database dan Seeding

bash
Generate Prisma Client
npx prisma generate

Run database migration
npx prisma migrate dev

Seed initial data (kantor, kategori, user default)
npm run seed


Data yang di-seed
- 5 Kantor Telkom Bojonegoro
- 4 Kategori default (Kendaraan, Kunci Ruangan, Perangkat, Lainnya)
- 1 Admin dan 5 Satpam (masing-masing untuk tiap kantor)

5️⃣ Setup Frontend

bash
cd ../frontend
npm install


6️⃣ Menjalankan Aplikasi

Backend (Terminal 1):
bash
cd backend
npm run dev

✅ Backend berjalan di `http://localhost:5000`

Frontend (Terminal 2):
bash
cd frontend
npm start

✅ Frontend berjalan di `http://localhost:3000`

---

🔑 Data Login Default

Setelah menjalankan seeding, gunakan kredensial berikut untuk login:

Administrator
- Username `admin`
- Password `password123`
- Akses Full access ke semua fitur

👮 Satpam Kantor Pusat
- Username ``
- Password `- Password `password123`
- Akses salah satu Kantor satpam


👔 Management
- Username ``
- Password ``
- Akses akses satu level dibawah administartor


Struktur Database

Entity Relationship Diagram (ERD)

User (users)
├── id (PK)
├── nik (Unique) - NIK pegawai maksimal 10 digit
├── username (Unique)
├── password (Hashed)
├── fullName
├── role (ADMIN|SECURITY_GUARD|MANAGEMENT)
├── officeId (FK) - Nullable untuk admin
└── isActive

Office (offices)
├── id (PK)
├── name (Unique)
├── address
└── isActive

Category (categories)
├── id (PK)
├── name (Unique)
├── type (VEHICLE|ROOM_KEY|DEVICE|OTHER)
├── description
├── allowedRoles - String CSV (e.g., "ADMIN,SECURITY_GUARD")
└── isActive

Asset (assets)
├── id (PK)
├── name
├── code (Unique) - Plat nomor / kode aset
├── categoryId (FK)
├── officeId (FK)
├── description
├── isAvailable - Status ketersediaan
└── isActive

Loan (loans)
├── id (PK)
├── assetId (FK)
├── userId (FK)
├── loanDate - Tanggal/waktu peminjaman
├── returnDate - Target pengembalian
├── actualReturnDate - Waktu pengembalian aktual
├── purpose - Tujuan peminjaman
├── notes - Catatan tambahan
├── status (BORROWED|RETURNED|OVERDUE)
├── isThirdParty - Flag peminjam pihak ketiga
├── thirdPartyName - Nama peminjam eksternal
├── thirdPartyContact - Kontak peminjam eksternal
└── returnNotes - Catatan kondisi saat dikembalikan
\`\`\`

 Relasi Tabel:
- User → Office Many-to-One (Satpam assigned to office)
- Asset → Category Many-to-One
- Asset → Office Many-to-One
- Loan → Asset Many-to-One
- Loan → User Many-to-One (User yang mencatat peminjaman)

---

API Endpoints

Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/register` | Register user baru | Admin |
| GET | `/api/auth/me` | Get current user info | Authenticated |

Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/stats` | Get dashboard statistics | All roles |
| GET | `/api/dashboard/chart/loans` | Get loan chart data (7 days) | All roles |

Loans (Peminjaman)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/loans` | List peminjaman dengan filter | All roles |
| POST | `/api/loans` | Buat peminjaman baru | Admin, Satpam |
| GET | `/api/loans/:id` | Detail peminjaman | All roles |
| PATCH | `/api/loans/:id/return` | Kembalikan aset | Admin, Satpam |
| PATCH | `/api/loans/:id/overdue` | Tandai terlambat | All roles |
| DELETE | `/api/loans/:id` | Hapus peminjaman | Admin |
| GET | `/api/loans/export/csv` | Export data ke CSV | All roles |

Assets
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/assets` | List aset dengan filter | All roles |
| POST | `/api/assets` | Tambah aset baru | Admin |
| GET | `/api/assets/:id` | Detail aset | All roles |
| PUT | `/api/assets/:id` | Update aset | Admin |
| DELETE | `/api/assets/:id` | Hapus aset (hard delete) | Admin |

Categories
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/categories` | List kategori dengan filter | All roles |
| POST | `/api/categories` | Tambah kategori | Admin |
| GET | `/api/categories/:id` | Detail kategori | All roles |
| PUT | `/api/categories/:id` | Update kategori | Admin |
| DELETE | `/api/categories/:id` | Hapus kategori (hard delete) | Admin |

Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | List user dengan pagination | Admin |
| POST | `/api/users` | Tambah user baru | Admin |
| GET | `/api/users/:id` | Detail user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Hapus user (hard delete) | Admin |

Offices
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/offices` | List kantor | All roles |
| POST | `/api/offices` | Tambah kantor | Admin |
| GET | `/api/offices/:id` | Detail kantor | All roles |
| PUT | `/api/offices/:id` | Update kantor | Admin |
| DELETE | `/api/offices/:id` | Hapus kantor (hard delete) | Admin |

>Note Semua endpoint (kecuali `/login`) memerlukan JWT token dalam header `Authorization: Bearer <token>`

---

Fitur Unggulan

Multi-Asset Type Management
- Kendaraan (VEHICLE) - Mobil dinas dengan plat nomor
- Kunci Ruangan (ROOM_KEY) - Kunci akses ruangan
- Perangkat (DEVICE) - Laptop, proyektor, dll
- Lainnya (OTHER) - Aset tambahan sesuai kebutuhan

Multi-Office Support
- Manajemen 5+ kantor/pos satpam
- Satpam terbatas akses ke kantor masing-masing
- Admin dapat mengelola semua kantor
- Dashboard terpisah per kantor

Advanced Role-Based Access Control
- ADMIN: Full CRUD access ke semua fitur
- SECURITY_GUARD Transaksi peminjaman di kantor sendiri
- MANAGEMENT View-only untuk monitoring
- Category-level permissions Kontrol akses per kategori aset

Real-time Dashboard
- Statistik peminjaman hari ini
- Status ketersediaan aset real-time
- Chart peminjaman 7 hari terakhir
- Daftar peminjaman terbaru
- Summary per kategori aset

Smart Loan Tracking
- Status otomatis: BORROWED, RETURNED, OVERDUE
- Notifikasi visual untuk peminjaman terlambat
- History lengkap dengan timestamp

Third-Party Loan Support
- Catat peminjaman untuk pihak eksternal
- Input nama dan kontak peminjam
- Tracking terpisah untuk internal vs eksternal

Export & Reporting
- Export riwayat peminjaman ke CSV
- Filter berdasarkan tanggal, status, kantor, user
- Data lengkap untuk analisis dan audit

Modern UI/UX
- Responsive design (mobile, tablet, desktop)
- Bootstrap 5 components
- Toast notifications untuk feedback
- Loading states dan error handling
- Confirmation modals untuk aksi penting
- Icon-rich interface dengan Font Awesome

Security Features
- Password hashing dengan bcrypt
- JWT-based authentication
- Protected routes di frontend & backend
- Input validation dengan express-validator
- Hard delete untuk data permanen removal
- CORS configuration

---

## 🐛 Troubleshooting

### Database Connection Error
\`\`\`bash
# Pastikan MySQL berjalan
sudo systemctl start mysql

# Cek kredensial di .env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DB_NAME"
\`\`\`

### Port Already in Use
\`\`\`bash
# Ganti port di .env (backend)
PORT=5001

# Atau kill proses yang menggunakan port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill
\`\`\`

### Prisma Migration Issues
\`\`\`bash
# Reset database (HATI-HATI: akan hapus semua data!)
npx prisma migrate reset

# Atau push schema tanpa migration
npx prisma db push
\`\`\`

---

## 🔮 Future Development

- [ ] notifications bot chat whatsapp untuk peminjaman terlambat
- [ ] Penambahan foto saat peminjaman dan pengembalian aset
- [ ] QR Code untuk scan aset
- [ ] Mobile app (React Native)
- [ ] Advanced analytics & reporting
- [ ] Automatic backup system
- [ ] Multi-language support
- [ ] Dark mode theme

---

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

---

👨‍💻 Developer

Moch Ridho Nur Mahendra Putra  
Email: ridhonurmp@gmail.com  
GitHub: [@ridhonur23](https://github.com/ridhonur23)  
Project Repository: [PA-Telkom](https://github.com/ridhonur23/PA-Telkom)

---

**© 2025 Moch Ridho Nur Mahendra Putra. All Rights Reserved.**
