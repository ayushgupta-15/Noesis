# Deployment Guide

## Overview

This is a full-stack application with:
- **Frontend**: Next.js (can deploy on Vercel)
- **Backend**: FastAPI + Databases (needs separate deployment)

## Option 1: Frontend Only on Vercel (Quick)

If you want to deploy just the frontend on Vercel and run backend locally:

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Update to v2.0 with FastAPI backend"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Import Project"
3. Select your GitHub repo: `ayushgupta-15/Noesis`
4. Vercel will auto-detect Next.js
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `http://localhost:8000` (for local backend)
6. Click "Deploy"

### Step 3: Run Backend Locally

```bash
cd backend
docker-compose up -d
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Note:** Frontend on Vercel will only work when you run backend locally.

---

## Option 2: Full Deployment (Recommended for Production)

### Frontend: Vercel
### Backend: Railway/Render/DigitalOcean

### A. Deploy Backend on Railway

**1. Install Railway CLI:**
```bash
npm i -g @railway/cli
```

**2. Login and Initialize:**
```bash
railway login
cd backend
railway init
```

**3. Add Services:**
```bash
# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis

# Deploy backend
railway up
```

**4. Get Backend URL:**
```bash
railway domain
# Example: https://noesis-backend.railway.app
```

### B. Deploy Frontend on Vercel

**1. Update Environment Variables:**

In Vercel dashboard, add:
```
NEXT_PUBLIC_API_URL=https://noesis-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://noesis-backend.railway.app
```

**2. Redeploy:**
```bash
vercel --prod
```

---

## Option 3: Deploy Backend on Render

### Step 1: Deploy Databases

**PostgreSQL:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. New → PostgreSQL
3. Copy connection string

**Redis:**
1. New → Redis
2. Copy connection string

### Step 2: Deploy FastAPI

**1. Create render.yaml:**
```yaml
services:
  - type: web
    name: noesis-backend
    env: python
    region: oregon
    plan: starter
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: OPENAI_API_KEY
        sync: false
      - key: EXA_API_KEY
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: noesis-db
          property: connectionString
```

**2. Connect Render to GitHub:**
- Link your repo
- Select `backend` folder as root directory
- Deploy

**3. Get Backend URL:**
- Example: `https://noesis-backend.onrender.com`

### Step 3: Update Vercel Frontend

Add environment variables in Vercel:
```
NEXT_PUBLIC_API_URL=https://noesis-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://noesis-backend.onrender.com
```

---

## Option 4: All on DigitalOcean (App Platform)

### Step 1: Create App

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Create App → GitHub
3. Select your repo

### Step 2: Configure Components

**Backend:**
```yaml
name: backend
source_dir: /backend
run_command: uvicorn main:app --host 0.0.0.0 --port 8080
```

**Frontend:**
```yaml
name: frontend
source_dir: /
build_command: npm run build
run_command: npm start
```

### Step 3: Add Databases

- Add PostgreSQL
- Add Redis
- Configure environment variables

---

## Quick Deploy Commands

### Push New Version to Vercel

```bash
# Commit changes
git add .
git commit -m "Deploy new version"
git push origin main

# Vercel will auto-deploy if connected to GitHub
# Or manually deploy:
vercel --prod
```

### Update Backend (Railway)

```bash
cd backend
railway up
```

### Update Backend (Render)

```bash
git push origin main
# Render auto-deploys on push
```

---

## Environment Variables Needed

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_WS_URL=wss://your-backend-url.com
```

### Backend (Railway/Render)
```env
OPENAI_API_KEY=sk-...
EXA_API_KEY=...
DATABASE_URL=postgresql://...
NEO4J_URI=neo4j+s://...
NEO4J_USER=neo4j
NEO4J_PASSWORD=...
REDIS_URL=redis://...
```

---

## Recommended Architecture

```
┌──────────────────┐
│  Vercel          │  ← Frontend (Next.js)
│  (Frontend)      │     Auto-deploys on git push
└────────┬─────────┘
         │ HTTPS/WSS
         ▼
┌──────────────────┐
│  Railway/Render  │  ← Backend (FastAPI)
│  (Backend)       │     Auto-deploys on git push
└────────┬─────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Postgres│ │Neo4j │ │Redis │ │ APIs │
└────────┘ └──────┘ └──────┘ └──────┘
  Managed   Aura    Upstash   OpenAI
```

---

## Cost Estimate

**Free Tier:**
- Vercel: Free for personal projects ✅
- Railway: $5/month free credit ⚠️
- Render: Free tier available ✅
- Databases:
  - PostgreSQL: Render free tier ✅
  - Redis: Upstash free tier ✅
  - Neo4j: Aura free tier (limited) ✅

**Total Cost (Free Tier):** $0-5/month

**Production (Paid):**
- Vercel Pro: $20/month
- Railway: ~$20-50/month
- Databases: ~$30-50/month
**Total:** ~$70-120/month

---

## Steps for Your Current Situation

Since you already have Vercel:

### Quick Deploy (5 minutes)

```bash
# 1. Commit and push
git add .
git commit -m "v2.0: Add FastAPI backend and multi-agent system"
git push origin main

# 2. Vercel auto-deploys frontend ✅

# 3. Run backend locally for now
cd backend
docker-compose up -d
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Full Production Deploy (30 minutes)

```bash
# 1. Sign up for Railway
https://railway.app

# 2. Deploy backend
cd backend
railway login
railway init
railway add postgresql
railway add redis
railway up

# 3. Get backend URL
railway domain

# 4. Update Vercel env vars
# Go to Vercel dashboard → Settings → Environment Variables
# Add: NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app

# 5. Redeploy frontend
git push origin main
```

---

## Verification

After deployment, check:

- ✅ Frontend: https://your-app.vercel.app
- ✅ Backend: https://your-backend.railway.app/health
- ✅ API Docs: https://your-backend.railway.app/docs

---

## Troubleshooting

**Frontend can't connect to backend:**
- Check NEXT_PUBLIC_API_URL is correct
- Ensure backend is running
- Check CORS settings in backend/main.py

**Backend deployment fails:**
- Check all environment variables are set
- Verify database connections
- Check logs: `railway logs` or Render dashboard

**Database connection errors:**
- Verify DATABASE_URL format
- Check firewall/IP whitelist
- Test connection locally first

---

## Next Steps

1. **Now:** Deploy frontend to Vercel (auto-deploy on push)
2. **Soon:** Deploy backend to Railway/Render
3. **Later:** Add custom domain, monitoring, CI/CD

---

Choose Option 1 for quick testing, Option 2 for production!
