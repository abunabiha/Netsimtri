# Lampiran D: Katalog Fitur IOS dan Perangkat untuk NetSimTRI

**Dokumen induk:** PRD-simulator-jaringan.md (v0.5)
**Melengkapi:** Lampiran A, B v2, dan C
**Status:** DRAFT. Setiap butir diberi status sumber.
**Terakhir diperbarui:** 17 Oktober 2026

## D.1 Cara membaca status sumber

| Status | Arti |
|---|---|
| **Resmi** | Dari dokumen Cisco Networking Academy atau Cisco Learning Labs yang sudah saya baca. |
| **Blueprint** | Dari daftar topik ujian Cisco (cuplikan PDF atau ringkasan). Menunjukkan fitur yang diuji, bukan platform tertentu. |
| **Sekunder** | Dari situs pihak ketiga, termasuk penjual lab kit dan forum. Wajib dicek ulang. |
| **Perlu verifikasi** | Belum ada sumber yang cukup. |

## D.2 Perangkat CCNA (IOS 15 klasik)

Perangkat ini dipakai di kebanyakan lab CCNA. Sumbernya sekunder, karena didapat dari penjual lab kit dan forum. Cisco Learning Labs (Resmi) menyebut CLI berbasis IOS versi 15.

| Platform | Varian software | Fungsi di NetSimTRI | Status sumber | Level |
|---|---|---|---|---|
| Switch 2960-TT-L | IOS 15.0(2) LanBase | Switch akses utama. Mendukung VLAN, trunk, dan STP. Routing statis terbatas, tanpa OSPF. | Sekunder | MVP |
| Switch 2960-S | IOS 15 LanLite | Varian lebih kecil dari LanBase. Tidak perlu disimulasikan di MVP. | Sekunder | V2 atau tidak sama sekali |
| Switch 3560 | IOS 15.0(2) SE6 IP Services | Switch Layer 3. Mendukung SVI, routing dinamis, dan inter-VLAN. | Sekunder | V2 |
| Switch 3750v2 | IOS 15.0(2) SE10 IP Services | Mirip 3560. | Sekunder | V2 |
| Router 1921 | IOS 15.x Universal | Router G2 untuk CCNA. Routing statis (MVP). OSPFv2, NAT, DHCP, ACL menyusul di V2. | Sekunder | MVP untuk routing statis |
| Router 1941 | IOS 15.x Universal | Mirip 1921. | Sekunder | V2 |
| Router 2911 | IOS 15.x Universal | Router dengan slot WIC untuk serial. | Sekunder | V2 |
| Router 2811 | IOS 15.x Universal | Router G1. | Sekunder | V2 atau tidak sama sekali |
| PC | - | Host, dengan ping, tracert, dan konfigurasi IP. | - | MVP |
| Server | - | DHCP, DNS, HTTP, TFTP, FTP, NTP. | Resmi (Academy menyebut server open source untuk HTTP, DHCP, FTP, TFTP) | V2 |

**Catatan:**

- Penjual lab kit menyebut bahwa switch 2960-TT-L bisa menjalankan IPv6 dan routing statis terbatas. Ini berarti OSPF tidak perlu disediakan di 2960. Perilaku ini realistis, dan dicatat sebagai batasan platform.
- Varian LanLite dan LanBase dibedakan di dokumentasi, tetapi di MVP cukup pakai LanBase.

## D.3 Perangkat CCNP (IOS-XE 17.x)

Perangkat ini dari dokumen Scope and Sequence Cisco Networking Academy (Resmi).

| Platform | Software | Fungsi di NetSimTRI | Status sumber | Level |
|---|---|---|---|---|
| Router C8200L-1N-4T | IOS-XE 17.15.4c atau lebih baru | Router utama CCNP. EIGRP, OSPF multi-area, eBGP, PBR, NAT, ACL (V3 dan V4). NetFlow dan IP SLA menyusul di V5. Level per fitur ada di D.4.2. | Resmi | V3 |
| Switch C9300L-24T-4G | IOS-XE 17.12.6 atau lebih baru | Switch Layer 3 distribusi. VLAN, trunk, STP, EtherChannel, SVI, routing dinamis. | Resmi | V3 |
| Switch C9200L-24T-4G | Tertulis "IOS 17.12.6" | Switch Layer 2 akses. | Resmi (dengan catatan) | V3 |
| PC | - | Sama dengan CCNA. | - | V3 |

**Catatan:** Dokumen Academy menyebut versi minimum. Versi minor per perintah belum dicek.

## D.4 Fitur per kurikulum

### D.4.1 Fitur CCNA

Fitur dipetakan ke blueprint CCNA v1.1 (Blueprint, sumber cuplikan). Kolom platform menunjukkan perangkat yang didukung di MVP atau V2.

| Domain | Fitur | Platform | Level |
|---|---|---|---|
| Network Fundamentals | Subnetting IPv4, IPv6 addressing dasar, alamat privat | PC, router | MVP |
| Network Fundamentals | Topologi dan komponen (teori) | - | Teori |
| Network Access | VLAN access | 2960, 3560 | MVP |
| Network Access | Trunk 802.1Q | 2960, 3560 | MVP |
| Network Access | Rapid PVST+, PortFast, BPDU guard | 2960, 3560 | MVP untuk Rapid PVST+. Sisanya V2. |
| Network Access | EtherChannel | 2960, 3560 | V2 |
| Network Access | CDP dan LLDP | 2960, 3560, router | V2 |
| Network Access | Port security | 2960, 3560 | V2 |
| IP Connectivity | Routing statis IPv4 | Semua | MVP |
| IP Connectivity | Routing statis IPv6 | Router, 3560 | V2 |
| IP Connectivity | OSPFv2 satu area | Router, 3560 | V2 |
| IP Connectivity | First hop redundancy (konsep) | - | Teori |
| IP Services | NAT dan PAT | Router | V2 |
| IP Services | DHCP server dan relay | Router, server | V2 |
| IP Services | DNS, NTP, SNMP, syslog | Server, router | V2 |
| IP Services | SSH | Router, switch | V2 |
| Security Fundamentals | ACL standard dan extended | Router | V2 |
| Security Fundamentals | AAA lokal | Router | V2 |
| Security Fundamentals | Hardening dasar (password, banner) | Semua | V2 |
| Automation | REST API, JSON (teori dan kuis) | - | Teori |

### D.4.2 Fitur CCNP

Fitur dipetakan ke modul Scope and Sequence v9 (Resmi).

| Domain | Fitur | Platform | Modul | Level |
|---|---|---|---|---|
| Switching | VLAN, trunk, inter-VLAN routing | C9300L, C9200L | ENCOR 3 | V3 |
| Switching | STP (konfigurasi dan troubleshooting) | C9300L, C9200L | ENCOR 4 | V3 |
| Switching | FHRP | C9300L, C8200L | ENCOR 5 | V3 |
| Switching | EtherChannel | C9300L, C9200L | ENCOR 6 | V3 |
| Switching | QoS (konfigurasi dasar) | C9300L, C8200L | ENCOR 7 | V3 |
| Routing | EIGRP | C8200L | ENARSI 1–3, ENCOR 8 | V4 |
| Routing | OSPF multi-area | C8200L, C9300L | ENCOR 9–10, ENARSI 4–6 | V3 untuk ENCOR. V4 untuk ENARSI. |
| Routing | eBGP | C8200L | ENCOR 11 | V3 |
| Routing | Redistribusi | C8200L | ENARSI 7–8 | V4 |
| Routing | PBR dan BFD | C8200L | ENARSI 9 | V4 |
| Routing | IP SLA | C8200L | ENARSI 9 | V5 |
| Routing | MP-BGP | C8200L | ENARSI 12 | V5 |
| Routing | Multicast (konsep) | - | ENCOR 12 | Teori |
| Routing | NAT | C8200L | ENCOR 13 | V3 |
| Security | ACL dan CoPP | C8200L, C9300L | ENCOR 14 | V3 |
| Security | AAA dengan TACACS+ dan RADIUS | C8200L | ENCOR 16 | V3 |
| Security | Keamanan IPv6 (ND inspection, RA guard) | C9300L | ENARSI 20 | V5 |
| Virtualization | VRF-Lite | C8200L | ENARSI 17 | V5 |
| Virtualization | MPLS L3 VPN | C8200L | ENARSI 14–16 | V5 atau setelahnya |
| Virtualization | DMVPN | C8200L | ENARSI 18 | V5 atau setelahnya |
| Services | DHCP IPv4 dan IPv6 | C8200L, server | ENARSI 19 | V4 |
| Services | NetFlow dan SPAN | C9300L, C8200L | ENCOR 20, ENARSI 22 | V3 untuk SPAN. V5 untuk NetFlow lanjut. |
| Automation | Python dasar | - | ENCOR 21 | V3 |
| Automation | NETCONF dan RESTCONF | C8200L | ENCOR 22 | V4 |
| SDN | SD-Access dan SD-WAN | - | ENCOR 24–25 | Konsep saja |

## D.5 Fitur yang tidak masuk simulator

| Fitur | Alasan |
|---|---|
| Wireless (AP, WLC, RF) | Dihapus dari ENCOR v1.2. Di CCNA hanya teori. |
| Firewall dan IPS | Di CCNA hanya konsep. |
| Catalyst Center dan SD-WAN Manager | Produk manajemen, tidak masuk simulasi perangkat. |
| Image IOS atau IOS-XE asli | Dilarang oleh NFR-12. |
| Packet Tracer | Produk Cisco. Tidak boleh dibundel. |
| Fitur hardware | Serial clock dan kabel fisik hanya disimulasikan sebagai koneksi. |

## D.6 Batasan platform yang perlu dimodelkan

Sumber lab kit menunjukkan bahwa perangkat yang berbeda memiliki batasan fitur. Simulator perlu menolak perintah yang tidak tersedia di platform tertentu.

| Platform | Batasan |
|---|---|
| 2960-TT-L (LanBase) | Tanpa OSPF. Routing statis terbatas. Dapat IPv6 addressing. |
| 3560 dan 3750v2 (IP Services) | Routing dinamis penuh. |
| Router G2 dan C8200L | Routing penuh sesuai versi software. |

Pesan penolakan harus menyebut platform, misalnya: "OSPF tidak didukung di Catalyst 2960-TT-L dengan IOS LanBase."

## D.7 Keputusan yang perlu diambil

1. **Varian LanLite dan LanBase.** Apakah simulator perlu membedakan keduanya, atau cukup satu varian per platform?
2. **Serial pada CCNA.** Apakah interface serial dan encapsulation HDLC atau PPP perlu di V2? Belum ada sumber resmi untuk CCNA v1.1 yang saya temukan.
3. **Router 2811 dan 2911.** Apakah keduanya perlu disediakan, atau cukup 1921 dan 1941?

## D.8 Yang perlu diverifikasi

1. Daftar platform dan varian software dari Scope and Sequence CCNA resmi. Minta dari halaman kelas CCNA di portal instruktur.
2. Apakah Academy memakai 2960 dan 3560 untuk CCNA 200-301 v1.1, atau perangkat lain. Dokumen Equipment List di portal instruktur bisa menjawab ini.
3. Modul ENCOR 4 dan 5 menyebut STP dan FHRP. Protokol spesifik (misalnya Rapid PVST+, HSRP, VRRP) belum dikonfirmasi ke silabus resmi.
4. Versi minor IOS per perintah.

## D.9 Sumber

- CCNP Enterprise: Advanced Routing (ENARSI), Scope and Sequence, Version 9 (Resmi, dokumen yang kamu kirim)
- CCNP Enterprise: Core Networking (ENCOR), Scope and Sequence, Version v9 (Resmi, dokumen yang kamu kirim)
- Cisco Learning Labs CCNA v1.0: https://learningnetworkstore.cisco.com/ccna/cisco-learning-labs-v1-0-cll-ccna-v1-60h90d-024885 (Resmi)
- Penjual lab kit CCNA, menyebut varian dan batasan platform: https://shop.certificationkits.com/cisco-ccna-200-301-v1-1-economy-plus-kit (Sekunder)
- Lab Suggestions CCNA, menyebut seri router dan switch: https://www.certificationkits.com/ccna-200-301-lab-suggestions/ (Sekunder)
