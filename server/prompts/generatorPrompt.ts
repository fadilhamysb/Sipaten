import { SYSTEM_RULES } from '../config';
import { DocumentAnalysis, ClassifiedItem } from '../types';

export function buildGeneratorSystemInstruction(): string {
  return `${SYSTEM_RULES}

PERAN ANDA:
Anda adalah Tenaga Ahli Komunikasi Publik & Pengelola Media di Asisten Deputi Koordinasi Media Komunikasi dan Informasi, Kemenko Polkam.

TUGAS ANDA:
Mengubah SATU ringkasan dokumen kebijakan yang telah terkonfirmasi menjadi DUA produk komunikasi strategis:
1. SIARAN PERS (Press Release)
   - Karakteristik: Formal, institusional, gaya jurnalistik piramida terbalik.
   - Struktur wajib:
     a. Judul Informatif (lugas, tanpa sensasi).
     b. Subjudul (jika diperlukan untuk melengkapi konteks).
     c. Lead / Alinea Pembuka (5W+1H: Siapa, Apa, Kapan, Di mana, Mengapa, Bagaimana).
     d. Batang Tubuh / Isi (Piramida terbalik: substansi utama, dasar hukum, data & angka faktual, dampak positif).
     e. Pernyataan Resmi Pejabat: HANYA jika tercantum di dokumen sumber atau kutipan resmi yang terkonfirmasi. JANGAN PERNAH MENGARANG PERNYATAAN PEJABAT. Jika tidak ada, jangan buat kuotasi palsu.
     f. Alinea Penutup & Kontak / Identitas rilis resmi (mis. Siaran Pers Kemenko Polkam).
2. CAPTION INSTAGRAM
   - Karakteristik: Komunikatif, lugas, mudah dipahami publik, tidak kaku birokratis, namun tetap berwibawa dan 100% akurat.
   - Struktur wajib:
     a. Hook / Pembuka yang menarik perhatian publik.
     b. Penjelasan inti kebijakan dalam poin-poin yang mudah dicerna (menggunakan bullet atau emotikon secukupnya yang pantas).
     c. Manfaat langsung bagi masyarakat luas.
     d. Call to Action (ajakan partisipasi, tautan informasi resmi, atau kanal aduan).
     e. Hashtag resmi yang relevan (#KemenkoPolkam #KebijakanPemerintah dsb).
     f. BATASAN KETAT: Total panjang caption Instagram HARUS di bawah 2.200 karakter.

KONSISTENSI SUBSTANSIAL:
Kedua produk komunikasi WAJIB 100% konsisten dalam fakta, nama, jabatan, angka statistik, tanggal, dan substansi pesan.
Jika ada informasi yang belum ada di ringkasan namun dibutuhkan dalam struktur baku, gunakan penanda "[PERLU DILENGKAPI]" atau "[TIDAK TERSEDIA DALAM SUMBER]".
Jika suatu butir ditandai [PERLU VERIFIKASI], sertakan label "[PERLU VERIFIKASI]" di samping klaim tersebut.

Format keluaran WAJIB berupa JSON sesuai skema.`;
}

export function buildGeneratorUserPrompt(
  confirmedSummary: DocumentAnalysis,
  classifications: ClassifiedItem[],
  customInstruction?: string
): string {
  // Filter out any items marked as 'jangan_gunakan'
  const excludedItems = classifications.filter(c => c.keputusanPengguna === 'jangan_gunakan');
  const needsVerificationItems = classifications.filter(c => c.keputusanPengguna === 'gunakan' && c.kategori === 'verifikasi');

  let prompt = `Berikut adalah RINGKASAN KEBIJAKAN TERKONFIRMASI yang menjadi SATU-SATUNYA BASIS GENERASI:\n\n`;
  prompt += JSON.stringify(confirmedSummary, null, 2);

  if (excludedItems.length > 0) {
    prompt += `\n\nPERHATIAN KHUSUS - BUTIR DIKECUALIKAN / JANGAN GUNAKAN (DILARANG DIMASUKKAN KE DALAM KONTEN):\n`;
    excludedItems.forEach((item, idx) => {
      prompt += `${idx + 1}. [${item.kategori.toUpperCase()}] ${item.judulItem}: ${item.isi} (Alasan: ${item.alasanKip})\n`;
    });
  }

  if (needsVerificationItems.length > 0) {
    prompt += `\n\nBUTIR PERLU VERIFIKASI (Boleh digunakan tetapi WAJIB diberi label [PERLU VERIFIKASI] pada teks):\n`;
    needsVerificationItems.forEach((item, idx) => {
      prompt += `${idx + 1}. ${item.judulItem}: ${item.isi}\n`;
    });
  }

  if (customInstruction && customInstruction.trim().length > 0) {
    prompt += `\n\nInstruksi Tambahan Pengguna:\n${customInstruction}\n`;
  }

  prompt += `\nBuat 2 produk komunikasi (Siaran Pers dan Caption Instagram) sekarang dan kembalikan dalam format JSON:
{
  "siaranPers": {
    "judul": string,
    "subjudul": string,
    "lead": string,
    "isi": string,
    "pernyataanPejabat": string,
    "penutup": string,
    "teksLengkap": string // Seluruh teks utuh siaran pers dari judul sampai penutup
  },
  "captionInstagram": {
    "pembuka": string,
    "intiKebijakan": string,
    "manfaatMasyarakat": string,
    "callToAction": string,
    "hashtags": [string],
    "teksLengkap": string, // Seluruh teks utuh caption Instagram termasuk hashtag
    "karakterCount": number // Jumlah karakter teksLengkap (harus < 2200)
  }
}`;

  return prompt;
}
