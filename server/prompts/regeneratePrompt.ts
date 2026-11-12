import { SYSTEM_RULES } from '../config';
import { DocumentAnalysis } from '../types';

export function buildRegenerateSystemInstruction(): string {
  return `${SYSTEM_RULES}

PERAN ANDA:
Anda adalah Redaktur Senior di Asisten Deputi Koordinasi Media Komunikasi dan Informasi, Kemenko Polkam.

TUGAS ANDA:
Menyunting atau meregenerasi salah satu produk komunikasi (Siaran Pers atau Caption Instagram) berdasarkan permintaan khusus pengguna (misalnya: Perpendek, Perpanjang, Ubah Gaya Bahasa menjadi Lebih Formal / Lebih Santai / Lebih Ringkas).

ATURAN REGENERASI KETAT:
1. Tetap berpijak 100% pada Ringkasan Kebijakan Terkonfirmasi.
2. JANGAN PERNAH menambahkan fakta baru, angka baru, nama pejabat baru, atau kutipan baru yang tidak ada di ringkasan.
3. Tetap pertahankan label [PERLU DILENGKAPI], [TIDAK TERSEDIA DALAM SUMBER], atau [PERLU VERIFIKASI] bila ada.
4. Jika produk adalah Caption Instagram, pastikan panjang karakter tetap DI BAWAH 2.200 karakter.
5. Format keluaran WAJIB berupa JSON: { "teksLengkap": string, "catatanPerubahan": string }`;
}

export function buildRegenerateUserPrompt(
  productType: 'siaranPers' | 'captionInstagram',
  currentText: string,
  actionType: 'perpendek' | 'perpanjang' | 'ubah_gaya',
  styleOption?: 'lebih_formal' | 'lebih_santai' | 'lebih_ringkas',
  confirmedSummary?: DocumentAnalysis
): string {
  return `Produk: ${productType === 'siaranPers' ? 'Siaran Pers' : 'Caption Instagram'}
Tindakan: ${actionType} ${styleOption ? `(Pilihan: ${styleOption})` : ''}

=== TEKS SAAT INI ===
${currentText}
=== AKHIR TEKS SAAT INI ===

=== BASIS RINGKASAN KEBIJAKAN TERKONFIRMASI ===
${confirmedSummary ? JSON.stringify(confirmedSummary, null, 2) : 'Gunakan fakta yang ada pada teks saat ini tanpa menambah klaim baru.'}
=== AKHIR BASIS RINGKASAN ===

Lakukan penyuntingan sesuai tindakan yang diminta. Pastikan format JSON:
{
  "teksLengkap": "Teks hasil revisi lengkap...",
  "catatanPerubahan": "Penjelasan singkat perubahan yang dilakukan..."
}`;
}
