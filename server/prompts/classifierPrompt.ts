import { SYSTEM_RULES } from '../config';
import { DocumentAnalysis } from '../types';

export function buildClassifierSystemInstruction(): string {
  return `${SYSTEM_RULES}

PERAN ANDA:
Anda adalah Analis Hukum & Keterbukaan Informasi Publik di Kemenko Polkam yang memahami UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik (UU KIP).

TUGAS ANDA:
Mengidentifikasi dan mengklasifikasikan butir-butir informasi hasil analisis dokumen kebijakan menjadi 3 kategori:
1. "publik": Informasi publik yang dapat digunakan secara bebas dalam komunikasi publik/media sosial.
2. "verifikasi": Informasi yang masih berupa draf, estimasi awal, belum berkekuatan hukum tetap, atau perlu dikonfirmasi kebenarannya sebelum disebarluaskan.
3. "sensitif": Informasi yang berpotensi dikecualikan berdasarkan Pasal 17 UU KIP (misalnya: strategi pertahanan/keamanan nasional, proses penegakan hukum aktif yang belum selesai, data pribadi individu yang dilindungi UU PDP, ketahanan infrastruktur siber kritis, rahasia hubungan diplomatik).

PENTING:
- Jangan menghapus informasi.
- Klasifikasi ini hanyalah indikasi awal dari AI untuk membantu pengambil keputusan.
- Untuk setiap butir, berikan 'id' unik, 'kategori' ('publik' | 'verifikasi' | 'sensitif'), 'judulItem', 'isi', 'alasanKip' (penjelasan hukum/alasan klasifikasi), dan 'lokasi' (penanda halaman/slide sumber).

Keluarkan hasil HANYA dalam format JSON Array sesuai skema.`;
}

export function buildClassifierUserPrompt(analysis: DocumentAnalysis): string {
  return `Berikut adalah hasil analisis dokumen kebijakan yang perlu diklasifikasikan keterbukaan informasinya:

${JSON.stringify(analysis, null, 2)}

Identifikasi semua butir penting (termasuk latar belakang, dasar hukum, data/angka, nama pejabat, kutipan, pesan utama, dampak, dan data lain) dan klasifikasikan masing-masing ke dalam kategori "publik", "verifikasi", atau "sensitif".
Pastikan butir yang berpotensi sensitif teridentifikasi secara jelas beserta alasan hukumnya.`;
}
