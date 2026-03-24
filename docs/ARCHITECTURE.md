# System Architecture

## Overview

SPBU Voucher Management System is a full-stack web application built with Next.js 14, featuring role-based access control, real-time voucher scanning, and shift-based settlement for operators.

## Tech Stack

### Frontend
- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Icons**: Lucide React
- **QR Code**: html5-qrcode

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Authentication**: better-auth 1.5.6

### Database
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit

### DevOps
- **Version Control**: Git
- **Hosting**: Vercel / Sumopod
- **CI/CD**: GitHub Actions (optional)

## Project Structure

```
voucher-spbu/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── layout.tsx
│   ├── dashboard/                # Dashboard routes (protected)
│   │   ├── page.tsx             # Dashboard overview
│   │   ├── vouchers/            # Voucher management
│   │   ├── sites/               # Outlet management
│   │   ├── transactions/        # Transaction history
│   │   ├── reports/             # Reports
│   │   ├── users/               # User management
│   │   ├── scan/                # QR Scan & Settlement
│   │   └── layout.tsx           # Dashboard layout
│   ├── api/                     # API routes
│   │   ├── auth/               # Auth endpoints
│   │   ├── vouchers/           # Voucher endpoints
│   │   ├── outlets/            # Outlet endpoints
│   │   ├── transactions/       # Transaction endpoints
│   │   ├── users/              # User endpoints
│   │   └── dashboard/          # Dashboard stats
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
│
├── components/                  # React components
│   ├── ui/                     # Base UI components
│   ├── layouts/                # Layout components
│   └── dashboard/              # Dashboard-specific components
│
├── lib/                        # Utilities & configurations
│   ├── db/                     # Database
│   │   ├── schema.ts          # Database schema
│   │   ├── seed.ts            # Database seeding
│   │   └── index.ts           # Database connection
│   └── auth.ts                # Authentication config
│
├── public/                     # Static assets
│   └── images/
│
├── docs/                       # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── USER_GUIDE.md
│   └── ARCHITECTURE.md
│
├── data/                       # Database files (local)
│   └── spbu-voucher.db
│
└── [config files]             # Package.json, tsconfig, etc.
```

## Database Architecture

### Schema Design

```
┌─────────────┐         ┌─────────────┐
│   USERS     │         │   OUTLETS   │
├─────────────┤         ├─────────────┤
│ id          │    ┌───│ id          │
│ name        │    │   │ name        │
│ email       │    │   │ address     │
│ password    │    │   │ latitude    │
│ role        │    │   │ longitude   │
│ outletId    │────┘   │ phone       │
│ createdAt   │         │ manager     │
└─────────────┘         │ createdAt   │
                       └─────────────┘
                              │
                              │ 1
                              │
                              │ N
┌─────────────┐         ┌─────────────┐
│  VOUCHERS   │         │TRANSACTIONS │
├─────────────┤         ├─────────────┤
│ id          │         │ id          │
│ code        │         │ voucherId   │───┐
│ type        │         │ userId      │   │
│ value       │         │ outletId    │   │
│ status      │         │ amount      │   │
│ expiryDate  │         │ status      │   │
│ outletId    │─────┐   │ date        │   │
│ createdBy   │     │   │ createdAt   │   │
│ qrCodeUrl   │     │   └─────────────┘   │
│ createdAt   │     │                      │
└─────────────┘     │                      │
                    │ N                    │ 1
                    │                      │
┌─────────────────────────────┐           │
│    VOUCHER_REDEMPTIONS      │           │
├─────────────────────────────┤           │
│ id                          │           │
│ voucherId                   │───────────┘
│ transactionId               │
│ outletId                    │
│ operatorId                  │
│ status                      │
│ failureReason               │
│ qrCodeData                  │
│ ipAddress                   │
│ userAgent                   │
│ createdAt                   │
└─────────────────────────────┘
```

### Relationships

1. **USERS → OUTLETS** (Many-to-One)
   - Operator belongs to one outlet
   - Outlet has many operators

2. **OUTLETS → VOUCHERS** (One-to-Many)
   - Voucher belongs to one outlet
   - Outlet has many vouchers

3. **USERS → VOUCHERS** (One-to-Many)
   - Voucher created by one user
   - User creates many vouchers

4. **VOUCHERS → TRANSACTIONS** (One-to-One)
   - Voucher has one transaction when used
   - Transaction belongs to one voucher

5. **TRANSACTIONS → USERS/OUTLETS** (Many-to-One)
   - Transaction recorded by one user at one outlet
   - User/Outlet has many transactions

6. **VOUCHERS → VOUCHER_REDEMPTIONS** (One-to-Many)
   - Voucher can have many redemption attempts
   - Each scan attempt is logged

### Indexes

For optimal query performance, indexes are created on:
- `vouchers.code` (unique)
- `vouchers.outletId`
- `vouchers.status`
- `transactions.userId`
- `transactions.outletId`
- `voucherRedemptions.voucherId`
- `users.email` (unique)

## Authentication Flow

### better-auth Integration

```
┌──────────┐         ┌────────────┐         ┌──────────┐
│  Client  │         │ Next.js    │         │ Database │
└──────────┘         └────────────┘         └──────────┘
     │                      │                      │
     │ 1. POST /login       │                      │
     │─────────────────────>│                      │
     │                      │ 2. Query user        │
     │                      │-------------------->│
     │                      │ 3. Return user       │
     │                      │<--------------------│
     │                      │ 4. Verify password   │
     │                      │ 5. Create session    │
     │                      │-------------------->│
     │ 6. Set session cookie │                     │
     │<─────────────────────│                      │
     │ 7. Redirect dashboard │                     │
     │<─────────────────────│                      │
```

### Session Management

- Session stored in HTTP-only cookie
- Session token: 32 characters random string
- Session expiry: 7 days (configurable)
- Auto-refresh on activity

### Role-Based Access Control (RBAC)

Roles are checked at:
1. **Server-side**: API routes and page loaders
2. **Client-side**: Navigation menu visibility

```typescript
// Example: API route protection
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers
  })

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Proceed with admin-only logic
}
```

## API Architecture

### Route Structure

```
/api
├── /auth
│   ├── /sign-in/email     # POST - Login
│   └── /sign-out          # POST - Logout
│
├── /vouchers
│   ├── /                  # GET - List, POST - Create
│   ├── /[id]              # GET - Detail
│   └── /scan              # POST - Scan/validate
│
├── /outlets
│   ├── /                  # GET - List, POST - Create
│   └── /[id]              # GET - Detail, PUT - Update, DELETE
│
├── /transactions
│   └── /                  # GET - List with filters
│
├── /users
│   ├── /                  # GET - List, POST - Create
│   └── /[id]              # GET - Detail, PUT - Update, DELETE
│
└── /dashboard
    └── /stats             # GET - Dashboard statistics
```

### Request/Response Pattern

All API endpoints follow this pattern:

```typescript
// Success Response
{
  success: true,
  data: { ... },
  message: "Optional message"
}

// Error Response
{
  success: false,
  error: "Error message",
  details: "Additional details"
}
```

## Voucher Lifecycle

### State Diagram

```
┌─────────┐
│ CREATED │
└────┬────┘
     │
     ▼
┌─────────┐     Scan Success      ┌────────┐
│  ACTIVE │──────────────────────>│  USED  │
└────┬────┘                        └────────┘
     │                                  │
     │ Scan Failed                      │
     │ Expired                          │
     ▼                                  │
┌─────────┐                            │
│ EXPIRED │<───────────────────────────┘
└─────────┘
```

### QR Code Generation

QR codes are generated using `qrcode` library:

```typescript
import QRCode from 'qrcode'

const qrCodeUrl = await QRCode.toDataURL(
  `VOU-${voucher.code}`,
  {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }
)
```

### Scan & Validation Flow

```
┌──────────┐
│ Operator │
└────┬─────┘
     │ Scan QR / Input Code
     ▼
┌────────────────┐
│ API: /vouchers │
│    /scan       │
└────┬───────────┘
     │
     ▼
┌────────────────────────┐
│ 1. Check voucher exists│
│    in database         │
└────┬───────────────────┘
     │ No                        Yes
     ▼                           ▼
┌────────────┐         ┌────────────────┐
│ Return     │         │ 2. Check if    │
│ INVALID    │         │    already used│
└────────────┘         └────┬───────────┘
                            │ No         Yes
                            ▼            ▼
                     ┌────────────┐  ┌─────────────┐
                     │ 3. Check   │  │ Return      │
                     │   expired  │  │ ALREADY_USED│
                     └────┬───────┘  └─────────────┘
                          │ No        Yes
                          ▼           ▼
                   ┌────────────┐ ┌─────────────┐
                   │ 4. Check   │ │ Return      │
                   │ outlet     │ │ EXPIRED     │
                   └────┬───────┘ └─────────────┘
                        │ Valid    Invalid
                        ▼          ▼
                 ┌────────────┐ ┌─────────────┐
                 │ 5. Update  │ │ Return      │
                 │ voucher    │ │ WRONG_OUTLET│
                 │ USED +     │ └─────────────┘
                 │ create     │
                 │ transaction│
                 └─────┬──────┘
                       │
                       ▼
              ┌────────────────┐
              │ Return SUCCESS │
              └────────────────┘
```

All scan attempts are logged to `voucherRedemptions` table for audit trail.

## Shift & Settlement System

### Shift Data Structure

```typescript
interface ShiftData {
  id: string
  operatorId: string
  operatorName: string
  outletId: string
  outletName: string
  startTime: Date
  endTime?: Date
  status: 'ACTIVE' | 'CLOSED'
  transactions: ShiftTransaction[]
}

interface ShiftTransaction {
  id: string
  voucherCode: string
  voucherType: string
  value: number
  timestamp: Date
}
```

### Settlement Flow

```
┌──────────┐
│ Operator │
└────┬─────┘
     │ Click "Tutup Shift"
     ▼
┌────────────────────┐
│ 1. Calculate totals│
│    - Count         │
│    - Amount        │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ 2. Show summary    │
│    - By type       │
│    - By value      │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ 3. User confirms   │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ 4. Save settlement │
│    - Close shift   │
│    - Archive data  │
└────────────────────┘
```

## Frontend Architecture

### Component Structure

```
DashboardLayout
├── Sidebar
│   ├── Logo
│   ├── Navigation (role-based)
│   └── User Menu
└── Main Content
    ├── Header
    │   ├── Breadcrumbs
    │   └── User Info
    └── Page Content
        └── [Page Components]
```

### State Management

- **Client State**: React useState, useEffect
- **Server State**: Next.js Server Components
- **Session**: better-auth hooks

### Data Fetching Patterns

```typescript
// Server Component (default)
async function VouchersPage() {
  const vouchers = await db.select().from(vouchers)
  return <VoucherList vouchers={vouchers} />
}

// Client Component with fetch
'use client'
function VoucherList() {
  const [vouchers, setVouchers] = useState([])

  useEffect(() => {
    fetch('/api/vouchers')
      .then(res => res.json())
      .then(data => setVouchers(data.vouchers))
  }, [])

  return <div>{/* render vouchers */}</div>
}
```

## Security

### Authentication Security

1. **Password Hashing**: bcrypt with salt rounds = 10
2. **Session Security**: HTTP-only, secure cookies
3. **CSRF Protection**: built-in with better-auth
4. **Rate Limiting**: API endpoint throttling

### Authorization

1. **Role-Based Middleware**: API route protection
2. **Outlet Validation**: Vouchers restricted to assigned outlets
3. **Audit Logging**: All actions logged with IP/user agent

### Data Protection

1. **SQL Injection**: Prevented by Drizzle ORM parameterized queries
2. **XSS**: React escapes output by default
3. **Environment Variables**: Sensitive data in .env files

## Performance Optimization

### Database

1. **Indexes**: On frequently queried columns
2. **Connection Pooling**: Managed by better-sqlite3
3. **Query Optimization**: Selective column retrieval

### Frontend

1. **Code Splitting**: Automatic with Next.js
2. **Image Optimization**: Next.js Image component
3. **Lazy Loading**: Route-based splitting
4. **Caching**: API response caching

### Monitoring

Recommended tools:
- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics / Plausible
- **Performance**: Lighthouse / WebPageTest

## Deployment Architecture

### Development
```
Local Machine
├── Next.js Dev Server (port 3000)
├── SQLite Database (local file)
└── Hot Module Replacement
```

### Production (Sumopod)
```
Sumopod Server
├── Node.js 20.x
├── Next.js Production Build
├── PM2 / Node Process Manager
├── SQLite Database (server file)
└── Nginx Reverse Proxy (HTTPS)
```

### Production (Vercel)
```
Vercel Platform
├── Edge Network
├── Serverless Functions
├── PostgreSQL (Vercel Postgres)
└── Automatic HTTPS
```

## Scalability Considerations

### Current Design Supports
- Up to 10,000 vouchers
- Up to 1,000 outlets
- Up to 500 operators
- Up to 100 concurrent users

### For Larger Scale
1. **Database**: Migrate to PostgreSQL
2. **Caching**: Add Redis for session/cache
3. **CDN**: Serve static assets via CDN
4. **Load Balancer**: Multiple app servers
5. **Read Replicas**: Separate read/write databases

## Monitoring & Logging

### Application Logs
- Request logs: API calls, response times
- Error logs: Exceptions, stack traces
- Audit logs: User actions, data changes

### Database Logs
- Query performance
- Connection pool status
- Transaction logs

### Recommended Tools
- **Logging**: Winston / Pino
- **Monitoring**: Datadog / New Relic
- **Uptime**: UptimeRobot / Pingdom

## Testing Strategy

### Unit Tests
- Business logic functions
- Utility functions
- Data transformations

### Integration Tests
- API endpoints
- Database operations
- Authentication flow

### E2E Tests
- User workflows
- Critical paths (login, scan, settlement)

### Recommended Tools
- **Unit**: Jest / Vitest
- **E2E**: Playwright / Cypress
- **API Testing**: Postman / Insomnia

## Future Enhancements

### Planned Features
1. **Real-time Notifications**: WebSocket for instant updates
2. **Mobile App**: React Native for operators
3. **Advanced Analytics**: Power BI / Metabase integration
4. **SMS Notifications**: Twilio for customer notifications
5. **Multi-currency**: Support for different currencies
6. **API Rate Limiting**: Per-user rate limits
7. **Export Scheduling**: Automated report generation
8. **Audit Dashboard**: Admin audit log viewer

### Technical Improvements
1. **Microservices**: Separate voucher service
2. **Event Sourcing**: For transaction history
3. **CQRS**: Separate read/write models
4. **GraphQL**: Alternative to REST API
5. **Containerization**: Docker deployment

---

**Document Version**: 1.0
**Last Updated**: March 2026
**Maintainer**: Development Team
