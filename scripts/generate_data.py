"""Membuat data sampel pelanggan (FIKTIF) -> data/pelanggan.js
Jalankan dari folder utama: python scripts/generate_data.py
"""
import json, random
random.seed(42)

KECAMATAN = ["Air Hangat", "Air Hangat Timur", "Depati VII", "Batang Merangin",
             "Gunung Raya", "Gunung Kerinci", "Keliling Danau", "Kayu Aro",
             "Siulak", "Siulak Mukai", "Danau Kerinci", "Bukitkerman"]
DEPAN = ["Ahmad", "Budi", "Candra", "Dedi", "Eko", "Fitri", "Gunawan", "Hendra",
         "Indra", "Joko", "Kartika", "Lina", "Mahmud", "Nurhayati", "Oki",
         "Putra", "Rahmat", "Siti", "Tono", "Umar", "Wati", "Yusuf", "Zainal", "Rina"]
BELAKANG = ["Saputra", "Hidayat", "Wijaya", "Pratama", "Sari", "Kurniawan",
            "Ramadhan", "Hakim", "Lestari", "Firmansyah", "Rahman", "Putri"]
PAKET_TV = [("TV Kabel", 50000)]
PAKET_WIFI = [("WiFi 10 Mbps", 150000), ("WiFi 20 Mbps", 200000), ("WiFi 30 Mbps", 250000)]

def status():
    r = random.random()
    if r < 0.70: return "Lunas", 0
    if r < 0.90: return "Belum Bayar", 1
    return "Nunggak", random.randint(2, 4)

data = []
for i in range(1, 1601):
    wifi = i > 1500
    paket, harga = random.choice(PAKET_WIFI if wifi else PAKET_TV)
    st, bln = status()
    data.append({
        "id": f"{'WF' if wifi else 'TV'}-{i:04d}",
        "nama": f"{random.choice(DEPAN)} {random.choice(BELAKANG)}",
        "alamat": f"RT {random.randint(1,9):02d}/RW {random.randint(1,5):02d}",
        "kecamatan": random.choice(KECAMATAN),
        "layanan": "WiFi" if wifi else "TV Kabel",
        "paket": paket,
        "tarif": harga,
        "status": st,
        "bulanTunggak": bln,
    })

with open("data/pelanggan.js", "w", encoding="utf-8") as f:
    f.write("// DATA SAMPEL FIKTIF. Ganti dengan data asli (jangan di repo publik).\n")
    f.write("const PELANGGAN = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("OK:", len(data), "pelanggan")
