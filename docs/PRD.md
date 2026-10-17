# PRD: NetSimTRI (Network Simulator Program Studi Teknologi Rekayasa Internet, Polinela)

**Versi:** 0.5
**Status:** Draf untuk review. Beberapa butir ditandai "Perlu verifikasi".
**Pemilik:** [isi nama]
**Distribusi:** Docker image, dijalankan pengguna di komputer atau server lab sendiri
**Lampiran:** A (pemetaan blueprint), B v2 (platform dan dialek), C (kurikulum resmi v9 dan lisensi)

> "NetSimTRI" adalah nama kerja. Cek registry Docker, GitHub, dan merek dagang sebelum rilis.

---

## 1. Ringkasan

NetSimTRI adalah simulator jaringan yang dikemas sebagai Docker image. Pengguna menjalankan satu container dan membuka antarmuka web di `localhost`. Di sana pengguna menyusun topologi, mengonfigurasi perangkat lewat CLI bergaya IOS atau GUI, lalu menguji konektivitas dengan mengirim paket dan melihat jalurnya.

Simulator ini dipakai untuk dua kurikulum: **CCNA 200-301** dan **CCNP Enterprise** (ENCOR dan ENARSI). Keduanya dilayani dalam satu aplikasi. Pengguna tidak memilih kurikulum saat aplikasi dibuka. Perbedaannya ditentukan oleh platform perangkat dan label skenario.

Tiga tujuan dijaga sama penting: memahami konsep, lulus ujian, dan terampil mengonfigurasi perangkat sungguhan.

## 2. Masalah

Materi CCNA dan CCNP sulit dipahami hanya dari teks. Mahasiswa perlu melihat perilaku protokol, misalnya bagaimana OSPF membangun adjacency atau bagaimana STP memilih root bridge.

Setelah paham konsep, mahasiswa sering tersendat saat pindah ke perangkat sungguhan. Penyebabnya biasanya kebiasaan kecil: lupa masuk ke mode konfigurasi, tidak tahu `?` menampilkan bantuan konteks, atau lupa menyimpan konfigurasi sehingga hilang setelah reload.

## 3. Tujuan dan non-tujuan

**Tujuan**

- Pengguna menjalankan aplikasi dengan satu perintah `docker run`.
- Pengguna memahami perilaku protokol lewat simulasi event per event.
- CLI mengikuti alur kerja perangkat asli: mode dan prompt, bantuan `?`, singkatan, `no`, `write memory`, `reload`.
- Konfigurasi hasil latihan bisa diekspor dalam format yang sama dengan `show running-config`.
- Pustaka skenario memuat latihan CCNA dan CCNP, dengan tag dan ID objektif blueprint.
- Topologi latihan bisa dibangun hingga 50 perangkat.

**Non-tujuan**

- Menjadi bank soal atau simulator ujian resmi. Soal ujian Cisco tidak boleh dimasukkan karena terikat NDA.
- Menjalankan atau mendistribusikan image IOS atau IOS-XE.
- Akurasi firmware penuh untuk seluruh perilaku internal. Yang dijamin adalah perilaku yang diuji dan dipakai sehari-hari.
- Menggantikan praktik di perangkat fisik atau lab resmi. NetSimTRI adalah pelengkap.
- Kompatibilitas dengan format `.pkt` milik pihak lain.
- Kolaborasi real-time banyak pengguna di satu instance.

## 4. Pengguna

| Persona | Kebutuhan utama | Konteks |
|---|---|---|
| Mahasiswa CCNA | Konsep dasar, VLAN, routing, kebiasaan CLI | Praktikum, persiapan ujian |
| Mahasiswa CCNP | OSPF lanjut, EIGRP, BGP, troubleshooting | Lanjutan setelah CCNA |
| Dosen | Skenario yang terpetakan ke blueprint dan bisa diperiksa | Kelas, penilaian |
| Admin lab | Image yang sama di banyak komputer | Pemeliharaan laboratorium |
| Pengembang | Mesin simulasi yang bisa diuji | Tim prodi, mahasiswa tingkat akhir |

## 5. Cakupan kurikulum

### 5.1 CCNA 200-301 v1.1

Berlaku sampai 2 Februari 2027. CCNA 200-301 v2.0 mulai 3 Februari 2027 dengan domain yang disusun ulang dan konten AI.

| Domain | Bobot | Topik utama | Target awal |
|---|---|---|---|
| 1.0 Network Fundamentals | 20% | Komponen jaringan, topologi, IPv4 dan subnetting, IPv6 dasar, Ethernet, konsep wireless dan virtualisasi | Subnetting dan IPv6 dasar di MVP. Wireless hanya teori. |
| 2.0 Network Access | 20% | VLAN, trunk 802.1Q, Rapid PVST+, EtherChannel, CDP dan LLDP, port security | VLAN, trunk, Rapid PVST+ di MVP. Sisanya V2. |
| 3.0 IP Connectivity | 25% | Routing table, routing statis, OSPFv2 satu area, first hop redundancy (konsep) | Routing statis di MVP. OSPFv2 di V2. |
| 4.0 IP Services | 10% | NAT dan PAT, DHCP, DNS, NTP, SNMP, syslog, SSH, QoS (konsep) | NAT dan DHCP di V2. |
| 5.0 Security Fundamentals | 15% | ACL, AAA (konsep), port security, VPN (konsep), hardening | ACL di V2. |
| 6.0 Automation and Programmability | 10% | Controller-based networking, REST API, JSON | Teori dan kuis. Tidak ada simulasi API di MVP. |

Bobot di atas diambil dari ringkasan pihak ketiga yang mengacu ke PDF Cisco. Cek ulang dengan PDF resmi sebelum rilis.

### 5.2 CCNP Enterprise v9 (ENCOR dan ENARSI)

Sumber: Scope and Sequence Cisco Networking Academy, Version 9.

**ENCOR 350-401 v1.2** adalah ujian inti. Dokumen Academy menyebut kurikulum ini selaras dengan versi 1.2. Modulnya:

| Domain | Modul | Versi NetSimTRI |
|---|---|---|
| Network Switching | 1–7 | V3 |
| Network Routing | 8–13 | V3 |
| Network Security | 14–16 | V3 |
| Virtualization dan Network Services | 17–20 | V3 untuk layanan. Virtualisasi dan VPN di V4. |
| Programmability | 21–22 | V3 untuk Python dasar. Protokol API di V4. |
| Software-Defined Networking | 23–26 | Konsep saja, V4 atau setelahnya |

**ENARSI 300-410 v1.1** adalah konsentrasi. Dokumen Academy menyebut kurikulum ini selaras dengan versi 1.1.

| Domain | Modul | Versi NetSimTRI |
|---|---|---|
| EIGRP | 1–3 | V4 |
| OSPF | 4–6 | V4 |
| Routing manipulation | 7–9 | V4 untuk redistribusi dan PBR. IP SLA di V5. |
| BGP | 10–13 | V4 untuk dasar. MP-BGP dan troubleshooting lanjut di V5. |
| MPLS dan VPN | 14–18 | V5 atau setelahnya |
| Keamanan dan layanan infrastruktur | 19–23 | V4 untuk DHCP dan keamanan router. Sisanya V5. |

### 5.3 Dialek CLI dan platform

Dialek ditentukan oleh platform perangkat, bukan oleh sesi. Detail di Lampiran B v2.

| Platform | Dialek | Kurikulum | Sumber |
|---|---|---|---|
| Switch Catalyst 2960 | IOS 15 klasik | CCNA | Cisco Learning Labs menyebut CLI berbasis IOS versi 15. Versi minor per perintah perlu dicek. |
| Router seri 2900 | IOS 15 klasik | CCNA | Sama seperti di atas. |
| Router C8200L | IOS-XE 17.15.4c atau lebih baru | CCNP | Scope and Sequence v9 (resmi) |
| Switch Layer 3 C9300L | IOS-XE 17.12.6 atau lebih baru | CCNP | Scope and Sequence v9 (resmi) |
| Switch Layer 2 C9200L | Tertulis "IOS 17.12.6", perlu dicek apakah sama dengan IOS-XE | CCNP | Scope and Sequence v9 (resmi) |
| PC dan host | Tidak ada CLI IOS | Keduanya | - |

### 5.4 Tingkat kesetiaan CLI

| Tingkat | Cakupan | Target |
|---|---|---|
| L1 Alur kerja | Mode dan prompt, `?`, Tab, singkatan, `no`, `do`, `end`, Ctrl+Z, `write memory`, `copy running-config startup-config`, `show running-config`, `reload` | Wajib di MVP |
| L2 Output show | Format output `show` sesuai dokumentasi publik | Wajib untuk perintah MVP |
| L3 Pesan error | Pola pesan error dan penunjuk kesalahan | V2 |
| L4 Perilaku waktu | Timer protokol, konvergensi | V3, diuji per protokol |

## 6. Ruang lingkup fitur

**Di luar cakupan**

- Aplikasi desktop native.
- Model fisik, misalnya panjang kabel dan interferensi.
- Layer aplikasi selain ICMP dan UDP sederhana.
- Wireless fisik. Konsep wireless diajarkan lewat teori dan konfigurasi dasar.

## 7. Urutan rilis

| Tahap | Cakupan |
|---|---|
| MVP | CCNA: L1 penuh dan L2 untuk subset perintah. Routing statis, VLAN, trunk, Rapid PVST+. |
| V2 | CCNA lengkap, L3, mode latihan (FR-11), skenario (FR-10), laporan cakupan per tag (FR-9) |
| V3 | CCNP: ENCOR modul 1–26 untuk fitur yang relevan, L4 untuk protokol utama, platform IOS-XE |
| V4 | ENARSI modul 1–13 dan 19–21, ENCOR protokol API dan SD-Access konsep |
| V5 | ENARSI modul 14–18 (MPLS, VPN, DMVPN) dan modul 22–23. IP SLA, MP-BGP lanjut. |
| V6 | CCNA v2.0, setelah blueprint final |

## 8. Kebutuhan fungsional

### FR-0 Kemasan dan menjalankan aplikasi

- Perintah `docker run -p 8080:8080 -v netsimtri-data:/data <image>` menjalankan aplikasi di `http://localhost:8080`.
- Image menyertakan semua dependensi runtime.
- Port, lokasi penyimpanan, dan batas sumber daya bisa diatur lewat variabel lingkungan.
- Container berjalan sebagai non-root. Endpoint `/health` tersedia.
- Berkas `docker-compose.yml` contoh tersedia untuk lab.
- Data topologi dan konfigurasi bertahan setelah restart selama volume yang sama dipakai.

### FR-1 Kanvas topologi

- Perangkat ditambahkan dengan drag dari palet, dipindah, diganti nama, dan dihapus.
- Penghapusan perangkat ikut menghapus kabelnya.
- Nama perangkat unik dalam satu topologi.

### FR-2 Kabel dan koneksi

- Kabel hanya bisa dibuat antara dua interface yang belum terpakai.
- Lampu status link mengikuti kondisi interface, termasuk `administratively down` setelah `shutdown`.
- Nama interface mengikuti konvensi platform: `FastEthernet0/1` untuk 2960, `GigabitEthernet1/0/1` untuk C9300L, dan seterusnya.

### FR-3 Konfigurasi via GUI

- Form memvalidasi IPv4, IPv6, dan prefix length.
- Perubahan di GUI langsung terlihat di `show running-config`, dan sebaliknya.

### FR-4 CLI bergaya IOS

- **Mode dan prompt.** `Router>`, `Router#`, `Router(config)#`, `Router(config-if)#`. Nama host ikut berubah.
- **Bantuan.** `?` menampilkan perintah yang tersedia pada posisi kursor.
- **Melengkapi dan singkatan.** Tab melengkapi perintah. Singkatan yang tidak ambigu diterima.
- **Negasi.** Perintah konfigurasi yang bisa dibatalkan mendukung `no`.
- **Navigasi.** `exit` naik satu tingkat. `end` atau Ctrl+Z langsung ke privileged mode. `do` menjalankan show dari mode konfigurasi.
- **Penyimpanan.** `write memory` dan `copy running-config startup-config` menyimpan konfigurasi. Setelah `reload`, konfigurasi berasal dari startup-config.
- **Show.** Perintah yang masuk MVP menghasilkan output L2.
- **Error.** Perintah tidak dikenal menghasilkan pesan error. Pola pesan didokumentasikan. String persisnya diputuskan melalui legal review.
- **Dialek.** Dialek ditentukan oleh platform perangkat. Perintah dari dialek lain ditolak dengan pesan yang menyebut platform perangkat.

### FR-5 Simulasi protokol dan paket

- Ping menghasilkan urutan event: ARP request, ARP reply, ICMP echo request, ICMP echo reply.
- Untuk STP, pemilihan root bridge dan port role terlihat sebagai event.
- Untuk OSPF, pembentukan adjacency dan pertukaran LSA terlihat sebagai event.
- Setiap hop menampilkan keputusan: MAC learning, flooding, forwarding, atau drop beserta alasannya.
- Hasil simulasi deterministik untuk input yang sama.

### FR-6 Mode simulasi

- Tombol play, pause, dan step tersedia. Kecepatan animasi bisa diatur.
- Daftar event tersinkron dengan animasi.
- Simulasi bisa diulang dari awal.

### FR-7 Inspeksi paket dan pesan protokol

- Klik paket menampilkan header Ethernet, IPv4 atau IPv6, dan ICMP.
- Klik pesan protokol (misalnya OSPF Hello atau BPDU) menampilkan field-nya.

### FR-8 Simpan, muat, dan bagikan

- Ekspor menghasilkan JSON yang berisi perangkat, interface, kabel, konfigurasi, posisi, dan skenario.
- Impor menampilkan ulang topologi yang sama.
- Berkas dengan versi skema tidak dikenal ditolak dengan pesan jelas.

### FR-9 Pemetaan blueprint dan laporan cakupan

- Setiap skenario punya ID objektif blueprint dan nomor modul Academy jika relevan.
- Laporan menampilkan cakupan per tag (CCNA, CCNP, ENCOR, ENARSI) dan per domain.
- Laporan bisa diekspor sebagai CSV.

### FR-10 Pustaka skenario

- Setiap skenario punya tag: `CCNA`, `CCNP`, `ENCOR`, atau `ENARSI`, dan daftar platform yang dibutuhkan.
- Pengguna memfilter pustaka dengan tag dan domain. Filter tidak mengubah mode aplikasi.
- Saat skenario dimuat, perangkat yang dibutuhkan disiapkan di kanvas.
- Skenario berisi topologi awal, tujuan, dan kriteria yang bisa diperiksa.

*Dijadwalkan di V2. Pada MVP, skenario disusun manual.*

### FR-11 Mode latihan konfigurasi

- Latihan menampilkan instruksi dan batas waktu opsional.
- Sistem memeriksa hasil dengan membandingkan `show running-config` dengan target, lalu berkembang ke pemeriksaan perilaku (misalnya ping berhasil).
- Hasil tersimpan per pengguna: jumlah percobaan, waktu, dan kesalahan yang paling sering.

*Dijadwalkan di V2.*

### FR-12 Ekspor konfigurasi

- Ekspor menghasilkan teks konfigurasi per perangkat dengan format `show running-config`.
- Pengguna memilih perangkat mana yang diekspor.
- Ekspor tidak menyertakan data khusus simulator seperti posisi kanvas.

*Dijadwalkan di MVP.*

### FR-13 Skenario troubleshooting

- Skenario bisa sengaja menyisipkan kesalahan. Siswa diminta menemukan dan memperbaikinya.
- Pemeriksaan membandingkan kondisi akhir dengan kriteria skenario.

*Dijadwalkan di V2 untuk CCNA dan V3 untuk CCNP.* Alasannya, ENARSI dan ENCOR banyak menguji troubleshooting.

### FR-14 Palet perangkat

- Palet awal memuat PC, switch, dan router, dengan paling banyak tiga platform per kelompok.
- Platform lain ada di "Lainnya".
- Setiap platform punya badge kurikulum (CCNA, CCNP, atau keduanya).

### FR-15 Peringatan dialek

- Perintah yang tidak tersedia di platform perangkat menghasilkan pesan yang menyebut platform dan dialeknya.
- Fitur yang tidak didukung platform tertentu ditandai pada perangkat itu.

## 9. Kebutuhan non-fungsional

| ID | Kategori | Target |
|---|---|---|
| NFR-1 | Kinerja | Ping di topologi 20 perangkat selesai dalam 500 ms. Untuk 50 perangkat, target awal 2 detik. |
| NFR-2 | Kinerja | Konvergensi OSPF dan STP sebanding dengan perangkat asli. Target spesifik di V3. |
| NFR-3 | Kinerja | Antarmuka tetap responsif (tanpa freeze lebih dari 200 ms) saat animasi. |
| NFR-4 | Kinerja | Terminal CLI merespons perintah biasa dalam 50 ms. |
| NFR-5 | Kemasan | Image mendukung amd64 dan arm64. Ukuran di bawah 300 MB pada MVP. |
| NFR-6 | Kemasan | Build image reproducible: versi base image dan dependensi dikunci. |
| NFR-7 | Kompatibilitas | Chrome, Edge, dan Firefox versi terbaru. |
| NFR-8 | Aksesibilitas | Navigasi keyboard untuk CLI dan form. Kontras memenuhi WCAG AA. |
| NFR-9 | Bahasa | Antarmuka Bahasa Indonesia dan Inggris. Perintah dan istilah jaringan dalam Inggris. |
| NFR-10 | Keamanan | Tidak ada data pengguna yang dikirim ke pihak luar. Container tidak memerlukan internet setelah image terpasang. |
| NFR-11 | Keamanan | Container non-root, filesystem read-only kecuali direktori data. Port default hanya di localhost. |
| NFR-12 | Hak kekayaan intelektual | Tidak ada image IOS atau IOS-XE, file Packet Tracer atau lab resmi Cisco, konfigurasi asli Cisco, atau soal ujian di image atau repositori. Perilaku CLI dibangun dari dokumentasi publik. Topologi latihan dibuat sendiri. |
| NFR-13 | Kesetiaan | Setiap perintah MVP punya catatan tingkat kesetiaan dan referensi dokumentasi publik. |
| NFR-14 | Kesetiaan | Output show dan alur mode diuji regresi dengan snapshot. |
| NFR-15 | Keandalan | Mesin simulasi punya tes unit untuk Layer 2 dan Layer 3. Setiap protokol punya tes berbasis RFC atau dokumen publik. |
| NFR-16 | Pemeliharaan | Mesin simulasi tidak bergantung pada GUI. |
| NFR-17 | Pemeliharaan | Daftar perintah per platform dan pemetaan modul disimpan sebagai data, bukan kode. |
| NFR-18 | Kepadatan menu | Palet awal tidak lebih dari sembilan item, tidak termasuk "Lainnya". |

## 10. Model data

```json
{
  "schemaVersion": 4,
  "devices": [
    {
      "id": "sw1",
      "type": "switch",
      "platform": "catalyst-2960",
      "hostname": "SW-1",
      "position": { "x": 200, "y": 200 },
      "runningConfig": [
        "hostname SW-1",
        "interface FastEthernet0/1",
        " switchport mode access",
        " switchport access vlan 10"
      ],
      "startupConfig": ["hostname SW-1"]
    },
    {
      "id": "pc1",
      "type": "pc",
      "name": "PC-A",
      "position": { "x": 120, "y": 200 },
      "interfaces": [
        { "id": "eth0", "ip": "192.168.10.10", "prefix": 24, "gateway": "192.168.10.1" }
      ]
    }
  ],
  "links": [
    { "from": { "device": "pc1", "interface": "eth0" }, "to": { "device": "sw1", "interface": "FastEthernet0/1" } }
  ],
  "scenario": {
    "tags": ["CCNA"],
    "objectives": ["NA-2.1"],
    "modules": [],
    "requiredPlatforms": ["catalyst-2960"],
    "checks": ["SW-1 FastEthernet0/1 harus berada di VLAN 10 dalam mode access"]
  }
}
```

Perubahan dari v0.4: field `profile` pada topologi dihapus. Setiap perangkat punya `platform`. Skenario punya `tags`, `modules`, dan `requiredPlatforms`. ID objektif di atas hanya contoh format.

Entitas inti: **Device**, **Interface**, **Link**, **Platform**, **CLISession**, **Frame**, **Packet**, **ProtocolMessage**, **SimulationEvent**, **Scenario**, **DrillResult**.

## 11. Arsitektur

Satu container berisi satu proses Node.js. Proses ini melayani GUI statis dan API, menjalankan mesin simulasi, dan menyimpan data di volume Docker.

Komponen utama:

- **Mesin simulasi.** Tanpa I/O dan tanpa DOM. Modul per protokol (`stp`, `ospf`, `arp`, dan seterusnya).
- **Parser CLI per dialek.** Dialek IOS 15 dan IOS-XE. Parser dan formatter `show` membaca konfigurasi yang sama dengan mesin simulasi.
- **Penyimpanan JSON** di `/data`.
- **Data kurikulum.** Daftar perintah per platform, pemetaan modul, dan skenario. Disimpan sebagai data.

Konfigurasi disimpan dalam bentuk teks yang sama dengan `show running-config`, sehingga ekspor dan impor tidak perlu konversi.

## 12. Asumsi, batasan, dan lisensi

- Host memiliki Docker Engine atau Docker Desktop.
- Simulasi bersifat abstrak. Waktu transmisi disederhanakan.
- Perilaku CLI mengikuti dokumentasi publik. Perbedaan dicatat per platform.
- Protokol mengikuti RFC publik (misalnya RFC 826 untuk ARP, RFC 792 untuk ICMP, RFC 2328 untuk OSPFv2).
- Versi minor IOS per perintah belum diverifikasi.
- Scope and Sequence CCNA belum tersedia. Pemetaan CCNA memakai daftar v1.1 dari sumber sekunder.
- NetSimTRI tidak menggantikan latihan di perangkat sungguhan.
- **Lisensi materi Academy.** Dokumen Scope and Sequence menyebut akses diberikan berdasarkan Cisco Networking Academy Membership Agreement, untuk program akademik dan pengembangan tenaga kerja nirlaba. Sebelum rilis publik, pemakaian materi Academy dalam perangkat lunak yang dibagikan harus dikonfirmasi secara tertulis ke Cisco Networking Academy atau bagian hukum institusi. Rincian di Lampiran C.

## 13. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kesetiaan CLI dinilai berlebihan | Kepercayaan diri palsu | NetSimTRI ditegaskan sebagai pelengkap. Latihan di perangkat sungguhan tetap dijadwalkan. |
| Output CLI berbeda dengan perangkat asli | Kebiasaan keliru terbawa | Tingkat kesetiaan per perintah. Tes snapshot. Dokumentasi perbedaan. |
| Pengejaran kesetiaan memperlambat MVP | Jadwal molor | MVP hanya L1 penuh dan L2 untuk subset perintah. |
| String error atau output disalin dari Cisco | Hak cipta dan NDA | Pola didokumentasikan. String persis lewat legal review. |
| Materi Academy dipakai di luar ketentuan | Pelanggaran perjanjian | Konfirmasi tertulis sebelum rilis publik. Topologi dan skenario dibuat sendiri. |
| Blueprint berubah | Kurikulum usang | Data kurikulum dipisah dari kode. Tanggal dan sumber dicatat. |
| Soal ujian masuk repositori | Pelanggaran NDA | Larangan tertulis (NFR-12). Tinjauan sebelum merge. |
| Simulasi di server membebani lab | Lambat saat banyak siswa | Ukur beban per instance. Batasi sumber daya container. |
| Mahasiswa belum familiar dengan Docker | Tidak bisa menjalankan | Panduan instalasi per OS dan skrip pembantu. |
| Nama produk bentrok | Ganti nama setelah rilis | Cek registry, GitHub, dan DJKI. |

## 14. Pertanyaan terbuka

1. **Lisensi.** Konfirmasi tertulis dari Cisco Networking Academy atau bagian hukum institusi untuk distribusi publik.
2. **Scope and Sequence CCNA.** Kirim dokumen dari halaman kelas CCNA untuk memverifikasi dialek IOS 15 dan daftar modul.
3. **Platform awal.** Apakah MVP cukup dengan 2960, 2900, dan PC? Atau perlu C9300L sejak awal?
4. **Campuran dialek.** Apakah satu topologi boleh memuat IOS 15 dan IOS-XE sekaligus?
5. **Tag ganda.** Skenario CCNA dan CCNP sekaligus diberi dua tag?
6. **Mode pemakaian.** Setiap siswa menjalankan container sendiri, atau satu server lab?
7. **Akses dari luar.** Cukup `localhost`, atau bisa diakses dari jaringan lab?
8. **Pemelihara dan lisensi kode.** Siapa yang memelihara proyek? MIT atau Apache 2.0?

## 15. Metrik keberhasilan

- **Pemahaman konsep.** Siswa uji coba (target 10 orang) menyelesaikan skenario "ping lintas router" dalam 15 menit tanpa bantuan.
- **Kesiapan konfigurasi.** Siswa yang berlatih di NetSimTRI mengerjakan latihan yang sama di perangkat sungguhan dalam waktu tidak lebih dari 1,5 kali siswa yang berlatih langsung di perangkat sejak awal.
- **Kebiasaan CLI.** Setelah latihan MVP, tidak ada siswa yang gagal menyimpan konfigurasi atau lupa masuk ke mode konfigurasi.
- **Cakupan.** Minimal 90% objektif CCNA v1.1 tercakup skenario atau fitur. Untuk CCNP, cakupan dihitung per modul.
- **Dosen.** Skenario latihan bisa dibuat dalam waktu kurang dari 30 menit.
- **Teknis.** Cakupan tes unit minimal 80% untuk Layer 2 dan Layer 3. Image berhasil dibangun di amd64 dan arm64.

## 16. Milestone

| Tahap | Isi | Keluaran |
|---|---|---|
| M0 | Kerangka proyek, model data, Dockerfile, daftar platform dan dialek, pemetaan CCNA v1.1 | Repo siap, image bisa dibangun |
| M1 | Kanvas, kabel, GUI, penyimpanan (FR-1, FR-2, FR-3, FR-8, FR-14) | Topologi bisa dibuat dan disimpan |
| M2 | Layer 2 dan Layer 3 dasar (FR-5 bagian MVP) | Ping lolos, VLAN dan trunk berjalan |
| M3 | CLI CCNA dengan L1 penuh dan L2 subset (FR-4), ekspor konfigurasi (FR-12) | Routing statis dan VLAN lewat CLI |
| M4 | Mode simulasi dan inspeksi (FR-6, FR-7), hardening container | Demo ke pengguna uji |
| M5 | Uji coba kelas CCNA, dokumentasi instalasi, rilis MVP | Versi 1.0 dengan image publik |
| V2 | CCNA lengkap, L3, FR-9, FR-10, FR-11, FR-13 (CCNA) | Cakupan CCNA penuh dengan latihan |
| V3 | CCNP: ENCOR, platform IOS-XE (C8200L, C9300L, C9200L), FR-13 (CCNP) | Latihan CCNP dasar |
| V4 | ENARSI modul 1–13 dan 19–21, protokol API ENCOR | Cakupan ENARSI sebagian |
| V5 | ENARSI modul 14–18 dan 22–23, MP-BGP lanjut | Cakupan ENARSI lengkap |
| V6 | CCNA v2.0 | Setelah blueprint final |

Durasi per milestone belum diisi karena bergantung pada jumlah pengembang dan waktu.

## 17. Catatan kekayaan intelektual

- Kode dan aset ditulis sendiri atau memakai lisensi yang jelas.
- Tidak ada ikon, logo, atau nama merek dari Cisco.
- Perilaku CLI dibangun dari dokumentasi publik.
- Materi Academy, soal ujian, dan lab resmi tidak boleh masuk ke repositori tanpa izin tertulis.
- Image Docker membawa lisensi setiap dependensi. Buat `THIRD_PARTY_NOTICES.md` sebelum rilis.
- Pendapat hukum tidak termasuk dalam dokumen ini.
