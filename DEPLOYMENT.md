# 🚀 StakeFlow Deployment Guide

## Quick Deploy Commands

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Frontend (Netlify)
```bash
cd frontend
netlify deploy --prod --dir=.next
```

### Backend (Railway)
```bash
cd backend
railway login
railway link
railway up
```

### Backend (Render)
```bash
# Connect your GitHub repo to Render
# Use these settings:
# - Build Command: bun install && bun run build
# - Start Command: bun run start
# - Environment: Node.js
```

## Live Demo URLs (Update after deployment)

- **Frontend**: https://stakeflow-frontend.vercel.app
- **Backend**: https://stakeflow-backend.railway.app
- **Alternative Frontend**: https://stakeflow.netlify.app

## Environment Variables to Set

### Vercel (Frontend)
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_CHAIN_ID
- NEXT_PUBLIC_PROJECT_ID

### Railway (Backend)
- NODE_ENV=production
- PORT (auto-set by Railway)
- CORS_ORIGIN

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] 3D animations work
- [ ] All routes accessible
- [ ] Mobile responsive
- [ ] CORS configured
- [ ] SSL certificates active

## Smoke Test Live Demo
```bash
node smoke-test-live.js
```
