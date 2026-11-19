// Isi dua baris Supabase di bawah (Supabase > Project Settings > API). Kunci "anon public" memang aman ditaruh di sini.
const CONFIG = {
  supabaseUrl: "https://XXXX.supabase.co",
  supabaseKey: "ISI_ANON_PUBLIC_KEY",

  namaWeb: "SUYADI TVWIFI",
  // Tarif dalam rupiah. TV saja & WiFi saja: ANGKA SEMENTARA, ganti sesuai tarif asli.
  pasang:  { "TV": 250000, "WiFi": 250000, "TV+WiFi": 250000 },
  bulanan: { "TV": 50000,  "WiFi": 150000, "TV+WiFi": 100000 },
  label:   { "TV": "TV Kabel", "WiFi": "WiFi", "TV+WiFi": "TV Kabel + WiFi" },
  kecamatan: ["Air Hangat", "Air Hangat Timur", "Depati VII", "Batang Merangin", "Gunung Raya",
              "Gunung Kerinci", "Keliling Danau", "Kayu Aro", "Siulak", "Siulak Mukai",
              "Danau Kerinci", "Bukitkerman"]
};
