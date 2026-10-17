# Lampiran B: Alur Pemilihan Profil, Track, dan Dialek IOS

> **USANG. JANGAN DIPAKAI.** Alur pemilihan kurikulum saat startup dibatalkan pada 17 Oktober 2026. Simulator melayani CCNA dan CCNP sekaligus tanpa layar pemilihan. Versi yang berlaku adalah **Lampiran-B-v2-Platform-dan-Dialek.md**. File ini disimpan hanya sebagai riwayat keputusan.

**Dokumen induk:** PRD-simulator-jaringan.md (v0.4)
**Melengkapi:** Lampiran A (pemetaan blueprint)
**Status:** USANG, digantikan oleh Lampiran B v2.
**Terakhir diperbarui:** 17 Oktober 2026

## B.1 Keputusan yang sudah ditetapkan

| Topik | Keputusan |
|---|---|
| Tujuan utama | Pemahaman konsep, persiapan ujian, dan kesiapan konfigurasi di perangkat sungguhan |
| Versi ENARSI yang dipakai | 300-410 v1.1, durasi 90 menit (Resmi, cuplikan PDF Cisco). Ini versi terbaru yang bisa diverifikasi. |
| Menu awal | Pengguna memilih kurikulum: CCNA atau CCNP. Hanya kurikulum yang sudah dirilis yang ditampilkan. |
| Track CCNP | CCNP Enterprise terdiri dari ENCOR 350-401 v1.2 (inti, wajib) dan satu konsentrasi. Di NetSimTRI, pilihannya satu saja: ENARSI 300-410 v1.1. |
| Dialek CLI | Ditentukan oleh profil, bukan oleh pilihan pengguna di tengah sesi. |

## B.2 Alur startup

Layar pertama hanya menampilkan dua pilihan utama. Tujuannya menjaga menu tetap ringan.

```
+------------------------------------------+
|  NetSimTRI                               |
|                                          |
|  [ CCNA 200-301 ]    [ CCNP Enterprise ] |
|                                          |
|  Pilihan kurikulum dapat diubah nanti    |
|  dari menu Profil.                       |
+------------------------------------------+
```

### Jalur A: CCNA 200-301

1. Pengguna memilih CCNA.
2. Aplikasi langsung membuka workspace profil A.
3. Dialek CLI: IOS 15 klasik (lihat B.3).
4. Perangkat yang muncul: switch dan router sesuai profil A. Perangkat khusus CCNP tidak ditampilkan.

### Jalur B: CCNP Enterprise

1. Pengguna memilih CCNP.
2. Layar kedua menampilkan track. Track CCNP selalu berisi ENCOR, jadi pengguna hanya memilih konsentrasi.

```
+------------------------------------------+
|  CCNP Enterprise                         |
|                                          |
|  Track:                                  |
|  [ ENCOR + ENARSI ]                      |
|                                          |
|  ENCOR (inti) wajib dan selalu termasuk. |
+------------------------------------------+
```

3. Setelah track dipilih, aplikasi membuka workspace profil B+C dengan dialek IOS-XE (lihat B.3).

**Aturan menu:**

- Konsentrasi yang belum dirilis di NetSimTRI tidak ditampilkan, baik sebagai pilihan maupun sebagai pilihan yang dinonaktifkan. Pengguna tidak melihat menu yang kosong atau tidak bisa dipakai.
- Saat konsentrasi baru dirilis (misalnya ENSLD atau ENAUTO), pilihan itu baru muncul di layar ini.
- Pada versi awal, layar track bisa dilewati karena hanya ada satu pilihan. Pengguna tetap melihat layar ini agar alurnya konsisten dengan rilis berikutnya. Perlu keputusan: dilewati atau tidak (lihat B.7).

## B.3 Dialek IOS per kurikulum

| Profil | Dialek | Contoh platform | Status |
|---|---|---|---|
| A, CCNA 200-301 v1.1 | IOS 15 klasik | Switch 2960 dan router keluarga 2900 | Sebagian resmi: Cisco Learning Labs untuk CCNA menyebut CLI berbasis IOS versi 15 (Resmi, halaman penjualan Cisco). Versi minor spesifik perlu dicek per perintah. |
| B, CCNP ENCOR 350-401 v1.2 | IOS-XE | Catalyst 9000 dan ISR 4000 | Perlu verifikasi. Belum saya temukan sumber resmi yang menyatakan dialek ini untuk ENCOR. |
| C, CCNP ENARSI 300-410 v1.1 | IOS-XE | Sama dengan B | Perlu verifikasi. Sama seperti B. |

**Catatan penting:**

- Sumber komunitas menyebut bahwa switch Catalyst 2960 lama tidak bisa dinaikkan ke semua versi IOS 15. Perilaku ini tidak mengubah dialek. Hanya versi firmware yang dicatat di dokumentasi profil.
- Pilihan platform di simulator (misalnya nama interface `FastEthernet0/1` atau `GigabitEthernet1/0/1`) mengikuti dialek profil. Nama interface tidak boleh tercampur dalam satu sesi.
- Untuk CCNP, Cisco merekomendasikan CML untuk lab (sumber komunitas Cisco, belum resmi). Ini perlu dicantumkan sebagai pelengkap di dokumentasi, bukan sebagai bagian dari produk.

## B.4 Perubahan pada PRD (akan dimasukkan ke v0.5)

### FR-13 Pemilihan kurikulum saat startup

**Cerita pengguna:** Sebagai mahasiswa, saya ingin memilih CCNA atau CCNP sejak awal, supaya saya hanya melihat materi yang relevan untuk ujian saya.

**Kriteria penerimaan**

- Layar startup menampilkan dua pilihan utama: CCNA dan CCNP Enterprise.
- Pilihan hanya memuat kurikulum yang sudah dirilis di NetSimTRI.
- Pilihan kurikulum bisa diubah dari menu Profil tanpa menutup aplikasi.
- Saat pengguna mengganti profil, topologi dan konfigurasi yang terikat profil lama tetap tersimpan. Aplikasi menampilkan peringatan jika pengguna pindah ke profil yang tidak kompatibel.

### FR-14 Track CCNP

**Cerita pengguna:** Sebagai mahasiswa CCNP, saya ingin memilih konsentrasi saya tanpa melihat konsentrasi lain yang belum tersedia.

**Kriteria penerimaan**

- Setelah CCNP dipilih, layar track menampilkan konsentrasi yang sudah dirilis. ENCOR selalu termasuk sebagai inti.
- Konsentrasi yang belum dirilis tidak ditampilkan.
- Satu sesi hanya memakai satu track. Pengguna bisa berpindah track dari menu Profil.

### FR-4 (revisi) Dialek CLI per profil

Tambahan pada FR-4:

- Dialek CLI ditentukan oleh profil yang dipilih, bukan oleh pengguna di tengah sesi.
- Profil A menggunakan IOS 15 klasik. Profil B dan C menggunakan IOS-XE.
- Nama interface, format output `show`, dan daftar perintah mengikuti dialek profil.
- Perintah dari dialek lain ditolak dengan pesan yang menjelaskan bahwa perintah tersebut tidak tersedia di profil aktif.

### NFR-18 (baru) Kepadatan menu

- Layar pilihan utama memuat paling banyak dua pilihan.
- Layar track memuat paling banyak tiga pilihan. Pada versi awal jumlahnya satu.
- Konsentrasi yang belum dirilis tidak tampil sama sekali.

### Perubahan data (schemaVersion 3 ke 4)

Field `profile` sekarang memakai nilai yang tetap:

| Nilai | Arti |
|---|---|
| `ccna-200-301-v1.1` | Profil A |
| `ccnp-encor-v1.2-enarsi-v1.1` | Profil B dan C dalam satu track |

Nilai untuk konsentrasi lain ditambahkan saat dirilis. Topologi lama yang memakai nilai lama dibaca dengan migrasi sederhana.

## B.5 Dampak ke milestone

| Milestone | Perubahan |
|---|---|
| M0 | Tambahkan keputusan dialek dan daftar profil ke dokumen teknis |
| M1 | Tambahkan layar startup (FR-13) |
| M3 | Dialek IOS 15 untuk profil A dan verifikasi versi per perintah |
| V3 | Tambahkan dialek IOS-XE dan layar track CCNP (FR-14) setelah verifikasi dialek selesai |

## B.6 Yang perlu diverifikasi

1. **Dialek IOS-XE untuk ENCOR dan ENARSI.** Belum ada sumber resmi yang saya temukan. Cek dokumen resmi dari Cisco Learning Network untuk ENCOR v1.2 dan ENARSI v1.1.
2. **Versi IOS 15 untuk profil A.** Cisco menyebut versi 15, tetapi belum ada daftar versi minor yang dipakai di materi resmi.
3. **Versi ENARSI.** v1.1 adalah versi terbaru yang bisa saya verifikasi. Sebuah sumber menyebut v1.2 tanpa bukti. Anggap v1.1 sebagai dasar sampai ada konfirmasi dari Cisco.

## B.7 Keputusan yang perlu diambil

1. **Layar track pada versi awal:** dilewati karena hanya ada satu konsentrasi, atau tetap ditampilkan agar alur konsisten?
2. **Pilihan "Konsep saja":** apakah perlu jalur ketiga untuk pengguna yang hanya ingin belajar konsep tanpa konfigurasi? Ini akan menambah pilihan di layar startup.
3. **Platform default per profil:** perangkat apa yang muncul pertama kali di palet? Usulan: switch dan router sesuai profil, tanpa perangkat lain.

## B.8 Sumber

- Cisco Learning Labs CCNA v1.0 (menyebut CLI berbasis IOS versi 15): https://learningnetworkstore.cisco.com/ccna/cisco-learning-labs-v1-0-cll-ccna-v1-60h90d-024885
- ENCOR 350-401 v1.2 exam topics (Cisco, cuplikan PDF): https://www.cisco.com/c/dam/global/ja_jp/training-events/training-certifications/exam-topics/350-401-ENCOR.pdf
- ENARSI 300-410 v1.1 (Cisco, cuplikan PDF): https://learningcontent.cisco.com/documents/marketing/exam-topics/300-410-ENARSI-v1.1.pdf
- Diskusi komunitas Cisco tentang lab CCNA dan CML: https://community.cisco.com/t5/routing/ccna-lab-proposed-update/m-p/4839811/highlight/true
