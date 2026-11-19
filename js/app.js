// Bergantung pada: CONFIG (js/config.js) dan PELANGGAN (data/pelanggan.js)
const $ = id => document.getElementById(id);
const rupiah = n => "Rp " + n.toLocaleString("id-ID");
const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const badge = s => `<span class="badge ${s === "Belum Bayar" ? "Belum" : s}">${s}</span>`;
const iuran = p => CONFIG.bulanan[p.layanan];
const tagihan = p => (p.status === "Lunas" ? 0 : iuran(p) * Math.max(1, p.bulanTunggak));

/* ---------- Navigasi antar menu ---------- */
function tampilHalaman() {
  const h = (location.hash || "#beranda").slice(1);
  const nama = ["beranda", "paket", "cek", "admin"].includes(h) ? h : "beranda";
  document.querySelectorAll(".hal").forEach(e => e.classList.toggle("aktif", e.id === "hal-" + nama));
  document.querySelectorAll("#menu a").forEach(a => a.classList.toggle("aktif", a.dataset.hal === nama));
}
window.addEventListener("hashchange", tampilHalaman);

/* ---------- Menu Paket ---------- */
function tampilPaket() {
  $("daftar-paket").innerHTML = Object.keys(CONFIG.namaLabel).map(k => `
    <div class="card"><b>${CONFIG.namaLabel[k]}</b>
      <div class="baris"><span>Biaya pemasangan</span><b>${rupiah(CONFIG.pasang[k])}</b></div>
      <div class="baris"><span>Iuran per bulan</span><b>${rupiah(CONFIG.bulanan[k])}</b></div>
    </div>`).join("");
}

/* ---------- Cek tagihan (publik, tanpa login) ---------- */
function detailPelanggan(p) {
  const bln = new Date().getMonth(); // bulan berjalan
  let kotak = "";
  for (let i = 5; i >= 0; i--) {
    const lunas = i >= p.bulanTunggak;
    kotak += `<div class="${lunas ? "ok" : "tdk"}">${BULAN[(bln - i + 12) % 12]}<br>${lunas ? "Lunas" : "Belum"}</div>`;
  }
  return `<div class="card"><b>${p.nama}</b> <small>${p.id}</small>
    <div class="baris"><span>Layanan</span><b>${CONFIG.namaLabel[p.layanan]}</b></div>
    <div class="baris"><span>Wilayah</span><b>${p.kecamatan}</b></div>
    <div class="baris"><span>Mulai berlangganan</span><b>${p.tglPasang}</b></div>
    <div class="baris"><span>Iuran per bulan</span><b>${rupiah(iuran(p))}</b></div>
    <div class="baris"><span>Status</span>${badge(p.status)}</div>
    <div class="baris"><span>Total tagihan</span><b>${rupiah(tagihan(p))}</b></div>
    <div class="riwayat">${kotak}</div></div>`;
}

function cekTagihan(e) {
  e.preventDefault();
  const q = $("input-cek").value.trim().toLowerCase();
  const hasil = PELANGGAN.filter(p => p.id.toLowerCase() === q || p.nama.toLowerCase().includes(q));
  const box = $("hasil-cek");
  if (!hasil.length) { box.textContent = "Data tidak ditemukan. Cek kembali ID atau nama."; return; }
  if (hasil.length === 1) { box.innerHTML = detailPelanggan(hasil[0]); return; }
  const tampil = hasil.slice(0, 10);
  box.innerHTML = `<p>${hasil.length} data cocok${hasil.length > 10 ? " (10 pertama)" : ""}. Pilih salah satu, atau cari dengan ID agar lebih tepat:</p>` +
    tampil.map(p => `<div class="card pilihan" data-id="${p.id}"><b>${p.nama}</b> <small>${p.id} &middot; ${p.kecamatan}</small></div>`).join("");
  box.querySelectorAll(".pilihan").forEach(el => el.addEventListener("click", () => {
    box.innerHTML = detailPelanggan(PELANGGAN.find(p => p.id === el.dataset.id));
  }));
}

/* ---------- Login admin ---------- */
async function sha256(teks) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(teks));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function aturTampilanAdmin() {
  const masuk = sessionStorage.getItem("admin") === "1";
  $("box-login").hidden = masuk;
  $("box-admin").hidden = !masuk;
  if (masuk) { tampilStatistik(); terapkanFilter(); }
}
async function login(e) {
  e.preventDefault();
  const ok = $("l-user").value.trim() === CONFIG.adminUser && (await sha256($("l-pass").value)) === CONFIG.adminHash;
  if (!ok) { $("pesan-login").textContent = "Username atau sandi salah."; return; }
  sessionStorage.setItem("admin", "1");
  $("l-pass").value = ""; $("pesan-login").textContent = "";
  aturTampilanAdmin();
}
function keluar() { sessionStorage.removeItem("admin"); aturTampilanAdmin(); }

/* ---------- Dashboard admin ---------- */
const PER_HALAMAN = 20;
let halaman = 1, hasilFilter = PELANGGAN;

function tampilStatistik() {
  const n = f => PELANGGAN.filter(f).length;
  const item = [
    ["Total pelanggan", PELANGGAN.length],
    ["Punya TV", n(p => p.layanan !== "WiFi")],
    ["Punya WiFi", n(p => p.layanan !== "TV")],
    ["TV + WiFi", n(p => p.layanan === "TV+WiFi")],
    ["Lunas", n(p => p.status === "Lunas")],
    ["Nunggak", n(p => p.status === "Nunggak")],
    ["Belum tertagih", rupiah(PELANGGAN.reduce((t, p) => t + tagihan(p), 0))],
  ];
  $("statistik").innerHTML = item.map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join("");
}
function isiFilter() {
  Object.entries(CONFIG.namaLabel).forEach(([k, v]) => $("f-layanan").insertAdjacentHTML("beforeend", `<option value="${k}">${v}</option>`));
  [...new Set(PELANGGAN.map(p => p.kecamatan))].sort().forEach(k => $("f-kecamatan").insertAdjacentHTML("beforeend", `<option>${k}</option>`));
}
function terapkanFilter() {
  const q = $("cari").value.trim().toLowerCase();
  const l = $("f-layanan").value, s = $("f-status").value, k = $("f-kecamatan").value;
  hasilFilter = PELANGGAN.filter(p =>
    (!q || p.nama.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) &&
    (!l || p.layanan === l) && (!s || p.status === s) && (!k || p.kecamatan === k));
  halaman = 1; tampilTabel();
}
function tampilTabel() {
  const total = Math.max(1, Math.ceil(hasilFilter.length / PER_HALAMAN));
  const awal = (halaman - 1) * PER_HALAMAN;
  $("isi-tabel").innerHTML = hasilFilter.slice(awal, awal + PER_HALAMAN).map(p =>
    `<tr><td>${p.id}</td><td>${p.nama}</td><td>${p.kecamatan}</td><td>${CONFIG.namaLabel[p.layanan]}</td>
     <td>${rupiah(iuran(p))}</td><td>${badge(p.status)}</td></tr>`).join("");
  $("info-halaman").textContent = `Halaman ${halaman} / ${total} (${hasilFilter.length} data)`;
  $("prev").disabled = halaman <= 1; $("next").disabled = halaman >= total;
}

/* ---------- Pasang event & mulai ---------- */
$("form-cek").addEventListener("submit", cekTagihan);
$("form-login").addEventListener("submit", login);
$("btn-keluar").addEventListener("click", keluar);
["cari", "f-layanan", "f-status", "f-kecamatan"].forEach(id => $(id).addEventListener("input", terapkanFilter));
$("prev").addEventListener("click", () => { halaman--; tampilTabel(); });
$("next").addEventListener("click", () => { halaman++; tampilTabel(); });

tampilPaket(); isiFilter(); aturTampilanAdmin(); tampilHalaman();
