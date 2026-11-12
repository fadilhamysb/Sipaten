import { SYSTEM_RULES } from '../config';

export function buildAnalyzerSystemInstruction(): string {
  return `${SYSTEM_RULES}

PERAN ANDA:
Anda adalah Analis Kebijakan Senior di Asisten Deputi Koordinasi Media Komunikasi dan Informasi, Kemenko Polkam.
Tugas Anda adalah membaca dan menganalisis satu dokumen kebijakan pemerintah secara komprehensif, teliti, dan faktual.

INSTRUKSI ANALISIS:
Ekstraksi informasi penting dari teks dokumen dengan ketelitian 100%. Jangan pernah mengasumsikan detail yang tidak tertulis.
Untuk SETIAP bagian/butir temuan, Anda WAJIB menyertakan:
1. 'referensi': nomor halaman, slide, atau penanda bagian di mana informasi ditemukan (misalnya: "[Halaman 1]" atau "[Slide 3]" atau "[Bagian 2]").
2. 'cuplikan': kutipan kata demi kata singkat (maksimal 20-30 kata) dari teks sumber asli sebagai bukti.
Jika suatu informasi TIDAK ada di dalam dokumen sumber, isi nilai teks/data dengan persis: "[TIDAK TERSEDIA DALAM SUMBER]", referensi: "-", cuplikan: "-".

Format respons Anda WAJIB berupa JSON sesuai skema yang ditentukan.`;
}

export function buildAnalyzerUserPrompt(sourceText: string, supportingSource?: string): string {
  let prompt = `Berikut adalah teks dokumen kebijakan utama yang diekstrak:\n\n=== AWAL DOKUMEN SUMBER ===\n${sourceText}\n=== AKHIR DOKUMEN SUMBER ===\n`;
  if (supportingSource && supportingSource.trim().length > 0) {
    prompt += `\nSumber pendukung tambahan yang dilampirkan oleh pengguna (hanya sebagai pelengkap, prioritas tetap dokumen utama):\n=== SUMBER PENDUKUNG ===\n${supportingSource}\n=== AKHIR SUMBER PENDUKUNG ===\n`;
  }
  prompt += `\nLakukan analisis terstruktur dan kembalikan objek JSON dengan format:
{
  "judul": string,
  "jenisDokumen": string,
  "latarBelakang": { "teks": string, "referensi": string, "cuplikan": string },
  "tujuanSubstansi": { "teks": string, "referensi": string, "cuplikan": string },
  "dasarHukum": [{ "teks": string, "referensi": string, "cuplikan": string }],
  "faktaDataPenting": [{ "data": string, "referensi": string, "cuplikan": string }],
  "pejabat": [{ "nama": string, "jabatan": string, "referensi": string, "cuplikan": string }],
  "kutipanResmi": [{ "penutur": string, "kutipan": string, "referensi": string, "cuplikan": string }],
  "waktuLokasi": { "waktu": string, "lokasi": string, "referensi": string, "cuplikan": string },
  "pesanUtama": [{ "poin": string, "referensi": string, "cuplikan": string }], // 3 sampai 5 butir
  "dampakManfaat": { "teks": string, "referensi": string, "cuplikan": string }
}`;
  return prompt;
}
