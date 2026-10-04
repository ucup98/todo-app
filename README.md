# Todo App

Aplikasi Todo List full-stack dengan fitur:
- 🔐 Autentikasi (Register/Login) dengan JWT
- ✅ CRUD Todo dengan filter & pencarian
- 🗃️ Database PostgreSQL
- 📥 Export ke CSV

## Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt
- **Hosting**: Railway

---

## Cara Deploy ke Railway

### Prasyarat
- Akun GitHub: https://github.com
- Akun Railway: https://railway.app (daftar gratis pakai GitHub)

---

### Langkah 1: Push ke GitHub

```bash
# Di folder c:\Projects\todo-app
git init
git add .
git commit -m "Initial commit"

# Buat repo baru di github.com, lalu:
git remote add origin https://github.com/USERNAME/todo-app.git
git push -u origin main
```

---

### Langkah 2: Deploy Backend ke Railway

1. Buka https://railway.app → klik **New Project**
2. Pilih **Deploy from GitHub repo** → pilih repo `todo-app`
3. Railway akan detect Node.js otomatis
4. Setelah deploy, klik **Settings** → set **Root Directory** ke `backend`
5. Klik **Redeploy**

---

### Langkah 3: Tambah PostgreSQL di Railway

1. Di project Railway, klik **+ New** → **Database** → **PostgreSQL**
2. Railway otomatis membuat database dan menambahkan `DATABASE_URL` ke environment

---

### Langkah 4: Set Environment Variables Backend

Di Railway dashboard → service backend → tab **Variables**, tambahkan:

```
NODE_ENV=production
JWT_SECRET=ganti_dengan_string_random_panjang
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://todo-app-frontend.up.railway.app
```

> `DATABASE_URL` sudah otomatis ditambahkan Railway saat kamu tambah PostgreSQL.

---

### Langkah 5: Deploy Frontend ke Railway

1. Di project yang sama, klik **+ New** → **GitHub Repo** → pilih repo yang sama
2. Set **Root Directory** ke `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npx serve dist -p $PORT`
5. Tambahkan environment variable:
   ```
   VITE_API_URL=https://URL-BACKEND-KAMU.up.railway.app
   ```
6. Klik **Deploy**

---

### Langkah 6: Update CORS Backend

Setelah frontend deploy dan dapat URL, update environment variable backend:
```
FRONTEND_URL=https://URL-FRONTEND-KAMU.up.railway.app
```

---

## Cara Menjalankan Lokal

### Prasyarat
- Node.js >= 18
- PostgreSQL terinstall lokal

### Setup Database Lokal
```sql
-- Di psql atau pgAdmin:
CREATE DATABASE todoapp;
```

### Backend
```bash
cd backend
npm install
# Edit .env - isi DATABASE_URL dengan koneksi PostgreSQL lokal kamu
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Buka: http://localhost:5173

---

## Struktur Project

```
todo-app/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js    # PostgreSQL pool
│   │   │   └── migrate.js     # Migration script
│   │   ├── middleware/auth.js # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js        # Register, Login
│   │   │   └── todos.js       # CRUD + Export CSV
│   │   └── index.js           # Express server
│   ├── .env
│   ├── Procfile
│   └── package.json
└── frontend/
    ├── src/
    │   ├── context/AuthContext.jsx
    │   ├── services/api.js
    │   ├── components/
    │   ├── pages/
    │   └── App.jsx
    ├── .env.development
    ├── .env.production
    └── package.json
```
