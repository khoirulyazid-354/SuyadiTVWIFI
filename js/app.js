// Memakai variabel PELANGGAN dari data/pelanggan.js
const PER_HALAMAN = 20;
let halaman = 1;
let hasilFilter = PELANGGAN;

const rupiah = n => "Rp " + n.toLocaleString("id-ID");
const $ = id => document.getElementById(id);
const kelasStatus = s => (s === "Belum Bayar" ? "Belum" : s);
const badge = s => `<span class="badge ${kelasStatus(s)}">${s}</span>`;

function tampilPaket() {
  const unik = new Map();
  PELANGGAN.forEach(p => unik.set(p.paket, p.tarif));
  $("daftar-paket").innerHTML = [...unik].map(([nama, tarif]) =>
    `<div class="card"><b>${nama}</b><div class="harga">${rupiah(tarif)}<small>/bulan</small></div></div>`).join("");
}

function tampilStatistik() {
  const hitung = f => PELANGGAN.filter(f).length;
  const belumTertagih = PELANGGAN.filter(p => p.status !== "Lunas")
                                 .reduce((t, p) => t + p.tarif * Math.max(1, p.bulanTunggak), 0);
  const item = [
    ["Total pelanggan", PELANGGAN.length],
    ["TV Kabel", hitung(p => p.layanan === "TV Kabel")],
    ["WiFi", hitung(p => p.layanan === "WiFi")],
    ["Lunas", hitung(p => p.status === "Lunas")],
    ["Nunggak", hitung(p => p.status === "Nunggak")],
    ["Belum tertagih", rupiah(belumTertagih)],
  ];
  $("statistik").innerHTML = item.map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join("");
}

function isiKecamatan() {
  [...new Set(PELANGGAN.map(p => p.kecamatan))].sort().forEach(k =>
    $("f-kecamatan").insertAdjacentHTML("beforeend", `<option>${k}</option>`));
}

function terapkanFilter() {
  const q = $("cari").value.trim().toLowerCase();
  const l = $("f-layanan").value, s = $("f-status").value, k = $("f-kecamatan").value;
  hasilFilter = PELANGGAN.filter(p =>
    (!q || p.nama.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) &&
    (!l || p.layanan === l) && (!s || p.status === s) && (!k || p.kecamatan === k));
  halaman = 1;
  tampilTabel();
}

function tampilTabel() {
  const total = Math.max(1, Math.ceil(hasilFilter.length / PER_HALAMAN));
  const awal = (halaman - 1) * PER_HALAMAN;
  $("isi-tabel").innerHTML = hasilFilter.slice(awal, awal + PER_HALAMAN).map(p =>
    `<tr><td>${p.id}</td><td>${p.nama}</td><td>${p.kecamatan}</td><td>${p.paket}</td>
     <td>${rupiah(p.tarif)}</td><td>${badge(p.status)}</td></tr>`).join("");
  $("info-halaman").textContent = `Halaman ${halaman} / ${total} (${hasilFilter.length} data)`;
  $("prev").disabled = halaman <= 1;
  $("next").disabled = halaman >= total;
}

function cekTagihan(e) {
  e.preventDefault();
  const id = $("input-id").value.trim().toUpperCase();
  const p = PELANGGAN.find(x => x.id === id);
  if (!p) { $("hasil-cek").textContent = "ID tidak ditemukan."; return; }
  const tagihan = p.status === "Lunas" ? 0 : p.tarif * Math.max(1, p.bulanTunggak);
  $("hasil-cek").innerHTML = `
    <div class="card"><b>${p.nama}</b> (${p.id})<br>
    ${p.paket} &middot; ${p.kecamatan}, ${p.alamat}<br>
    Tagihan: ${rupiah(tagihan)} ${badge(p.status)}</div>`;
}

$("form-cek").addEventListener("submit", cekTagihan);
["cari", "f-layanan", "f-status", "f-kecamatan"].forEach(id => $(id).addEventListener("input", terapkanFilter));
$("prev").addEventListener("click", () => { halaman--; tampilTabel(); });
$("next").addEventListener("click", () => { halaman++; tampilTabel(); });

tampilPaket(); tampilStatistik(); isiKecamatan(); tampilTabel();
