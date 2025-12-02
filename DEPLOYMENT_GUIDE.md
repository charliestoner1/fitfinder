# 🚀 FitFinder Deployment Guide

**Date**: December 2, 2025  
**Status**: Ready for Production Deployment

---

## 📋 Deployment Options

### **Option 1: Vercel + Render (RECOMMENDED) ⭐**
- **Frontend**: Vercel (Next.js optimized)
- **Backend**: Render (Django/PostgreSQL)
- **Cost**: Free tier available, affordable scaling
- **Setup Time**: 15-30 minutes
- **Difficulty**: Easy

### **Option 2: Railway**
- **Frontend & Backend**: Single platform
- **Cost**: Pay-as-you-go ($5/month starter)
- **Setup Time**: 20-30 minutes
- **Difficulty**: Easy

### **Option 3: Heroku (Legacy, not recommended)**
- Heroku removed free tier in 2022
- **Cost**: Minimum $7/month per dyno
- **Not recommended for new deployments**

### **Option 4: AWS / DigitalOcean (Advanced)**
- Full control, self-managed infrastructure
- **Cost**: ~$5-20/month
- **Setup Time**: 1-2 hours
- **Difficulty**: Advanced

---

## 🎯 RECOMMENDED: Vercel + Render Stack

### **Why This Stack?**
✅ Vercel optimized for Next.js (best performance)  
✅ Render has free tier for PostgreSQL + Django  
✅ Automatic HTTPS & CDN  
✅ Environment variables management built-in  
✅ Easy deployment with GitHub integration  
✅ Cost-effective for MVP/startup

---

## 📦 Step 1: Prepare Your Backend for Deployment

### 1.1 Update `backend/settings.py`

```python
# Add to your settings.py

import os
from pathlib import Path

# Production environment
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Database Configuration for Render
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'fitfinder'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# CORS settings
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000'
).split(',')

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Security
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
```

### 1.2 Create `backend/Procfile` (for Render)

```
release: python manage.py migrate
web: gunicorn backend.wsgi:application --log-file -
```

### 1.3 Create `backend/runtime.txt`

```
python-3.12.7
```

### 1.4 Update `backend/requirements.txt`

Add these for production:

```
gunicorn>=22.0.0
psycopg2-binary>=2.9.0
whitenoise>=6.6.0
django-environ>=0.11.0
```

### 1.5 Install Production Dependencies

```bash
pip install -r backend/requirements.txt
```

---

## 🎨 Step 2: Prepare Your Frontend for Deployment

### 2.1 Create `.env.production` (Frontend)

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_APP_URL=https://fitfinder-frontend.vercel.app
```

### 2.2 Create `next.config.ts` Redirects

Make sure your `next.config.ts` has proper API configuration:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
```

---

## 🌐 Step 3: Deploy Backend to Render

### 3.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository (`charliestoner1/fitfinder`)

### 3.2 Configure Render Service

**Basic Settings:**
- **Name**: `fitfinder-backend`
- **Environment**: `Python`
- **Region**: Select closest to you (US, EU, etc.)
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: See Procfile (render reads it automatically)

**Environment Variables** (add these):

```
DEBUG=False
ALLOWED_HOSTS=fitfinder-backend.onrender.com,yourdomain.com
DB_NAME=fitfinder
DB_USER=fitfinder_user
DB_PASSWORD=<generate-strong-password>
DB_HOST=<render-postgres-host>
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://fitfinder.vercel.app,https://yourdomain.com
SECRET_KEY=<generate-new-secret-key>
```

### 3.3 Create PostgreSQL Database on Render

1. In Render dashboard, click "New +" → "PostgreSQL"
2. **Database**: `fitfinder`
3. **User**: `fitfinder_user`
4. **Region**: Same as backend service
5. Copy the connection string

### 3.4 Deploy

- Click "Create Web Service"
- Wait for build to complete (~3-5 minutes)
- Test: `https://fitfinder-backend.onrender.com/api/`

**Expected Response**: 401 (requires authentication) or list of endpoints (good sign!)

---

## ⚡ Step 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select `charliestoner1/fitfinder` repository

### 4.2 Configure Vercel Project

**Framework Preset**: Next.js (auto-detected)

**Build Settings:**
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://fitfinder-backend.onrender.com/api
NEXT_PUBLIC_APP_URL=https://fitfinder.vercel.app
```

### 4.3 Deploy

- Click "Deploy"
- Wait for build (~2-3 minutes)
- Your app is now live! 🎉

**Your Frontend URL**: `https://fitfinder.vercel.app` (Vercel generates this)

---

## 🔧 Step 5: Post-Deployment Configuration

### 5.1 Update Backend CORS Settings

Once frontend is deployed, update Render environment:

```
CORS_ALLOWED_ORIGINS=https://fitfinder.vercel.app
```

Redeploy backend.

### 5.2 Run Migrations on Render

Render automatically runs migrations via `Procfile` release command, but you can manually trigger:

```bash
# Via Render dashboard:
# 1. Go to Web Service → Shell
# 2. Run: python manage.py migrate
```

### 5.3 Create Superuser (Optional)

```bash
# Via Render Shell:
python manage.py createsuperuser
```

Then access Django admin: `https://fitfinder-backend.onrender.com/admin/`

---

## 🧪 Step 6: Testing Your Deployment

### 6.1 Test Backend API

```bash
# Test root endpoint
curl https://fitfinder-backend.onrender.com/api/

# Test registration
curl -X POST https://fitfinder-backend.onrender.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Test recommendations
curl https://fitfinder-backend.onrender.com/api/recommendations/generate/?weather=sunny&occasion=casual
```

### 6.2 Test Frontend

1. Visit: https://fitfinder.vercel.app
2. Try registration
3. Upload a wardrobe item
4. Generate recommendations
5. Check browser console for errors

---

## 📊 Step 7: Monitoring & Maintenance

### Backend Monitoring (Render)

1. Go to Web Service dashboard
2. Check "Metrics" tab for:
   - CPU usage
   - Memory usage
   - Requests/sec
3. Check "Logs" tab for errors

### Frontend Monitoring (Vercel)

1. Go to Project dashboard
2. Check "Analytics" for:
   - Page load times
   - Core Web Vitals
   - Error tracking

### Set up Alerts

**Render:**
- CPU > 80% for 5 minutes
- Out of memory errors

**Vercel:**
- Build failures
- Error rate spikes

---

## 🚨 Troubleshooting

### Issue: `504 Gateway Timeout`

**Cause**: Backend taking too long to start or crash on startup  
**Solution**:
```bash
# Check logs in Render dashboard
# Look for migration errors or import failures
python manage.py check
```

### Issue: `CORS Error` in Browser

**Cause**: Frontend and backend origins not matching  
**Solution**: Update `CORS_ALLOWED_ORIGINS` in Render environment

```
CORS_ALLOWED_ORIGINS=https://fitfinder.vercel.app,https://yourdomain.com
```

### Issue: Static Files Not Loading

**Cause**: Static files not collected  
**Solution**: Add to `settings.py`:

```python
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### Issue: Database Connection Failed

**Cause**: Wrong connection string or credentials  
**Solution**:
```bash
# Test in Render Shell:
python manage.py dbshell
```

---

## 💾 Database Backup & Management

### Automated Backups (Render)

Render automatically backs up PostgreSQL. To restore:

1. Go to Database in Render dashboard
2. Click "Backups" tab
3. Click "Restore" on desired backup

### Manual Backup

```bash
# Download backup
pg_dump -U fitfinder_user -h <host> fitfinder > backup.sql

# Restore backup
psql -U fitfinder_user -h <host> fitfinder < backup.sql
```

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel Project Settings
2. Click "Domains"
3. Add your domain (e.g., `fitfinder.yourdomain.com`)
4. Follow DNS configuration steps

### Add Custom Domain to Render

1. Go to Render Web Service Settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records (Render provides instructions)

---

## 📈 Scaling for Production

### When to Scale

**Vercel**: Usually scales automatically  
**Render**: Monitor CPU/memory usage

### Upgrade Backend Plan

In Render:
1. Go to Web Service Settings
2. Change "Instance Type"
3. Options: `Starter` ($7/mo) → `Standard` ($25/mo) → Higher tiers

### Upgrade Database

In Render:
1. Go to PostgreSQL database
2. Increase storage or upgrade tier

---

## 🔐 Security Checklist

Before going fully public:

- [ ] `DEBUG = False` in production
- [ ] `ALLOWED_HOSTS` configured correctly
- [ ] `SECRET_KEY` is random and strong
- [ ] `HTTPS` enabled (automatic on both platforms)
- [ ] CSRF/CORS properly configured
- [ ] Database backups enabled
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables for secrets (no hardcoding)
- [ ] Set up rate limiting on API endpoints
- [ ] Enable HTTPS-only cookies

---

## 📝 Deployment Checklist

### Before Deployment

- [ ] All tests passing (`bash qa/run_all_tests.sh`)
- [ ] No hardcoded secrets in code
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Build process tested locally
- [ ] API endpoints tested
- [ ] Frontend builds without errors

### During Deployment

- [ ] Render backend deployed
- [ ] PostgreSQL database created
- [ ] Migrations running successfully
- [ ] Vercel frontend deployed
- [ ] Environment variables configured
- [ ] CORS settings updated

### After Deployment

- [ ] Test registration endpoint
- [ ] Test login endpoint
- [ ] Test wardrobe upload
- [ ] Test recommendations
- [ ] Check browser console (no errors)
- [ ] Monitor backend logs
- [ ] Set up monitoring/alerts

---

## 🎊 You're Live!

**Frontend**: https://fitfinder.vercel.app  
**Backend API**: https://fitfinder-backend.onrender.com/api/  
**Admin Panel**: https://fitfinder-backend.onrender.com/admin/

---

## 📚 Additional Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/5.0/howto/deployment/
- **Next.js Deployment**: https://nextjs.org/learn/pages/next-steps/deployment

---

## 💬 Need Help?

**Common Issues Solved**:
1. Check Render logs for backend errors
2. Check Vercel logs for frontend errors
3. Test API endpoints manually with `curl`
4. Review environment variables
5. Check CORS configuration

**Quick Redeploy**:
- Push to main branch (Render/Vercel auto-redeploy)
- Or manually trigger in dashboard

---

**Last Updated**: December 2, 2025  
**Status**: Production Ready 🚀
