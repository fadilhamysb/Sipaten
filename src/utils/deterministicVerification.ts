import { VerificationFinding, VerificationStatusType } from '../../server/types';

/**
 * Normalisasi teks untuk pencocokan: menghapus spasi ganda, tanda baca tertentu,
 * dan mengubah ke lowercase.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”"']/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalisasi format angka Indonesia ke bentuk kanonikal:
 * e.g., "1.000,50" -> "1000.5", "15.000" -> "15000", "20,5%" -> "20.5%"
 */
export function normalizeNumber(numStr: string): string {
  let cleaned = numStr.replace(/\s+/g, '').trim();
  // Tangani angka ribuan dengan titik: misal 1.000 atau 15.000
  cleaned = cleaned.replace(/(\d{1,3})\.(\d{3})/g, '$1$2');
  // Ganti koma desimal dengan titik: misal 25,4% -> 25.4% atau 1000,5 -> 1000.5
  cleaned = cleaned.replace(/(\d+),(\d+)/g, '$1.$2');
  return cleaned;
}

/**
 * Ekstraksi angka dan persentase dari teks.
 */
export function extractNumbersAndPercentages(text: string): string[] {
  // Tangkap angka ribuan titik, koma desimal, persentase, dan penyebutan mata uang/satuan
  const regex = /(?:Rp\s*)?\b\d{1,3}(?:\.\d{3})*(?:,\d+)?(?:\s*(?:persen|%|ribu|juta|miliar|triliun))?\b|\b\d+(?:,\d+)?\s*%/gi;
  const matches = text.match(regex) || [];
  // Filter angka yang terlalu pendek (misal nomor urut 1, 2) kecuali persentase atau angka besar
  return Array.from(new Set(matches.map(m => m.trim()))).filter(item => {
    // Abaikan satu digit sendirian tanpa satuan
    return !/^\d$/.test(item);
  });
}

/**
 * Ekstraksi tanggal dalam format Indonesia dari teks.
 */
export function extractIndonesianDates(text: string): string[] {
  const months = '(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)';
  const dateRegex = new RegExp(`\\b\\d{1,2}\\s+${months}(?:\\s+\\d{4})?\\b|\\b\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}\\b`, 'gi');
  const matches = text.match(dateRegex) || [];
  return Array.from(new Set(matches.map(m => m.trim())));
}

/**
 * Ekstraksi teks di dalam tanda kutip ("..." atau “...”).
 */
export function extractQuotes(text: string): string[] {
  const quoteRegex = /["“]([^"”]{4,200})["”]/g;
  const quotes: string[] = [];
  let match;
  while ((match = quoteRegex.exec(text)) !== null) {
    if (match[1] && match[1].trim().length > 3) {
      quotes.push(match[1].trim());
    }
  }
  return quotes;
}

/**
 * Lapis Verifikasi Deterministik (Kode Murni, Tanpa AI):
 * Memeriksa angka, persentase, tanggal, dan kutipan terhadap dokumen sumber asli.
 */
export function runDeterministicVerification(
  sourceText: string,
  pressReleaseText: string,
  instagramText: string
): VerificationFinding[] {
  const findings: VerificationFinding[] = [];
  const normalizedSource = normalizeText(sourceText);

  // 1. Periksa Teks dalam Tanda Kutip (Quotes)
  const prQuotes = extractQuotes(pressReleaseText);
  const igQuotes = extractQuotes(instagramText);

  prQuotes.forEach((quote, idx) => {
    const normalizedQuote = normalizeText(quote);
    const isExactMatch = normalizedSource.includes(normalizedQuote);
    
    // Jika tidak exact, cek kemiripan parsial
    if (!isExactMatch) {
      findings.push({
        id: `det-quote-pr-${idx}`,
        targetProduk: 'siaranPers',
        tipeTemuan: 'kutipan',
        klaimDiuji: `"${quote}"`,
        status: 'tidak_ditemukan',
        catatanPenjelasan: 'Pernyataan kutipan dalam tanda petik ini tidak ditemukan persis di dalam teks dokumen sumber asli (dilarang mengarang pernyataan pejabat).',
      });
    } else {
      findings.push({
        id: `det-quote-pr-${idx}`,
        targetProduk: 'siaranPers',
        tipeTemuan: 'kutipan',
        klaimDiuji: `"${quote}"`,
        status: 'terverifikasi',
        sumberKutipan: quote,
        catatanPenjelasan: 'Kutipan resmi terverifikasi cocok dengan dokumen sumber asli.',
      });
    }
  });

  igQuotes.forEach((quote, idx) => {
    const normalizedQuote = normalizeText(quote);
    const isExactMatch = normalizedSource.includes(normalizedQuote);
    if (!isExactMatch) {
      findings.push({
        id: `det-quote-ig-${idx}`,
        targetProduk: 'captionInstagram',
        tipeTemuan: 'kutipan',
        klaimDiuji: `"${quote}"`,
        status: 'tidak_ditemukan',
        catatanPenjelasan: 'Kutipan dalam caption Instagram tidak ditemukan di dalam teks dokumen sumber asli.',
      });
    }
  });

  // 2. Periksa Angka dan Data
  const prNumbers = extractNumbersAndPercentages(pressReleaseText);
  const igNumbers = extractNumbersAndPercentages(instagramText);

  const checkNumberInSource = (num: string, target: 'siaranPers' | 'captionInstagram', idPrefix: string) => {
    const normalizedNum = normalizeNumber(num).toLowerCase();
    const rawNum = num.toLowerCase();
    
    // Cari baik format asli maupun angka yang dinormalisasi
    const exists = sourceText.toLowerCase().includes(rawNum) || 
                   normalizedSource.includes(normalizedNum) ||
                   sourceText.includes(num.replace(/\./g, ''));

    if (!exists) {
      findings.push({
        id: `${idPrefix}-${num.replace(/[^a-zA-Z0-9]/g, '')}`,
        targetProduk: target,
        tipeTemuan: 'angka_data',
        klaimDiuji: `Angka/Data: ${num}`,
        status: 'tidak_ditemukan',
        catatanPenjelasan: `Data angka "${num}" tidak ditemukan dalam teks sumber dokumen. Pastikan tidak ada rekayasa data kuantitatif.`,
      });
    }
  };

  prNumbers.forEach(n => checkNumberInSource(n, 'siaranPers', 'det-num-pr'));
  igNumbers.forEach(n => checkNumberInSource(n, 'captionInstagram', 'det-num-ig'));

  // 3. Periksa Tanggal
  const prDates = extractIndonesianDates(pressReleaseText);
  const igDates = extractIndonesianDates(instagramText);

  const checkDateInSource = (dt: string, target: 'siaranPers' | 'captionInstagram', idPrefix: string) => {
    const normalizedDate = normalizeText(dt);
    const exists = normalizedSource.includes(normalizedDate);
    if (!exists) {
      findings.push({
        id: `${idPrefix}-${dt.replace(/[^a-zA-Z0-9]/g, '')}`,
        targetProduk: target,
        tipeTemuan: 'tanggal_lokasi',
        klaimDiuji: `Tanggal: ${dt}`,
        status: 'tidak_ditemukan',
        catatanPenjelasan: `Tanggal "${dt}" tidak ditemukan dalam teks sumber dokumen asli.`,
      });
    }
  };

  prDates.forEach(d => checkDateInSource(d, 'siaranPers', 'det-date-pr'));
  igDates.forEach(d => checkDateInSource(d, 'captionInstagram', 'det-date-ig'));

  // 4. Periksa Konsistensi Angka antara Siaran Pers dan Caption Instagram
  // Jika Siaran Pers memuat angka tertentu dan Caption Instagram memuat angka yang bertentangan
  const igNumbersSet = new Set(igNumbers.map(n => normalizeNumber(n)));
  const prNumbersSet = new Set(prNumbers.map(n => normalizeNumber(n)));

  // Cek apakah ada angka di IG yang tidak ada di PR jika itu merupakan data pokok
  igNumbers.forEach(n => {
    const norm = normalizeNumber(n);
    if (!prNumbersSet.has(norm) && !sourceText.includes(n)) {
      findings.push({
        id: `det-diff-${norm}`,
        targetProduk: 'keduanya',
        tipeTemuan: 'inkonsistensi_produk',
        klaimDiuji: `Perbedaan angka: "${n}" ada di Instagram namun tidak ditemukan di Siaran Pers maupun Sumber`,
        status: 'berpotensi_tidak_konsisten',
        catatanPenjelasan: 'Terdapat perbedaan data kuantitatif antara siaran pers dan Instagram.',
      });
    }
  });

  return findings;
}

/**
 * Menggabungkan temuan deterministik dan temuan Gemini AI.
 * Sesuai aturan: "Jika hasil deterministik dan Gemini berbeda, pakai status yang lebih berhati-hati."
 * Urutan kehati-hatian:
 * 1. berpotensi_tidak_konsisten
 * 2. tidak_ditemukan
 * 3. perlu_pemeriksaan
 * 4. terverifikasi
 */
const STATUS_PRIORITY: Record<VerificationStatusType, number> = {
  berpotensi_tidak_konsisten: 4,
  tidak_ditemukan: 3,
  perlu_pemeriksaan: 2,
  terverifikasi: 1,
};

export function mergeVerificationFindings(
  deterministic: VerificationFinding[],
  aiFindings: VerificationFinding[]
): VerificationFinding[] {
  const mergedMap = new Map<string, VerificationFinding>();

  // Masukkan temuan deterministik dahulu
  for (const f of deterministic) {
    const key = `${f.targetProduk}:${f.tipeTemuan}:${normalizeText(f.klaimDiuji)}`;
    mergedMap.set(key, f);
  }

  // Masukkan temuan AI atau rekonsiliasi jika duplikat
  for (const f of aiFindings) {
    const key = `${f.targetProduk}:${f.tipeTemuan}:${normalizeText(f.klaimDiuji)}`;
    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key)!;
      // Pilih status yang lebih berhati-hati (prioritas lebih tinggi)
      const existingPriority = STATUS_PRIORITY[existing.status] || 1;
      const aiPriority = STATUS_PRIORITY[f.status] || 1;
      if (aiPriority > existingPriority) {
        mergedMap.set(key, { ...f, id: existing.id });
      }
    } else {
      mergedMap.set(key, f);
    }
  }

  return Array.from(mergedMap.values());
}
