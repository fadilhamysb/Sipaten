import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  Filter,
  Info,
  Lock,
} from 'lucide-react';
import { ClassifiedItem, KipCategory } from '../../types';

interface ClassificationStepProps {
  initialClassifications: ClassifiedItem[];
  onConfirmClassifications: (confirmed: ClassifiedItem[]) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const ClassificationStep: React.FC<ClassificationStepProps> = ({
  initialClassifications,
  onConfirmClassifications,
  onBack,
  isLoading,
}) => {
  const [items, setItems] = useState<ClassifiedItem[]>(initialClassifications);

  const handleDecision = (id: string, decision: 'gunakan' | 'jangan_gunakan') => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, keputusanPengguna: decision } : item
      )
    );
  };

  // Cek apakah ada butir sensitif yang belum diputuskan
  const undecidedSensitiveItems = items.filter(
    (i) => i.kategori === 'sensitif' && !i.keputusanPengguna
  );

  const canProceed = undecidedSensitiveItems.length === 0;

  const getCategoryBadge = (kategori: KipCategory) => {
    switch (kategori) {
      case 'publik':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Informasi Publik yang Dapat Digunakan
          </span>
        );
      case 'verifikasi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Perlu Diverifikasi
          </span>
        );
      case 'sensitif':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <Lock className="w-3.5 h-3.5 text-[#D32F2F]" />
            Berpotensi Dikecualikan / Sensitif
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner Tetap Kewenangan Sesuai UU KIP */}
      <div className="bg-[#0B1F3A] text-white p-4 sm:p-5 rounded-2xl shadow-sm flex items-start gap-3 border-l-4 border-[#D32F2F]">
        <Info className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-sm text-white">
            Penyaringan Keterbukaan Informasi (UU No. 14 Tahun 2008)
          </p>
          <p className="text-slate-200 leading-relaxed font-medium">
            "Ini hanya indikasi awal dari AI. Penetapan klasifikasi informasi merupakan kewenangan pejabat atau petugas yang berwenang."
          </p>
          <p className="text-slate-400 text-[11px]">
            Sistem tidak menghapus informasi secara otomatis. Anda memegang kendali penuh untuk memutuskan apakah butir informasi boleh dicantumkan ke dalam materi komunikasi publik atau dikecualikan.
          </p>
        </div>
      </div>

      {/* Peringatan jika masih ada butir sensitif belum diputuskan */}
      {undecidedSensitiveItems.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              Keputusan Diperlukan untuk Butir Sensitif ({undecidedSensitiveItems.length} butir)
            </p>
            <p className="mt-0.5 text-amber-800">
              Sesuai aturan, semua butir yang ditandai "Berpotensi Dikecualikan/Sensitif" wajib diputuskan ("Gunakan" atau "Jangan gunakan") oleh pengguna sebelum produk komunikasi dapat digenerasi.
            </p>
          </div>
        </div>
      )}

      {/* Daftar Butir Klasifikasi */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#0B1F3A]">
              Daftar Informasi Terklasifikasi
            </h3>
            <p className="text-xs text-slate-500">
              Pilih tindakan per butir untuk menentukan materi yang masuk ke Siaran Pers dan Caption Instagram.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
            {items.length} Butir Dinilai
          </span>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const isSensitive = item.kategori === 'sensitif';
            const isUndecided = isSensitive && !item.keputusanPengguna;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isUndecided
                    ? 'border-red-300 bg-red-50/30'
                    : item.keputusanPengguna === 'jangan_gunakan'
                    ? 'border-slate-200 bg-slate-50/70 opacity-75'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {getCategoryBadge(item.kategori)}
                      <span className="text-[11px] font-mono text-slate-500">
                        Lokasi: {item.lokasi || '-'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0B1F3A]">
                      {item.judulItem}
                    </h4>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {item.isi}
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Alasan KIP: </span>
                      {item.alasanKip}
                    </div>

                    {item.kategori === 'verifikasi' && item.keputusanPengguna === 'gunakan' && (
                      <p className="text-[11px] text-amber-700 font-medium">
                        * Butir ini akan diberi penanda <strong>[PERLU VERIFIKASI]</strong> di hasil produk komunikasi.
                      </p>
                    )}
                  </div>

                  {/* Tombol Keputusan Pengguna */}
                  <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleDecision(item.id, 'gunakan')}
                      className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        item.keputusanPengguna === 'gunakan'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Gunakan
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDecision(item.id, 'jangan_gunakan')}
                      className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        item.keputusanPengguna === 'jangan_gunakan'
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-800'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Jangan Gunakan
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Kembali ke Ringkasan
          </button>

          <button
            type="button"
            onClick={() => onConfirmClassifications(items)}
            disabled={!canProceed || isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-[#0B1F3A] hover:bg-[#15325b] active:scale-98 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Lanjut: Generasi 2 Produk Komunikasi</span>
            <ArrowRight className="w-4 h-4 text-[#D32F2F]" />
          </button>
        </div>
      </div>
    </div>
  );
};
