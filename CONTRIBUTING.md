# Contributing to SPBU Voucher Management System

Terima kasih atas ketertarikan Anda untuk berkontribusi pada proyek SPBU Voucher Management System!

## Cara Berkontribusi

### Melaporkan Bug

Jika Anda menemukan bug, silakan buat issue di GitHub dengan:

1. **Judul yang jelas**: Contoh: "Login fails when using special characters in password"
2. **Deskripsi detail**:
   - Langkah-langkah untuk reproduksi
   - Perilaku yang diharapkan
   - Perilaku yang sebenarnya terjadi
   - Screenshot (jika relevan)
3. **Environment**:
   - OS dan versi
   - Browser dan versi
   - Node.js versi
   - Versi aplikasi

### Menyarankan Fitur

Kami menyambut baik saran fitur! Buat issue dengan:

1. **Judul yang jelas**: Contoh: "Add bulk voucher generation"
2. **Deskripsi fitur**: Apa yang ingin Anda tambahkan
3. **Use case**: Mengapa fitur ini berguna
4. **Contoh** (jika ada): Mockup atau referensi

### Pull Request

1. **Fork repository**
   ```bash
   # Fork di GitHub, lalu clone fork Anda
   git clone https://github.com/YOUR_USERNAME/voucher-spbunewrev.git
   cd voucher-spbunewrev
   ```

2. **Buat branch baru**
   ```bash
   git checkout -b feature/your-feature-name
   # atau
   git checkout -b fix/your-bug-fix
   ```

3. **Buat perubahan**
   - Ikuti style guide yang ada
   - Tambah test untuk fitur baru
   - Update dokumentasi

4. **Commit perubahan**
   ```bash
   git add .
   git commit -m "feat: add bulk voucher generation

   - Add bulk generation feature
   - Update API endpoint
   - Add documentation

   Co-Authored-By: Your Name <your.email@example.com>"
   ```

   **Commit Message Format:**
   - `feat:` - Fitur baru
   - `fix:` - Bug fix
   - `docs:` - Perubahan dokumentasi
   - `style:` - Perubahan format kode (tidak mengubah logic)
   - `refactor:` - Refactor kode
   - `test:` - Menambah atau mengubah test
   - `chore:` - Maintenance tasks

5. **Push ke fork Anda**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Buat Pull Request**
   - Buka repository di GitHub
   - Click "New Pull Request"
   - Beri judul dan deskripsi yang jelas
   - Referensi issue terkait (jika ada): `Fixes #123`

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- Git
- Code editor (VS Code recommended)

### Setup Lokal

```bash
# Clone repository
git clone https://github.com/anfalblank/voucher-spbunewrev.git
cd voucher-spbunewrev

# Install dependencies
npm install

# Setup database
npm run db:push

# Seed database (opsional)
npm run db:seed

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Project Structure

```
voucher-spbu/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/             # Utilities & configurations
├── docs/            # Documentation
└── public/          # Static assets
```

## Coding Standards

### TypeScript

- Gunakan TypeScript untuk semua file baru
- Hindari `any` type
- Gunakan type inference
- Export types yang dibutuhkan oleh modul lain

### React Components

```typescript
// Bad
export default function Component() {
  return <div>Hello</div>
}

// Good
interface ComponentProps {
  name: string
}

export function Component({ name }: ComponentProps) {
  return <div>Hello, {name}</div>
}
```

### Database Operations

```typescript
// Bad - raw SQL
await db.run(`SELECT * FROM users WHERE email = '${email}'`)

// Good - Drizzle ORM
const users = await db.select()
  .from(usersTable)
  .where(eq(usersTable.email, email))
```

### Error Handling

```typescript
// Good
async function getVoucher(id: string) {
  try {
    const voucher = await db.query.vouchers.findFirst({
      where: eq(vouchers.id, id)
    })

    if (!voucher) {
      return { error: "Voucher not found", status: 404 }
    }

    return { data: voucher }
  } catch (error) {
    console.error("Error fetching voucher:", error)
    return { error: "Internal server error", status: 500 }
  }
}
```

## Testing

Sebelum mengirim PR, pastikan:

1. **Linting**
   ```bash
   npm run lint
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Test secara manual**
   - Login sebagai admin
   - Buat voucher baru
   - Scan voucher
   - Cek settlement

## Documentation

Update dokumentasi jika Anda:
- Menambahkan fitur baru
- Mengubah API
- Mengubah database schema
- Mengubah configuration

Dokumentasi ada di folder `docs/`:
- `API_DOCUMENTATION.md` - API reference
- `USER_GUIDE.md` - Panduan pengguna
- `ARCHITECTURE.md` - Arsitektur sistem

## Code Review

### Apa yang kami review

1. **Functionality**: Apakah kode berfungsi sesuai yang diharapkan?
2. **Code quality**: Apakah kode clean dan readable?
3. **Tests**: Apakah test sudah mencukupi?
4. **Documentation**: Apakah dokumentasi sudah di-update?
5. **Performance**: Apakah ada isu performance?

### Proses Review

1. Maintainer akan me-review PR Anda
2. Mungkin ada request changes
3. Lakukan perubahan yang diminta
4. Push changes ke branch yang sama
5. PR akan di-update otomatis

## Getting Help

Jika butuh bantuan:

1. **Documentation**: Cek folder `docs/`
2. **Issues**: Cari issue serupa di GitHub
3. **Discussions**: Buat discussion di GitHub
4. **Email**: support@spbu.co.id

## License

Dengan berkontribusi, Anda setuju bahwa kontribusi Anda akan dilisensikan di bawah MIT License.

## Recognition

Kontributor akan di-list di `README.md` dan di file `CONTRIBUTORS.md`.

Terima kasih atas kontribusi Anda! 🎉
