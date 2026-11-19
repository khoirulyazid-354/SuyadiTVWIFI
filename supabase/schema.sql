-- SUYADI TVWIFI: jalankan SEKALI di Supabase > SQL Editor

create or replace function hari_ini() returns date
language sql stable as $$ select (now() at time zone 'Asia/Jakarta')::date $$;

create table pelanggan (
  id text primary key,                       -- contoh: TV-0001, WF-0002, TW-0003
  nama text not null,
  kecamatan text not null,
  alamat text,
  layanan text not null check (layanan in ('TV','WiFi','TV+WiFi')),
  tgl_pasang date,
  mulai_tagih date not null default date_trunc('month', hari_ini()::timestamp)::date,
  aktif boolean not null default true,
  dibuat timestamptz not null default now()
);

create table pembayaran (
  id bigint generated always as identity primary key,
  pelanggan_id text not null references pelanggan(id) on delete cascade,
  bulan date not null,                       -- selalu tanggal 1, contoh 2026-11-01
  jumlah integer not null check (jumlah >= 0),
  tgl_bayar date not null default hari_ini(),
  unique (pelanggan_id, bulan)
);

-- Keamanan: hanya admin (user yang login) yang boleh baca/tulis tabel
alter table pelanggan enable row level security;
alter table pembayaran enable row level security;
create policy "admin kelola pelanggan" on pelanggan for all to authenticated using (true) with check (true);
create policy "admin kelola pembayaran" on pembayaran for all to authenticated using (true) with check (true);

-- Jumlah bulan belum dibayar per pelanggan (dihitung sejak mulai_tagih sampai bulan ini)
create view status_pelanggan with (security_invoker = true) as
select p.*, (
  select count(*)::int
  from generate_series(date_trunc('month', p.mulai_tagih::timestamp),
                       date_trunc('month', hari_ini()::timestamp), interval '1 month') m
  where not exists (select 1 from pembayaran b where b.pelanggan_id = p.id and b.bulan = m::date)
) as bulan_tunggak
from pelanggan p;

-- Cek tagihan untuk PUBLIK (tanpa login): hanya data terbatas, maksimal 10 hasil
create or replace function cek_tagihan(q text)
returns table (id text, nama text, kecamatan text, layanan text, tgl_pasang date,
               aktif boolean, mulai_tagih date, bulan_dibayar date[])
language sql stable security definer set search_path = public as $$
  select p.id, p.nama, p.kecamatan, p.layanan, p.tgl_pasang, p.aktif, p.mulai_tagih,
         coalesce(array(select b.bulan from pembayaran b where b.pelanggan_id = p.id), '{}'::date[])
  from pelanggan p
  where length(trim(q)) >= 3
    and (upper(p.id) = upper(trim(q)) or strpos(lower(p.nama), lower(trim(q))) > 0)
  order by p.nama
  limit 10;
$$;
revoke all on function cek_tagihan(text) from public;
grant execute on function cek_tagihan(text) to anon, authenticated;
