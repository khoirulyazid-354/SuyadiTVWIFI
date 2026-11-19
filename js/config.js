// Pengaturan web. Ubah tarif di sini (dalam rupiah).
const CONFIG = {
  namaWeb: "SUYADI TVWIFI",
  // Biaya pemasangan (sekali bayar)
  pasang: { "TV": 250000, "WiFi": 250000, "TV+WiFi": 250000 },
  // Iuran per bulan. TV+WiFi = 100.000 (paket gabungan).
  // TV saja & WiFi saja: ANGKA SEMENTARA, silakan ganti sesuai tarif asli.
  bulanan: { "TV": 50000, "WiFi": 150000, "TV+WiFi": 100000 },
  namaLabel: { "TV": "TV Kabel", "WiFi": "WiFi", "TV+WiFi": "TV Kabel + WiFi" },
  // Login admin (username + hash SHA-256 dari sandi, bukan sandi asli)
  adminUser: "admin",
  adminHash: "5e1eabeb2c1f0ae48345c1088b6bbe4c4beac36b209507520256fe2edef6d415"
};
