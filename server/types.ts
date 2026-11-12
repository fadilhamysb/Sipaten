export interface DocumentAnalysis {
  judul: string;
  jenisDokumen: string;
  latarBelakang: { teks: string; referensi: string; cuplikan: string };
  tujuanSubstansi: { teks: string; referensi: string; cuplikan: string };
  dasarHukum: Array<{ teks: string; referensi: string; cuplikan: string }>;
  faktaDataPenting: Array<{ data: string; referensi: string; cuplikan: string }>;
  pejabat: Array<{ nama: string; jabatan: string; referensi: string; cuplikan: string }>;
  kutipanResmi: Array<{ penutur: string; kutipan: string; referensi: string; cuplikan: string }>;
  waktuLokasi: { waktu: string; lokasi: string; referensi: string; cuplikan: string };
  pesanUtama: Array<{ poin: string; referensi: string; cuplikan: string }>;
  dampakManfaat: { teks: string; referensi: string; cuplikan: string };
}

export type KipCategory = 
  | 'publik' // Informasi publik yang dapat digunakan
  | 'verifikasi' // Perlu diverifikasi
  | 'sensitif'; // Berpotensi dikecualikan/sensitif

export interface ClassifiedItem {
  id: string;
  kategori: KipCategory;
  judulItem: string;
  isi: string;
  alasanKip: string;
  lokasi: string;
  keputusanPengguna?: 'gunakan' | 'jangan_gunakan';
}

export interface GeneratedProducts {
  siaranPers: {
    judul: string;
    subjudul?: string;
    lead: string;
    isi: string; // Paragraf piramida terbalik
    pernyataanPejabat?: string;
    penutup: string;
    teksLengkap: string;
  };
  captionInstagram: {
    pembuka: string;
    intiKebijakan: string;
    manfaatMasyarakat: string;
    callToAction?: string;
    hashtags: string[];
    teksLengkap: string;
    karakterCount: number;
  };
}

export type VerificationStatusType = 
  | 'terverifikasi' // Terverifikasi dari sumber
  | 'perlu_pemeriksaan' // Perlu pemeriksaan manual
  | 'tidak_ditemukan' // Tidak ditemukan dalam sumber
  | 'berpotensi_tidak_konsisten'; // Berpotensi tidak konsisten

export interface VerificationFinding {
  id: string;
  targetProduk: 'siaranPers' | 'captionInstagram' | 'keduanya';
  tipeTemuan: 'nama_jabatan' | 'tanggal_lokasi' | 'angka_data' | 'substansi' | 'kutipan' | 'klaim_tanpa_dasar' | 'inkonsistensi_produk';
  klaimDiuji: string;
  status: VerificationStatusType;
  sumberKutipan?: string;
  referensiSumber?: string;
  catatanPenjelasan: string;
}

export interface VerificationResult {
  statusRingkasan: {
    terverifikasiCount: number;
    perluPemeriksaanCount: number;
    tidakDitemukanCount: number;
    berpotensiTidakKonsistenCount: number;
  };
  findings: VerificationFinding[];
  timestamp: string;
}

export interface VerificationAudit {
  isVerified: boolean;
  reviewerName: string;
  notes: string;
  verifiedAt: string;
}

export interface StoredDocumentRecord {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  supportingSource?: string;
  extractedText: string;
  isOcr?: boolean;
  pageCount?: number;
  
  // Pipeline outputs
  analysis?: DocumentAnalysis;
  classifications?: ClassifiedItem[];
  products?: GeneratedProducts;
  
  // Product Versions
  pressReleaseHistory: Array<{
    id: string;
    text: string;
    timestamp: string;
    actionNote: string;
  }>;
  instagramHistory: Array<{
    id: string;
    text: string;
    timestamp: string;
    actionNote: string;
  }>;
  
  // Verification
  verification?: VerificationResult;
  audit?: VerificationAudit;
  currentStep: number;
}
