# Todo App — Project Documentation

> Dokumen ini mencakup spesifikasi aplikasi, environment setup, proses development lokal, deployment ke production, serta issue yang ditemui beserta penyelesaiannya.

---

## 1. Spesifikasi Aplikasi

### Overview
Aplikasi Todo List full-stack berbasis web yang memungkinkan pengguna mengelola tugas harian dengan fitur autentikasi, manajemen todo, dan ekspor data.

### Fitur
| Fitur | Deskripsi |
|-------|-----------|
| Register | Daftar akun baru dengan nama, email, dan password |
| Login | Autentikasi menggunakan email dan password |
| JWT Auth | Setiap request API dilindungi dengan JSON Web Token |
| Create Todo | Tambah todo dengan judul, deskripsi, prioritas, status, dan tenggat waktu |
| Read Todo | Lihat semua todo milik user yang sedang login |
| Update Todo | Edit judul, deskripsi, status, prioritas, dan tenggat waktu |
| Delete Todo | Hapus todo |
| Filter & Search | Filter berdasarkan status dan prioritas, pencarian berdasarkan judul/deskripsi |
| Export CSV | Download semua todo dalam format CSV |
| Dashboard Stats | Ringkasan jumlah todo per status (Total, Pending, Dalam Proses, Selesai) |

### Tech Stack
| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite 5, TailwindCSS 3, React Router v6, Axios |
| Backend | Node.js v24, Express 4 |
| Database | PostgreSQL (production), sql.js / SQLite (development awal) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Notifikasi | react-hot-toast |
| Hosting | Railway.app |
| Version Control | GitHub |

---

## 2. Struktur Project

```
todo-app/
├── .gitignore
├── README.md
├── DOCUMENTATION.md
├── backend/
│   ├── .env                        # Environment variables (tidak di-commit)
│   ├── package.json
│   ├── Procfile                    # Railway start command
│   ├── railway.json                # Railway build config
│   ├── nixpacks.toml               # Nixpacks build config
│   └── src/
│       ├── index.js                # Entry point Express server
│       ├── db/
│       │   ├── database.js         # PostgreSQL connection pool
│       │   └── migrate.js          # Database migration script
│       ├── middleware/
│       │   └── auth.js             # JWT authentication middleware
│       └── routes/
│           ├── auth.js             # Register, Login, Me endpoints
│           └── todos.js            # CRUD + Export CSV endpoints
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js              # Vite + proxy config
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.development            # VITE_API_URL untuk lokal
    ├── .env.production             # VITE_API_URL untuk production
    └── src/
        ├── main.jsx                # Entry point React
        ├── App.jsx                 # Router + Protected/Guest routes
        ├── index.css               # Tailwind directives
        ├── context/
        │   └── AuthContext.jsx     # Global auth state (login, logout, register)
        ├── services/
        │   └── api.js              # Axios instance + auth/todo API calls
        ├── components/
        │   ├── TodoCard.jsx        # Card komponen untuk setiap todo
        │   └── TodoModal.jsx       # Modal form create/edit todo
        └── pages/
            ├── Login.jsx           # Halaman login
            ├── Register.jsx        # Halaman registrasi
            └── Todos.jsx           # Halaman utama todo (CRUD, filter, export)
```

---

## 3. API Endpoints

### Auth
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | ❌ | Daftar akun baru |
| POST | `/api/auth/login` | ❌ | Login, return JWT token |
| GET | `/api/auth/me` | ✅ | Info user yang sedang login |

### Todos
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/todos` | ✅ | Ambil semua todo (support query: status, priority, search) |
| POST | `/api/todos` | ✅ | Buat todo baru |
| GET | `/api/todos/:id` | ✅ | Ambil satu todo |
| PUT | `/api/todos/:id` | ✅ | Update todo |
| DELETE | `/api/todos/:id` | ✅ | Hapus todo |
| GET | `/api/todos/export/csv` | ✅ | Export semua todo ke file CSV |

### Health Check
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/health` | Cek status server |

---

## 4. Database Schema

### Tabel `users`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | SERIAL PRIMARY KEY | Auto increment |
| name | VARCHAR(255) | Nama pengguna |
| email | VARCHAR(255) UNIQUE | Email unik |
| password | VARCHAR(255) | Bcrypt hashed password |
| created_at | TIMESTAMP | Waktu registrasi |

### Tabel `todos`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | SERIAL PRIMARY KEY | Auto increment |
| user_id | INTEGER | Foreign key ke users |
| title | VARCHAR(500) | Judul todo |
| description | TEXT | Deskripsi opsional |
| status | VARCHAR(20) | pending / in_progress / completed |
| priority | VARCHAR(10) | low / medium / high |
| due_date | DATE | Tenggat waktu opsional |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu terakhir diupdate (auto via trigger) |

---

## 5. Environment Variables

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=development

# PostgreSQL connection string
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/todoapp

# JWT
JWT_SECRET=random_string_panjang_dan_aman
JWT_EXPIRES_IN=7d

# CORS - URL frontend yang diizinkan
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env.development`)
```env
VITE_API_URL=http://localhost:5000
```

### Frontend (`.env.production`)
```env
VITE_API_URL=https://todo-app-production-xxxx.up.railway.app
```

### Railway Production (Environment Variables)
| Variable | Nilai |
|----------|-------|
| NODE_ENV | production |
| DATABASE_URL | *otomatis dari Railway PostgreSQL* |
| JWT_SECRET | *random string panjang* |
| JWT_EXPIRES_IN | 7d |
| FRONTEND_URL | https://focused-bravery-production-ae43.up.railway.app |

---

## 6. Development Lokal

### Prasyarat
- Node.js >= 18
- PostgreSQL terinstall lokal (atau gunakan Docker)
- Git

### Setup Backend
```bash
# Clone repo
git clone https://github.com/ucup98/todo-app.git
cd todo-app/backend

# Install dependencies
npm install

# Buat file .env dan isi DATABASE_URL sesuai PostgreSQL lokal
# Contoh: DATABASE_URL=postgresql://postgres:password@localhost:5432/todoapp

# Jalankan server
npm run dev
# Server berjalan di http://localhost:5000
```

### Setup Frontend
```bash
cd todo-app/frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
# Buka http://localhost:5173
```

### Catatan Development Lokal
- Frontend menggunakan Vite proxy — semua request ke `/api` diteruskan ke `http://localhost:5000`
- Database tabel dibuat otomatis saat server pertama kali dijalankan (auto-migrate di `index.js`)
- Hot reload aktif di kedua sisi (nodemon untuk backend, Vite HMR untuk frontend)

---

## 7. Deployment ke Production (Railway)

### Prasyarat
- Akun GitHub: https://github.com
- Akun Railway: https://railway.app (daftar gratis via GitHub)

### Langkah Deploy

#### Step 1 — Push ke GitHub
```bash
cd todo-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/todo-app.git
git push -u origin main
```

#### Step 2 — Deploy Backend di Railway
1. Buka https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Pilih repo `todo-app`
3. Klik service yang muncul → tab **Settings**
4. Set **Root Directory**: `/backend`
5. Railway otomatis redeploy

#### Step 3 — Tambah PostgreSQL
1. Di canvas project, klik kanan area kosong → **Add Service** → **Database** → **PostgreSQL**
2. Railway otomatis inject `DATABASE_URL` ke semua service dalam project

#### Step 4 — Set Environment Variables Backend
Di service `todo-app` → tab **Variables**:
```
NODE_ENV=production
JWT_SECRET=isi_random_string_panjang
JWT_EXPIRES_IN=7d
FRONTEND_URL=* (sementara, update setelah frontend deploy)
```

#### Step 5 — Generate Domain Backend
Settings → Networking → **Generate Domain** → isi port `5000`

#### Step 6 — Deploy Frontend
1. Di canvas project, tambah service baru dari repo `todo-app` yang sama
2. Set **Root Directory**: `/frontend`
3. Tab **Settings** → bagian **Build**: `npm run build`
4. Tab **Settings** → bagian **Deploy/Start**: `npx serve dist -p $PORT`
5. Tab **Variables**: tambahkan `VITE_API_URL=https://URL-BACKEND`
6. Settings → Networking → **Generate Domain**

#### Step 7 — Update CORS Backend
Setelah dapat URL frontend, update variable backend:
```
FRONTEND_URL=https://focused-bravery-production-614a.up.railway.app
```

#### Step 8 — Verifikasi
Buka URL frontend di browser → Register → Login → CRUD Todo → Export CSV ✅

### Update / Redeploy
Setiap kali push ke GitHub, Railway otomatis redeploy:
```bash
git add .
git commit -m "deskripsi perubahan"
git push
```

---

## 8. Issues & Penyelesaian

### Issue #1 — npm/node tidak dikenali di terminal Kiro
**Masalah:** Terminal PowerShell di Kiro tidak mengenali perintah `node` dan `npm` meskipun Node.js sudah terinstall.

**Root Cause:** PATH environment variable belum direfresh di session PowerShell yang sedang berjalan.

**Solusi:**
```powershell
$env:PATH += ";C:\Program Files\nodejs"
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

---

### Issue #2 — PowerShell Execution Policy memblokir npm
**Masalah:** Error `npm.ps1 cannot be loaded because running scripts is disabled on this system`

**Root Cause:** Windows PowerShell secara default memblokir eksekusi script `.ps1` termasuk npm wrapper.

**Solusi:**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

---

### Issue #3 — better-sqlite3 gagal compile (Windows SDK tidak ditemukan)
**Masalah:** `better-sqlite3` membutuhkan kompilasi native (node-gyp) dan gagal karena Windows SDK 10.0.19041.0 tidak terinstall.

**Error:**
```
error MSB8036: The Windows SDK version 10.0.19041.0 was not found
```

**Root Cause:** `better-sqlite3` adalah native addon yang butuh build tools (Visual Studio + Windows SDK) untuk dikompilasi di mesin lokal.

**Solusi:** Ganti ke `sql.js` (pure JavaScript SQLite, tidak perlu kompilasi), lalu saat deployment production ganti ke PostgreSQL untuk keandalan yang lebih baik.

---

### Issue #4 — sql.js bersifat async, tidak kompatibel dengan API synchronous better-sqlite3
**Masalah:** Setelah migrasi ke `sql.js`, semua fungsi database perlu direfactor karena `sql.js` menggunakan Promise/async sedangkan `better-sqlite3` synchronous.

**Solusi:** Buat wrapper helper functions (`dbGet`, `dbAll`, `dbRun`) dan inisialisasi database sekali saat startup, lalu semua route menggunakan `async/await`.

---

### Issue #5 — npm install scripts tidak diapprove otomatis
**Masalah:** npm v9+ memerlukan approval eksplisit untuk package yang memiliki install scripts (seperti `esbuild` untuk Vite dan `better-sqlite3`).

**Error:** `npm warn install-scripts 1 package has install scripts not yet covered by allowScripts`

**Solusi:**
```bash
npm install-scripts approve esbuild
npm install-scripts approve better-sqlite3
npm install  # reinstall setelah approve
```

---

### Issue #6 — git push gagal: "src refspec main does not match any"
**Masalah:** `git push` gagal karena belum ada commit sama sekali.

**Solusi:** Lakukan `git add` dan `git commit` terlebih dahulu sebelum push:
```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

---

### Issue #7 — git push gagal: "Repository not found"
**Masalah:** Push ke GitHub gagal karena repo belum dibuat di GitHub.

**Solusi:** Buat repo baru di https://github.com/new terlebih dahulu (tanpa mencentang "Add README"), baru jalankan `git push`.

---

### Issue #8 — Backend crash setelah deploy ke Railway
**Masalah:** Service `todo-app` di Railway berstatus "Crashed" setelah deploy pertama.

**Root Cause:** `DATABASE_URL` belum tersedia karena PostgreSQL belum ditambahkan ke project.

**Solusi:** Tambahkan service PostgreSQL di Railway terlebih dahulu. Railway secara otomatis meng-inject `DATABASE_URL` ke semua service dalam project yang sama.

---

### Issue #9 — CORS error antara frontend dan backend production
**Masalah:** Saat frontend coba hit API backend, request diblokir CORS dengan response headers kosong.

**Root Cause:** Beberapa penyebab yang ditemukan secara bertahap:
1. `VITE_API_URL` di frontend tidak ada `https://` di depannya
2. Backend melakukan serve static frontend files (`frontend/dist`) yang tidak ada di service backend Railway, menyebabkan error 500 pada semua request
3. `FRONTEND_URL` di backend tidak ada `https://` di depannya sehingga CORS header dikirim dengan origin yang salah

**Solusi:**
- Hapus kode serve static frontend dari `backend/src/index.js` (frontend sudah di-serve terpisah)
- Pastikan `VITE_API_URL` di frontend diisi dengan format lengkap: `https://todo-app-production-xxxx.up.railway.app`
- Pastikan `FRONTEND_URL` di backend diisi dengan format lengkap: `https://focused-bravery-production-ae43.up.railway.app`
- Ganti CORS middleware ke manual headers untuk memastikan header selalu dikirim di setiap response

---

### Issue #10 — Service `todo-app` tidak auto-deploy commit terbaru
**Masalah:** Commit-commit terbaru tidak ter-deploy ke service `todo-app` di Railway meskipun sudah di-push ke GitHub.

**Root Cause:** Railway tidak mendeteksi perubahan di folder `backend/` secara otomatis untuk service tersebut.

**Solusi:** Lakukan redeploy manual di Railway — klik titik tiga `...` di deployment Active → **Redeploy**.

---

### Issue #11 — Tanggal due_date tampil sebagai ISO string (2026-10-31T00:00:00.000Z)
**Masalah:** Tanggal tenggat waktu di TodoCard tampil dalam format ISO lengkap `2026-10-31T00:00:00.000Z` alih-alih format rapi `2026-10-31`.

**Root Cause:** PostgreSQL mengembalikan kolom `DATE` sebagai objek JavaScript Date yang saat di-render langsung menghasilkan ISO string. Masalah yang sama terjadi di TodoModal saat mengisi form edit.

**Solusi:** Tambahkan `.toString().slice(0, 10)` saat menggunakan nilai `due_date` di komponen:
```js
// TodoCard.jsx & TodoModal.jsx
const formattedDueDate = todo.due_date
  ? todo.due_date.toString().slice(0, 10)
  : null
```

---

### Issue #12 — Service `focused-bravery` tidak auto-deploy setelah push ke GitHub
**Masalah:** Setelah push commit baru, service frontend di Railway tidak otomatis redeploy. Semua deployment di history menunjukkan commit lama.

**Root Cause:** Dua penyebab:
1. Koneksi GitHub ke Railway terputus — muncul error "Could not load branches"
2. **Auto deploy** dalam kondisi **disabled** di Settings service

**Solusi:**
1. Buka Railway → service `focused-bravery` → tab **Settings** → bagian **Source**
2. Klik **Disconnect** lalu reconnect repo `ucup98/todo-app`
3. Klik **Enable** di bagian "Auto deploy is disabled"
4. Push commit baru ke GitHub — Railway akan otomatis detect dan deploy

---

## 9. URL Production

| Service | URL |
|---------|-----|
| Frontend | https://focused-bravery-production-ae43.up.railway.app |
| Backend API | https://todo-app-production-438d.up.railway.app |
| GitHub Repo | https://github.com/ucup98/todo-app |
