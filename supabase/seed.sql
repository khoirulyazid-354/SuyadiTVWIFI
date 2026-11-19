-- OPSIONAL: 60 pelanggan fiktif + riwayat bayar untuk uji coba. Jalankan setelah schema.sql
insert into pelanggan (id, nama, kecamatan, alamat, layanan, tgl_pasang, mulai_tagih)
select
  case when g % 10 = 0 then 'TW' when g % 7 = 0 then 'WF' else 'TV' end || '-' || lpad(g::text, 4, '0'),
  (array['Ahmad','Budi','Candra','Dedi','Eko','Fitri','Gunawan','Hendra','Indra','Joko','Lina','Rahmat','Siti','Yusuf','Rina'])[1 + floor(random()*15)::int]
    || ' ' || (array['Saputra','Hidayat','Wijaya','Pratama','Sari','Kurniawan','Hakim','Lestari','Rahman','Putri'])[1 + floor(random()*10)::int],
  (array['Air Hangat','Depati VII','Batang Merangin','Gunung Raya','Keliling Danau','Kayu Aro','Siulak','Danau Kerinci'])[1 + floor(random()*8)::int],
  'RT 0' || (1 + floor(random()*9))::int || '/RW 0' || (1 + floor(random()*5))::int,
  case when g % 10 = 0 then 'TV+WiFi' when g % 7 = 0 then 'WiFi' else 'TV' end,
  hari_ini() - (random()*1500)::int,
  (date_trunc('month', hari_ini()::timestamp) - interval '5 months')::date
from generate_series(1, 60) g;

insert into pembayaran (pelanggan_id, bulan, jumlah)
select p.id, m::date, case p.layanan when 'TV' then 50000 when 'WiFi' then 150000 else 100000 end
from pelanggan p
cross join lateral generate_series(p.mulai_tagih::timestamp, date_trunc('month', hari_ini()::timestamp), interval '1 month') m
where m <= date_trunc('month', hari_ini()::timestamp) - make_interval(months =>
      case when (substr(p.id, 4)::int * 7 + 3) % 10 < 7 then 0
           when (substr(p.id, 4)::int * 7 + 3) % 10 < 9 then 1
           else 2 + substr(p.id, 4)::int % 3 end);
