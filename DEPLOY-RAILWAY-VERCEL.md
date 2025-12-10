# 🚀 Panduan Deploy: Railway (Backend) + Vercel (Frontend)

## 📌 Overview

Kombinasi Railway + Vercel adalah solusi **GRATIS** terbaik untuk deploy full-stack aplikasi:
- **Railway**: Backend Node.js + MySQL Database (Free $5/month credit = ~500 jam)
- **Vercel**: Frontend React (Free unlimited)

---

## 🎯 BAGIAN 1: Deploy Backend ke Railway

### Prasyarat
- Akun GitHub (untuk connect repo)
- Akun Railway.app (daftar gratis di https://railway.app)
- Railway CLI (optional, bisa via dashboard)

### Opsi A: Deploy via Railway Dashboard (Termudah)

#### 1. Setup Railway Project

1. **Login ke Railway**
   - Buka https://railway.app
   - Login dengan GitHub

2. **Create New Project**
   - Klik "New Project"
   - Pilih "Deploy from GitHub repo"
   - Authorize Railway untuk akses repo
   - Pilih repository `PA-Telkom`
   - Pilih branch `main`

3. **Add MySQL Database**
   - Di project dashboard, klik "New"
   - Pilih "Database" → "MySQL"
   - Database akan otomatis ter-provision

#### 2. Configure Backend Service

1. **Set Root Directory**
   - Klik service backend Anda
   - Tab "Settings"
   - Scroll ke "Root Directory"
   - Set: `backend`
   - Save changes

2. **Add Environment Variables**
   - Tab "Variables"
   - Klik "New Variable"
   - Tambahkan satu per satu:

```env
JWT_SECRET=gunakan-string-random-minimal-32-karakter-untuk-security
JWT_EXPIRES_IN=24h
NODE_ENV=production
PORT=5000
```

   - `DATABASE_URL` sudah otomatis tersedia dari MySQL service!
   - `FRONTEND_URL` akan diset setelah deploy Vercel (step nanti)

3. **Deploy!**
   - Railway akan otomatis build dan deploy
   - Tunggu hingga status "Success"
   - Copy URL backend Anda (contoh: `https://telkom-backend-production.up.railway.app`)

#### 3. Run Database Migrations

Di Railway Dashboard:
1. Klik backend service
2. Tab "Deployments"
3. Klik deployment terbaru
4. Klik "View Logs"
5. Jika muncul error Prisma, run manual:

**Via Railway CLI:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed data
railway run npm run seed
```

**ATAU via Dashboard:**
1. Tab "Settings"
2. Scroll ke "Deploy Triggers"
3. Enable "Run migrations on deploy"
4. Redeploy

---

### Opsi B: Deploy via Railway CLI (Advanced)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Masuk ke folder backend
cd backend

# 4. Initialize Railway project
railway init

# Jawab pertanyaan:
# - Project name: telkom-backend
# - Start from scratch? No (pilih existing service jika ada)

# 5. Add MySQL database
railway add

# Pilih: MySQL
# Database akan otomatis ditambahkan ke project

# 6. Link service
railway link

# 7. Set environment variables
railway variables set JWT_SECRET="your-super-secret-key-min-32-chars"
railway variables set NODE_ENV="production"
railway variables set JWT_EXPIRES_IN="24h"

# 8. Deploy
railway up

# 9. Run migrations
railway run npx prisma migrate deploy

# 10. Seed database
railway run npm run seed

# 11. Get backend URL
railway open
```

---

## 🎯 BAGIAN 2: Deploy Frontend ke Vercel

### Prasyarat
- Akun Vercel (daftar gratis di https://vercel.com)
- Vercel CLI (optional)

### Opsi A: Deploy via Vercel Dashboard (Termudah)

#### 1. Import Project

1. **Login ke Vercel**
   - Buka https://vercel.com
   - Login dengan GitHub

2. **Import Repository**
   - Klik "Add New..." → "Project"
   - Pilih repository `PA-Telkom`
   - Klik "Import"

3. **Configure Project**
   - **Framework Preset**: Create React App (auto-detect)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `build` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables**
   Klik "Environment Variables", tambahkan:
   
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://telkom-backend-production.up.railway.app/api`
     *(Ganti dengan URL Railway Anda!)*
   - Apply to: **Production, Preview, Development**

5. **Deploy!**
   - Klik "Deploy"
   - Tunggu proses build (~2-3 menit)
   - Setelah selesai, copy URL Vercel Anda (contoh: `https://telkom-app.vercel.app`)

---

### Opsi B: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Masuk ke folder frontend
cd frontend

# 4. Deploy (pertama kali)
vercel

# Jawab pertanyaan:
# - Set up and deploy? Y
# - Which scope? [pilih account Anda]
# - Link to existing project? N
# - Project name? telkom-loan-system
# - In which directory is your code? ./
# - Override settings? N

# 5. Set environment variable
vercel env add REACT_APP_API_URL

# Input value: https://telkom-backend-production.up.railway.app/api
# Select environments: Production, Preview, Development

# 6. Deploy production
vercel --prod
```

---

## 🔄 BAGIAN 3: Connect Backend & Frontend

### Update Railway Backend

Setelah dapat URL Vercel, update environment variable di Railway:

**Via Dashboard:**
1. Buka Railway project
2. Klik backend service
3. Tab "Variables"
4. Edit atau tambah `FRONTEND_URL`
5. Value: `https://telkom-app.vercel.app` (URL Vercel Anda)
6. Redeploy backend

**Via CLI:**
```bash
cd backend
railway variables set FRONTEND_URL="https://telkom-app.vercel.app"
```

### Update Vercel Frontend (jika perlu)

Jika URL Railway berubah:

**Via Dashboard:**
1. Buka Vercel project
2. Settings → Environment Variables
3. Edit `REACT_APP_API_URL`
4. Redeploy

**Via CLI:**
```bash
cd frontend
vercel env rm REACT_APP_API_URL production
vercel env add REACT_APP_API_URL
# Input URL Railway yang baru
vercel --prod
```

---

## ✅ BAGIAN 4: Testing Deployment

### 1. Test Backend (Railway)

```bash
# Health check
curl https://telkom-backend-production.up.railway.app/api/health

# Expected response:
{
  "status": "OK",
  "message": "Telkom Bojonegoro Loan Management System API",
  "timestamp": "2025-12-10T..."
}
```

### 2. Test Frontend (Vercel)

1. Buka URL Vercel di browser: `https://telkom-app.vercel.app`
2. Coba login dengan kredensial default:
   - Username: `admin`
   - Password: `password123`
3. Test semua fitur utama:
   - Dashboard
   - CRUD Aset
   - Input Peminjaman
   - Upload foto

### 3. Test Koneksi Backend-Frontend

Buka browser console (F12) saat login:
- ✅ Harus muncul response dari Railway backend
- ❌ Jika ada CORS error, cek `FRONTEND_URL` di Railway
- ❌ Jika "Network Error", cek `REACT_APP_API_URL` di Vercel

---

## 🔧 Troubleshooting

### ❌ Railway: Build Failed

**Error: Prisma migration failed**
```bash
# Solusi: Run manual migration
railway run npx prisma migrate deploy
railway run npx prisma generate
```

**Error: Port already in use**
```
# server.js sudah benar menggunakan process.env.PORT
# Railway otomatis set PORT variable, jangan override!
```

**Error: MySQL connection refused**
```bash
# Cek DATABASE_URL sudah tersedia
railway variables

# Jika kosong, reconnect MySQL:
railway link
```

---

### ❌ Vercel: Build Failed

**Error: Module not found**
```bash
# Solusi: Pastikan semua dependencies di package.json
cd frontend
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: Environment variable not defined**
```
# Solusi: Set via Vercel dashboard
Settings → Environment Variables → Add
Name: REACT_APP_API_URL
Value: https://your-railway-backend.up.railway.app/api
```

---

### ❌ CORS Error di Browser

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solusi:**
1. Pastikan `FRONTEND_URL` di Railway benar
2. Cek `backend/server.js` → CORS config:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

3. Redeploy Railway backend setelah update

---

### ❌ Upload Foto Tidak Jalan

Railway menggunakan **ephemeral filesystem** (reset tiap deploy).

**Solusi: Gunakan Cloud Storage**

Opsi gratis:
1. **Cloudinary** (10GB gratis)
2. **AWS S3** (5GB gratis 12 bulan)
3. **Supabase Storage** (1GB gratis)

Implementasi nanti jika diperlukan.

---

## 💰 Biaya & Limit

### Railway Free Tier
- ✅ $5 credit/bulan (~500 jam runtime)
- ✅ MySQL database included
- ✅ Auto-sleep jika tidak digunakan (save credit)
- ❌ Max 500MB RAM
- ❌ Shared CPU

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ Unlimited bandwidth
- ✅ 100GB/month bandwidth
- ✅ SSL gratis
- ✅ Global CDN

**Total: GRATIS selamanya!** 🎉

---

## 🔄 Auto-Deploy (CI/CD)

### Railway
Sudah otomatis! Setiap push ke GitHub branch main:
1. Railway detect changes di `/backend`
2. Auto build & deploy
3. Run migrations (jika diconfig)

### Vercel
Sudah otomatis! Setiap push ke GitHub:
1. Vercel detect changes di `/frontend`
2. Auto build & deploy
3. Generate preview URL untuk setiap PR

**Workflow:**
```bash
# Edit code
git add .
git commit -m "Update feature"
git push origin main

# Railway & Vercel otomatis deploy! 🚀
```

---

## 📝 Checklist Deployment

### Persiapan
- [ ] Push semua changes ke GitHub
- [ ] Update `.env.example` dengan template lengkap
- [ ] Test lokal terlebih dahulu

### Railway Setup
- [ ] Create account & login
- [ ] Import GitHub repo
- [ ] Add MySQL database
- [ ] Set root directory: `backend`
- [ ] Add environment variables
- [ ] Deploy success
- [ ] Run migrations: `railway run npx prisma migrate deploy`
- [ ] Seed database: `railway run npm run seed`
- [ ] Copy backend URL

### Vercel Setup
- [ ] Create account & login
- [ ] Import GitHub repo
- [ ] Set root directory: `frontend`
- [ ] Add `REACT_APP_API_URL` variable
- [ ] Deploy success
- [ ] Copy frontend URL

### Final Configuration
- [ ] Update `FRONTEND_URL` di Railway
- [ ] Test login di production
- [ ] Test CRUD operations
- [ ] Test upload foto
- [ ] Ubah password admin default

---

## 🎓 Tips Production

1. **Keamanan**
   - Ubah password admin setelah deploy
   - Generate JWT_SECRET yang kuat: `openssl rand -base64 32`
   - Jangan commit file `.env`

2. **Monitoring**
   - Railway: Tab "Observability" untuk logs
   - Vercel: Tab "Analytics" untuk traffic
   - Setup uptime monitoring (UptimeRobot gratis)

3. **Database Backup**
   ```bash
   # Download backup dari Railway
   railway run mysqldump -u root telkom_loan_system > backup.sql
   ```

4. **Custom Domain (Optional)**
   - Railway: Settings → Domains → Add custom domain
   - Vercel: Settings → Domains → Add domain
   - Update DNS records sesuai instruksi

---

## 📞 Support

Jika mengalami error:

1. **Cek Logs**
   - Railway: Tab "Deployments" → klik latest → "View Logs"
   - Vercel: Tab "Deployments" → klik latest → "View Function Logs"

2. **Environment Variables**
   - Railway: Tab "Variables"
   - Vercel: Settings → "Environment Variables"

3. **Database Connection**
   ```bash
   railway run npx prisma studio
   ```

4. **Redeploy**
   - Railway: Tab "Deployments" → "Redeploy"
   - Vercel: Tab "Deployments" → "Redeploy"

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Prisma Railway Guide: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway

---

**Selamat! Aplikasi Anda sudah live di internet! 🚀**

URL Anda:
- Frontend: `https://[project-name].vercel.app`
- Backend API: `https://[project-name].up.railway.app/api`
