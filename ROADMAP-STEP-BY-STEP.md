# Roadmap Step by Step Online

## Step 1 - Online Static
- Upload ke GitHub Pages.
- Data masih offline.
- Tujuan: website punya link online.

## Step 2 - Supabase Database
- Jalankan `supabase-schema.sql`.
- Isi `online-config.js`.
- Test koneksi Supabase.

## Step 3 - Migrasi Produk & Karyawan
- Backup produk lokal ke Supabase.
- Backup karyawan lokal ke Supabase.
- Ubah halaman produk dan karyawan agar langsung membaca Supabase.

## Step 4 - Migrasi Transaksi
- Ubah POS kasir agar menyimpan transaksi ke Supabase.
- Kurangi stok online.
- Simpan item transaksi online.

## Step 5 - Migrasi Pelanggan
- Keranjang online.
- Wishlist online.
- Pesanan online.

## Step 6 - Auth Aman
- Ganti login demo menjadi Supabase Auth.
- Terapkan Row Level Security sesuai role.

## Step 7 - Storage Gambar
- Gambar produk masuk Supabase Storage.
- Tidak lagi simpan gambar base64 di localStorage.
