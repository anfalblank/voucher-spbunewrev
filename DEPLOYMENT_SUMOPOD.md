# Deployment Guide - Sumopod Hosting

## Akses cPanel Sumopod

1. Buka: `http://43.157.213.54/cpanel` atau `https://manggala.biz.id:2083`
2. Login dengan username/password dari Sumopod

## Metode 1: Deploy dengan Node.js App di cPanel

### 1. Setup Node.js App
1. Di cPanel, cari **"Setup Node.js App"**
2. Click **"Create Application"**
3. Konfigurasi:
   - **Node.js version**: 20.x
   - **Application mode**: Production
   - **Application root**: voucher-spbu
   - **Application URL**: manggala.biz.id
   - **Application startup file**: package.json
4. Click **"Create"**

### 2. Upload Files
1. Di cPanel, buka **File Manager**
2. Go ke folder aplikasi yang dibuat
3. Upload semua file kecuali:
   - node_modules/
   - .next/
   - *.db files
   - .git/

### 3. Install & Build
Di cPanel Node.js App:
1. Click **"Run NPM Install"**
2. Setelah selesai, click **"Run NPM Build"**
3. Click **"Restart"**

### 4. Environment Variables
Di cPanel Node.js App, tambahkan:
```
DATABASE_URL=file:./data/spbu-voucher.db
NODE_ENV=production
BETTER_AUTH_SECRET=generate-random-secret-32chars
BETTER_AUTH_URL=https://manggala.biz.id
NEXT_PUBLIC_APP_URL=https://manggala.biz.id
```

## Metode 2: Deploy dengan File Manager (Manual)

### 1. Build Locally
```bash
# Di local machine
npm run build
```

### 2. Upload ke cPanel
1. Buka File Manager di cPanel
2. Go ke `public_html` atau subdomain folder
3. Upload:
   - Semua file dari folder `.next/`
   - Folder `public/`
   - File `package.json`
   - Folder `node_modules/` (hanya production dependencies)

### 3. Create Server File
Buat file `server.js` di root:
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = false
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
```

### 4. Setup di cPanel
1. Di cPanel, buka **Setup Node.js App**
2. Create application dengan:
   - **Application startup file**: server.js
   - **Application root**: voucher-spbu
3. Run NPM Install
4. Restart application

## Metode 3: Deploy dengan Git Deploy

### 1. Setup Git Repository
```bash
# Repository sudah ada di GitHub
# https://github.com/anfalblank/voucher-spbunewrev
```

### 2. Di cPanel
1. Buka **Git Version Control**
2. Click **"Create"**
3. Clone repository:
   - **Repository URL**: https://github.com/anfalblank/voucher-spbunewrev.git
   - **Repository Path**: voucher-spbu
   - **Branch**: main
4. Click **"Create"**

### 3. Pull & Update
Setiap kali ada update:
1. Di cPanel Git Version Control
2. Click **"Update"** atau **"Pull"**

## Domain Configuration

### 1. Add Domain di cPanel
1. Buka **Domains**
2. Click **"Add Domain"**
3. Masukkan: `manggala.biz.id`
4. Set document root ke folder aplikasi

### 2. SSL Certificate
1. Buka **SSL/TLS Status**
2. Click **"Run AutoSSL"** untuk manggala.biz.id
3. Tunggu proses install SSL

## Troubleshooting

### Application tidak starting
- Cek Node.js version harus 20.x
- Pastikan `npm install` sudah dijalankan
- Cek error log di cPanel

### Database permission error
- Pastikan folder `data/` ada dan writable
- Set permission 755 untuk folder

### Port 3000 blocked
- Sumopod akan reverse proxy dari port 80/443
- Tidak perlu config port di application

## Cek Deployment

Setelah deploy:
```bash
# Health check
curl https://manggala.biz.id/api/health

# Cek website
# https://manggala.biz.id
```

## Support Sumopod
- Knowledge Base: https://www.sumopod.com/kb
- Support: support@sumopod.com
