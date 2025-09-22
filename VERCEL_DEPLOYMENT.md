# Vercel Deployment Configuration

## Environment Variables

Create these environment variables in your Vercel dashboard:

### Required Variables:
- `GOOGLE_API_KEY` - Your Google Sheets API key
- `GOOGLE_SHEET_ID` - Your Google Sheet ID
- `GOOGLE_SHEET_NAME` - Sheet name (default: "Trang tính1")

### Optional Variables (for Service Account):
- `GOOGLE_CLIENT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key

## Build Settings

Vercel will automatically detect this as a Next.js project and configure:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## Deployment Steps

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

## Custom Domain (Optional)

After deployment, you can add a custom domain in Vercel dashboard under:
Settings → Domains → Add Domain
