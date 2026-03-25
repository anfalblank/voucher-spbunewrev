# Deploy ke manggala.biz.id (Sumopod)

## Server Info
- **Domain**: manggala.biz.id
- **IP**: 43.157.213.54
- **Hosting**: Sumopod (cPanel)
- **SSH**: Port 22 blocked (gunakan cPanel)

## Metode Deploy

### METODE 1: Deploy via cPanel Git (Recommended)

#### 1. Login ke cPanel
Buka salah satu:
- https://manggala.biz.id:2083
- https://43.157.213.54:2083
- http://manggala.biz.id/cpanel

#### 2. Setup Git di cPanel

1. Di cPanel, cari **Git Version Control**
2. Click **Create**
3. Isi form:
   - **Clone URL**: `https://github.com/anfalblank/voucher-spbunewrev.git`
   - **Repository Path**: `voucher-spbu`
   - **Branch**: `main`
4. Click **Create**

cPanel akan clone repository ke: `/home/username/voucher-spbu`

#### 3. Setup Node.js App

1. Di cPanel, cari **Setup Node.js App**
2. Click **Create Application**
3. Konfigurasi:
   - **Node.js version**: `20.x` (atau latest available)
   - **Application mode**: `Production`
   - **Application root**: `/voucher-spbu`
   - **Application URL**: `manggala.biz.id`
   - **Application startup file**: `package.json`
4. Click **Create**

#### 4. Install Dependencies

Di Node.js App Setup:
1. Click **"Run NPM Install"**
2. Tunggu sampai selesai

#### 5. Setup Environment Variables

Di Node.js App, klik **"Environment"** dan tambahkan:

```
NODE_ENV=production
DATABASE_URL=file:./data/spbu-voucher.db
NEXT_PUBLIC_APP_URL=https://manggala.biz.id
BETTER_AUTH_SECRET=ganti_dengan_random_string_32_karakter
BETTER_AUTH_URL=https://manggala.biz.id
```

Generate random secret:
```
openssl rand -base64 32
```

#### 6. Build & Start

1. Click **"Run NPM Build"**
2. Setelah selesai, click **"Restart"**

#### 7. Setup Database Folder

1. Di File Manager, buka folder `/voucher-spbu`
2. Create folder `data`
3. Set permission ke `755`:
   - Right click folder `data`
   - Change Permissions
   - Set ke `755`

#### 8. Seed Database (Opsional)

Jika ingin data demo:
1. Di cPanel Terminal (jika available) atau via SSH:
2. Navigate ke app folder: `cd voucher-spbu`
3. Run: `npm run db:seed`

Atau via browser, API akan otomatis create database file saat first use.

#### 9. Setup SSL

1. Di cPanel, cari **SSL/TLS Status**
2. Pilih domain `manggala.biz.id`
3. Click **"Run AutoSSL"**

---

### METODE 2: Manual Upload via File Manager

#### 1. Build Lokal

```bash
# Di local machine
cd /Users/administrator/voucher-spbu

# Install dependencies
npm install

# Build production
npm run build

# Zip folder (exclude node_modules, .next, data)
zip -r voucher-spbu.zip . -x "node_modules/*" ".next/*" "data/*" ".git/*" "*.db"
```

#### 2. Upload ke cPanel

1. Login ke cPanel (https://manggala.biz.id:2083)
2. Buka **File Manager**
3. Navigate ke folder di mana app akan di-host (biasanya `public_html` atau subfolder)
4. Upload `voucher-spbu.zip`
5. Extract zip file

#### 3. Install Dependencies di Server

1. Di cPanel, buka **Terminal**
2. Navigate ke folder app
3. Run:
```bash
cd public_html/voucher-spbu  # atau folder tempat extract
npm install --production
```

#### 4. Setup Node.js App

Lanjutkan dari **Langkah 3-9** di METODE 1.

---

### METODE 3: Deploy via FTP/SFTP

#### 1. Build Lokal

Sama seperti METODE 2, langkah 1.

#### 2. Upload via FTP

Gunakan FileZilla atau FTP client:

- **Host**: manggala.biz.id (atau 43.157.213.54)
- **Port**: 21 (FTP) atau 22 (SFTP jika available)
- **Username**: (dari cPanel)
- **Password**: (dari cPanel)

Upload semua file ke folder app di server.

#### 3. Lanjutkan dengan setup Node.js App

Lanjutkan dari **Langkah 3-9** di METODE 1.

---

## Troubleshooting

### Port 22 Timeout (SSH blocked)

**Solusi**: Gunakan cPanel Git Version Control atau File Manager

### Database Permission Error

**Error**: ` SQLITE_CANTOPEN: unable to open database file`

**Solusi**:
```bash
# Di cPanel Terminal atau File Manager
mkdir -p data
chmod 755 data
chmod 644 data/*.db
```

### better-sqlite3 Module Error

**Error**: `Error: Cannot find module 'better-sqlite3'`

**Solusi**:
```bash
# Reinstall better-sqlite3
npm uninstall better-sqlite3
npm install better-sqlite3 --build-from-source
```

Atau di cPanel Node.js App:
1. Click **"Run NPM Install"** lagi
2. Pastikan **"Rebuild"** dicentang

### 500 Internal Server Error

**Cek logs**:
1. Di cPanel, buka **Errors** (di Metrics section)
2. Atau cek log di Node.js App Setup

**Common issues**:
- Environment variable belum diset
- Database folder belum ada
- Port sudah digunakan
- Build error

### Halaman Blank/404

**Solusi**:
1. Pastikan build berhasil
2. Cek application root path
3. Pastikan `next.config.js` ada
4. Restart application

---

## Update Code (Cara Pull dari GitHub)

Setiap kali ada update di repository:

### Via cPanel Git Version Control

1. Di cPanel, buka **Git Version Control**
2. Find repository `voucher-spbu`
3. Click **"Update"** atau **"Pull"**
4. Di Node.js App Setup:
   - Click **"Run NPM Install"** (jika ada dependency baru)
   - Click **"Run NPM Build"**
   - Click **"Restart"**

---

## Check Deployment

Setelah deploy:

```bash
# Health check
curl https://manggala.biz.id/api/health

# Cek homepage
curl -I https://manggala.biz.id

# Cek API vouchers
curl https://manggala.biz.id/api/vouchers
```

---

## URLs Setelah Deploy

| Service | URL |
|---------|-----|
| Homepage | https://manggala.biz.id |
| Login | https://manggala.biz.id/login |
| Dashboard | https://manggala.biz.id/dashboard |
| API Health | https://manggala.biz.id/api/health |
| API Vouchers | https://manggala.biz.id/api/vouchers |
| API Outlets | https://manggala.biz.id/api/outlets |

---

## Default Login

Setelah seed database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@spbu.co.id | password123 |
| Owner | owner@spbu.co.id | password123 |
| Operator | operator1@spbu.co.id | password123 |

---

## Server Resources

Pastikan server meeting requirements:

- **Node.js**: 20.x or higher
- **RAM**: Min 512MB (recommended 1GB+)
- **Disk**: Min 500MB (untuk dependencies + database)
- **CPU**: 1 core (recommended 2+)

---

## Monitoring

### Cek Application Status

1. Di cPanel Node.js App Setup
2. Lihat status: **Running** / **Stopped**
3. Cek logs jika error

### Cek Database

```bash
# Di cPanel Terminal
cd voucher-spbu
sqlite3 data/spbu-voucher.db "SELECT COUNT(*) FROM vouchers;"
```

---

## Backup

### Backup Database

```bash
# Di cPanel Terminal atau via cron job
cp data/spbu-voucher.db data/backup/spbu-voucher-$(date +%Y%m%d).db
```

### Backup ke Local

```bash
# Download via SFTP/FTP
# Atau via cPanel > Backup > Download
```

---

## Rollback

Jika ada masalah setelah update:

```bash
# Di cPanel Git Version Control
1. Click "Checkout" ke commit sebelumnya
2. Run NPM Build
3. Restart Application
```

---

## Support

Jika ada masalah:
- **cPanel Documentation**: https://docs.cpanel.net/
- **Sumopod Support**: support@sumopod.com
- **GitHub Issues**: https://github.com/anfalblank/voucher-spbunewrev/issues

---

**Last Updated**: 25 Maret 2026
