# Deckster Evaluator - Deployment Guide

## Architecture

- **Frontend**: Vercel (static React app)
- **Backend**: Render (Node.js Express API)
- **Domain**: evaluator.deckster.pro

---

## Step 1: Deploy Backend to Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select the Deckster repository
3. **Configure Service**:
   - **Name**: `deckster-evaluator-api`
   - **Region**: Oregon (US West) or nearest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or Starter $7/mo for no cold starts)
4. **Environment Variables**:
   - Click "Environment" tab
   - Add: `OPENAI_API_KEY` = `your-actual-openai-api-key`
   - Add: `NODE_ENV` = `production`
5. **Create Web Service**
6. **Copy the URL**: It will be something like `https://deckster-evaluator-api.onrender.com`

---

## Step 2: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
4. **Update vercel.json**:
   - In `client/vercel.json`, replace `YOUR_RENDER_URL_HERE` with your actual Render URL
   - Example: `https://deckster-evaluator-api.onrender.com`
5. **Deploy**
6. **Copy the URL**: It will be something like `https://deckster-evaluator.vercel.app`

---

## Step 3: Configure Custom Domain (Cloudflare DNS)

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com/
2. **Select your domain**: deckster.pro
3. **Go to DNS settings**:
   - Click "DNS" in the sidebar
4. **Add CNAME Record**:
   - **Type**: CNAME
   - **Name**: `evaluator`
   - **Target**: `cname.vercel-dns.com`
   - **Proxy status**: Proxied (orange cloud) — or DNS only (gray cloud), both work
   - **TTL**: Auto
5. **Save**

6. **Add Domain in Vercel**:
   - Go to your Vercel project → Settings → Domains
   - Add domain: `evaluator.deckster.pro`
   - Vercel will auto-detect the CNAME and provision SSL (takes ~1 minute)

---

## Step 4: Verify Deployment

1. **Test the API**:
   - Visit `https://YOUR_RENDER_URL/api/evaluate` (should return 400 error — expected, means it's running)

2. **Test the Frontend**:
   - Visit `https://evaluator.deckster.pro`
   - Upload a test presentation
   - Verify evaluation works end-to-end

---

## Environment Variables Summary

### Backend (Render):
- `OPENAI_API_KEY` - Your OpenAI API key
- `NODE_ENV` - `production`
- `PORT` - Auto-set by Render (usually 10000)

### Frontend (Vercel):
- None needed (API URL is configured in vercel.json)

---

## Auto-Deploy Setup

Both platforms auto-deploy on push to `main`:

- **Render**: Watches `server/` directory, rebuilds on changes
- **Vercel**: Watches `client/` directory, rebuilds on changes

To deploy updates:
```bash
git add .
git commit -m "Update message"
git push origin main
```

Both services will auto-deploy within 2-3 minutes.

---

## Monitoring & Logs

**Render Logs**:
- Dashboard → Your Service → Logs tab
- Shows server console output, errors, API calls

**Vercel Logs**:
- Dashboard → Your Project → Deployments → Click deployment → Logs
- Shows build logs and runtime logs

---

## Troubleshooting

### Issue: API calls failing with CORS errors
- **Fix**: Verify Render URL is correct in `client/vercel.json`
- Redeploy frontend after updating

### Issue: Render service says "Deploy failed"
- Check Render logs for build errors
- Verify `server/package.json` has correct `build` and `start` scripts

### Issue: "Cold start" delays (30s wait on first request)
- **Cause**: Render free tier spins down after inactivity
- **Fix**: Upgrade to Render Starter ($7/mo) for always-on

### Issue: Custom domain not working
- Verify CNAME record in Cloudflare points to `cname.vercel-dns.com`
- Check Vercel dashboard → Domains → Status should be "Valid Configuration"
- Wait 5-10 minutes for DNS propagation

---

## Costs

**Free Tier** (starting point):
- Render Free: 750 hours/month (enough for most side projects)
- Vercel Hobby: Unlimited bandwidth + builds
- **Total**: $0/month

**Paid Tier** (if you need always-on):
- Render Starter: $7/month (no cold starts)
- Vercel Pro: $20/month (optional, only if you need team features)
- **Total**: $7-27/month
