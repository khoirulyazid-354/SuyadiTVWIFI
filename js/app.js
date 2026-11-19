// Bergantung pada: supabase (CDN) dan CONFIG (js/config.js)
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rupiah = n => "Rp " + Number(n).toLocaleString("id-ID");
const BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const siap = !CONFIG.supabaseUrl.includes("XXXX");
const db = siap ? supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey) : null;
if (!siap) $("banner-setup").hidden = false;

/* ---------- Helper umum ---------- */
const KELAS = { "Lunas": "lunas", "Belum Bayar": "belum", "Nunggak": "nunggak", "Tidak aktif": "nonaktif" };
const badge = s => `<span class="badge ${KELAS[s]}">${s}</span>`;
const statusDari = n => (n === 0 ? "Lunas" : n === 1 ? "Belum Bayar" : "Nunggak");
const ym = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}-01`;
const labelBulan = b => BLN[+b.slice(5, 7) - 1] + " " + b.slice(2, 4);
function daftarBulan(mulai) { // semua bulan dari 'mulai' sampai bulan ini, format YYYY-MM-01
  let [y, m] = mulai.split("-").map(Number); m--;
  const now = new Date(), out = [];
  while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth())) {
    out.push(ym(y, m)); if (++m > 11) { m = 0; y++; }
  }
  return out;
}
function toast(teks) { const t = $("toast"); t.textContent = teks; t.hidden = false; setTimeout(() => (t.hidden = true), 2800); }
function bukaModal(html) { $("modal-isi").innerHTML = html; $("modal").hidden = false; }
function tutupModal() { $("modal").hidden = true; }
$("modal").addEventListener("click", e => { if (e.target.id === "modal") tutupModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") tutupModal(); });

/* ---------- Navigasi ---------- */
function tampilHalaman() {
  const h = (location.hash || "#beranda").slice(1);
  const nama = ["beranda", "paket", "cek", "admin"].includes(h) ? h : "beranda";
  document.querySelectorAll(".hal").forEach(e => e.classList.toggle("aktif", e.id === "hal-" + nama));
  document.querySelectorAll("[data-hal]").forEach(a => a.classList.toggle("aktif", a.dataset.hal === nama));
}
window.addEventListener("hashchange", tampilHalaman);

/* ---------- Menu Paket ---------- */
function tampilPaket() {
  const ikon = { "TV": "📺", "WiFi": "📶", "TV+WiFi": "📺📶" };
  const wa = (CONFIG.whatsapp || "").replace(/\D/g, "");
  const html = Object.keys(CONFIG.label).map(k => `
    <div class="kartu-paket ${k === "TV+WiFi" ? "unggul" : ""}">
      ${k === "TV+WiFi" ? '<span class="tag">Paket gabungan</span>' : ""}
      <div class="gambar">${ikon[k]}</div><b>${CONFIG.label[k]}</b>
      <div class="bawah"><div><div class="harga">${rupiah(CONFIG.bulanan[k])}<small> /bln</small></div>
        <small>Pasang ${rupiah(CONFIG.pasang[k])}</small></div>
        ${wa ? `<a class="panah" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${encodeURIComponent("Halo, saya mau pasang paket " + CONFIG.label[k])}">→</a>` : ""}</div>
    </div>`).join("");
  document.querySelectorAll(".js-paket").forEach(e => (e.innerHTML = html));
  if (wa) { const a = $("wa-cta"); a.href = "https://wa.me/" + wa; a.hidden = false; }
}

/* ---------- Cek tagihan (publik) ---------- */
function kartuTagihan(p) {
  const dibayar = new Set((p.bulan_dibayar || []).map(String));
  const semua = daftarBulan(p.mulai_tagih);
  const tunggak = semua.filter(b => !dibayar.has(b)).length;
  const st = p.aktif ? statusDari(tunggak) : "Tidak aktif";
  const chip = semua.slice(-6).map(b => `<div class="chip ${dibayar.has(b) ? "ok" : "tdk"}">${labelBulan(b)}<br>${dibayar.has(b) ? "Lunas" : "Belum"}</div>`).join("");
  return `<div class="hasil-kartu">
    <div class="atas"><div><h3>${esc(p.nama)}</h3><small>${esc(p.id)} &middot; ${esc(p.kecamatan)}</small></div>${badge(st)}</div>
    <div class="besar">${rupiah(tunggak * CONFIG.bulanan[p.layanan])}</div><small>Total tagihan${tunggak ? ` (${tunggak} bulan)` : ""}</small>
    <div class="info" style="margin-top:12px"><span>Layanan</span><b>${CONFIG.label[p.layanan]}</b></div>
    <div class="info"><span>Iuran per bulan</span><b>${rupiah(CONFIG.bulanan[p.layanan])}</b></div>
    <div class="riwayat">${chip}</div></div>`;
}
async function cekTagihan(e) {
  e.preventDefault();
  const box = $("hasil-cek");
  if (!siap) { box.innerHTML = '<p class="galat">Supabase belum dihubungkan.</p>'; return; }
  box.innerHTML = "<p>Mencari...</p>";
  const { data, error } = await db.rpc("cek_tagihan", { q: $("input-cek").value });
  if (error) { box.innerHTML = `<p class="galat">Gagal: ${esc(error.message)}</p>`; return; }
  if (!data.length) { box.innerHTML = '<p class="galat">Data tidak ditemukan. Cek kembali ID atau nama.</p>'; return; }
  if (data.length === 1) { box.innerHTML = kartuTagihan(data[0]); return; }
  box.innerHTML = `<p class="sub" style="margin-top:16px">${data.length} data cocok. Pilih salah satu:</p>` +
    data.map((p, i) => `<div class="pilihan" data-i="${i}"><b>${esc(p.nama)}</b> <small>${esc(p.id)} &middot; ${esc(p.kecamatan)}</small></div>`).join("");
  box.querySelectorAll(".pilihan").forEach(el => el.addEventListener("click", () => (box.innerHTML = kartuTagihan(data[el.dataset.i]))));
}

/* ---------- Login admin ---------- */
let sesi = null;
function tampilAdmin() {
  $("box-login").hidden = !!sesi; $("box-admin").hidden = !sesi;
  if (sesi) muatAdmin();
}
async function login(e) {
  e.preventDefault();
  if (!siap) { $("pesan-login").textContent = "Supabase belum dihubungkan."; return; }
  const { error } = await db.auth.signInWithPassword({ email: $("l-email").value.trim(), password: $("l-pass").value });
  $("pesan-login").textContent = error ? "Email atau sandi salah." : "";
  if (!error) $("l-pass").value = "";
}

/* ---------- Dashboard admin ---------- */
const PER_HALAMAN = 20;
let semuaP = [], hasil = [], halaman = 1;

async function ambilSemua(buat) { // Supabase membatasi 1000 baris per permintaan
  let semua = [], dari = 0;
  for (;;) {
    const { data, error } = await buat().range(dari, dari + 999);
    if (error) throw error;
    semua = semua.concat(data);
    if (data.length < 1000) return semua;
    dari += 1000;
  }
}
async function muatAdmin() {
  try {
    semuaP = await ambilSemua(() => db.from("status_pelanggan").select("*").order("id"));
    const now = new Date();
    const bayar = await ambilSemua(() => db.from("pembayaran").select("id,jumlah").eq("bulan", ym(now.getFullYear(), now.getMonth())).order("id"));
    statistik(bayar.reduce((t, r) => t + r.jumlah, 0));
    terapkanFilter(true);
  } catch (err) { toast("Gagal memuat data: " + err.message); }
}
const stP = p => (p.aktif ? statusDari(p.bulan_tunggak) : "Tidak aktif");
const tagihanP = p => (p.aktif ? p.bulan_tunggak * CONFIG.bulanan[p.layanan] : 0);

function statistik(pemasukan) {
  const n = s => semuaP.filter(p => stP(p) === s).length;
  const item = [
    ["Pelanggan aktif", semuaP.filter(p => p.aktif).length, ""],
    ["Lunas", n("Lunas"), "h"], ["Belum bayar", n("Belum Bayar"), "k"], ["Nunggak", n("Nunggak"), "m"],
    ["Belum tertagih", rupiah(semuaP.reduce((t, p) => t + tagihanP(p), 0)), "m"],
    ["Pemasukan bulan ini", rupiah(pemasukan), "h"],
  ];
  $("statistik").innerHTML = item.map(([k, v, c]) => `<div class="stat ${c}"><span>${k}</span><b>${v}</b></div>`).join("");
}
function terapkanFilter(tetap) {
  const q = $("cari").value.trim().toLowerCase(), l = $("f-layanan").value, s = $("f-status").value, k = $("f-kecamatan").value;
  hasil = semuaP.filter(p => (!q || p.nama.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) &&
    (!l || p.layanan === l) && (!s || stP(p) === s) && (!k || p.kecamatan === k));
  if (tetap !== true) halaman = 1;
  tampilTabel();
}
function tampilTabel() {
  const total = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  halaman = Math.min(halaman, total);
  const awal = (halaman - 1) * PER_HALAMAN;
  $("isi-tabel").innerHTML = hasil.slice(awal, awal + PER_HALAMAN).map(p =>
    `<tr data-id="${esc(p.id)}"><td>${esc(p.id)}</td><td>${esc(p.nama)}</td><td>${esc(p.kecamatan)}</td>
     <td>${CONFIG.label[p.layanan]}</td><td>${badge(stP(p))}</td><td>${rupiah(tagihanP(p))}</td></tr>`).join("");
  $("info-halaman").textContent = `Halaman ${halaman} / ${total} (${hasil.length} data)`;
  $("prev").disabled = halaman <= 1; $("next").disabled = halaman >= total;
}

/* ---------- Detail pelanggan & catat pembayaran ---------- */
async function bukaDetail(id) {
  const p = semuaP.find(x => x.id === id);
  const { data, error } = await db.from("pembayaran").select("bulan").eq("pelanggan_id", id);
  if (error) return toast("Gagal: " + error.message);
  const dibayar = new Set(data.map(r => r.bulan));
  const semua = daftarBulan(p.mulai_tagih), belum = semua.filter(b => !dibayar.has(b));
  bukaModal(`<h3>${esc(p.nama)}</h3><small>${esc(p.id)} &middot; ${esc(p.kecamatan)}${p.alamat ? ", " + esc(p.alamat) : ""}</small>
    <div class="info" style="margin-top:12px"><span>Layanan</span><b>${CONFIG.label[p.layanan]}</b></div>
    <div class="info"><span>Status</span>${badge(stP(p))}</div>
    <div class="info"><span>Total tagihan</span><b>${rupiah(belum.length * CONFIG.bulanan[p.layanan])}</b></div>
    <p class="sub" style="margin:14px 0 0">Klik bulan untuk mencatat / membatalkan pembayaran:</p>
    <div class="riwayat">${semua.slice(-12).map(b => `<button class="chip ${dibayar.has(b) ? "ok" : "tdk"}" data-b="${b}" data-s="${dibayar.has(b) ? 1 : 0}">${labelBulan(b)}<br>${dibayar.has(b) ? "Lunas" : "Belum"}</button>`).join("")}</div>
    <div class="aksi">
      ${belum.length ? '<button class="btn" id="d-lunas">Tandai semua lunas</button>' : ""}
      <button class="btn ghost" id="d-edit">Edit</button><button class="btn ghost" id="d-tutup">Tutup</button></div>`);
  const tarif = CONFIG.bulanan[p.layanan];
  document.querySelectorAll("#modal-isi .chip").forEach(c => c.addEventListener("click", async () => {
    const b = c.dataset.b;
    if (c.dataset.s === "1") {
      if (!confirm(`Batalkan pembayaran ${labelBulan(b)}?`)) return;
      const r = await db.from("pembayaran").delete().eq("pelanggan_id", id).eq("bulan", b);
      if (r.error) return toast("Gagal: " + r.error.message);
    } else {
      const r = await db.from("pembayaran").insert({ pelanggan_id: id, bulan: b, jumlah: tarif });
      if (r.error) return toast("Gagal: " + r.error.message);
    }
    await muatAdmin(); bukaDetail(id);
  }));
  if (belum.length) $("d-lunas").addEventListener("click", async () => {
    if (!confirm(`Tandai ${belum.length} bulan lunas (${rupiah(belum.length * tarif)})?`)) return;
    const r = await db.from("pembayaran").insert(belum.map(b => ({ pelanggan_id: id, bulan: b, jumlah: tarif })));
    if (r.error) return toast("Gagal: " + r.error.message);
    toast("Pembayaran dicatat"); await muatAdmin(); bukaDetail(id);
  });
  $("d-edit").addEventListener("click", () => formPelanggan(p));
  $("d-tutup").addEventListener("click", tutupModal);
}

/* ---------- Tambah / edit pelanggan ---------- */
function idBaru(layanan) {
  const awalan = { "TV": "TV", "WiFi": "WF", "TV+WiFi": "TW" }[layanan];
  const maks = semuaP.reduce((m, p) => Math.max(m, parseInt(p.id.split("-")[1]) || 0), 0);
  return `${awalan}-${String(maks + 1).padStart(4, "0")}`;
}
function formPelanggan(p) {
  const now = new Date(), bulanIni = ym(now.getFullYear(), now.getMonth()).slice(0, 7);
  bukaModal(`<h3>${p ? "Edit pelanggan" : "Pelanggan baru"}</h3>
    <form id="f-p" class="form-grid">
      <label>Nama<input name="nama" required value="${esc(p?.nama)}"></label>
      <label>Kecamatan<input name="kecamatan" list="dl-kec" required value="${esc(p?.kecamatan)}"></label>
      <datalist id="dl-kec">${CONFIG.kecamatan.map(k => `<option value="${k}">`).join("")}</datalist>
      <label>Alamat / RT-RW<input name="alamat" value="${esc(p?.alamat)}"></label>
      <label>Layanan<select name="layanan">${Object.entries(CONFIG.label).map(([k, v]) => `<option value="${k}" ${p?.layanan === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      <label>Tanggal pasang<input type="date" name="tgl_pasang" value="${p?.tgl_pasang || ""}"></label>
      <label>Mulai ditagih (bulan)<input type="month" name="mulai" required value="${(p?.mulai_tagih || bulanIni).slice(0, 7)}"></label>
      <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="aktif" ${!p || p.aktif ? "checked" : ""}> Pelanggan aktif</label>
      <div class="aksi"><button class="btn" type="submit">Simpan</button>
        ${p ? '<button class="btn bahaya" type="button" id="f-hapus">Hapus</button>' : ""}
        <button class="btn ghost" type="button" id="f-batal">Batal</button></div>
    </form>`);
  $("f-batal").addEventListener("click", tutupModal);
  if (p) $("f-hapus").addEventListener("click", async () => {
    if (!confirm(`Hapus ${p.nama} beserta seluruh riwayat bayarnya? Tidak bisa dibatalkan.`)) return;
    const r = await db.from("pelanggan").delete().eq("id", p.id);
    if (r.error) return toast("Gagal: " + r.error.message);
    tutupModal(); toast("Pelanggan dihapus"); muatAdmin();
  });
  $("f-p").addEventListener("submit", async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const obj = { nama: f.get("nama").trim(), kecamatan: f.get("kecamatan").trim(), alamat: f.get("alamat").trim() || null,
      layanan: f.get("layanan"), tgl_pasang: f.get("tgl_pasang") || null, mulai_tagih: f.get("mulai") + "-01", aktif: f.get("aktif") === "on" };
    const r = p ? await db.from("pelanggan").update(obj).eq("id", p.id) : await db.from("pelanggan").insert({ id: idBaru(obj.layanan), ...obj });
    if (r.error) return toast("Gagal menyimpan: " + r.error.message);
    tutupModal(); toast("Tersimpan"); muatAdmin();
  });
}

/* ---------- Pasang event & mulai ---------- */
$("form-cek").addEventListener("submit", cekTagihan);
$("form-login").addEventListener("submit", login);
$("btn-keluar").addEventListener("click", () => db.auth.signOut());
$("btn-tambah").addEventListener("click", () => formPelanggan(null));
$("isi-tabel").addEventListener("click", e => { const tr = e.target.closest("tr"); if (tr) bukaDetail(tr.dataset.id); });
["cari", "f-layanan", "f-status", "f-kecamatan"].forEach(id => $(id).addEventListener("input", () => terapkanFilter()));
$("prev").addEventListener("click", () => { halaman--; tampilTabel(); });
$("next").addEventListener("click", () => { halaman++; tampilTabel(); });
Object.entries(CONFIG.label).forEach(([k, v]) => $("f-layanan").insertAdjacentHTML("beforeend", `<option value="${k}">${v}</option>`));
CONFIG.kecamatan.forEach(k => $("f-kecamatan").insertAdjacentHTML("beforeend", `<option>${k}</option>`));
if (siap) db.auth.onAuthStateChange((_e, s) => { sesi = s; tampilAdmin(); });
tampilPaket(); tampilHalaman();
