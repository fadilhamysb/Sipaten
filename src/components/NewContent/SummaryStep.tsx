import React, { useState } from 'react';
import {
  FileCheck2,
  Edit3,
  Check,
  Plus,
  Trash2,
  HelpCircle,
  ArrowRight,
  BookMarked,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { DocumentAnalysis } from '../../types';

interface SummaryStepProps {
  initialAnalysis: DocumentAnalysis;
  onConfirmSummary: (confirmed: DocumentAnalysis) => void;
  isLoading: boolean;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({
  initialAnalysis,
  onConfirmSummary,
  isLoading,
}) => {
  const [analysis, setAnalysis] = useState<DocumentAnalysis>(initialAnalysis);

  const handleTextChange = (field: keyof DocumentAnalysis, val: any) => {
    setAnalysis(prev => ({ ...prev, [field]: val }));
  };

  const handlePesanUtamaChange = (index: number, val: string) => {
    setAnalysis(prev => {
      const updated = [...prev.pesanUtama];
      updated[index] = { ...updated[index], poin: val };
      return { ...prev, pesanUtama: updated };
    });
  };

  const handleAddPesanUtama = () => {
    if (analysis.pesanUtama.length >= 5) return;
    setAnalysis(prev => ({
      ...prev,
      pesanUtama: [
        ...prev.pesanUtama,
        { poin: '', referensi: '[Tambahan Analis]', cuplikan: '-' },
      ],
    }));
  };

  const handleRemovePesanUtama = (index: number) => {
    if (analysis.pesanUtama.length <= 1) return;
    setAnalysis(prev => ({
      ...prev,
      pesanUtama: prev.pesanUtama.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Langkah */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-1">
            <BookMarked className="w-4 h-4 text-[#D32F2F]" />
            Langkah 2: Pemeriksaan & Konfirmasi Ringkasan Kebijakan
          </div>
          <h2 className="text-xl font-bold text-[#0B1F3A]">
            Ringkasan Terstruktur Dokumen Kebijakan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Periksa dan sunting butir temuan di bawah. Hasil konfirmasi ini akan menjadi <strong>satu-satunya basis generasi</strong> dua produk komunikasi.
          </p>
        </div>

        <button
          onClick={() => onConfirmSummary(analysis)}
          disabled={isLoading}
          className="px-5 py-2.5 bg-[#0B1F3A] hover:bg-[#15325b] active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Konfirmasi Ringkasan</span>
        </button>
      </div>

      {/* Form Editor Ringkasan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* 1. Judul & Jenis Dokumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Judul Dokumen Kebijakan</label>
            <input
              type="text"
              value={analysis.judul}
              onChange={(e) => handleTextChange('judul', e.target.value)}
              className="w-full text-sm font-semibold p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Jenis Dokumen</label>
            <input
              type="text"
              value={analysis.jenisDokumen}
              onChange={(e) => handleTextChange('jenisDokumen', e.target.value)}
              placeholder="e.g. Surat Edaran, Instruksi, Keputusan"
              className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
            />
          </div>
        </div>

        {/* 2. Latar Belakang & Tujuan */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Latar Belakang Kebijakan</label>
              <span className="text-[11px] font-mono text-slate-400">
                Ref: {analysis.latarBelakang.referensi || '-'}
              </span>
            </div>
            <textarea
              rows={3}
              value={analysis.latarBelakang.teks}
              onChange={(e) =>
                handleTextChange('latarBelakang', {
                  ...analysis.latarBelakang,
                  teks: e.target.value,
                })
              }
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
            />
            {analysis.latarBelakang.cuplikan && analysis.latarBelakang.cuplikan !== '-' && (
              <p className="text-[11px] text-slate-400 italic">
                Cuplikan sumber: "{analysis.latarBelakang.cuplikan}"
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Tujuan & Substansi Pokok</label>
              <span className="text-[11px] font-mono text-slate-400">
                Ref: {analysis.tujuanSubstansi.referensi || '-'}
              </span>
            </div>
            <textarea
              rows={3}
              value={analysis.tujuanSubstansi.teks}
              onChange={(e) =>
                handleTextChange('tujuanSubstansi', {
                  ...analysis.tujuanSubstansi,
                  teks: e.target.value,
                })
              }
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
            />
          </div>
        </div>

        {/* 3. Pesan Utama (3-5 butir) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-700">
                Pesan Utama Kebijakan (3–5 Butir Strategis)
              </label>
              <p className="text-[11px] text-slate-500">
                Pesan yang harus tercakup dan konsisten di Siaran Pers dan Caption Instagram.
              </p>
            </div>
            {analysis.pesanUtama.length < 5 && (
              <button
                type="button"
                onClick={handleAddPesanUtama}
                className="text-xs font-semibold text-[#0B1F3A] hover:text-[#D32F2F] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Butir
              </button>
            )}
          </div>

          <div className="space-y-2">
            {analysis.pesanUtama.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-xs font-bold text-slate-400 mt-2 shrink-0">
                  {idx + 1}.
                </span>
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={item.poin}
                    onChange={(e) => handlePesanUtamaChange(idx, e.target.value)}
                    placeholder="Masukkan butir pesan kebijakan..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{item.referensi || '-'}</span>
                    {item.cuplikan && item.cuplikan !== '-' && (
                      <span className="truncate italic">· "{item.cuplikan}"</span>
                    )}
                  </div>
                </div>
                {analysis.pesanUtama.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePesanUtama(idx)}
                    className="p-2 text-slate-400 hover:text-[#D32F2F] rounded-lg"
                    aria-label="Hapus butir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Fakta & Data Penting */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">
            Fakta & Data Kuantitatif Penting (Angka, Statistik, Anggaran)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {analysis.faktaDataPenting.map((fakta, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-slate-800">{fakta.data}</p>
                <p className="text-[10px] text-slate-400">{fakta.referensi || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Pejabat & Kutipan Resmi */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">
            Pejabat & Kutipan Resmi (Hanya yang Ada dalam Dokumen)
          </label>
          {analysis.kutipanResmi.length === 0 || analysis.kutipanResmi[0]?.kutipan?.includes('[TIDAK TERSEDIA') ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>Catatan:</strong> Tidak ditemukan kutipan langsung resmi pejabat dalam dokumen sumber. Sistem TIDAK akan mengarang pernyataan pejabat palsu pada Siaran Pers.
            </div>
          ) : (
            <div className="space-y-2">
              {analysis.kutipanResmi.map((k, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-[#0B1F3A]">{k.penutur}</p>
                  <p className="italic text-slate-700">"{k.kutipan}"</p>
                  <p className="text-[10px] text-slate-400">{k.referensi || '-'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Dampak & Manfaat */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">Dampak & Manfaat bagi Masyarakat Luas</label>
          <textarea
            rows={2}
            value={analysis.dampakManfaat.teks}
            onChange={(e) =>
              handleTextChange('dampakManfaat', {
                ...analysis.dampakManfaat,
                teks: e.target.value,
              })
            }
            className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          />
        </div>

        {/* Tombol Konfirmasi Bawah */}
        <div className="pt-4 flex justify-end border-t border-slate-100">
          <button
            onClick={() => onConfirmSummary(analysis)}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Konfirmasi Ringkasan & Lanjut ke Penyaringan KIP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
