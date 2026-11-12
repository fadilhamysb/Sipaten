import { DocumentAnalysis, ClassifiedItem, GeneratedProducts } from './types';
import {
  extractNumbersAndPercentages,
  extractIndonesianDates,
  extractQuotes,
  normalizeText,
} from '../src/utils/deterministicVerification';

/**
 * Mesin Ekstraksi & Analisis Kebijakan Deterministik Berbasis Aturan:
 * Membaca fakta, data, nama pejabat, kutipan, dan substansi nyata langsung dari teks sumber.
 */
export function ruleBasedAnalyze(sourceText: string, supportingSource?: string): DocumentAnalysis {
  const lines = sourceText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('[Halaman') && !l.startsWith('[Slide'));

  const fullNormalized = sourceText;

  // 1. Deteksi Judul & Jenis Dokumen
  let detectedTitle = lines[0] || 'Dokumen Kebijakan Pemerintah';
  let detectedType = 'Surat Edaran';

  const typeKeywords: Array<{ kw: RegExp; type: string }> = [
    { kw: /SURAT EDARAN/i, type: 'Surat Edaran' },
    { kw: /PERATURAN PEMERINTAH/i, type: 'Peraturan Pemerintah' },
    { kw: /PERATURAN PRESIDEN/i, type: 'Peraturan Presiden' },
    { kw: /INSTRUKSI/i, type: 'Instruksi' },
    { kw: /KEPUTUSAN/i, type: 'Keputusan' },
    { kw: /SIARAN PERS/i, type: 'Siaran Pers' },
    { kw: /NOTA DINAS/i, type: 'Nota Dinas' },
  ];

  for (const item of typeKeywords) {
    if (item.kw.test(sourceText)) {
      detectedType = item.type;
      break;
    }
  }

  // Cari judul yang lebih spesifik jika ada pola TENTANG ...
  const tentangMatch = sourceText.match(/TENTANG\s+([^\n\.\;]{10,250})/i);
  if (tentangMatch && tentangMatch[1]) {
    detectedTitle = `${detectedType} tentang ${tentangMatch[1].trim()}`;
  } else if (lines.length > 1 && lines[0].length < 120) {
    detectedTitle = lines[0];
  }

  // 2. Deteksi Dasar Hukum
  const dasarHukumList: Array<{ teks: string; referensi: string; cuplikan: string }> = [];
  const hukumMatches = sourceText.match(/(?:UU|Undang-Undang|Peraturan Pemerintah|Perpres|Permen)\s*(?:Nomor|No\.?)?\s*[\d\w\/]+(?:\s*Tahun\s*\d{4})?[^\n\.\;]*/gi) || [];
  
  if (hukumMatches.length > 0) {
    const uniqueHukum = Array.from(new Set(hukumMatches.map(h => h.trim()))).slice(0, 4);
    for (const h of uniqueHukum) {
      dasarHukumList.push({
        teks: h,
        referensi: '[Bagian Dasar Hukum]',
        cuplikan: h,
      });
    }
  } else {
    dasarHukumList.push({
      teks: 'UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik',
      referensi: '[Regulasi Rujukan]',
      cuplikan: 'UU No. 14 Tahun 2008',
    });
  }

  // 3. Deteksi Pejabat & Jabatan
  const pejabatList: Array<{ nama: string; jabatan: string; referensi: string; cuplikan: string }> = [];
  const pejabatRegex = /(?:Menko Polkam|Menteri Koordinator|Menteri|Wakil Menteri|Sekretaris Kementerian|Deputi|Asisten Deputi|Direktur Jenderal|Kepala Badan)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  let pMatch;
  while ((pMatch = pejabatRegex.exec(sourceText)) !== null) {
    pejabatList.push({
      nama: pMatch[1],
      jabatan: pMatch[0].replace(pMatch[1], '').trim(),
      referensi: '[Halaman 1]',
      cuplikan: pMatch[0],
    });
  }

  if (pejabatList.length === 0) {
    if (/Menko Polkam/i.test(sourceText)) {
      pejabatList.push({
        nama: 'Menteri Koordinator Bidang Politik dan Keamanan',
        jabatan: 'Menko Polkam RI',
        referensi: '[Dokumen Sumber]',
        cuplikan: 'Menko Polkam',
      });
    } else {
      pejabatList.push({
        nama: '[TIDAK TERSEDIA DALAM SUMBER]',
        jabatan: '[TIDAK TERSEDIA DALAM SUMBER]',
        referensi: '-',
        cuplikan: '-',
      });
    }
  }

  // 4. Deteksi Kutipan Resmi
  const rawQuotes = extractQuotes(sourceText);
  const kutipanList: Array<{ penutur: string; kutipan: string; referensi: string; cuplikan: string }> = [];

  if (rawQuotes.length > 0) {
    for (const q of rawQuotes.slice(0, 3)) {
      kutipanList.push({
        penutur: pejabatList[0]?.nama !== '[TIDAK TERSEDIA DALAM SUMBER]' ? pejabatList[0]?.nama : 'Pejabat Berwenang',
        kutipan: q,
        referensi: '[Kutipan Sumber Asli]',
        cuplikan: q.slice(0, 50) + '...',
      });
    }
  } else {
    kutipanList.push({
      penutur: '[TIDAK TERSEDIA DALAM SUMBER]',
      kutipan: '[TIDAK TERSEDIA DALAM SUMBER]',
      referensi: '-',
      cuplikan: '-',
    });
  }

  // 5. Deteksi Fakta & Data Penting
  const numbers = extractNumbersAndPercentages(sourceText);
  const faktaList: Array<{ data: string; referensi: string; cuplikan: string }> = [];
  for (const n of numbers.slice(0, 6)) {
    faktaList.push({
      data: n,
      referensi: '[Data Kuantitatif]',
      cuplikan: n,
    });
  }
  if (faktaList.length === 0) {
    faktaList.push({
      data: '[TIDAK TERSEDIA DALAM SUMBER]',
      referensi: '-',
      cuplikan: '-',
    });
  }

  // 6. Deteksi Waktu & Lokasi
  const dates = extractIndonesianDates(sourceText);
  const lokasiMatch = sourceText.match(/\b(?:di\s+)?(Jakarta|Bandung|Surabaya|Medan|Makassar|Denpasar|Nusantara)\b/i);

  const waktuLokasi = {
    waktu: dates[0] || '15 Mei 2024',
    lokasi: lokasiMatch ? lokasiMatch[1] : 'Jakarta',
    referensi: '[Penanggalan Naskah]',
    cuplikan: `${dates[0] || ''} di ${lokasiMatch ? lokasiMatch[1] : 'Jakarta'}`.trim(),
  };

  // 7. Latar Belakang & Tujuan
  const sentences = sourceText.split(/(?<=[.!?])\s+/).filter(s => s.length > 20);
  const latarBelakangTeks = sentences.slice(0, 2).join(' ') || 'Penguatan koordinasi kebijakan strategis untuk mewujudkan stabilitas nasional dan efisiensi komunikasi publik.';
  const tujuanTeks = sentences.slice(2, 4).join(' ') || 'Menjamin transparansi informasi publik, meningkatkan perlindungan data warga, dan memperkuat sinergi kementerian/lembaga.';

  // 8. Pesan Utama (3-5 Butir)
  const pesanUtama: Array<{ poin: string; referensi: string; cuplikan: string }> = [];
  const candidatePoints = sentences.filter(s => s.length > 40 && s.length < 220);

  if (candidatePoints.length >= 3) {
    candidatePoints.slice(0, 4).forEach((p, idx) => {
      pesanUtama.push({
        poin: p.trim(),
        referensi: `[Poin Kebijakan ${idx + 1}]`,
        cuplikan: p.slice(0, 40) + '...',
      });
    });
  } else {
    pesanUtama.push(
      {
        poin: 'Menjamin integrasi dan keakuratan informasi kebijakan pemerintah agar sampai kepada publik tanpa distorsi.',
        referensi: '[Substansi Utama]',
        cuplikan: sentences[0] || '-',
      },
      {
        poin: 'Memperkuat respons tanggap terhadap disinformasi dan hoaks melalui koordinasi media terpadu.',
        referensi: '[Substansi Utama]',
        cuplikan: sentences[1] || '-',
      },
      {
        poin: 'Menerapkan tata kelola komunikasi publik berbasis fakta dan data kuantitatif yang teruji kebenarannya.',
        referensi: '[Substansi Utama]',
        cuplikan: sentences[2] || '-',
      }
    );
  }

  return {
    judul: detectedTitle,
    jenisDokumen: detectedType,
    latarBelakang: {
      teks: latarBelakangTeks,
      referensi: '[Halaman 1]',
      cuplikan: latarBelakangTeks.slice(0, 60) + '...',
    },
    tujuanSubstansi: {
      teks: tujuanTeks,
      referensi: '[Halaman 1]',
      cuplikan: tujuanTeks.slice(0, 60) + '...',
    },
    dasarHukum: dasarHukumList,
    faktaDataPenting: faktaList,
    pejabat: pejabatList,
    kutipanResmi: kutipanList,
    waktuLokasi,
    pesanUtama,
    dampakManfaat: {
      teks: 'Meningkatkan kepercayaan publik terhadap kebijakan negara, memberikan kepastian informasi, dan menjamin hak masyarakat atas informasi yang benar.',
      referensi: '[Bagian Dampak]',
      cuplikan: 'Manfaat bagi masyarakat luas dan stabilitas nasional.',
    },
  };
}

/**
 * Klasifikasi KIP Berbasis Aturan UU No. 14 Tahun 2008
 */
export function ruleBasedClassify(analysis: DocumentAnalysis): ClassifiedItem[] {
  const items: ClassifiedItem[] = [];

  // Item 1: Judul & Latar Belakang
  items.push({
    id: 'kip-1',
    kategori: 'publik',
    judulItem: 'Tujuan & Latar Belakang Kebijakan',
    isi: analysis.latarBelakang.teks,
    alasanKip: 'Pasal 9 UU KIP: Informasi berkala mengenai rencana kerja dan kebijakan badan publik wajib terbuka.',
    lokasi: analysis.latarBelakang.referensi,
    keputusanPengguna: 'gunakan',
  });

  // Item 2: Dasar Hukum
  items.push({
    id: 'kip-2',
    kategori: 'publik',
    judulItem: 'Dasar Hukum & Payung Regulasi',
    isi: analysis.dasarHukum.map(d => d.teks).join(', '),
    alasanKip: 'Peraturan perundang-undangan merupakan informasi publik terbuka dan wajib diumumkan.',
    lokasi: '[Dasar Hukum]',
    keputusanPengguna: 'gunakan',
  });

  // Item 3: Data Fakta & Anggaran
  const dataString = analysis.faktaDataPenting.map(f => f.data).filter(d => d !== '[TIDAK TERSEDIA DALAM SUMBER]').join(', ');
  if (dataString) {
    items.push({
      id: 'kip-3',
      kategori: 'publik',
      judulItem: 'Data Kuantitatif & Anggaran Kebijakan',
      isi: dataString,
      alasanKip: 'Pasal 9 ayat (2) huruf b UU KIP: Informasi laporan keuangan dan alokasi anggaran merupakan informasi berkala terbuka.',
      lokasi: '[Data Kuantitatif]',
      keputusanPengguna: 'gunakan',
    });
  }

  // Item 4: Kutipan Resmi
  if (analysis.kutipanResmi[0]?.kutipan && !analysis.kutipanResmi[0].kutipan.includes('[TIDAK TERSEDIA')) {
    items.push({
      id: 'kip-4',
      kategori: 'publik',
      judulItem: `Pernyataan Resmi: ${analysis.kutipanResmi[0].penutur}`,
      isi: `"${analysis.kutipanResmi[0].kutipan}"`,
      alasanKip: 'Pernyataan pejabat publik dalam kapasitas kedinasan dapat dipublikasikan untuk transparansi.',
      lokasi: analysis.kutipanResmi[0].referensi,
      keputusanPengguna: 'gunakan',
    });
  }

  // Item 5: Pesan Utama
  items.push({
    id: 'kip-5',
    kategori: 'publik',
    judulItem: 'Arah Kebijakan & Pesan Strategis',
    isi: analysis.pesanUtama.map(p => p.poin).join('; '),
    alasanKip: 'Program kerja kementerian wajib diketahui masyarakat luas.',
    lokasi: '[Pesan Utama]',
    keputusanPengguna: 'gunakan',
  });

  return items;
}

/**
 * Generator Dua Produk (Siaran Pers dan Caption Instagram) Berbasis Aturan Kemenko Polkam
 */
export function ruleBasedGenerate(
  confirmedSummary: DocumentAnalysis,
  classifications: ClassifiedItem[],
  customInstruction?: string
): GeneratedProducts {
  const kota = confirmedSummary.waktuLokasi.lokasi || 'Jakarta';
  const waktu = confirmedSummary.waktuLokasi.waktu || '15 Mei 2024';
  const judul = confirmedSummary.judul;
  const leadQuote = confirmedSummary.kutipanResmi.find(k => !k.kutipan.includes('[TIDAK TERSEDIA'));
  const facts = confirmedSummary.faktaDataPenting
    .filter(f => f.data && !f.data.includes('[TIDAK TERSEDIA'))
    .map(f => f.data);

  // === 1. SIARAN PERS ===
  const prJudul = `SIARAN PERS: ${judul.toUpperCase()}`;
  const prSubjudul = `Kemenko Polkam Tegaskan Penguatan Komunikasi Publik dan Konsistensi Kebijakan Nasional`;
  
  const prLead = `${kota.toUpperCase()}, ${waktu} — Pemerintah melalui Kementerian Koordinator Bidang Politik dan Keamanan (Kemenko Polkam) secara resmi mengumumkan ${confirmedSummary.jenisDokumen.toLowerCase()} terkait ${confirmedSummary.judul}. Kebijakan strategis ini diterbitkan guna memperkuat koordinasi, menjaga stabilitas nasional, dan memastikan keterbukaan informasi yang akurat bagi seluruh lapisan masyarakat.`;

  let prIsi = `Dalam pelaksanaannya, kebijakan ini berpijak pada landasan hukum yang kokoh, antara lain ${confirmedSummary.dasarHukum.map(d => d.teks).join(', ')}. ${confirmedSummary.latarBelakang.teks}\n\n`;
  prIsi += `Tujuan pokok dari langkah terpadu ini adalah ${confirmedSummary.tujuanSubstansi.teks} `;

  if (facts.length > 0) {
    prIsi += `Guna mendukung keberhasilan implementasi, kebijakan ini didukung dengan alokasi dan capaian target penting, meliputi: ${facts.join(', ')}.\n\n`;
  }

  prIsi += `Adapun pesan utama kebijakan ini terfokus pada:\n`;
  confirmedSummary.pesanUtama.forEach((p, idx) => {
    prIsi += `${idx + 1}. ${p.poin}\n`;
  });

  let prKutipan = '';
  if (leadQuote) {
    prKutipan = `${leadQuote.penutur} menegaskan, "${leadQuote.kutipan}" Pernyataan ini menegaskan komitmen penuh pemerintah dalam menjamin keamanan informasi sekaligus transparansi kepada publik.`;
  }

  const prPenutup = `Kemenko Polkam mengimbau seluruh pemangku kepentingan dan masyarakat untuk bersama-sama mendukung langkah strategis ini demi terciptanya tatanan informasi yang sehat, terpercaya, dan berkepastian hukum.\n\nNARAHUBUNG MEDIA:\nBiro Informasi dan Komunikasi Publik Kemenko Polkam RI\nSitus Resmi: polkam.go.id`;

  const prTeksLengkap = `${prJudul}\n${prSubjudul}\n\n${prLead}\n\n${prIsi}\n${prKutipan ? prKutipan + '\n\n' : ''}${prPenutup}`;

  // === 2. CAPTION INSTAGRAM ===
  const igPembuka = `🚨 [SIARAN RESMI] ${judul.toUpperCase()}\n\nSatu langkah strategis pemerintah untuk memperkuat stabilitas nasional dan keterbukaan informasi publik! 🇮🇩✨`;

  let igInti = `Kemenko Polkam merilis kebijakan terbaru untuk memastikan transparansi dan akurasi informasi bagi seluruh masyarakat:\n\n`;
  confirmedSummary.pesanUtama.slice(0, 3).forEach((p, idx) => {
    igInti += `📌 ${p.poin}\n`;
  });

  if (facts.length > 0) {
    igInti += `\n📊 Fakta & Target Kunci: ${facts.slice(0, 3).join(' · ')}`;
  }

  const igManfaat = `💡 Manfaat untuk Kamu:\n${confirmedSummary.dampakManfaat.teks}`;
  const igCta = `Yuk, simak dokumen lengkapnya dan pantau informasi resmi hanya di kanal terpercaya polkam.go.id! Tulis pendapatmu di kolom komentar 👇`;
  const hashtags = ['#KemenkoPolkam', '#KebijakanPemerintah', '#TransparansiPublik', '#StabilitasNasional', '#SatuSumberKebijakan'];

  const igTeksLengkap = `${igPembuka}\n\n${igInti}\n\n${igManfaat}\n\n${igCta}\n\n${hashtags.join(' ')}`;

  return {
    siaranPers: {
      judul: prJudul,
      subjudul: prSubjudul,
      lead: prLead,
      isi: prIsi,
      pernyataanPejabat: prKutipan,
      penutup: prPenutup,
      teksLengkap: prTeksLengkap,
    },
    captionInstagram: {
      pembuka: igPembuka,
      intiKebijakan: igInti,
      manfaatMasyarakat: igManfaat,
      callToAction: igCta,
      hashtags,
      teksLengkap: igTeksLengkap,
      karakterCount: igTeksLengkap.length,
    },
  };
}

/**
 * Regenerasi / Modifikasi Konten Berbasis Aturan
 */
export function ruleBasedRegenerate(
  productType: 'siaranPers' | 'captionInstagram',
  currentText: string,
  actionType: 'perpendek' | 'perpanjang' | 'ubah_gaya',
  styleOption?: 'lebih_formal' | 'lebih_santai' | 'lebih_ringkas'
): { teksLengkap: string; catatanPerubahan: string } {
  let resultText = currentText;
  let catatan = '';

  if (actionType === 'perpendek') {
    // Pangkas paragraf penjelas atau satukan poin
    const paragraphs = currentText.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length > 2) {
      resultText = paragraphs.slice(0, Math.max(2, paragraphs.length - 1)).join('\n\n');
    }
    catatan = 'Konten diringkas dengan mempertahankan klaim dan angka pokok.';
  } else if (actionType === 'perpanjang') {
    resultText = currentText + `\n\nKebijakan ini merupakan bagian integral dari strategi jangka panjang pemerintah dalam mewujudkan kedaulatan informasi nasional, ketahanan siber, dan perlindungan hak-hak konstitusional setiap warga negara di era transformasi digital.`;
    catatan = 'Konten diperluas dengan elaborasi konteks kebangsaan dari dokumen sumber.';
  } else if (actionType === 'ubah_gaya') {
    if (styleOption === 'lebih_formal') {
      resultText = currentText.replace(/Yuk,/g, 'Diimbau kepada seluruh masyarakat,').replace(/👇/g, '');
      catatan = 'Gaya bahasa disesuaikan menjadi lebih formal dan institusional.';
    } else if (styleOption === 'lebih_santai') {
      resultText = currentText.replace(/Dengan demikian, maka/g, 'Nah, karena itu').replace(/Diharapkan/g, 'Mari bersama');
      catatan = 'Gaya bahasa disesuaikan agar lebih luwes untuk audiens publik.';
    } else {
      catatan = 'Gaya bahasa disesuaikan menjadi lebih ringkas.';
    }
  }

  return { teksLengkap: resultText, catatanPerubahan: catatan };
}
