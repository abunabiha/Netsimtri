# Panduan Development NetSimTRI: Antigravity, GitHub, dan Docker

**Dokumen induk:** PRD-simulator-jaringan.md (v0.5)
**Status:** Panduan kerja. Sesuaikan dengan preferensi tim.
**Terakhir diperbarui:** 17 Oktober 2026

Panduan ini menjelaskan cara mengembangkan NetSimTRI dengan Antigravity sebagai IDE, GitHub sebagai repositori dan CI/CD, dan Docker untuk menjalankan aplikasi secara lokal. Setiap milestone menghasilkan dokumen, sesuai permintaan.

Catatan tentang Antigravity: ini IDE agentik dari Google, fork VS Code, dengan agen yang bisa merencanakan dan menulis kode. Ulasan menyebut dukungan Git branching-nya belum matang. Jadi di panduan ini, operasi Git (branch, commit, merge) kamu kendalikan sendiri lewat terminal, dan agen dipakai untuk menulis kode di dalam branch yang sudah kamu siapkan.

## 1. Prasyarat

| Alat | Fungsi | Catatan |
|---|---|---|
| Antigravity | IDE dan agen | Unduh dari portal resmi Google. Masih public preview. |
| Git | Kontrol versi | Pasang di sistem. |
| Docker Desktop atau Docker Engine | Menjalankan container lokal | Pastikan sudah berjalan sebelum uji coba. |
| Akun GitHub | Repositori dan CI/CD | Siapkan satu repo kosong, misalnya `netsimtri`. |
| Node.js LTS | Runtime pengembangan | Versi mengikuti `.nvmrc` di repo. |

## 2. Struktur repositori

Buat struktur ini di awal (milestone M0). Agen Antigravity bisa membuat kerangkanya, tetapi tinjau hasilnya.

```
netsimtri/
├── .github/
│   └── workflows/
│       ├── ci.yml              # lint, test, build per push dan PR
│       └── release.yml         # build dan push image saat tag
├── docs/
│   ├── PRD.md                  # salinan PRD
│   ├── lampiran/               # lampiran A, B v2, C, D
│   ├── adr/                    # Architecture Decision Records
│   └── milestones/             # dokumen per milestone (M0.md, M1.md, ...)
├── engine/                     # mesin simulasi, tanpa I/O
│   ├── src/
│   └── test/
├── cli/                        # parser CLI per dialek
│   ├── ios15/
│   └── iosxe/
├── server/                     # API dan penyaji GUI
├── web/                        # GUI React
├── data/                       # daftar perintah, pemetaan modul, skenario
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .nvmrc
├── package.json
└── README.md
```

Pemisahan `engine`, `cli`, `server`, dan `web` mengikuti prinsip arsitektur di PRD: mesin simulasi tidak bergantung pada GUI.

## 3. Alur Git yang disarankan

Karena branching di Antigravity belum matang, pakai alur sederhana dan kendalikan dari terminal.

- Branch utama: `main`. Selalu bisa di-build dan lolos tes.
- Branch kerja per fitur: `feat/<nama>`, misalnya `feat/kanvas-topologi`.
- Satu pull request per fitur. CI harus hijau sebelum merge.
- Tag versi untuk rilis: `v0.1.0`, `v0.2.0`, dan seterusnya.

Perintah dasar:

```bash
git checkout -b feat/kanvas-topologi
# agen menulis kode di sini
git add -A
git commit -m "feat: kanvas topologi dasar"
git push -u origin feat/kanvas-topologi
# buka PR di GitHub
```

## 4. Cara memakai agen Antigravity

Agen bekerja paling baik jika diberi konteks dan batasan yang jelas.

1. **Beri agen akses ke PRD dan lampiran.** Taruh di `docs/`. Minta agen membaca dokumen itu sebelum menulis kode.
2. **Satu tugas per sesi agen.** Misalnya "buat mesin event queue di `engine/` sesuai FR-5, dengan tes unit". Jangan menggabungkan banyak fitur dalam satu perintah.
3. **Minta agen menulis tes lebih dulu atau bersamaan.** PRD menuntut cakupan tes 80% untuk Layer 2 dan 3.
4. **Tinjau Artifact.** Antigravity menghasilkan plan, screenshot, dan rekaman. Periksa sebelum menerima.
5. **Jangan serahkan operasi Git ke agen.** Branch, commit, dan merge kamu kendalikan sendiri.
6. **Verifikasi di browser.** Antigravity bisa menjalankan browser untuk memeriksa GUI. Pakai ini untuk FR-1 sampai FR-7.

## 5. Dokumen per milestone

Permintaanmu: setiap tahapan tersedia dokumen. Berikut dokumen yang dibuat di tiap milestone, disimpan di `docs/milestones/`.

| Milestone | Dokumen | Isi |
|---|---|---|
| M0 | `M0.md` | Keputusan arsitektur, struktur repo, matriks dialek, hasil setup CI |
| M1 | `M1.md` | Desain model data, cara kerja kanvas dan penyimpanan, hasil uji |
| M2 | `M2.md` | Desain mesin simulasi Layer 2 dan 3, daftar event, hasil tes |
| M3 | `M3.md` | Daftar perintah CLI MVP, tingkat kesetiaan per perintah, hasil ekspor konfigurasi |
| M4 | `M4.md` | Desain mode simulasi dan inspeksi, hasil hardening container |
| M5 | `M5.md` | Hasil uji coba kelas, catatan perbaikan, panduan instalasi |

Selain itu, pakai dua jenis dokumen berjalan:

- **ADR (Architecture Decision Record)** di `docs/adr/`. Satu berkas per keputusan penting, misalnya `0001-mesin-simulasi-di-server.md`. Formatnya singkat: konteks, keputusan, konsekuensi.
- **CHANGELOG.md** di akar repo. Dicatat per rilis.

Agen Antigravity bisa membantu menyusun draf dokumen ini dari kode dan commit, tetapi isi keputusannya kamu yang tentukan.

## 6. CI/CD dengan GitHub Actions

Dua workflow. Keduanya menghasilkan log yang bisa dijadikan bukti di dokumen milestone.

### 6.1 CI: `.github/workflows/ci.yml`

Jalan di setiap push dan pull request. Tahapannya:

```
1. Checkout kode
2. Setup Node.js sesuai .nvmrc
3. Install dependensi
4. Lint
5. Test unit (engine, cli, server)
6. Build web
7. Build Docker image (tanpa push), untuk memastikan Dockerfile valid
```

Gagal di tahap mana pun menghentikan pipeline. PR tidak bisa di-merge jika CI merah. Ini menegakkan NFR-15 (tes unit) dan NFR-6 (build reproducible).

### 6.2 Release: `.github/workflows/release.yml`

Jalan saat kamu push tag versi, misalnya `v0.1.0`. Tahapannya:

```
1. Checkout kode
2. Build Docker image untuk amd64 dan arm64 (NFR-5)
3. Beri tag image dengan versi
4. Push ke registry (GitHub Container Registry atau Docker Hub)
5. Buat GitHub Release dengan catatan dari CHANGELOG
```

Pilihan registry (GHCR atau Docker Hub) masih terbuka, ada di pertanyaan PRD bagian 14.

### 6.3 Catatan keamanan CI

- Simpan kredensial registry sebagai GitHub Secrets, bukan di dalam kode.
- Jangan pernah memasukkan image IOS, file Packet Tracer, atau materi Academy ke repo atau image (NFR-12). Tambahkan pola berkas itu ke `.gitignore` dan `.dockerignore`.
- Tambahkan langkah scan dependensi, misalnya `npm audit`, di CI.

## 7. Dockerfile dan menjalankan lokal

### 7.1 Prinsip Dockerfile

- Multi-stage build: tahap build untuk kompilasi web dan server, tahap runtime yang ramping.
- Base image dikunci versinya (NFR-6).
- Container berjalan sebagai user non-root (NFR-11).
- Hanya port aplikasi yang diekspos.

Kerangka (agen bisa melengkapinya):

```dockerfile
# Tahap build
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Tahap runtime
FROM node:22-bookworm-slim
WORKDIR /app
RUN useradd --system --create-home appuser
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER appuser
EXPOSE 8080
HEALTHCHECK CMD node dist/healthcheck.js
CMD ["node", "dist/server.js"]
```

Versi base image di atas adalah contoh. Kunci ke versi digest yang tepat sebelum rilis.

### 7.2 docker-compose untuk pengembangan lokal

```yaml
services:
  netsimtri:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - netsimtri-data:/data
    environment:
      - NODE_ENV=development
volumes:
  netsimtri-data:
```

### 7.3 Menjalankan di komputermu

```bash
# build dan jalankan
docker compose up --build

# buka di browser
# http://localhost:8080

# hentikan
docker compose down
```

Data topologi tersimpan di volume `netsimtri-data`, jadi tetap ada setelah container dihentikan (FR-0).

## 8. Siklus kerja harian

1. Tarik perubahan terbaru: `git pull origin main`.
2. Buat branch fitur.
3. Di Antigravity, beri agen tugas satu fitur dengan rujukan ke FR terkait.
4. Tinjau kode dan Artifact yang dihasilkan.
5. Jalankan tes lokal: `npm test`.
6. Jalankan di Docker: `docker compose up --build`, lalu cek di browser.
7. Commit dan push.
8. Buka PR. Tunggu CI hijau.
9. Merge ke `main`.
10. Perbarui dokumen milestone jika tahap selesai.

## 9. Urutan eksekusi yang disarankan

Ikuti urutan milestone di PRD bagian 16.

1. **M0:** Siapkan repo, struktur folder, CI dasar, Dockerfile kosong yang bisa di-build. Tulis `M0.md` dan ADR pertama.
2. **M1:** Kanvas, kabel, penyimpanan. Verifikasi di browser lewat Antigravity.
3. **M2:** Mesin simulasi Layer 2 dan 3. Fokus pada tes unit.
4. **M3:** CLI IOS 15 untuk platform CCNA. Ekspor konfigurasi.
5. **M4:** Mode simulasi dan inspeksi. Hardening container.
6. **M5:** Uji coba kelas, rilis image pertama dengan tag `v1.0.0`.

Setiap milestone diakhiri dengan: CI hijau, dokumen milestone terisi, dan image bisa dijalankan di Docker lokal.

## 10. Yang perlu diputuskan

1. **Registry image:** GitHub Container Registry atau Docker Hub?
2. **Lisensi kode:** MIT atau Apache 2.0? Pengaruh ke berkas `LICENSE` dan header.
3. **Bahasa mesin simulasi:** TypeScript (satu bahasa dengan web dan server) atau Python? Panduan ini mengasumsikan TypeScript.
4. **Cakupan peran agen:** seberapa banyak kode diserahkan ke agen Antigravity, dan mana yang ditulis manual?

## 11. Sumber

- Google Antigravity, ikhtisar fitur (OpenReplay): https://blog.openreplay.com/google-antigravity-ide-guide/
- Google Antigravity, catatan keterbatasan Git branching (Zeabur): https://bunny.zeabur.com/blogs/google-antigravity-agentic-ide-features
- Google Antigravity, Editor dan Manager view (gend.co): https://www.gend.co/blog/google-antigravity
