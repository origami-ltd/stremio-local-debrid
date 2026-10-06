# Stremio Local Debrid — Bahasa Indonesia

Komputer Anda mengunduh dan menyimpan torrent dari addon Stremio, lalu mengalirkan video ke TV melalui jaringan lokal.

## Mengapa proyek ini ada

TV lambat bisa kesulitan mengunduh torrent sambil memutar video. Stremio Local Debrid memindahkan unduhan dan penyimpanan ke komputer. TV menerima video HTTP melalui jaringan rumah. Cache tetap Anda kendalikan tanpa akun debrid cloud berbayar.

## Cara kerja

Server meminta sumber dari addon terpasang yang kompatibel, dengan mempertahankan alamat dan konfigurasinya. Hash torrent, magnet dan tautan .torrent menjadi sumber Cache Lokal. Memilih sumber memulai unduhan di komputer. Berkas duplikat berbagi cache dan trackernya digabungkan. Tautan video langsung dan layanan eksternal tidak dikonversi.

## Persyaratan

Gunakan Node.js 24 atau lebih baru, ruang disk cukup, serta komputer dan TV di jaringan yang saling terjangkau. Penemuan akun otomatis mendukung Stremio 5 di macOS. Linux dan Windows memakai daftar addon manual. Android TV, Google TV dan Fire TV adalah target utama; klien lain mungkin memerlukan HTTPS dan codec yang kompatibel.

## Menyiapkan server

Di macOS, masuk ke Stremio 5 memakai akun TV. Di Linux atau Windows, jalankan npm run setup, tambahkan URL manifest addon yang telah dikonfigurasi ke sources dalam config.json dan atur autoDiscoverAddons ke false. Di ketiga sistem, npm run install:service menjalankan server dan mengatur mulai otomatis saat login melalui LaunchAgent, layanan pengguna systemd atau Task Scheduler. Stremio boleh ditutup. Jangan publikasikan config.json pribadi.

```sh
git clone https://github.com/origami-ltd/stremio-local-debrid.git
cd stremio-local-debrid
npm ci
npm run install:service
```

```sh
npm run setup
npm start
```

## Menghubungkan TV

Buka alamat dalam state/status-url.txt, pilih bahasa, lalu klik Pasang di Stremio atau tempel alamat addon ke kolom pemasangan. Segarkan addon atau buka ulang Stremio di TV dengan akun yang sama. Pilih sumber Cache Lokal untuk film atau episode. Sumber asli bekerja di perangkat yang membukanya. Addon akun disinkronkan setiap 60 detik.

## Cache dan pemutaran

Unduhan berlanjut setelah pemutar ditutup dan dilanjutkan setelah server dimulai ulang. Hanya berkas terpilih yang diunduh. Batas bawaan 100 GiB dengan cadangan ruang kosong 10 GiB; torrent selesai yang paling jarang digunakan dihapus saat perlu ruang. Waktu mulai bergantung pada peer dan jaringan. TV tetap mendekode video; tidak ada transcoding. Jaga komputer tetap aktif dan terjangkau. Jika IP berubah, perbarui baseUrl dan pasang ulang addon.

## Privasi dan lisensi

URL addon memuat token akses: jaga kerahasiaannya. Penemuan akun membaca profil Stremio lokal dan mengirim kunci sesi hanya ke API resmi, tanpa menyimpan salinannya. Alamat addon disimpan secara privat. Proyek tidak memuat katalog media atau telemetri. Peer BitTorrent dapat melihat IP komputer. Gunakan konten yang berhak Anda akses. MIT-PoU mewajibkan pencatatan penggunaan dan atribusi untuk sistem otomatis.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
