# Panduan Penggunaan Aplikasi

## Daftar Isi

1. [Login](#1-login)
2. [Dashboard](#2-dashboard)
3. [Manajemen Voucher](#3-manajemen-voucher)
4. [Scan QR & Settlement](#4-scan-qr--settlement)
5. [Manajemen Outlet](#5-manajemen-outlet)
6. [Manajemen Pengguna](#6-manajemen-pengguna)
7. [Laporan](#7-laporan)
8. [Riwayat Transaksi](#8-riwayat-transaksi)

---

## 1. Login

### Langkah-langkah:

1. Buka aplikasi di browser: `http://localhost:3000` atau `https://manggala.biz.id`
2. Halaman login akan muncul
3. Masukkan **email** dan **password**
4. Klik tombol **Masuk**

### Akun Default:

| Role | Email | Password | Akses Menu |
|------|-------|----------|------------|
| **Admin** | admin@spbu.co.id | password123 | Semua menu |
| **Owner** | owner@spbu.co.id | password123 | Kecuali Pengguna |
| **Operator** | operator1@spbu.co.id | password123 | Dashboard, Scan QR |

### Gambar Login:

```
┌─────────────────────────────────────┐
│      SPBU Voucher System            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Email                         │ │
│  │ ────────────────────────────  │ │
│  │                               │ │
│  │ Password                      │ │
│  │ ────────────────────────────  │ │
│  │                               │ │
│  │       [  Masuk  ]             │ │
│  └───────────────────────────────┘ │
│                                     │
│  Lupa password?                      │
└─────────────────────────────────────┘
```

---

## 2. Dashboard

### Fitur Dashboard:

Setelah login, Anda akan melihat dashboard dengan:

**Kartu Statistik:**
- Total Voucher Aktif
- Total Transaksi Hari Ini
- Total Nilai Transaksi Bulan Ini
- Total Outlet

**Filter Interaktif:**
- **Periode**: Semua, Hari Ini, Minggu Ini, Bulan Ini
- **Outlet**: Pilih outlet spesifik
- **Status**: Filter berdasarkan status voucher

**Grafik Distribusi:**
- Bar chart voucher per status
- Progress bar transaksi

### Menggunakan Filter:

1. Klik dropdown **Periode**
2. Pilih: "Hari Ini", "Minggu Ini", atau "Bulan Ini"
3. Data akan otomatis terupdate

### Refresh Data:

Klik tombol **Refresh** di pojok kanan atas untuk mendapatkan data terbaru.

---

## 3. Manajemen Voucher

### 3.1 Daftar Voucher

Untuk melihat semua voucher yang sudah diterbitkan:

1. Klik menu **Voucher** di sidebar
2. Anda akan melihat tabel dengan kolom:
   - Kode Voucher
   - Tipe (Liter/Rupiah)
   - Nilai
   - Status
   - Outlet
   - Berlaku sampai
   - Aksi

### Filter Voucher:

- **Status**: Pilih ACTIVE, USED, atau EXPIRED
- **Outlet**: Pilih outlet tertentu
- **Tipe**: Pilih LITER atau RUPIAH
- **Search**: Ketik kode voucher untuk mencari

### 3.2 Membuat Voucher Baru

**Hanya Admin dan Owner** yang bisa membuat voucher.

**Langkah-langkah:**

1. Di halaman Voucher, klik tombol **Buat Voucher Baru**
2. Form akan muncul, isi:

   ```
   Tipe Voucher:
   ○ Liter  ● Rupiah

   Nilai: [100000]

   Outlet:
   [SPBU Gatot Subroto ▼]

   Berlaku sampai:
   [31/12/2026]

   Jumlah:
   [10]
   ```

3. Klik **Buat Voucher**

4. Sistem akan membuat voucher dengan:
   - Kode unik: `VOU-XXXXXX`
   - QR Code otomatis
   - Status: ACTIVE

### 3.3 Melihat Detail Voucher

1. Di daftar voucher, klik kode voucher
2. Detail akan muncul:

   ```
   ┌──────────────────────────────────┐
   │ Detail Voucher                  │
   ├──────────────────────────────────┤
   │ Kode: VOU-WLYCZ2                 │
   │ Tipe: Liter                      │
   │ Nilai: 10 Liter                  │
   │ Status: ● Active                 │
   │                                  │
   │ Outlet: SPBU Gatot Subroto       │
   │ Dibuat: Admin SPBU               │
   │ Tanggal: 25 Mar 2026             │
   │ Expired: 31 Des 2026             │
   │                                  │
   │ [QR Code akan tampil di sini]    │
   │                                  │
   │ [ Download QR ]  [ Share ]       │
   └──────────────────────────────────┘
   ```

---

## 4. Scan QR & Settlement

**Hanya Operator** yang menggunakan menu ini untuk scan voucher di lapangan.

### 4.1 Memulai Shift

**Langkah-langkah:**

1. Klik menu **Scan QR & Settlement**
2. Klik tombol **Mulai Shift**
3. Sistem akan mencatat:
   - Waktu mulai: `25 Mar 2026, 08:00`
   - Outlet: `SPBU Gatot Subroto`
   - Operator: `Ahmad`

4. Status shift akan muncul:

   ```
   ┌──────────────────────────────────┐
   │ Shift Aktif                      │
   │ Mulai: 08:00                     │
   │ Outlet: SPBU Gatot Subroto       │
   │ Operator: Ahmad                  │
   │                                  │
   │ Transaksi: 0                     │
   │ Total: Rp 0                      │
   └──────────────────────────────────┘
   ```

### 4.2 Scan Voucher

**Metode 1: Scan QR Code**

1. Klik tombol **Scan QR Code**
2. Izinkan akses kamera (required)
3. Arahkan kamera ke QR Code pada voucher
4. Sistem akan otomatis:
   - Mendeteksi QR Code
   - Validasi voucher
   - Tampilkan hasil

**Metode 2: Input Manual**

1. Masukkan kode voucher di field input
2. Klik **Validasi**
3. Hasil akan muncul

### Hasil Scan:

**✅ SUCCESS**
```
┌──────────────────────────────────┐
│ Voucher Berhasil!                │
│                                  │
│ Kode: VOU-WLYCZ2                 │
│ Nilai: 10 Liter                  │
│                                  │
│ Voucher telah digunakan          │
│ Transaksi tersimpan              │
│                                  │
│ [ OK ]                           │
└──────────────────────────────────┘
```

**❌ ALREADY USED**
```
┌──────────────────────────────────┐
│ Voucher Sudah Digunakan!         │
│                                  │
│ Kode: VOU-WLYCZ2                 │
│ Digunakan: 24 Mar 2026, 15:30    │
│ Operator: Budi                   │
│ Outlet: SPBU Sudirman            │
│                                  │
│ [ OK ]                           │
└──────────────────────────────────┘
```

**❌ EXPIRED**
```
┌──────────────────────────────────┐
│ Voucher Kadaluarsa!              │
│                                  │
│ Kode: VOU-WLYCZ2                 │
│ Expired: 20 Mar 2026             │
│                                  │
│ [ OK ]                           │
└──────────────────────────────────┘
```

**❌ INVALID**
```
┌──────────────────────────────────┐
│ Voucher Tidak Ditemukan!         │
│                                  │
│ Kode: VOU-XXXXXX                 │
│                                  │
│ Pastikan kode voucher benar       │
│                                  │
│ [ OK ]                           │
└──────────────────────────────────┘
```

### 4.3 Tracking Shift

Selama shift aktif, sistem menampilkan:

**Real-time Counter:**
- Total transaksi: `5 voucher`
- Total nilai: `Rp 500.000`
- Durasi: `2 jam 30 menit`

**Daftar Transaksi:**
```
┌────────────────────────────────────┐
│ Transaksi Shift                    │
├────────────────────────────────────┤
│ VOU-WLYC2 | 10 Liter | 10:30      │
│ VOU-XYZ123 | Rp 50.000 | 10:45    │
│ VOU-ABC456 | 5 Liter | 11:00      │
│ VOU-DEF789 | Rp 75.000 | 11:30    │
│ VOU-GHI012 | 15 Liter | 12:00     │
└────────────────────────────────────┘
```

### 4.4 Settlement Shift

**Langkah-langkah:**

1. Klik tombol **Tutup Shift / Settlement**
2. Summary akan muncul:

   ```
   ┌──────────────────────────────────┐
   │ SETTLEMENT SHIFT                 │
   │                                  │
   │ Outlet: SPBU Gatot Subroto       │
   │ Operator: Ahmad                  │
   │                                  │
   │ Mulai: 08:00                     │
   │ Selesai: 17:00                   │
   │ Durasi: 9 jam                    │
   │                                  │
   │ Total Transaksi: 5 voucher       │
   │ Total Nilai: Rp 500.000          │
   │                                  │
   │ Rincian:                         │
   │ - 10 Liter x 2 = Rp 200.000      │
   │ - Rp 50.000 x 1 = Rp 50.000      │
   │ - 5 Liter x 1 = Rp 50.000        │
   │ - Rp 75.000 x 1 = Rp 75.000      │
   │ - 15 Liter x 1 = Rp 150.000      │
   │                                  │
   │ [ Download PDF ]  [ Email ]      │
   │                                  │
   │ [ Simpan Settlement ]            │
   └──────────────────────────────────┘
   ```

3. Klik **Simpan Settlement**
4. Shift akan ditutup dan data tersimpan

---

## 5. Manajemen Outlet

**Hanya Admin dan Owner** yang bisa mengelola outlet.

### 5.1 Daftar Outlet

1. Klik menu **Outlet SPBU**
2. Tabel akan menampilkan:
   - Nama Outlet
   - Alamat
   - Telepon
   - Manager
   - Total Voucher
   - Total Transaksi
   - Aksi (Edit, Hapus)

### 5.2 Tambah Outlet Baru

1. Klik tombol **Tambah Outlet**
2. Isi form:

   ```
   Nama Outlet: [SPBU Baru]

   Alamat Lengkap:
   [Jl. Contoh No. 123, Jakarta]

   Latitude: [-6.2000]
   Longitude: [106.8500]

   Telepon: [021-87654321]

   Manager: [Ahmad Yani]
   ```

3. Klik **Simpan**

### 5.3 Edit Outlet

1. Di daftar outlet, klik tombol **Edit**
2. Ubah data yang diperlukan
3. Klik **Update**

### 5.4 Hapus Outlet

1. Di daftar outlet, klik tombol **Hapus**
2. Konfirmasi penghapusan
3. ⚠️ **Perhatian**: Outlet yang sudah memiliki voucher/transaksi tidak bisa dihapus

---

## 6. Manajemen Pengguna

**Hanya Admin** yang bisa mengelola pengguna.

### 6.1 Daftar Pengguna

1. Klik menu **Pengguna**
2. Tabel akan menampilkan:
   - Nama
   - Email
   - Role (Badge)
   - Outlet (jika operator)
   - Status
   - Terdaftar
   - Aksi

### Filter Pengguna:

- **Role**: Admin, Owner, Operator
- **Status**: Active, Inactive
- **Search**: Cari nama atau email

### 6.2 Tambah Pengguna

1. Klik tombol **Tambah Pengguna**
2. Isi form:

   ```
   Nama Lengkap: [Budi Santoso]

   Email: [budi@spbu.co.id]

   Password: [••••••••]

   Role:
   ○ Admin
   ○ Owner
   ● Operator

   Outlet (untuk Operator):
   [SPBU Gatot Subroto ▼]
   ```

3. Klik **Simpan**

### 6.3 Edit Pengguna

1. Di daftar pengguna, klik **Edit**
2. Ubah data:
   - Nama
   - Role
   - Outlet
   - Status (Active/Inactive)
3. Klik **Update**

### 6.4 Reset Password

1. Di daftar pengguna, klik **Reset Password**
2. Masukkan password baru
3. Klik **Reset**

---

## 7. Laporan

**Admin dan Owner** bisa mengakses laporan.

### Jenis Laporan:

1. **Laporan Voucher**
   - Total voucher dibuat
   - Voucher aktif, digunakan, expired
   - Distribusi per outlet

2. **Laporan Transaksi**
   - Total transaksi
   - Nilai transaksi
   - Tren harian/mingguan/bulanan

3. **Laporan Outlet**
   - Performa per outlet
   - Top 5 outlet
   - Outlet terendah

### Menggunakan Filter Laporan:

1. Pilih **Jenis Laporan**
2. Pilih **Periode**:
   - Hari Ini
   - Minggu Ini
   - Bulan Ini
   - Custom Range
3. Pilih **Outlet** (opsional)
4. Klik **Generate**

### Export Laporan:

- **Export CSV**: Unduh dalam format CSV
- **Export PDF**: Unduh dalam format PDF
- **Print**: Cetak laporan

---

## 8. Riwayat Transaksi

### Melihat Transaksi:

1. Klik menu **Transaksi**
2. Tabel menampilkan:
   - ID Transaksi
   - Kode Voucher
   - Tipe & Nilai
   - Outlet
   - Operator
   - Waktu
   - Status

### Filter Transaksi:

- **Periode**: Hari ini, Minggu ini, Bulan ini
- **Outlet**: Pilih outlet
- **Status**: Completed, Failed, Pending
- **Search**: Cari kode voucher atau ID

### Detail Transaksi:

Klik transaksi untuk melihat detail:

```
┌──────────────────────────────────┐
│ Detail Transaksi                 │
├──────────────────────────────────┤
│ ID: TRX-12345                    │
│ Voucher: VOU-WLYCZ2              │
│ Nilai: 10 Liter                  │
│                                  │
│ Outlet: SPBU Gatot Subroto       │
│ Operator: Ahmad                  │
│                                  │
│ Waktu: 25 Mar 2026, 10:30        │
│ Status: ✅ Completed             │
│                                  │
│ Tanggal Scan: 25 Mar 2026        │
│ IP: 192.168.1.1                  │
│ User Agent: Chrome/120           │
│                                  │
│ [ Print ]  [ Download PDF ]      │
└──────────────────────────────────┘
```

---

## Tips & Tricks

### Untuk Admin:
1. Generate voucher dalam batch untuk efisiensi
2. Set expiry date yang wajar (1-6 bulan)
3. Monitor penggunaan voucher secara berkala
4. Review settlement operator harian

### Untuk Owner:
1. Pantau performa outlet via dashboard
2. Generate voucher per outlet untuk tracking
3. Export laporan bulanan untuk analisis
4. Review top performing outlets

### Untuk Operator:
1. Selalu mulai shift sebelum operasional
2. Scan QR di tempat yang pencahayaan cukup
3. Gunakan input manual jika QR sulit terbaca
4. Selalu lakukan settlement sebelum pulang
5. Pastikan kamera bersih untuk scan QR

### Troubleshooting:

**QR Code tidak terbaca:**
- Pastikan pencahayaan cukup
- Jaga jarak 10-20 cm dari QR
- Gunakan input manual sebagai alternatif

**Login gagal:**
- Cek email dan password
- Pastikan akun aktif
- Hubungi admin untuk reset password

**Voucher invalid:**
- Pastikan kode benar (6 karakter setelah VOU-)
- Cek status voucher di menu Voucher
- Hubungi admin untuk verifikasi

---

## Support

Jika mengalami masalah:
- 📧 Email: support@spbu.co.id
- 📱 WhatsApp: +62 812-3456-7890
- 📚 Dokumentasi: [README.md](../README.md)

---

**Versi Dokumen**: 1.0
**Terakhir Update**: 25 Maret 2026
