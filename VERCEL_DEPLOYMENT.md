# JEBLI Vercel Deployment Guide

## 🚀 Environment Variables

Set these in your Vercel dashboard under Settings > Environment Variables:

### Required Variables

```bash
# Google Apps Script API Configuration
JEBLI_API_URL=https://script.google.com/macros/s/AKfycbxIuOkOX7pQcv6VCsTEePGR4hkB731_b2kqYxci_3YhoqZTUHu_x9T-ypqR0eqK0pHlJQ/exec
JEBLI_API_KEY=jebli_secret_key_2024_xyz789_secure_hash

# Business Configuration
JEBLI_DEFAULT_FX_RATE=40.5
JEBLI_SHIPPING_PER_KG_USD=6
JEBLI_SERVICE_FEE_RATE=0.15

# Email Configuration
JEBLI_EMAIL_FROM=JEBLI Orders <Jebli963.90@gmail.com>
JEBLI_EMAIL_REPLY_TO=Jebli963.90@gmail.com
```

## 📋 Deployment Steps

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `jebli.co` repository

2. **Set Environment Variables:**
   - Go to Project Settings > Environment Variables
   - Add each variable from the list above
   - Make sure to set them for Production, Preview, and Development

3. **Deploy:**
   - Vercel will automatically deploy from your GitHub repository
   - Your site will be available at `https://jebli-co.vercel.app` (or your custom domain)

## 🔧 Configuration Files

- `vercel.json` - Vercel configuration
- `config.js` - Updated to use environment variables
- All static files are ready for deployment

## 🌐 Custom Domain

To use your custom domain `jebli.co`:
1. Go to Project Settings > Domains
2. Add `jebli.co` and `www.jebli.co`
3. Update your DNS records as instructed by Vercel

## ✅ Post-Deployment

After deployment:
1. Test the order form functionality
2. Verify email notifications work
3. Test the tracking system
4. Check admin dashboard access
5. Test mobile responsiveness

## 🔒 Security Notes

- API keys are stored securely in Vercel environment variables
- No sensitive data is exposed in the client-side code
- All API calls go through your Google Apps Script backend
