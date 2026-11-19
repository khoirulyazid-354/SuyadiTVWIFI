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

# 1440 TV saja + 60 TV&WiFi (total TV 1500) + 40 WiFi saja (total WiFi 100)
JENIS = ["TV"] * 1440 + ["TV+WiFi"] * 60 + ["WiFi"] * 40
random.shuffle(JENIS)
PREFIX = {"TV": "TV", "WiFi": "WF", "TV+WiFi": "TW"}

def status():
    r = random.random()
    if r < 0.70: return "Lunas", 0
    if r < 0.90: return "Belum Bayar", 1
    return "Nunggak", random.randint(2, 4)

data = []
for i, jenis in enumerate(JENIS, 1):
    st, bln = status()
    data.append({
        "id": f"{PREFIX[jenis]}-{i:04d}",
        "nama": f"{random.choice(DEPAN)} {random.choice(BELAKANG)}",
        "kecamatan": random.choice(KECAMATAN),
        "alamat": f"RT {random.randint(1,9):02d}/RW {random.randint(1,5):02d}",
        "layanan": jenis,
        "tglPasang": f"{random.randint(2019,2026)}-{random.randint(1,11):02d}-{random.randint(1,28):02d}",
        "status": st,
        "bulanTunggak": bln,
    })

with open("data/pelanggan.js", "w", encoding="utf-8") as f:
    f.write("// DATA SAMPEL FIKTIF. Ganti dengan data asli (jangan di repo publik).\n")
    f.write("const PELANGGAN = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("OK:", len(data), "pelanggan")
