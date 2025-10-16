@echo off
REM Script untuk memisahkan repository frontend
echo ========================================
echo SETUP FRONTEND REPOSITORY
echo ========================================
echo.

REM Pindah ke folder frontend
cd c:\laragon\www\vertinova\frontend

REM Cek apakah sudah ada git repo
if exist .git (
    echo [!] Git repository sudah ada di folder frontend
    echo [!] Menghapus git repository lama...
    rmdir /s /q .git
)

echo [*] Inisialisasi git repository baru...
git init

echo [*] Menambahkan semua file...
git add .

echo [*] Membuat commit pertama...
git commit -m "Initial commit: Frontend React + Vite"

echo.
echo ========================================
echo INSTRUKSI SELANJUTNYA:
echo ========================================
echo 1. Buat repository baru di GitHub dengan nama: vertinova-frontend
echo 2. Jalankan command berikut:
echo.
echo    git remote add origin https://github.com/Hawsyi-CEO/vertinova-frontend.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo ========================================

pause
