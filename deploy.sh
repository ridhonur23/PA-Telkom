# Deploy Script untuk VPS
# Jalankan dengan: bash deploy.sh

#!/bin/bash

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Pull latest changes
print_info "Pulling latest changes from Git..."
git pull origin main

if [ $? -ne 0 ]; then
    print_error "Failed to pull latest changes"
    exit 1
fi

# Backend deployment
print_info "Deploying backend..."
cd backend

# Install dependencies
print_info "Installing backend dependencies..."
npm install --production

# Run database migrations
print_info "Running database migrations..."
npx prisma generate
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    print_error "Database migration failed"
    exit 1
fi

# Restart backend with PM2
print_info "Restarting backend service..."
pm2 restart telkom-backend

if [ $? -ne 0 ]; then
    print_warning "PM2 restart failed, trying to start..."
    pm2 start server.js --name telkom-backend
fi

cd ..

# Frontend deployment
print_info "Deploying frontend..."
cd frontend

# Install dependencies
print_info "Installing frontend dependencies..."
npm install

# Build frontend
print_info "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi

cd ..

# Restart Nginx
print_info "Restarting Nginx..."
sudo systemctl restart nginx

if [ $? -ne 0 ]; then
    print_error "Failed to restart Nginx"
    exit 1
fi

# Check PM2 status
print_info "Checking application status..."
pm2 status

print_info "✅ Deployment completed successfully!"
print_info "Backend: Check with 'pm2 logs telkom-backend'"
print_info "Frontend: Deployed to /var/www/PA-Telkom/frontend/build"
