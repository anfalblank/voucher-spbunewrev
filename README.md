# SPBU Voucher Management System

Sistem manajemen voucher BBM untuk SPBU dengan fitur generate voucher, scan QR, dan settlement shift operator.

## 📋 Fitur Utama

- **Multi-Role Access Control**: Admin, Owner, Operator
- **Voucher Management**: Generate, list, detail voucher
- **QR Code Scanning**: Scan & validasi voucher
- **Shift Settlement**: Track penggunaan voucher per shift operator
- **Real-time Dashboard**: Filter periode, outlet, status
- **Transaction History**: Riwayat transaksi lengkap
- **Outlet Management**: Kelola outlet SPBU
- **User Management**: Kelola pengguna sistem

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: better-auth 1.5.6
- **Database**: SQLite + Drizzle ORM
- **UI Components**: Radix UI
- **QR Code**: html5-qrcode

## 📦 Installation

### Prerequisites

- Node.js 20.x or higher
- npm or yarn or bun

### Setup

```bash
# Clone repository
git clone https://github.com/anfalblank/voucher-spbunewrev.git
cd voucher-spbunewrev

# Install dependencies
npm install

# Setup database
npm run db:push

# Seed database (opsional - untuk data demo)
npm run db:seed

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🚀 Deployment

Lihat [DEPLOYMENT_SUMOPOD.md](./DEPLOYMENT_SUMOPOD.md) untuk panduan deployment ke Sumopod hosting.

### Quick Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📖 Panduan Penggunaan

### 1. Login

Gunakan akun default (setelah seed database):

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@spbu.co.id | password123 |
| **Owner** | owner@spbu.co.id | password123 |
| **Operator** | operator1@spbu.co.id | password123 |

### 2. Dashboard

Dashboard menampilkan statistik:
- Total voucher aktif
- Total transaksi hari ini
- Total nilai transaksi bulan ini
- Distribusi voucher per status

**Filter Dashboard:**
- **Periode**: Semua, Hari Ini, Minggu Ini, Bulan Ini
- **Outlet**: Pilih outlet tertentu
- **Status**: Filter berdasarkan status voucher

### 3. Generate Voucher (Admin/Owner)

1. Masuk ke menu **Voucher**
2. Click **Buat Voucher Baru**
3. Isi form:
   - **Tipe Voucher**: Liter / Rupiah
   - **Nilai**: Jumlah liter atau rupiah
   - **Outlet**: Pilih outlet tujuan
   - **Berlaku sampai**: Tanggal expired
   - **Jumlah**: Berapa banyak voucher yang dibuat
4. Click **Buat Voucher**

Voucher akan otomatis dibuat dengan:
- Kode unik (format: VOU-XXXXXX)
- QR Code untuk scanning
- Status: ACTIVE

### 4. Scan QR & Settlement (Operator/Owner/Admin)

#### Memulai Shift

1. Masuk ke menu **Scan QR & Settlement**
2. Klik tombol **Mulai Shift**
3. Sistem akan mencatat:
   - Waktu mulai shift
   - Outlet operator
   - Operator yang bertugas

#### Scan Voucher

**Opsi 1: Scan QR Code**
1. Klik **Scan QR Code**
2. Izinkan akses kamera
3. Arahkan ke QR Code pada voucher
4. Sistem akan validasi:
   - Voucher ada di database
   - Voucher belum digunakan
   - Voucher belum expired
   - Voucher valid untuk outlet tersebut

**Opsi 2: Input Manual**
1. Masukkan kode voucher (format: VOU-XXXXXX)
2. Klik **Validasi**
3. Sistem akan mengecek validitas voucher

**Hasil Scan:**
- ✅ **SUCCESS**: Voucher valid dan berhasil digunakan
- ❌ **ALREADY_USED**: Voucher sudah pernah digunakan
- ❌ **EXPIRED**: Voucher sudah kadaluarsa
- ❌ **INVALID**: Voucher tidak ditemukan
- ❌ **WRONG_OUTLET**: Voucher tidak valid untuk outlet ini

#### Mengakhiri Shift (Settlement)

1. Klik tombol **Tutup Shift / Settlement**
2. Sistem akan menampilkan ringkasan:
   - Total transaksi shift
   - Total nilai voucher digunakan
   - Daftar transaksi shift
3. Klik **Simpan Settlement** untuk menyimpan

### 5. Daftar Voucher

1. Masuk ke menu **Voucher**
2. Lihat semua voucher yang sudah diterbitkan
3. Filter berdasarkan:
   - Status (Active, Used, Expired)
   - Outlet
   - Tipe (Liter/Rupiah)
4. Klik voucher untuk melihat detail:
   - Kode voucher
   - Tipe & nilai
   - Status
   - Tanggal dibuat & expired
   - Outlet
   - QR Code

### 6. Kelola Outlet (Admin/Owner)

1. Masuk ke menu **Outlet SPBU**
2. Lihat semua outlet
3. Tambah outlet baru:
   - Nama outlet
   - Alamat lengkap
   - Latitude & Longitude
   - No. telepon
   - Manager
4. Edit atau hapus outlet

### 7. Kelola Pengguna (Admin Only)

1. Masuk ke menu **Pengguna**
2. Lihat semua pengguna
3. Tambah pengguna baru:
   - Nama lengkap
   - Email
   - Password
   - Role (Admin/Owner/Operator)
   - Outlet (untuk operator)
4. Edit atau hapus pengguna

### 8. Laporan (Admin/Owner)

1. Masuk ke menu **Laporan**
2. Pilih jenis laporan:
   - Laporan Voucher
   - Laporan Transaksi
   - Laporan Outlet
3. Filter periode dan parameter lain
4. Export data (CSV/PDF)

## 🔐 Role & Permissions

| Menu | Admin | Owner | Operator |
|------|-------|-------|----------|
| Dashboard | ✅ | ✅ | ✅ |
| Voucher | ✅ | ✅ | ❌ |
| Outlet SPBU | ✅ | ✅ | ❌ |
| Transaksi | ✅ | ✅ | ❌ |
| Laporan | ✅ | ✅ | ❌ |
| Pengguna | ✅ | ❌ | ❌ |
| Scan QR & Settlement | ✅ | ✅ | ✅ |

## 📊 Database Schema

Sistem menggunakan 4 tabel utama:

### USERS
- id, name, email, password
- role (ADMIN, OWNER, OPERATOR)
- outletId (untuk operator)
- emailVerified, createdAt

### OUTLETS
- id, name, address
- latitude, longitude
- phone, manager
- createdAt

### VOUCHERS
- id, code, type (LITER, RUPIAH)
- value, status (ACTIVE, USED, EXPIRED)
- expiryDate, outletId
- createdBy, createdAt
- qrCodeUrl

### TRANSACTIONS
- id, voucherId
- userId, outletId
- transactionDate, amount
- status (COMPLETED, FAILED, PENDING)
- createdAt

### VOUCHER_REDEMPTIONS
- id, voucherId, transactionId
- outletId, operatorId
- status (SUCCESS, FAILED, PENDING, EXPIRED, ALREADY_USED, INVALID)
- failureReason, qrCodeData
- ipAddress, userAgent, createdAt

## 🔄 Flow Penggunaan

### Flow 1: Generate Voucher
```
Admin/Owner Login
    ↓
Menu Voucher
    ↓
Buat Voucher Baru
    ↓
Isi Form (Tipe, Nilai, Outlet, Jumlah)
    ↓
Generate Voucher
    ↓
Voucher muncul di Daftar Voucher
    ↓
QR Code otomatis dibuat
```

### Flow 2: Scan & Validasi Voucher
```
Operator Login
    ↓
Menu Scan QR & Settlement
    ↓
Mulai Shift
    ↓
Scan QR / Input Manual
    ↓
Sistem Validasi:
  - Voucher ada?
  - Belum digunakan?
  - Belum expired?
  - Outlet sesuai?
    ↓
SUCCESS → Update voucher USED → Buat transaksi
FAILED → Log ke voucher_redemptions → Show error
    ↓
Tutup Shift → Settlement
```

### Flow 3: Settlement Shift
```
Operator tutup shift
    ↓
Klik "Tutup Shift / Settlement"
    ↓
Sistem hitung:
  - Total transaksi
  - Total nilai
  - Daftar transaksi
    ↓
Show Summary
    ↓
Simpan Settlement
    ↓
Shift selesai
```

## 🐛 Troubleshooting

### Login Gagal

**Problem**: Tidak bisa login

**Solution**:
- Pastikan database sudah di-seed: `npm run db:seed`
- Cek email dan password di tabel users
- Reset password admin jika lupa

### Database Error

**Problem**: `SQLITE_CORRUPT` atau error database lain

**Solution**:
```bash
# Delete database file
rm data/spbu-voucher.db

# Recreate database
npm run db:push

# Reseed database
npm run db:seed
```

### QR Code Scan Tidak Berfungsi

**Problem**: Kamera tidak bisa diakses

**Solution**:
- Pastikan HTTPS (wajib untuk akses kamera)
- Izinkan akses kamera di browser
- Gunakan browser modern (Chrome, Firefox, Safari)
- Gunakan input manual sebagai alternatif

### Navigation Menu Tidak Muncul

**Problem**: Setelah login, menu navigasi hilang

**Solution**:
- Pastikan role user sesuai dengan yang di database
- Cek `components/layouts/dashboard-layout.tsx`
- Pastikan role di navigation array sesuai

## 📝 Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL=file:./data/spbu-voucher.db

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Session
BETTER_AUTH_SESSION_TOKEN_NAME=session_token
```

## 🧪 Testing

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spbu.co.id",
    "password": "password123"
  }'
```

### Test Scan Voucher

```bash
curl -X POST http://localhost:3000/api/vouchers/scan \
  -H "Content-Type: application/json" \
  -d '{
    "code": "VOU-WLYCZ2",
    "operatorId": "operator-id",
    "outletId": "outlet-id"
  }'
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get session

### Vouchers
- `GET /api/vouchers` - List all vouchers
- `POST /api/vouchers` - Create voucher
- `GET /api/vouchers/[id]` - Get voucher detail
- `POST /api/vouchers/scan` - Scan/validate voucher

### Outlets
- `GET /api/outlets` - List all outlets
- `POST /api/outlets` - Create outlet
- `GET /api/outlets/[id]` - Get outlet detail

### Transactions
- `GET /api/transactions` - List all transactions
- `GET /api/transactions/[id]` - Get transaction detail

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

- **Development**: Anfal Blank
- **Project**: SPBU Voucher Management System

## 📞 Support

Untuk pertanyaan atau support, hubungi:
- Email: support@spbu.co.id
- GitHub Issues: https://github.com/anfalblank/voucher-spbunewrev/issues

---

**Version**: 1.0.0
**Last Updated**: March 2026
