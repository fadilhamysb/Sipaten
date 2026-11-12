import React from 'react';
import {
  FileText,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  FilePlus2,
  Calendar,
} from 'lucide-react';
import { StoredDocument } from '../types';

interface DashboardProps {
  documents: StoredDocument[];
  onStartNewContent: () => void;
  onOpenDocument: (doc: StoredDocument) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  documents,
  onStartNewContent,
  onOpenDocument,
}) => {
  // Hitung statistik dari riwayat data nyata (bukan mockup dummy)
  const totalDocuments = documents.length;
  const totalProducts = documents.reduce((acc, doc) => {
    let count = 0;
    if (doc.products?.siaranPers?.teksLengkap) count++;
    if (doc.products?.captionInstagram?.teksLengkap) count++;
    return acc + count;
  }, 0);

  const pendingVerification = documents.filter(
    (doc) => !doc.audit?.isVerified && doc.products
  ).length;

  const verifiedDocuments = documents.filter(
    (doc) => doc.audit?.isVerified
  ).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#15325b] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <svg width="300" height="300" viewBox="0 0 48 48" fill="white">
            <path d="M10 6C10 4.89543 10.8954 4 12 4H28L38 14V42C38 43.1046 37.1046 44 36 44H12C10.8954 44 10 43.1046 10 42V6Z" />
          </svg>
        </div>

        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-slate-200 border border-white/15">
            <span className="w-2 h-2 rounded-full bg-[#D32F2F]"></span>
            Kemenko Polkam RI · Asdep Koordinasi Media Komunikasi & Informasi
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Selamat Datang di SIPATEN
          </h2>
          <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
            Ubah satu dokumen kebijakan menjadi siaran pers dan caption Instagram secara cepat, konsisten, dan akurat.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartNewContent}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-98"
            >
              <FilePlus2 className="w-4 h-4" />
              Mulai Buat Konten
            </button>
            <div className="text-xs text-slate-300 italic">
              "Satu Sumber Kebijakan, Dua Produk Komunikasi Strategis"
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Statistik Nyata */}
      <section aria-labelledby="stats-heading">
        <h3 id="stats-heading" className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Statistik Ringkasan Aktivitas (Data Nyata)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Dokumen Diproses */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold">Dokumen Diproses</span>
              <div className="p-2 bg-blue-50 text-[#0B1F3A] rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-[#0B1F3A] tabular-nums">
                {totalDocuments}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {totalDocuments === 0 ? 'Belum ada dokumen diproses' : `${totalDocuments} berkas tersimpan`}
              </p>
            </div>
          </div>

          {/* 2. Produk Komunikasi Dihasilkan */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold">Produk Dihasilkan</span>
              <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                <Share2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-[#0B1F3A] tabular-nums">
                {totalProducts}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {totalProducts === 0 ? 'Siaran Pers & Caption Instagram' : `${totalProducts} materi rilis publik`}
              </p>
            </div>
          </div>

          {/* 3. Menunggu Verifikasi */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold">Menunggu Verifikasi</span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-amber-600 tabular-nums">
                {pendingVerification}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {pendingVerification === 0 ? 'Tidak ada antrean tertunda' : 'Memerlukan review verifikator'}
              </p>
            </div>
          </div>

          {/* 4. Dokumen Terverifikasi */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold">Telah Terverifikasi</span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-emerald-700 tabular-nums">
                {verifiedDocuments}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {verifiedDocuments === 0 ? 'Belum ada verifikasi final' : 'Siap dipublikasikan tim humas'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Aktivitas Terbaru & Empty State */}
      <section aria-labelledby="recent-heading" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 id="recent-heading" className="text-base font-bold text-[#0B1F3A]">
              Aktivitas Dokumen Terbaru
            </h3>
            <p className="text-xs text-slate-500">
              Riwayat dokumen yang diproses dan disimpan di peramban ini.
            </p>
          </div>
          {documents.length > 0 && (
            <button
              onClick={onStartNewContent}
              className="text-xs font-semibold text-[#0B1F3A] hover:text-[#D32F2F] flex items-center gap-1"
            >
              Proses Baru <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          /* Empty State Nyata */
          <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              Belum Ada Dokumen Kebijakan
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Mulai proses dengan mengunggah dokumen kebijakan pemerintah (PDF, DOCX, PPTX) atau masukkan teks secara langsung untuk menghasilkan Siaran Pers dan Caption Instagram.
            </p>
            <button
              onClick={onStartNewContent}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <FilePlus2 className="w-4 h-4 text-[#D32F2F]" />
              Mulai Buat Konten Sekarang
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.slice(0, 5).map((doc) => {
              const isVerified = doc.audit?.isVerified;
              return (
                <div
                  key={doc.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-3 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 bg-slate-100 text-[#0B1F3A] rounded-lg shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-sm font-semibold text-slate-800 truncate">
                        {doc.fileName}
                      </h5>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="uppercase text-[10px] font-bold tracking-wider px-1.5 py-0.5 bg-slate-100 rounded">
                          {doc.fileType}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(doc.uploadedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>·</span>
                        <span>{doc.extractedText.length.toLocaleString('id-ID')} karakter</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Menunggu Verifikasi
                      </span>
                    )}

                    <button
                      onClick={() => onOpenDocument(doc)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white border border-[#0B1F3A]/30 rounded-lg transition-colors"
                    >
                      Buka Dokumen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Prinsip & Panduan Singkat */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#D32F2F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-[#0B1F3A] text-sm">
              Pedoman Verifikasi Integritas Kebijakan
            </h4>
            <p className="leading-relaxed">
              SIPATEN beroperasi dengan Aturan AI ketat: tidak mengarang kutipan pejabat, menjaga keselarasan fakta kuantitatif, dan mematuhi prinsip UU KIP No. 14 Tahun 2008. Setiap draf wajib ditinjau dan diverifikasi secara manual oleh verifikator berwenang sebelum disebarluaskan ke media massa atau media sosial.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
