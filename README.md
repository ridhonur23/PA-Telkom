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
- Multer** - File upload middleware untuk foto peminjaman/pengembalian
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
- ✅ Manajemen Aset - CRUD aset sama seperti Admin

Fitur Sistem
- ✅ Multi-Asset Type: Kendaraan, Kunci Ruangan, Perangkat, dan Lainnya
- ✅ Multi-Office: Manajemen multi kantor/pos satpam
- ✅ Role-Based Access: Kontrol akses berdasarkan role dan kategori
- ✅ Real-time Dashboard: Statistik dan grafik interaktif
- ✅ Peminjaman Pihak Ketiga: Support peminjaman untuk pihak eksternal
- ✅ Upload Foto: Upload foto saat peminjaman dan pengembalian aset
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
├── loanPhoto - Foto aset saat peminjaman
└── returnPhoto - Foto aset saat pengembalian
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
| POST | `/api/loans` | Buat peminjaman baru (+ upload foto) | Admin, Satpam, Management |
| GET | `/api/loans/:id` | Detail peminjaman | All roles |
| PATCH | `/api/loans/:id/return` | Kembalikan aset (+ upload foto) | Admin, Satpam, Management |
| PATCH | `/api/loans/:id/overdue` | Tandai terlambat | All roles |
| DELETE | `/api/loans/:id` | Hapus peminjaman | Admin |
| GET | `/api/loans/export/csv` | Export data ke CSV | All roles |

Assets
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/assets` | List aset dengan filter | All roles |
| POST | `/api/assets` | Tambah aset baru | Admin, Management |
| GET | `/api/assets/:id` | Detail aset | All roles |
| PUT | `/api/assets/:id` | Update aset | Admin, Management |
| DELETE | `/api/assets/:id` | Hapus aset (hard delete) | Admin, Management |

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

Photo Documentation
- Upload foto aset saat peminjaman (kondisi awal)
- Upload foto aset saat pengembalian (kondisi akhir)
- Preview foto sebelum upload
- Validasi tipe file (JPEG, PNG, GIF) dan ukuran (max 5MB)
- Penyimpanan terorganisir di folder /uploads/loans/
- Tampilan foto di modal detail peminjaman

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

## 🔮 Future Development

- [ ] notifications bot chat whatsapp untuk peminjaman terlambat
- [x] ~~Penambahan foto saat peminjaman dan pengembalian aset~~ ✅ **Done**
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

## 🚀 Deployment Guide

### Opsi 1: Deploy ke VPS/Cloud Server (Ubuntu/Debian)

#### 1️⃣ Persiapan Server
\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PM2 untuk process management
sudo npm install -g pm2

# Install Nginx untuk reverse proxy
sudo apt install nginx -y
\`\`\`

#### 2️⃣ Setup Database
\`\`\`bash
# Login ke MySQL
sudo mysql

# Buat database dan user
CREATE DATABASE telkom_loan_system;
CREATE USER 'telkom_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON telkom_loan_system.* TO 'telkom_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
\`\`\`

#### 3️⃣ Clone & Setup Aplikasi
\`\`\`bash
# Clone repository
cd /var/www
sudo git clone https://github.com/ridhonur23/PA-Telkom.git
cd PA-Telkom

# Setup Backend
cd backend
npm install --production
cp .env.example .env
nano .env  # Edit dengan konfigurasi production
\`\`\`

**Edit .env untuk production:**
\`\`\`env
DATABASE_URL="mysql://telkom_user:strong_password_here@localhost:3306/telkom_loan_system"
JWT_SECRET="generate-random-secret-key-here-min-32-chars"
JWT_EXPIRES_IN="24h"
PORT=5000
NODE_ENV=production
FRONTEND_URL="https://yourdomain.com"
\`\`\`

\`\`\`bash
# Run migrations
npx prisma generate
npx prisma migrate deploy
npm run seed

# Build frontend
cd ../frontend
npm install
npm run build
\`\`\`

#### 4️⃣ Setup PM2
\`\`\`bash
# Start backend dengan PM2
cd /var/www/PA-Telkom/backend
pm2 start server.js --name telkom-backend

# Save PM2 configuration
pm2 save
pm2 startup
\`\`\`

#### 5️⃣ Configure Nginx
\`\`\`bash
sudo nano /etc/nginx/sites-available/telkom
\`\`\`

**Nginx Configuration:**
\`\`\`nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /var/www/PA-Telkom/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

\`\`\`bash
# Enable site & restart Nginx
sudo ln -s /etc/nginx/sites-available/telkom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

#### 6️⃣ Setup SSL dengan Certbot (HTTPS)
\`\`\`bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
\`\`\`

---

### Opsi 2: Deploy Backend ke Railway.app

#### 1️⃣ Setup Railway
1. Buat akun di [Railway.app](https://railway.app)
2. Install Railway CLI:
\`\`\`bash
npm install -g @railway/cli
railway login
\`\`\`

#### 2️⃣ Deploy Backend
\`\`\`bash
cd backend

# Initialize Railway project
railway init

# Add MySQL database
railway add mysql

# Set environment variables
railway variables set JWT_SECRET="your-secret-key"
railway variables set NODE_ENV="production"

# Deploy
railway up
\`\`\`

#### 3️⃣ Run Migrations
\`\`\`bash
railway run npx prisma migrate deploy
railway run npm run seed
\`\`\`

---

### Opsi 3: Deploy Frontend ke Vercel

#### 1️⃣ Install Vercel CLI
\`\`\`bash
npm install -g vercel
\`\`\`

#### 2️⃣ Deploy
\`\`\`bash
cd frontend

# Login ke Vercel
vercel login

# Deploy
vercel --prod
\`\`\`

#### 3️⃣ Configure Environment
Di Vercel Dashboard:
- Settings → Environment Variables
- Add: \`REACT_APP_API_URL=https://your-backend-url.com/api\`

---

### Opsi 4: Deploy dengan Docker

#### 1️⃣ Buat Dockerfile untuk Backend
**backend/Dockerfile:**
\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
\`\`\`

#### 2️⃣ Buat Dockerfile untuk Frontend
**frontend/Dockerfile:**
\`\`\`dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
\`\`\`

#### 3️⃣ Docker Compose
**docker-compose.yml:**
\`\`\`yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: telkom_loan_system
      MYSQL_USER: telkom_user
      MYSQL_PASSWORD: telkom_pass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: mysql://telkom_user:telkom_pass@mysql:3306/telkom_loan_system
      JWT_SECRET: your-secret-key-here
      NODE_ENV: production
    depends_on:
      - mysql
    command: sh -c "npx prisma migrate deploy && npm start"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
\`\`\`

#### 4️⃣ Run dengan Docker Compose
\`\`\`bash
docker-compose up -d
\`\`\`

---

### Opsi 5: Deploy ke Heroku

#### 1️⃣ Install Heroku CLI
\`\`\`bash
# Download dari https://devcenter.heroku.com/articles/heroku-cli
heroku login
\`\`\`

#### 2️⃣ Deploy Backend
\`\`\`bash
cd backend

# Create Heroku app
heroku create telkom-backend

# Add MySQL addon (ClearDB)
heroku addons:create cleardb:ignite

# Get database URL
heroku config:get CLEARDB_DATABASE_URL

# Set environment variables
heroku config:set JWT_SECRET="your-secret-key"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
heroku run npm run seed
\`\`\`

---

## 🔧 Post-Deployment Checklist

### Security
- [ ] Ubah semua password default
- [ ] Generate JWT secret yang kuat (min 32 karakter random)
- [ ] Setup firewall (UFW/iptables)
- [ ] Enable HTTPS/SSL
- [ ] Disable MySQL remote access (jika tidak perlu)
- [ ] Setup rate limiting di Nginx/backend

### Database
- [ ] Setup backup otomatis
- [ ] Configure database timezone
- [ ] Optimize MySQL settings untuk production
- [ ] Monitor disk space

### Monitoring
- [ ] Setup PM2 monitoring: \`pm2 monitor\`
- [ ] Configure log rotation
- [ ] Setup uptime monitoring (UptimeRobot, etc)
- [ ] Configure error tracking (Sentry, etc)

### Performance
- [ ] Enable Nginx gzip compression
- [ ] Setup CDN untuk static assets (optional)
- [ ] Configure database connection pooling
- [ ] Enable Redis caching (optional)

---

## 📊 Monitoring & Maintenance

### PM2 Commands
\`\`\`bash
pm2 status              # Check app status
pm2 logs telkom-backend # View logs
pm2 restart telkom-backend # Restart app
pm2 stop telkom-backend    # Stop app
pm2 delete telkom-backend  # Remove app from PM2
\`\`\`

### Database Backup
\`\`\`bash
# Manual backup
mysqldump -u telkom_user -p telkom_loan_system > backup_$(date +%Y%m%d).sql

# Automated daily backup (crontab)
0 2 * * * mysqldump -u telkom_user -p'password' telkom_loan_system > /backups/backup_$(date +\%Y\%m\%d).sql
\`\`\`

### Update Application
\`\`\`bash
cd /var/www/PA-Telkom

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install
npx prisma migrate deploy
pm2 restart telkom-backend

# Update frontend
cd ../frontend
npm install
npm run build
\`\`\`

---

## 🌐 Domain & DNS Setup

### Cloudflare Setup (Recommended)
1. Add your domain to Cloudflare
2. Update nameservers di domain registrar
3. Add DNS records:
   - Type: A, Name: @, Content: YOUR_SERVER_IP
   - Type: A, Name: www, Content: YOUR_SERVER_IP
4. Enable SSL/TLS (Full mode)
5. Enable "Always Use HTTPS"

### Alternative: Direct DNS
Update DNS records di domain provider:
\`\`\`
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_SERVER_IP
TTL: 3600
\`\`\`

---

## 💡 Production Tips

1. **Environment Variables**: Jangan commit file .env ke Git
2. **Secrets**: Gunakan environment variable untuk semua credential
3. **Logging**: Setup proper logging dengan Winston/Morgan
4. **Error Handling**: Implement global error handler
5. **Rate Limiting**: Protect API dari abuse
6. **CORS**: Configure CORS dengan whitelist domain production
7. **Database**: Regular backup dan testing restore process
8. **Monitoring**: Setup alerts untuk downtime/errors
9. **Documentation**: Update API documentation
10. **Testing**: Test di staging environment sebelum production

---

## 👨‍💻 Developer

**Moch Ridho Nur Mahendra Putra**  
📧 Email: ridhonurmp@gmail.com  
🔗 GitHub: [@ridhonur23](https://github.com/ridhonur23)  
🌐 Project Repository: [PA-Telkom](https://github.com/ridhonur23/PA-Telkom)

---

## 🙏 Acknowledgments

- PT Telkom Indonesia - Witel Bojonegoro
- Dosen Pembimbing Proyek Akhir
- React & Node.js Community
- Prisma Documentation
- Bootstrap Team

---

**© 2025 Moch Ridho Nur Mahendra Putra. All Rights Reserved.**
