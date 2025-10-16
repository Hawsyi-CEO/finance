# Panduan Memisahkan Repository Backend dan Frontend

## ⚡ Cara Cepat (Menggunakan Script Otomatis)

Saya sudah membuatkan script otomatis untuk mempermudah proses:

### Langkah 1: Buat Repository di GitHub

1. Buka https://github.com/Hawsyi-CEO
2. Buat 2 repository baru:
   - `vertinova-backend` - Backend API untuk Vertinova (Laravel)
   - `vertinova-frontend` - Frontend aplikasi Vertinova (React + Vite)
   - **JANGAN** centang "Initialize with README"

### Langkah 2: Jalankan Script

**Untuk Backend:**
```powershell
# Klik dua kali file ini atau jalankan di terminal
.\setup-backend-repo.bat
```

**Untuk Frontend:**
```powershell
# Klik dua kali file ini atau jalankan di terminal
.\setup-frontend-repo.bat
```

Script akan otomatis:
- Inisialisasi git repository baru
- Menambahkan semua file
- Membuat commit pertama
- Memberikan instruksi untuk push ke GitHub

---

## 📋 Cara Manual (Langkah Detail)

Jika Anda ingin melakukan manual atau memahami prosesnya:

## Langkah 1: Persiapan

Sebelum memulai, pastikan semua perubahan sudah di-commit:

```powershell
cd c:\laragon\www\vertinova
git status
git add .
git commit -m "Update README dan konfigurasi untuk pemisahan repository"
```

## Langkah 2: Buat 2 Repository Baru di GitHub

1. Buka https://github.com/Hawsyi-CEO
2. Klik "New repository"
3. Buat repository pertama:
   - Name: `vertinova-backend`
   - Description: "Backend API untuk Vertinova (Laravel)"
   - Public atau Private (pilih sesuai kebutuhan)
   - **JANGAN** centang "Initialize with README" (karena kita sudah punya kode)
   - Klik "Create repository"

4. Buat repository kedua:
   - Name: `vertinova-frontend`
   - Description: "Frontend aplikasi Vertinova (React + Vite)"
   - Public atau Private (pilih sesuai kebutuhan)
   - **JANGAN** centang "Initialize with README"
   - Klik "Create repository"

## Langkah 3: Setup Backend Repository

```powershell
# Masuk ke folder backend
cd c:\laragon\www\vertinova\backend

# Inisialisasi git repository baru
git init

# Tambahkan semua file
git add .

# Commit pertama
git commit -m "Initial commit: Backend Laravel"

# Hubungkan dengan GitHub repository
git remote add origin https://github.com/Hawsyi-CEO/vertinova-backend.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

## Langkah 4: Setup Frontend Repository

```powershell
# Masuk ke folder frontend
cd c:\laragon\www\vertinova\frontend

# Inisialisasi git repository baru
git init

# Tambahkan semua file
git add .

# Commit pertama
git commit -m "Initial commit: Frontend React"

# Hubungkan dengan GitHub repository
git remote add origin https://github.com/Hawsyi-CEO/vertinova-frontend.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

## Langkah 5: Update Konfigurasi CORS di Backend

File: `backend/config/cors.php`

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:5173',
        // Tambahkan URL production frontend nanti
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

Commit perubahan:

```powershell
cd c:\laragon\www\vertinova\backend
git add config/cors.php
git commit -m "Update CORS configuration"
git push
```

## Langkah 6: Buat file .env di Frontend

File: `frontend/.env`

```env
VITE_API_URL=http://localhost:8000
```

**PENTING:** File `.env` sudah ada di `.gitignore`, jadi tidak akan ter-push ke GitHub (ini benar untuk keamanan)

## Langkah 7: Update API Service di Frontend

Buat file `frontend/src/services/api.js` (jika belum ada):

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default API_URL;
```

Gunakan di AuthContext atau service lainnya:

```javascript
import API_URL from '../services/api';

// Contoh penggunaan
const response = await fetch(`${API_URL}/api/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify(credentials)
});
```

## Langkah 8: (Opsional) Hapus Repository Lama

Jika Anda ingin menghapus repository lama `finance`:

1. Buka https://github.com/Hawsyi-CEO/finance
2. Klik "Settings" (tab paling kanan)
3. Scroll ke bawah ke bagian "Danger Zone"
4. Klik "Delete this repository"
5. Ikuti instruksi konfirmasi

**ATAU** bisa tetap dipertahankan sebagai arsip/backup.

## Langkah 9: Update Local Workspace

Untuk development selanjutnya, Anda bisa:

**Opsi 1: Tetap pakai struktur folder saat ini**
```
c:\laragon\www\vertinova\
  ├── backend/  (git repo sendiri)
  └── frontend/ (git repo sendiri)
```

**Opsi 2: Buat folder terpisah**
```powershell
# Buat folder baru
mkdir c:\laragon\www\vertinova-new
cd c:\laragon\www\vertinova-new

# Clone kedua repository
git clone https://github.com/Hawsyi-CEO/vertinova-backend.git
git clone https://github.com/Hawsyi-CEO/vertinova-frontend.git
```

## Langkah 10: Testing

1. **Test Backend:**
```powershell
cd c:\laragon\www\vertinova\backend
php artisan serve
```

2. **Test Frontend:**
```powershell
cd c:\laragon\www\vertinova\frontend
npm run dev
```

3. Test login di browser: http://localhost:5173

## Selesai! 🎉

Sekarang backend dan frontend sudah terpisah menjadi 2 repository independen di GitHub.

## Tips untuk Development Selanjutnya

1. **Commit secara terpisah** - Backend dan frontend punya history commit sendiri
2. **Deploy terpisah** - Backend bisa deploy ke Heroku/Railway, Frontend ke Vercel/Netlify
3. **Environment Variables** - Jangan lupa set `VITE_API_URL` di production
4. **CORS** - Update `allowed_origins` di backend saat deploy production

## Troubleshooting

### Error "remote origin already exists"
```powershell
git remote remove origin
git remote add origin <URL_BARU>
```

### Error CORS saat development
- Pastikan backend running di `http://localhost:8000`
- Pastikan CORS config di backend sudah benar
- Cek Network tab di browser untuk detail error

### Error 422 saat login
- Cek console browser untuk detail error
- Pastikan format request body benar
- Cek Laravel logs: `backend/storage/logs/laravel.log`
