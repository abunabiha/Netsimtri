# Lampiran A: Pemetaan Blueprint NetSimTRI

**Dokumen induk:** PRD-simulator-jaringan.md (v0.4)
**Status:** DRAFT. Sebagian isi belum diverifikasi ke PDF resmi Cisco.
**Terakhir diperbarui:** 17 Oktober 2026

## A.1 Cara membaca status

| Status | Arti |
|---|---|
| **Resmi (cuplikan)** | Teks dan bobot diambil dari cuplikan PDF resmi Cisco. Belum dicek utuh. |
| **Sekunder** | Diambil dari situs pihak ketiga atau ringkasan. Wajib dicocokkan dengan PDF resmi. |
| **Perlu verifikasi** | Versi atau detail yang sumbernya saling bertentangan. |

Sebelum M0 selesai, setiap baris berstatus Sekunder atau Perlu verifikasi harus diganti dengan Resmi, dengan mencantumkan nomor versi dan tanggal unduh PDF.

## A.2 Profil A: CCNA 200-301 v1.1

**Berlaku sampai:** 2 Februari 2027 (Resmi, cuplikan)
**Pengganti:** CCNA 200-301 v2.0, mulai 3 Februari 2027 (Resmi, cuplikan)

| Domain | Bobot | Status | Topik utama | Target awal |
|---|---|---|---|---|
| 1.0 Network Fundamentals | 20% | Resmi (cuplikan) | Komponen jaringan, topologi, IPv4 dan subnetting, IPv6 dasar, Ethernet, wireless konsep, virtualisasi, switching konsep | Subnetting dan IPv6 dasar di MVP. Wireless hanya teori. |
| 2.0 Network Access | 20% | Sekunder | VLAN, trunk 802.1Q, Rapid PVST+, EtherChannel, CDP dan LLDP, port security, akses perangkat | VLAN, trunk, dan Rapid PVST+ di MVP. Sisanya V2. |
| 3.0 IP Connectivity | 25% | Sekunder | Routing table, routing statis, OSPFv2 satu area, first hop redundancy (konsep) | Routing statis di MVP. OSPFv2 satu area di V2. |
| 4.0 IP Services | 10% | Sekunder | NAT dan PAT, DHCP, DNS, NTP, SNMP, syslog, SSH, QoS (konsep) | NAT dan DHCP di V2. |
| 5.0 Security Fundamentals | 15% | Sekunder | ACL, AAA (konsep), port security, VPN (konsep), hardening | ACL di V2. |
| 6.0 Automation and Programmability | 10% | Sekunder | Controller-based networking, REST API, JSON | Teori saja. Tidak ada simulasi API di MVP. |

**Catatan:** Domain 1 dan 2 memuat banyak butir yang bersifat konsep. Konsep tetap diajarkan lewat teks dan kuis, bukan simulasi.

## A.3 Profil B: CCNP ENCOR 350-401 v1.2

**Berlaku mulai:** 19 Maret 2026 (Sekunder, dari beberapa sumber)
**Perubahan utama:** konten wireless dihapus (Sekunder)

| Domain | Bobot | Status | Topik utama | Target awal |
|---|---|---|---|---|
| 1.0 Architecture | 15% | Resmi (cuplikan) | Desain dua dan tiga tingkat, fabric, high availability (FHRP, SSO), SD-WAN, SD-Access | Fitur desain tidak disimulasikan. Konsep saja. |
| 2.0 Virtualization | 10% | Sekunder | VRF, GRE, IPsec, hypervisor, virtual switching | VRF-Lite dan GRE di V3. |
| 3.0 Infrastructure | 30% | Sekunder | Layer 2 (802.1Q, EtherChannel, STP), Layer 3 (EIGRP, OSPF multi-area, eBGP dasar, PBR) | Inti V3. Butuh mesin routing lanjut. |
| 4.0 Network Assurance | 10% | Sekunder | NetFlow, SPAN, troubleshooting dengan Catalyst Center | SPAN dan NetFlow dasar di V3. |
| 5.0 Security | 20% | Sekunder | AAA, akses perangkat, 802.1X (konsep), TrustSec (konsep) | AAA di V3. |
| 6.0 Automation and AI | 15% | Sekunder | REST API, RESTCONF, NETCONF, EEM, Ansible, Python | Parsial. Tidak ada simulasi API di V3. |

## A.4 Profil C: CCNP ENARSI 300-410

**Versi:** Perlu verifikasi. Sebagian besar sumber menyebut v1.1 (Resmi, cuplikan PDF). Satu sumber menyebut v1.2 dengan durasi 90 menit.
**Durasi:** 90 menit (Sekunder)

| Domain | Bobot | Status | Topik utama | Target awal |
|---|---|---|---|---|
| 1.0 Layer 3 Technologies | 35% | Resmi (cuplikan) | Administrative distance, route map, pencegahan loop, redistribusi, summarization, PBR, VRF-Lite, BFD, EIGRP classic dan named, OSPF multi-area, BGP | EIGRP, OSPF multi-area, dan redistribusi di V4. BGP di V4 setelah V3. |
| 2.0 VPN Technologies | 20% | Sekunder | MPLS, MPLS L3 VPN, DMVPN single hub | Di luar cakupan V4 awal. Dievaluasi ulang setelah V3. |
| 3.0 Infrastructure Security | 20% | Sekunder | AAA, ACL, keamanan router, IPv6 first-hop security | ACL dan AAA di V4. |
| 4.0 Infrastructure Services | 25% | Sekunder | Device management, SNMP, syslog, DHCP, IP SLA, NetFlow, troubleshooting dengan Catalyst Center | DHCP, SNMP, syslog di V4. IP SLA dan NetFlow di V5 atau setelahnya. |

**Catatan:** Domain 1 dan 4 mendominasi (60%). Keduanya menguntungkan fitur troubleshooting, bukan konfigurasi saja.

## A.5 Usulan perubahan pada PRD (akan dimasukkan ke v0.5)

1. **FR-10 diperluas dengan troubleshooting.** Skenario dengan kesalahan yang sengaja disisipkan. Siswa diminta menemukan dan memperbaikinya. Sesuai dengan porsi troubleshooting di ENARSI dan ENCOR.
2. **MPLS dan DMVPN dikeluarkan dari V4 awal.** Keduanya masuk dalam evaluasi ulang setelah V3 stabil.
3. **Pemetaan bobot per domain ditampilkan di FR-9.** Laporan cakupan menampilkan persentase skenario per domain, bukan hanya jumlah butir.
4. **Teori tidak dihapus dari cakupan.** Butir bersifat konsep ditandai khusus, dan diajarkan lewat modul teks serta kuis. Ini sebaiknya masuk sebagai fitur tambahan di V2.

## A.6 Sumber

- CCNA 200-301 v1.1 Exam Topics (Cisco Learning Network), PDF: https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf
- ENCOR 350-401 v1.2 Exam Topics (Cisco), PDF: https://learningcontent.cisco.com/documents/marketing/exam-topics/350-401-ENCORE-v1.2.pdf
- ENARSI 300-410 v1.1 Exam Topics (Cisco), PDF: https://learningcontent.cisco.com/documents/marketing/exam-topics/300-410-ENARSI-v1.1.pdf
- Ringkasan bobot ENCOR v1.2 (NetworkLessons): https://networklessons.com/cisco/ccnp-encor-350-401
- Ringkasan topik ENARSI (NetworkLessons): https://networklessons.com/cisco/ccnp-enarsi-300-410

## A.7 Hal yang belum dicek

- Cuplikan PDF belum dibaca utuh. Butir di tabel mungkin tidak lengkap.
- Versi ENARSI belum pasti.
- Tanggal berlaku ENCOR v1.2 berasal dari sumber sekunder.
- Daftar topik ENARSI untuk domain 2 dan 3 belum dicek ke PDF resmi.
- Cisco menyatakan daftar topik dapat berubah tanpa pemberitahuan. Setiap tahap rilis harus mengulang pengecekan ini.
