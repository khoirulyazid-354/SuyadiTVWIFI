# SUYADI TVWIFI

Website layanan TV kabel & WiFi di Kerinci, Jambi. Berisi **data sampel fiktif** (1540 pelanggan).

## Menu
- **Beranda**, **Paket** (biaya pasang & iuran), **Cek Tagihan** (pelanggan, tanpa login, cari pakai ID/nama), **Admin** (login, dashboard & tabel pelanggan).

## Struktur
```
index.html               halaman & menu
css/style.css            tampilan
js/config.js             nama web, tarif, akun admin (hash)
js/app.js                logika web
data/pelanggan.js        data sampel
scripts/generate_data.py pembuat data sampel
```

## Ubah tarif
Edit `js/config.js`. Tarif TV saja dan WiFi saja masih angka sementara.

## Ganti sandi admin
Buat hash SHA-256 dari sandi baru (`printf '%s' 'sandibaru' | sha256sum`), tempel ke `adminHash`.

## Peringatan keamanan
Web ini statis: **login hanya penghalang tampilan, bukan pengaman data**. Siapa pun bisa membuka `data/pelanggan.js` langsung dan membaca semua data.
Aman untuk data sampel. Untuk data pelanggan asli, pakai backend dengan login sungguhan (mis. Supabase) dan jangan simpan datanya di repo publik.
