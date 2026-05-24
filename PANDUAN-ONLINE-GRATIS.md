# Panduan Online Gratis 100% - KasirKu

Target stack:
- **GitHub Pages**: hosting gratis untuk `index.html`, `style.css`, `script.js`.
- **Supabase Free**: database, login prototype, dan storage awal.

## A. Upload ke GitHub Pages

1. Buat akun GitHub.
2. Buat repository baru, contoh: `kasirku-online`.
3. Upload semua file di folder ini.
4. Buka repository → **Settings** → **Pages**.
5. Source pilih `Deploy from a branch`.
6. Branch pilih `main` dan folder `/root`.
7. Tunggu link aktif.

Nanti link kira-kira:

```text
https://username.github.io/kasirku-online/
```

## B. Buat Supabase Project Gratis

1. Buat akun Supabase.
2. Buat project baru.
3. Buka menu **SQL Editor**.
4. Copy isi file `supabase-schema.sql`.
5. Jalankan SQL.
6. Buka **Project Settings → API**.
7. Copy:
   - Project URL
   - anon public key

## C. Isi konfigurasi online

Buka file:

```text
online-config.js
```

Ubah:

```js
APP_MODE: 'online',
SUPABASE_URL: 'URL_SUPABASE_KAMU',
SUPABASE_ANON_KEY: 'ANON_KEY_KAMU'
```

## D. Jalankan

Refresh website. Jika berhasil, muncul badge:

```text
Online Ready: Supabase aktif
```

## E. Backup data offline ke Supabase

Saat Supabase sudah aktif, buka browser console dan jalankan:

```js
KasirCloud.backupLocalToSupabase()
```

Ini akan mengirim data produk dan karyawan lokal ke Supabase.

## F. Restore produk dari Supabase ke aplikasi

```js
KasirCloud.restoreProductsFromSupabase()
```

## Catatan penting

Versi ini adalah **tahap online-ready**:
- Website sudah siap di-host gratis.
- Database Supabase sudah disiapkan.
- Ada adapter backup/restore data.
- Mode offline tetap aman.

Tahap berikutnya adalah mengubah setiap fitur agar langsung CRUD ke Supabase secara real-time, bukan backup/restore manual.
