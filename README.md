# Kerinci Net

Website sederhana untuk layanan TV kabel & WiFi di Kerinci, Jambi.
Saat ini berisi **data sampel fiktif** (1500 pelanggan TV, 100 pelanggan WiFi).

## Struktur
```
index.html            halaman utama
css/style.css         tampilan
js/app.js             logika (filter, statistik, cek tagihan)
data/pelanggan.js     data sampel
scripts/generate_data.py   pembuat data sampel
```

## Cara pakai
- Lokal: buka `index.html` di browser.
- Online: upload ke GitHub, lalu Settings > Pages > Deploy from branch `main`.

## Penting
Ini web statis. **Jangan taruh data pelanggan asli di repo publik** (nama dan alamat adalah data pribadi).
Untuk data asli dan login, perlu backend (misalnya Supabase) dan repo private.
