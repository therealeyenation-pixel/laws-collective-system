# L.A.W.S. Collective System

## Quick Start (Read This First)

This is a web application for the L.A.W.S. Collective multi-generational wealth building platform. It runs on a web server and users access it through a browser.

### What's Included

```
├── README.md          ← You are here
├── docs/              ← Detailed documentation
│   ├── DEPLOYMENT_GUIDE.md   ← Step-by-step setup instructions
│   ├── SYSTEM_DOCUMENTATION.md
│   ├── API_REFERENCE.md
│   └── BACKUP_PRESETS.md
├── client/            ← Frontend (React)
├── server/            ← Backend (Express + tRPC)
├── drizzle/           ← Database schema
└── shared/            ← Shared code
```

### To Run This System

**Option 1: Easiest (Railway - Free Tier)**
1. Create account at railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Connect this repository
4. Add environment variables (see below)
5. Done - Railway gives you a URL

**Option 2: Any Computer with Node.js**
```bash
# 1. Install Node.js 22 from nodejs.org

# 2. Open terminal in this folder

# 3. Install dependencies
npm install -g pnpm
pnpm install

# 4. Create .env file with:
DATABASE_URL=mysql://user:pass@host:3306/database
JWT_SECRET=any-random-string-at-least-32-characters

# 5. Setup database
pnpm db:push

# 6. Start
pnpm dev

# 7. Open browser to http://localhost:3000
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | MySQL connection string | mysql://user:pass@localhost:3306/laws |
| JWT_SECRET | Session security key | random-32-character-string |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| STRIPE_SECRET_KEY | For payment processing |
| AWS_ACCESS_KEY_ID | For file storage |
| SMTP_HOST | For email notifications |

### Need a Database?

**Free options:**
- PlanetScale (free tier) - planetscale.com
- TiDB Cloud (free tier) - tidbcloud.com
- Railway MySQL (free tier) - railway.app

### Detailed Instructions

See `docs/DEPLOYMENT_GUIDE.md` for complete step-by-step instructions including:
- VPS setup (DigitalOcean, Linode)
- Docker deployment
- SSL/HTTPS configuration
- Backup setup

### System Features

- Document Vault & E-Signatures
- Workflow Automation
- Grant Management
- Financial Tracking
- HR Management
- Board Governance
- Academy & Training
- And 300+ more pages

### Support

This system is self-contained. All documentation is in the `docs/` folder.

---

*L.A.W.S. Collective - Land, Air, Water, Self*
*Building Multi-Generational Wealth Through Purpose & Community*
