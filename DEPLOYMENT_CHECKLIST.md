# 🚀 Quick Deployment Checklist

## Pre-Deployment (Complete Before Deploying)

### Backend Setup
- [ ] Run all tests: `bash qa/run_all_tests.sh`
- [ ] All tests passing ✅
- [ ] Database migrations ready: `python manage.py migrate`
- [ ] Check settings: `python manage.py check`

### Frontend Setup
- [ ] Build test: `npm run build` (in frontend directory)
- [ ] No build errors
- [ ] Environment variables configured

### Code Cleanup
- [ ] No hardcoded secrets in code
- [ ] No DEBUG=True in production
- [ ] No console.log statements left
- [ ] All imports working correctly

---

## Deployment Steps (15-30 minutes)

### Step 1: Deploy Backend to Render (10 min)

```bash
# 1. Go to https://render.com
# 2. Sign in with GitHub
# 3. Click "New +" → "Web Service"
# 4. Connect charliestoner1/fitfinder repo
# 5. Configure:
#    - Name: fitfinder-backend
#    - Build Command: pip install -r backend/requirements.txt
#    - Environment: Python 3.12
# 6. Add Environment Variables:
#    - DEBUG=False
#    - SECRET_KEY=<generate-random-string>
#    - ALLOWED_HOSTS=fitfinder-backend.onrender.com
#    - CORS_ALLOWED_ORIGINS=https://fitfinder.vercel.app
# 7. Create Web Service
# 8. Wait for build (2-3 min)
# 9. Note your backend URL: https://fitfinder-backend.onrender.com
```

**Backend URL**: `https://fitfinder-backend.onrender.com` ← Save this!

### Step 2: Create PostgreSQL Database (3 min)

```bash
# 1. In Render dashboard, click "New +" → "PostgreSQL"
# 2. Configure:
#    - Name: fitfinder-db
#    - Database: fitfinder
#    - User: fitfinder_user
#    - Region: Same as backend
# 3. Create Database
# 4. Copy connection details
# 5. Update backend environment variables in Render:
#    - DB_HOST=<postgres-host>
#    - DB_USER=fitfinder_user
#    - DB_PASSWORD=<generated-password>
#    - DB_NAME=fitfinder
# 6. Redeploy backend service
```

### Step 3: Deploy Frontend to Vercel (5 min)

```bash
# 1. Go to https://vercel.com
# 2. Sign in with GitHub
# 3. Click "Import Project"
# 4. Select charliestoner1/fitfinder
# 5. Configure:
#    - Framework: Next.js
#    - Root Directory: frontend
#    - Build Command: npm run build
#    - Install Command: npm install
# 6. Add Environment Variables:
#    - NEXT_PUBLIC_API_URL=https://fitfinder-backend.onrender.com/api
#    - NEXT_PUBLIC_APP_URL=https://<your-vercel-url>.vercel.app
# 7. Deploy
# 8. Wait for build (1-2 min)
```

**Frontend URL**: `https://fitfinder-XXXX.vercel.app` ← Save this!

---

## Post-Deployment Testing (5 min)

### Test Backend

```bash
# 1. API is responding
curl https://fitfinder-backend.onrender.com/api/

# 2. Can register user
curl -X POST https://fitfinder-backend.onrender.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@fitfinder.com",
    "username": "testuser",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Test Frontend

1. Open: `https://fitfinder-XXXX.vercel.app`
2. Register new account
3. Try uploading a wardrobe item
4. Generate recommendations
5. Check browser console (should have no errors)

### Common Issues

| Issue | Solution |
|-------|----------|
| 404 on API | Backend didn't deploy, check Render logs |
| CORS error | Update `CORS_ALLOWED_ORIGINS` in backend env |
| Database connection failed | Check DB_HOST, DB_USER, DB_PASSWORD |
| Images not uploading | Check storage/permissions, may need object storage |
| Recommendations failing | Check ML model loads correctly |

---

## Monitoring (Ongoing)

### Check Backend Health

```bash
# Check logs
# Go to Render dashboard → fitfinder-backend → Logs

# Check status
curl https://fitfinder-backend.onrender.com/api/ -v
```

### Check Frontend Health

```bash
# Go to Vercel dashboard
# Check "Deployments" and "Analytics"
# Monitor for build failures or performance issues
```

---

## Environment Variables Quick Reference

### Backend (Render)

```
DEBUG=False
SECRET_KEY=django-insecure-xxxxx-change-this
ALLOWED_HOSTS=fitfinder-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://fitfinder.vercel.app
DB_NAME=fitfinder
DB_USER=fitfinder_user
DB_PASSWORD=<strong-password>
DB_HOST=<postgres-host>
DB_PORT=5432
```

### Frontend (Vercel)

```
NEXT_PUBLIC_API_URL=https://fitfinder-backend.onrender.com/api
NEXT_PUBLIC_APP_URL=https://fitfinder-XXXX.vercel.app
```

---

## After Deployment

- [ ] Test all features work
- [ ] Check error logs (no 500 errors)
- [ ] Monitor performance
- [ ] Share public URL with team
- [ ] Update documentation with live URL
- [ ] Set up automated backups (Render does this)
- [ ] Enable monitoring/alerts

---

## 🎉 Success Criteria

✅ Backend responding at public URL  
✅ Frontend deployed and accessible  
✅ User registration working  
✅ Image upload working  
✅ Recommendations generating  
✅ No CORS errors in browser  
✅ Database migrations applied  
✅ All features functioning correctly  

---

## 📞 Troubleshooting

**Backend won't start?**
- Check Render logs for errors
- Verify all environment variables set
- Run: `python manage.py check` locally

**Frontend won't build?**
- Check Vercel logs
- Verify env vars configured
- Try: `npm run build` locally

**Images not uploading?**
- May need AWS S3 or similar cloud storage
- For now, images stored locally on backend
- Consider adding cloud storage later

**Database errors?**
- Verify connection string is correct
- Check PostgreSQL is running
- Test connection locally first

---

**Deployment Status**: Ready for production 🚀  
**Estimated Time**: 15-30 minutes  
**Difficulty**: Easy  

Let's ship it! 🎊
