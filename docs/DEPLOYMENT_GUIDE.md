# L.A.W.S. Collective System - Self-Hosting Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the L.A.W.S. Collective System on your own infrastructure, ensuring complete independence from any third-party platform.

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 20 GB SSD | 100+ GB SSD |
| Node.js | 22.x | Latest LTS |
| MySQL | 8.0+ | 8.0+ or TiDB |

### Required Software

```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL (or use managed database)
sudo apt-get install mysql-server
```

## Step 1: Clone Repository

```bash
# From GitHub export
git clone https://github.com/YOUR_USERNAME/laws-collective-system.git
cd laws-collective-system

# Or extract from ZIP
unzip laws-collective-system.zip
cd laws-collective-system
```

## Step 2: Configure Environment

Create `.env` file in the project root:

```env
# ============================================
# REQUIRED - Database
# ============================================
DATABASE_URL=mysql://username:password@localhost:3306/laws_collective

# ============================================
# REQUIRED - Security
# ============================================
JWT_SECRET=your-secure-secret-key-minimum-32-characters-long

# ============================================
# OPTIONAL - Authentication
# ============================================
# If using Manus OAuth (leave blank for local auth)
OAUTH_SERVER_URL=
VITE_APP_ID=
VITE_OAUTH_PORTAL_URL=

# For local auth, generate your own JWT secret above

# ============================================
# OPTIONAL - File Storage (S3-compatible)
# ============================================
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
AWS_ENDPOINT=https://s3.amazonaws.com

# For local file storage, leave blank and files will be stored locally

# ============================================
# OPTIONAL - Stripe Payments
# ============================================
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# ============================================
# OPTIONAL - Email (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

## Step 3: Setup Database

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE laws_collective CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create user (optional)
mysql -u root -p -e "CREATE USER 'laws_user'@'localhost' IDENTIFIED BY 'secure_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON laws_collective.* TO 'laws_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

## Step 4: Install Dependencies

```bash
pnpm install
```

## Step 5: Run Database Migrations

```bash
pnpm db:push
```

## Step 6: Build for Production

```bash
pnpm build
```

## Step 7: Start Server

### Development Mode
```bash
pnpm dev
```

### Production Mode
```bash
# Direct
node dist/index.js

# With PM2 (recommended)
npm install -g pm2
pm2 start dist/index.js --name laws-collective
pm2 save
pm2 startup
```

## Deployment Options

### Option A: VPS (DigitalOcean, Linode, Vultr)

```bash
# 1. Create droplet/instance (Ubuntu 22.04)
# 2. SSH into server
ssh root@your-server-ip

# 3. Setup user
adduser laws
usermod -aG sudo laws
su - laws

# 4. Install dependencies
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx

# 5. Clone and setup project
git clone https://github.com/YOUR_USERNAME/laws-collective-system.git
cd laws-collective-system
pnpm install
pnpm build

# 6. Configure nginx
sudo nano /etc/nginx/sites-available/laws-collective
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 7. Enable site and SSL
sudo ln -s /etc/nginx/sites-available/laws-collective /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com

# 8. Start with PM2
pm2 start dist/index.js --name laws-collective
pm2 save
pm2 startup
```

### Option B: Railway

1. Push code to GitHub
2. Connect Railway to GitHub repo
3. Add environment variables in Railway dashboard
4. Deploy automatically

### Option C: Docker

Create `Dockerfile`:
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://laws_user:password@db:3306/laws_collective
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=laws_collective
      - MYSQL_USER=laws_user
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

```bash
docker-compose up -d
```

## Replacing Manus OAuth

If deploying without Manus OAuth, implement local authentication:

1. **Create local auth routes** in `server/routers/local-auth.ts`:

```typescript
import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const localAuthRouter = router({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      // Insert user into database
      // Return success
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Find user by email
      // Verify password with bcrypt
      // Generate JWT token
      // Set cookie
    })
});
```

2. **Add password field to users table** in `drizzle/schema.ts`:

```typescript
export const users = mysqlTable('users', {
  // ... existing fields
  passwordHash: varchar('password_hash', { length: 255 }),
});
```

3. **Update login page** to use local auth form instead of OAuth redirect.

## Backup Configuration

### Automated Database Backup

Create `scripts/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/var/backups/laws-collective
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Optional: Upload to S3
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-backup-bucket/
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## Monitoring

### Health Check Endpoint

The system includes `/api/health` endpoint. Monitor with:

```bash
# Simple check
curl https://yourdomain.com/api/health

# With uptime monitoring (UptimeRobot, Pingdom, etc.)
# Add URL: https://yourdomain.com/api/health
```

### Log Management

```bash
# View PM2 logs
pm2 logs laws-collective

# Setup log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Security Checklist

- [ ] SSL/TLS certificate installed
- [ ] Firewall configured (only ports 80, 443, 22)
- [ ] Database not exposed to internet
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Regular backups configured
- [ ] Monitoring enabled
- [ ] Rate limiting enabled
- [ ] CORS configured for your domain only

## Troubleshooting

### Database Connection Failed
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u laws_user -p -h localhost laws_collective
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm build
```

## Support

For self-hosted deployments, refer to:
- This documentation
- GitHub Issues on your repository
- Community forums

---

*Last Updated: January 2026*
