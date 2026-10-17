# Lampiran C: Kurikulum Resmi CCNP Enterprise v9 dan Batasan Lisensi

**Dokumen induk:** PRD-simulator-jaringan.md (v0.4)
**Melengkapi:** Lampiran A (pemetaan blueprint) dan Lampiran B v2 (platform dan dialek)
**Sumber:** Dua dokumen Scope and Sequence dari Cisco Networking Academy, CCNP Enterprise v9:
- ENARSI (© 2025 Cisco, Version 9)
- ENCOR (© 2026 Cisco, Version v9)
**Status:** Sumber primer, sudah dibaca langsung. Bagian lisensi perlu konfirmasi dari pihak yang berwenang.
**Terakhir diperbarui:** 17 Oktober 2026

---

## C.1 Batasan lisensi yang tercantum di dokumen

Dokumen ini menyebut tiga hal penting di bagian "Authorized Use":

1. Akses kurikulum diberikan berdasarkan Cisco Networking Academy Membership Agreement.
2. Materi hanya boleh dipakai untuk program gelar akademik dan pengembangan tenaga kerja nirlaba.
3. Pemakaian untuk pelatihan komersial, bootcamp, atau kegiatan lain yang mencari keuntungan dilarang. Pelanggaran bisa berujung pada pemutusan perjanjian Academy.

## C.2 Apa yang boleh dan tidak boleh dilakukan NetSimTRI

Berikut pembagian yang saya usulkan. Ini bukan nasihat hukum.

| Kategori | Contoh | Usulan |
|---|---|---|
| Boleh dengan aman | Menggunakan daftar modul sebagai acuan cakupan internal tim pengembang. Menulis objektif sendiri yang terinspirasi dari modul, dengan kata-kata sendiri. | Lanjutkan. Catat sumbernya di dokumentasi. |
| Perlu konfirmasi | Menyebut judul modul dan objektif Cisco di dokumentasi publik NetSimTRI. Membuat fitur yang mengikuti urutan modul secara persis. | Tanyakan ke Cisco Networking Academy sebelum rilis publik. |
| Perlu izin | Memasukkan teks modul, diagram topologi, daftar perangkat dari dokumen, atau bahan lab Academy ke dalam image atau repositori publik. Mendistribusikan hasil via Docker Hub publik. | Jangan lakukan tanpa izin tertulis. |
| Tidak boleh | Menyertakan IOS atau IOS-XE, file Packet Tracer atau lab resmi Cisco, dan soal asesmen. | Larangan tegas. Tidak ada pengecualian. |

**Catatan tentang pemakaian internal di kelas:** Jika NetSimTRI hanya dipakai di lingkungan Polinela untuk mahasiswa dalam program akademik, itu lebih dekat ke ketentuan lisensi. Namun perlu dipastikan bahwa pemakaian itu termasuk dalam perjanjian Academy dan tidak memberikan akses ke pihak luar.

## C.3 Platform CCNP dari dokumen resmi

Dokumen ENCOR dan ENARSI menyebut perangkat dan versi IOS yang dipakai di lab. Ini menyelesaikan asumsi di Lampiran B.

| Peran | Model | Versi software (dari dokumen) | Platform di NetSimTRI |
|---|---|---|---|
| Router | C8200L-1N-4T | IOS-XE 17.15.4c atau lebih baru | `c8200l` |
| Switch Layer 3 | C9300L-24T-4G | IOS-XE 17.12.6 atau lebih baru | `catalyst-9300` |
| Switch Layer 2 | C9200L-24T-4G | IOS 17.12.6 atau lebih baru (tertulis "IOS", bukan "IOS-XE") | `catalyst-9200` |

**Perubahan dibanding Lampiran B v2:**

- `isr-4000` diganti dengan `c8200l`. Dokumen resmi memakai C8200L, bukan ISR 4000.
- `catalyst-9300` sudah terkonfirmasi IOS-XE, jadi asumsi di Lampiran B v2 bisa ditutup.
- `catalyst-9200` ditambahkan. Dokumen menulis "IOS" untuk switch Layer 2, jadi perlu dicek apakah perintahnya sama dengan IOS-XE.

**Catatan:** Versi software di atas adalah versi minimum yang disebut dokumen. Versi minor per perintah belum dicek.

**Untuk CCNA:** Dokumen yang saya terima hanya mencakup CCNP. Dialek CCNA (IOS 15 klasik, Catalyst 2960 dan router 2900) masih berdasarkan sumber lain. Saya perlu Scope and Sequence CCNA dari Cisco Networking Academy untuk memverifikasinya.

## C.4 Topologi dasar: pola, bukan salinan

Dokumen menyertakan satu topologi dasar untuk seluruh CCNP. Secara garis besar, topologi itu berisi:

- Tiga router (R1, R2, R3) dengan koneksi serial di antara R1 dan R3, serta R1 dan R2.
- Dua switch Layer 3 sebagai distribusi (D1, D2).
- Satu switch Layer 2 sebagai akses (A1).
- Enam PC.

**Usulan:** Jangan menyalin diagram atau label port dari dokumen. Buat topologi sendiri dengan ukuran serupa dan pola yang sama, misalnya tiga router, dua distribusi, satu akses, dan enam host. Pola jaringan ini tidak dilindungi, tetapi gambar dan tata letak dokumen dilindungi.

## C.5 Peta modul ENARSI v9

Dokumen ENARSI membagi materi menjadi 23 modul dalam 6 domain. Judul di bawah ditulis ulang dengan kata-kata sendiri.

| Domain | Modul | Topik | Versi NetSimTRI |
|---|---|---|---|
| EIGRP | 1–3 | Implementasi, optimasi, dan troubleshooting EIGRP | V4 |
| OSPF | 4–6 | Implementasi, optimasi, dan troubleshooting OSPF | V4 |
| Routing manipulation | 7–9 | Redistribusi, troubleshooting redistribusi, path control (PBR, IP SLA, BFD) | V4 (PBR dan BFD), V5 (IP SLA) |
| BGP | 10–13 | IBGP, optimasi BGP, MP-BGP, troubleshooting BGP | V4 untuk dasar, V5 untuk MP-BGP dan troubleshooting lanjut |
| MPLS dan VPN | 14–18 | MPLS, MPLS L3 VPN, VRF-Lite, DMVPN | V5 atau setelahnya |
| Keamanan dan layanan infrastruktur | 19–23 | DHCP IPv4 dan IPv6, keamanan IPv6, keamanan router, troubleshooting layanan, Catalyst Center | V4 untuk DHCP dan keamanan router. Sisanya V5. |

**Dampak:** Domain MPLS dan VPN (modul 14–18) dipindahkan ke V5. Ini mengonfirmasi keputusan di PRD untuk menunda MPLS dan DMVPN.

## C.6 Peta modul ENCOR v9

Dokumen ENCOR membagi materi menjadi 26 modul dalam 6 domain. Judul ditulis ulang.

| Domain | Modul | Topik | Versi NetSimTRI |
|---|---|---|---|
| Network Switching | 1–7 | Arsitektur enterprise, switching path, VLAN dan trunk, STP, FHRP, EtherChannel, QoS (konsep) | V3. Beberapa butir sudah masuk CCNA. |
| Network Routing | 8–13 | EIGRP, OSPF, optimasi OSPF, eBGP, multicast (konsep), NAT | V3 |
| Network Security | 14–16 | ACL dan CoPP, arsitektur keamanan (konsep), AAA dengan TACACS+ dan RADIUS | V3 |
| Virtualization dan Network Services | 17–20 | Virtualisasi, VPN (konsep), layanan jaringan, troubleshooting dan analisis | V3 untuk layanan. Virtualisasi dan VPN V4. |
| Programmability | 21–22 | Dasar Python, protokol programmability | V3 untuk Python dasar. Protokol API di V4. |
| Software-Defined Networking | 23–26 | Catalyst Center, SD-Access, SD-WAN, API | Konsep saja, di V4 atau setelahnya |

**Catatan:** Dalam ENCOR, OSPF dan EIGRP muncul sebagai dua modul yang terpisah. Ini sejalan dengan Lampiran A, di mana keduanya masuk domain Infrastructure.

## C.7 Dampak ke PRD

1. **FR-9 pemetaan blueprint** bisa menggunakan nomor modul dari dokumen resmi, bukan hanya ID objektif. Ini mempermudah dosen yang mengikuti kurikulum Academy.
2. **FR-10 skenario** bisa diberi tag `ENCOR` atau `ENARSI` selain `CCNA` dan `CCNP`, sehingga dosen bisa memilih skenario per modul.
3. **Platform di Lampiran B v2** diperbarui: `isr-4000` menjadi `c8200l`, dan `catalyst-9200` ditambahkan.
4. **Roadmap** tetap sama. Modul MPLS dan VPN dipindahkan ke V5.
5. **Skenario latihan CCNP** dibuat sendiri dengan topologi serupa, tanpa menyalin materi Academy.

## C.8 Yang belum diketahui

- Scope and Sequence CCNA dari Cisco Networking Academy, untuk memverifikasi dialek CCNA.
- Hasil konfirmasi lisensi dari Cisco Networking Academy atau bagian hukum institusi.
- Apakah Packet Tracer, yang disebut sebagai alat latihan di dokumen, juga punya batasan lisensi untuk dipakai sebagai referensi.
- Versi minor IOS-XE per perintah pada C8200L, C9300L, dan C9200L.

## C.9 Sumber

- CCNP Enterprise: Advanced Routing (ENARSI), Scope and Sequence, Version 9 (dokumen yang dikirim pengguna, © 2025 Cisco)
- CCNP Enterprise: Core Networking (ENCOR), Scope and Sequence, Version v9 (dokumen yang dikirim pengguna, © 2026 Cisco)
- Equipment Information, Cisco NetAcad: https://www.netacad.com/resources/program-info/equipment-information
