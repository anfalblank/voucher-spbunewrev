# API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://manggala.biz.id/api
```

## Authentication

Most endpoints require authentication. Include session token in cookies or Authorization header.

```bash
# Using cookies
curl -X GET http://localhost:3000/api/vouchers \
  --cookies "session_token=your-session-token"

# Using Authorization header
curl -X GET http://localhost:3000/api/vouchers \
  -H "Authorization: Bearer your-session-token"
```

---

## Authentication Endpoints

### Sign In / Login

Login dengan email dan password.

```http
POST /auth/sign-in/email
Content-Type: application/json

{
  "email": "admin@spbu.co.id",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user-id",
    "name": "Admin SPBU",
    "email": "admin@spbu.co.id",
    "role": "ADMIN",
    "outletId": null
  },
  "session": "session-token"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Invalid email or password"
}
```

### Sign Out / Logout

Logout dari sesi saat ini.

```http
POST /auth/sign-out
```

**Response (200 OK):**
```json
{
  "success": true
}
```

### Get Session

Mendapatkan informasi sesi saat ini.

```http
GET /auth/session
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user-id",
    "name": "Admin SPBU",
    "email": "admin@spbu.co.id",
    "role": "ADMIN"
  }
}
```

---

## Voucher Endpoints

### List All Vouchers

Mendapatkan daftar semua voucher.

```http
GET /vouchers
```

**Query Parameters:**
- `status` (optional): Filter by status (ACTIVE, USED, EXPIRED)
- `outletId` (optional): Filter by outlet ID
- `type` (optional): Filter by type (LITER, RUPIAH)

**Example:**
```bash
curl -X GET "http://localhost:3000/api/vouchers?status=ACTIVE&outletId=outlet-123"
```

**Response (200 OK):**
```json
{
  "success": true,
  "vouchers": [
    {
      "id": "voucher-id",
      "code": "VOU-WLYCZ2",
      "type": "LITER",
      "value": 10,
      "status": "ACTIVE",
      "expiryDate": "2026-12-31T23:59:59.000Z",
      "outletId": "outlet-id",
      "outletName": "SPBU Gatot Subroto",
      "createdBy": "admin-id",
      "creatorName": "Admin SPBU",
      "createdAt": "2026-03-25T10:00:00.000Z",
      "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/..."
    }
  ],
  "total": 10
}
```

### Create Voucher

Membuat voucher baru (Admin & Owner only).

```http
POST /vouchers
Content-Type: application/json

{
  "type": "LITER",
  "value": 10,
  "outletId": "outlet-id",
  "expiryDate": "2026-12-31",
  "quantity": 5
}
```

**Request Body:**
- `type` (string, required): Tipe voucher ("LITER" atau "RUPIAH")
- `value` (number, required): Nilai voucher (liter atau rupiah)
- `outletId` (string, required): ID outlet tujuan
- `expiryDate` (string, required): Tanggal expired (YYYY-MM-DD)
- `quantity` (number, required): Jumlah voucher yang akan dibuat

**Response (201 Created):**
```json
{
  "success": true,
  "vouchers": [
    {
      "id": "new-voucher-id",
      "code": "VOU-ABC123",
      "type": "LITER",
      "value": 10,
      "status": "ACTIVE",
      "expiryDate": "2026-12-31T23:59:59.000Z",
      "outletId": "outlet-id",
      "createdBy": "user-id",
      "createdAt": "2026-03-25T10:00:00.000Z",
      "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/..."
    }
  ],
  "count": 1
}
```

### Get Voucher Detail

Mendapatkan detail voucher berdasarkan ID.

```http
GET /vouchers/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "voucher": {
    "id": "voucher-id",
    "code": "VOU-WLYCZ2",
    "type": "LITER",
    "value": 10,
    "status": "ACTIVE",
    "expiryDate": "2026-12-31T23:59:59.000Z",
    "outletId": "outlet-id",
    "outlet": {
      "id": "outlet-id",
      "name": "SPBU Gatot Subroto",
      "address": "Jl. Gatot Subroto No. 1"
    },
    "createdBy": "admin-id",
    "creator": {
      "id": "admin-id",
      "name": "Admin SPBU"
    },
    "createdAt": "2026-03-25T10:00:00.000Z",
    "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/..."
  }
}
```

**Error (404 Not Found):**
```json
{
  "error": "Voucher not found"
}
```

### Scan/Validate Voucher

Validasi voucher yang di-scan atau di-input manual.

```http
POST /vouchers/scan
Content-Type: application/json

{
  "code": "VOU-WLYCZ2",
  "operatorId": "operator-id",
  "outletId": "outlet-id"
}
```

**Request Body:**
- `code` (string, required): Kode voucher
- `operatorId` (string, required): ID operator yang melakukan scan
- `outletId` (string, required): ID outlet tempat scan

**Response (200 OK - Success):**
```json
{
  "success": true,
  "message": "Voucher berhasil digunakan",
  "data": {
    "voucher": {
      "id": "voucher-id",
      "code": "VOU-WLYCZ2",
      "type": "LITER",
      "value": 10
    },
    "transactionId": "transaction-id",
    "scannedAt": "2026-03-25T10:30:00.000Z"
  }
}
```

**Response (400 Bad Request - Already Used):**
```json
{
  "success": false,
  "message": "Voucher sudah digunakan",
  "error": "ALREADY_USED",
  "data": {
    "voucher": {
      "id": "voucher-id",
      "code": "VOU-WLYCZ2",
      "usedAt": "2026-03-24T15:30:00.000Z"
    }
  }
}
```

**Response (400 Bad Request - Expired):**
```json
{
  "success": false,
  "message": "Voucher sudah kadaluarsa",
  "error": "EXPIRED",
  "data": {
    "voucher": {
      "code": "VOU-WLYCZ2",
      "expiryDate": "2026-03-20T23:59:59.000Z"
    }
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Voucher tidak ditemukan",
  "error": "INVALID"
}
```

---

## Outlet Endpoints

### List All Outlets

Mendapatkan daftar semua outlet.

```http
GET /outlets
```

**Response (200 OK):**
```json
{
  "success": true,
  "outlets": [
    {
      "id": "outlet-id",
      "name": "SPBU Gatot Subroto",
      "address": "Jl. Gatot Subroto No. 1, Jakarta",
      "latitude": -6.2088,
      "longitude": 106.8456,
      "phone": "021-12345678",
      "manager": "Budi Santoso",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Outlet

Membuat outlet baru (Admin & Owner only).

```http
POST /outlets
Content-Type: application/json

{
  "name": "SPBU Baru",
  "address": "Jl. Contoh No. 123",
  "latitude": -6.2000,
  "longitude": 106.8500,
  "phone": "021-87654321",
  "manager": "Ahmad Yani"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "outlet": {
    "id": "new-outlet-id",
    "name": "SPBU Baru",
    "address": "Jl. Contoh No. 123",
    "latitude": -6.2000,
    "longitude": 106.8500,
    "phone": "021-87654321",
    "manager": "Ahmad Yani",
    "createdAt": "2026-03-25T10:00:00.000Z"
  }
}
```

---

## Transaction Endpoints

### List All Transactions

Mendapatkan daftar semua transaksi.

```http
GET /transactions
```

**Query Parameters:**
- `outletId` (optional): Filter by outlet ID
- `status` (optional): Filter by status (COMPLETED, FAILED, PENDING)
- `startDate` (optional): Filter start date
- `endDate` (optional): Filter end date

**Example:**
```bash
curl -X GET "http://localhost:3000/api/transactions?outletId=outlet-123&status=COMPLETED"
```

**Response (200 OK):**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "transaction-id",
      "voucherId": "voucher-id",
      "voucherCode": "VOU-WLYCZ2",
      "voucherType": "LITER",
      "amount": 10,
      "outletId": "outlet-id",
      "outletName": "SPBU Gatot Subroto",
      "userId": "operator-id",
      "userName": "Ahmad Operator",
      "transactionDate": "2026-03-25T10:30:00.000Z",
      "status": "COMPLETED"
    }
  ],
  "total": 50
}
```

---

## Dashboard Endpoints

### Get Dashboard Statistics

Mendapatkan statistik dashboard.

```http
GET /dashboard/stats
```

**Query Parameters:**
- `period` (optional): Filter period (all, today, week, month)
- `outletId` (optional): Filter by outlet ID

**Example:**
```bash
curl -X GET "http://localhost:3000/api/dashboard/stats?period=today&outletId=outlet-123"
```

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalVouchers": 100,
    "activeVouchers": 60,
    "usedVouchers": 30,
    "expiredVouchers": 10,
    "totalTransactions": 30,
    "totalAmount": 300,
    "todayTransactions": 5,
    "todayAmount": 50,
    "monthTransactions": 25,
    "monthAmount": 250
  }
}
```

---

## User Endpoints

### List All Users

Mendapatkan daftar semua pengguna (Admin only).

```http
GET /users
```

**Query Parameters:**
- `role` (optional): Filter by role (ADMIN, OWNER, OPERATOR)
- `outletId` (optional): Filter by outlet ID

**Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "id": "user-id",
      "name": "Admin SPBU",
      "email": "admin@spbu.co.id",
      "role": "ADMIN",
      "outletId": null,
      "outletName": null,
      "emailVerified": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "operator-id",
      "name": "Ahmad Operator",
      "email": "operator1@spbu.co.id",
      "role": "OPERATOR",
      "outletId": "outlet-id",
      "outletName": "SPBU Gatot Subroto",
      "emailVerified": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create User

Membuat pengguna baru (Admin only).

```http
POST /users
Content-Type: application/json

{
  "name": "Budi Operator",
  "email": "budi@spbu.co.id",
  "password": "password123",
  "role": "OPERATOR",
  "outletId": "outlet-id"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "new-user-id",
    "name": "Budi Operator",
    "email": "budi@spbu.co.id",
    "role": "OPERATOR",
    "outletId": "outlet-id",
    "emailVerified": false,
    "createdAt": "2026-03-25T10:00:00.000Z"
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per IP
- 1000 requests per hour per IP

If rate limit is exceeded:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## SDK Examples

### JavaScript/Node.js

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3000/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@spbu.co.id',
      password: 'password123'
    })
  })
  const data = await response.json()
  return data.session
}

// Get vouchers
const getVouchers = async (sessionToken) => {
  const response = await fetch('http://localhost:3000/api/vouchers', {
    headers: {
      'Cookie': `session_token=${sessionToken}`
    }
  })
  return await response.json()
}

// Create voucher
const createVoucher = async (sessionToken, voucherData) => {
  const response = await fetch('http://localhost:3000/api/vouchers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `session_token=${sessionToken}`
    },
    body: JSON.stringify(voucherData)
  })
  return await response.json()
}
```

---

## Testing

Use the provided test accounts:

```bash
# Admin Login
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spbu.co.id","password":"password123"}'

# Get vouchers with admin session
curl -X GET http://localhost:3000/api/vouchers \
  --cookies "session_token=YOUR_ADMIN_SESSION_TOKEN"
```

---

For more information, see the main [README.md](../README.md)
