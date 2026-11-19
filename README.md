# SUYADI TVWIFI (versi Supabase)

Web TV kabel & WiFi: pelanggan cek tagihan tanpa login, admin login untuk kelola pelanggan dan catat pembayaran.

## Struktur
```
index.html            halaman & menu
css/style.css         tampilan
js/config.js          URL/kunci Supabase, tarif, daftar kecamatan
js/app.js             logika web
supabase/schema.sql   tabel, keamanan, fungsi cek tagihan
supabase/seed.sql     (opsional) 60 pelanggan fiktif untuk uji coba
```

## Langkah pasang
1. Buat project di supabase.com.
2. **SQL Editor**: jalankan isi `supabase/schema.sql`. Lalu (opsional) `supabase/seed.sql` untuk data uji coba.
3. **Authentication > Users > Add user**: isi email admin + sandi, centang auto confirm.
4. **Matikan pendaftaran publik** ("Allow new users to sign up") di pengaturan Authentication. WAJIB, supaya orang lain tidak bisa mendaftar lalu mengakses data.
5. **Project Settings > API**: salin *Project URL* dan *anon public key* ke `js/config.js`.
6. Upload ke GitHub, aktifkan Pages (Settings > Pages > branch `main`).

## Memasukkan data asli
Table Editor > tabel `pelanggan` > Import CSV (kolom: id, nama, kecamatan, alamat, layanan, tgl_pasang, mulai_tagih).
`layanan` harus `TV`, `WiFi`, atau `TV+WiFi`. `mulai_tagih` = bulan pertama yang mau ditagih lewat web (tanggal 1).

## Catatan
- Pelanggan hanya bisa mencari lewat fungsi `cek_tagihan` (minimal 3 huruf, maksimal 10 hasil, tanpa alamat lengkap). Tabel asli tidak bisa dibaca tanpa login.
- Jangan pernah menaruh kunci `service_role` di repo.
- Tarif TV saja dan WiFi saja di `js/config.js` masih angka sementara.

- Tampilan mengikuti contoh desain (gaya Nexora): ungu + hijau lime. Isi `whatsapp` di `js/config.js` agar tombol "Hubungi kami" dan tombol panah paket muncul.
