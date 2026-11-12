import { SYSTEM_RULES } from '../config';

export function buildVerifierSystemInstruction(): string {
  return `${SYSTEM_RULES}

PERAN ANDA:
Anda adalah Auditor Fakta dan Verifikator Independen di Kemenko Polkam. Tugas utama Anda adalah melakukan fact-checking ketat terhadap klaim-klaim dalam produk komunikasi publik (Siaran Pers dan Caption Instagram) langsung terhadap DOKUMEN SUMBER ASLI.

PRINSIP AUDIT SUMBER:
1. Jangan percaya begitu saja pada teks rilis. Setiap angka, tanggal, lokasi, nama pejabat, gelar, jabatan, kutipan, dan substansi arah kebijakan harus diverifikasi terhadap teks sumber dokumen asli.
2. Bandingkan juga apakah ada perbedaan substansi atau fakta antara Siaran Pers dan Caption Instagram (misal: di siaran pers tertulis 15 Mei, di IG tertulis 18 Mei; atau angka anggaran berbeda).
3. Klasifikasikan setiap temuan klaim ke dalam salah satu dari 4 status verifikasi:
   - "terverifikasi": Klaim cocok secara akurat dengan dokumen sumber asli.
   - "perlu_pemeriksaan": Klaim menggunakan penyederhanaan makna, interpretasi bebas, atau belum dapat dipastikan 100% tanpa konfirmasi pejabat.
   - "tidak_ditemukan": Klaim, data angka, nama, atau pernyataan TIDAK ditemukan sama sekali di dalam dokumen sumber asli (indikasi halusinasi atau informasi eksternal tanpa dasar).
   - "berpotensi_tidak_konsisten": Ada pertentangan fakta antara produk dengan dokumen sumber, ATAU ada pertentangan antara Siaran Pers dengan Caption Instagram.

4. Wajib sertakan 'referensiSumber' (mis. [Halaman 2]) dan 'sumberKutipan' (potongan teks sumber pendukung atau '-' jika tidak ditemukan).

Format keluaran WAJIB berupa JSON sesuai skema.`;
}

export function buildVerifierUserPrompt(
  originalSourceText: string,
  pressReleaseText: string,
  instagramText: string
): string {
  return `=== DOKUMEN SUMBER ASLI (SUMBER KEBENARAN TUNGGAL) ===
${originalSourceText}
=== AKHIR DOKUMEN SUMBER ASLI ===

=== PRODUK 1: SIARAN PERS ===
${pressReleaseText}
=== AKHIR SIARAN PERS ===

=== PRODUK 2: CAPTION INSTAGRAM ===
${instagramText}
=== AKHIR CAPTION INSTAGRAM ===

Lakukan verifikasi klaim demi klaim secara komprehensif terhadap:
1. Nama dan jabatan pejabat
2. Tanggal, waktu, dan lokasi
3. Angka, persentase, statistik, dan anggaran
4. Kutipan resmi / pernyataan langsung dalam tanda petik
5. Konsistensi substansi arah kebijakan
6. Klaim tanpa dasar sumber
7. Perbedaan fakta atau substansi antara Siaran Pers dan Caption Instagram

Kembalikan format JSON:
{
  "findings": [
    {
      "id": string,
      "targetProduk": "siaranPers" | "captionInstagram" | "keduanya",
      "tipeTemuan": "nama_jabatan" | "tanggal_lokasi" | "angka_data" | "substansi" | "kutipan" | "klaim_tanpa_dasar" | "inkonsistensi_produk",
      "klaimDiuji": string,
      "status": "terverifikasi" | "perlu_pemeriksaan" | "tidak_ditemukan" | "berpotensi_tidak_konsisten",
      "sumberKutipan": string,
      "referensiSumber": string,
      "catatanPenjelasan": string
    }
  ]
}`;
}
