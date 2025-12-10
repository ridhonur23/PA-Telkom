# Deployment Guide - Quick Reference
# Panduan Deployment Cepat untuk Sistem Informasi Telkom

## 🎯 Pilihan Deployment

### 1. VPS/Cloud Server (Recommended for Full Control)
**Cocok untuk**: Production environment dengan kontrol penuh
**Estimasi Biaya**: $5-20/bulan (Digital Ocean, Vultr, AWS Lightsail)

**Langkah Cepat:**
```bash
# 1. Setup server & install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs mysql-server nginx
sudo npm install -g pm2

# 2. Clone & setup
cd /var/www
sudo git clone <your-repo>
cd PA-Telkom

# 3. Setup backend
cd backend
cp .env.example .env
nano .env  # Edit konfigurasi
npm install --production
npx prisma migrate deploy
pm2 start server.js --name telkom-backend

# 4. Build frontend
cd ../frontend
npm install
npm run build

# 5. Configure Nginx (lihat nginx.conf)
sudo nano /etc/nginx/sites-available/telkom
sudo ln -s /etc/nginx/sites-available/telkom /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# 6. Setup SSL
sudo certbot --nginx -d yourdomain.com
```

---

### 2. Docker (Easiest for Development/Testing)
**Cocok untuk**: Quick deployment, development, testing
**Estimasi Waktu**: 5-10 menit

**Langkah Cepat:**
```bash
# 1. Install Docker & Docker Compose
# https://docs.docker.com/engine/install/

# 2. Clone project
git clone <your-repo>
cd PA-Telkom

# 3. Setup environment
cp .env.example .env
nano .env  # Edit konfigurasi

# 4. Run!
docker-compose up -d

# 5. Run migrations & seed
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run seed
```

Aplikasi berjalan di:
- Frontend: http://localhost
- Backend: http://localhost:5000

---

### 3. Railway.app (Backend) + Vercel (Frontend)
**Cocok untuk**: Quick demo, prototype, free hosting
**Estimasi Biaya**: Free (dengan limit)

**Backend di Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login & deploy
cd backend
railway login
railway init
railway add mysql
railway up

# Set environment variables di Railway dashboard
# Run migrations
railway run npx prisma migrate deploy
```

**Frontend di Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel login
vercel --prod

# Set environment variable:
# REACT_APP_API_URL=https://your-railway-backend.up.railway.app/api
```

---

### 4. Heroku (All-in-One)
**Cocok untuk**: Simple deployment, tidak perlu konfigurasi server
**Estimasi Biaya**: ~$7/bulan (Hobby dyno)

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Backend
cd backend
heroku login
heroku create telkom-backend
heroku addons:create cleardb:ignite
heroku config:set JWT_SECRET="your-secret"
git push heroku main
heroku run npx prisma migrate deploy

# Frontend
cd ../frontend
heroku create telkom-frontend
heroku buildpacks:set heroku/nodejs
heroku config:set REACT_APP_API_URL=https://telkom-backend.herokuapp.com/api
git push heroku main
```

---

## 🔑 Environment Variables Penting

### Backend (.env)
```env
DATABASE_URL="mysql://user:pass@host:3306/db"
JWT_SECRET="min-32-karakter-random-string"
JWT_EXPIRES_IN="24h"
PORT=5000
NODE_ENV="production"
FRONTEND_URL="https://yourdomain.com"
```

### Frontend (.env)
```env
REACT_APP_API_URL="https://api.yourdomain.com/api"
```

---

## ✅ Post-Deployment Checklist

1. **Security**
   - [ ] Ubah semua password default
   - [ ] Setup SSL/HTTPS
   - [ ] Configure firewall
   - [ ] Enable CORS dengan whitelist

2. **Database**
   - [ ] Run migrations: `npx prisma migrate deploy`
   - [ ] Seed initial data: `npm run seed`
   - [ ] Setup backup otomatis
   - [ ] Ubah password admin default

3. **Monitoring**
   - [ ] Setup PM2 monitoring (jika pakai VPS)
   - [ ] Configure logging
   - [ ] Test all endpoints
   - [ ] Setup uptime monitoring

4. **Testing**
   - [ ] Test login dengan semua role
   - [ ] Test CRUD operations
   - [ ] Test file upload (jika ada)
   - [ ] Test di berbagai browser

---

## 🚨 Troubleshooting

### Database Connection Error
```bash
# Cek MySQL running
sudo systemctl status mysql

# Test connection
mysql -u username -p -h localhost database_name
```

### PM2 Not Starting
```bash
# Check logs
pm2 logs telkom-backend

# Restart with fresh config
pm2 delete telkom-backend
pm2 start server.js --name telkom-backend
pm2 save
```

### Nginx 502 Bad Gateway
```bash
# Check backend running
pm2 status

# Check Nginx config
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### Prisma Migration Failed
```bash
# Reset & re-migrate (HATI-HATI: Hapus semua data!)
npx prisma migrate reset

# Or push schema without migration
npx prisma db push
```

---

## 📞 Support

Jika mengalami masalah:
1. Check logs: `pm2 logs` atau `docker-compose logs`
2. Verify environment variables
3. Check database connection
4. Review Nginx/Apache config
5. Contact: ridhonurmp@gmail.com

---

## 🎓 Rekomendasi untuk Produksi

**Minimum Specs VPS:**
- CPU: 2 vCPU
- RAM: 2GB
- Storage: 20GB SSD
- Bandwidth: 2TB

**Recommended Hosting:**
1. **VPS**: Digital Ocean ($12/mo), Vultr ($6/mo), AWS Lightsail ($10/mo)
2. **Database**: Managed MySQL (Railway, PlanetScale) - $0-5/mo
3. **Frontend**: Vercel, Netlify (Free tier cukup)
4. **Domain**: Namecheap, Cloudflare ($8-12/year)
5. **SSL**: Let's Encrypt (Free) atau Cloudflare

**Total Estimasi Biaya Production:**
- Budget: $0-5/month (Railway + Vercel)
- Standard: $10-15/month (VPS + Domain)
- Professional: $20-30/month (VPS + Managed DB + CDN)
