WEB KASIR SEDERHANA - KASIRKU V2

Cara pakai:
1. Extract ZIP.
2. Buka file index.html di browser.
3. Login memakai akun demo.
4. Data antar role saling terhubung karena memakai localStorage browser yang sama.

Akun demo:
- Akun Master: username master, password master123
- Pemilik Toko: username pemilik, password toko123
- Pelanggan: username pelanggan, password pelanggan123

Fitur Akun Master:
- Dashboard semua data.
- Tambah akun baru.
- Edit akun: nama, username, password, no HP, alamat.
- Aktif/nonaktif akun.
- Hapus akun.
- Lihat semua transaksi.
- Detail transaksi.
- Edit status, pembayaran, dan catatan transaksi.
- Lihat log aktivitas sistem.

Fitur Pemilik Toko:
- Dashboard toko.
- Tambah produk.
- Edit item produk: nama, kategori, harga, stok, icon.
- Tambah/kurangi stok.
- Aktif/nonaktif produk.
- Hapus produk.
- Kelola pesanan masuk.
- Riwayat transaksi toko.
- Edit status transaksi.

Fitur Pelanggan:
- Melihat semua produk aktif.
- Tambah produk ke keranjang.
- Edit jumlah item keranjang.
- Hapus item keranjang.
- Checkout dengan metode pembayaran dan catatan.
- Melihat riwayat transaksi sendiri.
- Edit profil dan password.

Tools gratis yang dipakai:
- HTML
- CSS
- JavaScript
- Browser localStorage

Catatan:
Versi ini bisa langsung dipakai secara offline. Untuk multi-user online sungguhan, lanjutkan ke database gratis seperti Supabase/Firebase.

Update V8:
- Pada dashboard Pemilik Toko, Total Akun diganti menjadi Total Karyawan.
- Total Karyawan menghitung data karyawan toko/ruko milik pemilik, bukan seluruh akun login sistem.


Update V9:
- Data karyawan default dibuat 0 karena pemilik toko harus mendaftarkan karyawan sendiri.
- Menu Pemilik Toko ditambah Karyawan Toko untuk tambah/edit/hapus/filter/export data karyawan.
- Menu Kasir / Scan Barcode ditambah filter produk transaksi berdasarkan nama, SKU, barcode, kategori, dan stok.
