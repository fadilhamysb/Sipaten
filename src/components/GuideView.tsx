import React from 'react';
import {
  BookOpen,
  ShieldAlert,
  FileCheck2,
  Users,
  Lock,
  Sparkles,
  HelpCircle,
  FileText,
} from 'lucide-react';

export const GuideView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0B1F3A] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#D32F2F]" />
          Panduan Penggunaan SIPATEN & Pedoman Kebijakan
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Standar operasional pembuatan konten komunikasi publik di lingkungan Kemenko Polkam RI.
        </p>
      </div>

      {/* 1. Alur 7 Tahap SIPATEN */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-[#D32F2F]" />
          1. Alur Kerja Terintegrasi (7 Tahap)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-[#0B1F3A]">Tahap 1: Input Dokumen</span>
            <p className="text-slate-600 leading-relaxed">
              Unggah dokumen kebijakan resmi (PDF, DOCX, PPTX) atau masukkan teks secara langsung. Dokumen yang diunggah merupakan sumber kebenaran tunggal.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-[#0B1F3A]">Tahap 2: Analisis Terstruktur</span>
            <p className="text-slate-600 leading-relaxed">
              AI mengekstrak latar belakang, tujuan, dasar hukum, angka statistik, nama pejabat, kutipan resmi, dan 3–5 pesan utama beserta nomor referensi halaman/slide.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-[#0B1F3A]">Tahap 3: Penyaringan KIP</span>
            <p className="text-slate-600 leading-relaxed">
              Penyaringan berdasarkan UU KIP 14/2008. Setiap butir diklasifikasikan (Publik, Perlu Verifikasi, Sensitif). Pengguna memutuskan butir yang boleh atau tidak boleh masuk rilis.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-[#0B1F3A]">Tahap 4: Generasi Dua Produk</span>
            <p className="text-slate-600 leading-relaxed">
              Menghasilkan Siaran Pers (piramida terbalik, formal institusional) dan Caption Instagram (komunikatif, hook kuat, &lt; 2.200 karakter) dari ringkasan terkonfirmasi.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-[#0B1F3A]">Tahap 5: Verifikasi Berbasis Sumber</span>
            <p className="text-slate-600 leading-relaxed">
              Dua lapis verifikasi otomatis: Deterministik (angka, tanggal, kutipan persis) dan Gemini Fact-Checker langsung terhadap teks sumber asli.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-[#0B1F3A]">Tahap 6: Human Review (Pemeriksaan Manusia)</span>
            <p className="text-slate-600 leading-relaxed">
              Analis memeriksa matriks perbandingan, menyunting manual bila diperlukan, dan menyelesaikan dialog "Tandai Sudah Diverifikasi" dengan identitas pemeriksa.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2">
            <span className="font-bold text-[#0B1F3A]">Tahap 7: Output & Ekspor Resmi</span>
            <p className="text-slate-600 leading-relaxed">
              Salin teks atau unduh dalam format DOCX resmi ber-watermark verifikasi ("TERVERIFIKASI OLEH: [Nama]" atau "DRAF – BELUM DIVERIFIKASI").
            </p>
          </div>
        </div>
      </section>

      {/* 2. Aturan AI Kemenko Polkam */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#D32F2F]" />
          2. Aturan AI Kemenko Polkam (System Grounding)
        </h3>
        <p className="text-xs text-slate-500">
          Setiap pemrosesan di sistem SIPATEN dibatasi oleh 10 aturan mutlak:
        </p>

        <ul className="space-y-2 text-xs text-slate-700 divide-y divide-slate-100">
          <li className="pt-2">1. <strong>Tanpa Fabrikasi Data:</strong> Dilarang mengarang fakta, angka, nama pejabat, tanggal, lokasi, atau kutipan di luar teks sumber.</li>
          <li className="pt-2">2. <strong>Larangan Kutipan Palsu:</strong> Kutipan pejabat HANYA disertakan jika tercantum secara eksplisit dalam dokumen sumber.</li>
          <li className="pt-2">3. <strong>Menjaga Arah Kebijakan:</strong> Dilarang mendistorsi maksud dan substansi hukum kebijakan pemerintah.</li>
          <li className="pt-2">4. <strong>Penanda Eksplisit:</strong> Fakta yang tidak tercantum diisi <code>[TIDAK TERSEDIA DALAM SUMBER]</code> atau <code>[PERLU DILENGKAPI]</code>.</li>
          <li className="pt-2">5. <strong>Bebas Asumsi Eksternal:</strong> Tidak menggunakan data eksternal internet tanpa instruksi pengguna.</li>
          <li className="pt-2">6. <strong>Penyederhanaan Tanpa Distorsi:</strong> Bahasa birokrasi disederhanakan menjadi bahasa publik yang mudah dipahami tanpa mengubah esensi.</li>
          <li className="pt-2">7. <strong>Tanpa Publikasi Otomatis:</strong> Tidak ada tombol integrasi langsung untuk menerbitkan ke media sosial demi mencegah insiden komunikasi publik.</li>
          <li className="pt-2">8. <strong>Human-in-the-Loop:</strong> Semua produk harus melalui tinjauan petugas sebelum dipublikasikan.</li>
          <li className="pt-2">9. <strong>Kerahasiaan Dokumen:</strong> Server bersifat stateless; tidak ada berkas yang disimpan di disk server atau dibagikan ke pengguna lain.</li>
        </ul>
      </section>

      {/* 3. Catatan UU No. 14 Tahun 2008 KIP */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#0B1F3A]" />
          3. Landasan UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik
        </h3>
        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>
            Berdasarkan <strong>Pasal 17 UU KIP</strong>, informasi yang dikecualikan mencakup informasi yang apabila dibuka dapat:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Menghambat proses penegakan hukum atau membahayakan keselamatan aparat.</li>
            <li>Mengganggu kepentingan perlindungan hak atas kekayaan intelektual dan persaingan usaha tidak sehat.</li>
            <li>Membahayakan pertahanan dan keamanan negara (strategi intelijen, gelar militer, kerentanan siber kritis).</li>
            <li>Mengungkapkan rahasia pribadi seseorang tanpa persetujuan tertulis (UU Pelindungan Data Pribadi).</li>
          </ul>
          <p className="font-semibold text-slate-800">
            *SIPATEN memberikan tanda peringatan otomatis pada butir berpotensi sensitif, namun penetapan final status keterbukaan informasi merupakan wewenang Pejabat Pengelola Informasi dan Dokumentasi (PPID) atau pejabat berwenang.
          </p>
        </div>
      </section>
    </div>
  );
};
