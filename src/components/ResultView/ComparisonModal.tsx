import React from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, ArrowLeftRight } from 'lucide-react';
import { DocumentAnalysis, GeneratedProducts } from '../../types';
import { normalizeText, normalizeNumber, extractNumbersAndPercentages } from '../../utils/deterministicVerification';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis?: DocumentAnalysis;
  pressReleaseText: string;
  instagramText: string;
}

interface ComparisonRow {
  label: string;
  category: 'Pesan Utama' | 'Fakta / Data Kunci' | 'Kutipan Pejabat';
  prStatus: 'tercakup' | 'tidak_tercakup';
  prSnippet: string;
  igStatus: 'tercakup' | 'tidak_tercakup';
  igSnippet: string;
  discrepancyNote?: string;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  analysis,
  pressReleaseText,
  instagramText,
}) => {
  if (!isOpen) return null;

  const prNormalized = normalizeText(pressReleaseText);
  const igNormalized = normalizeText(instagramText);

  const rows: ComparisonRow[] = [];

  // 1. Bandingkan Pesan Utama
  (analysis?.pesanUtama || []).forEach((item, idx) => {
    const keywords = item.poin
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4);

    // Hitung kemunculan kata kunci
    const prMatches = keywords.filter((k) => prNormalized.includes(k));
    const igMatches = keywords.filter((k) => igNormalized.includes(k));

    const prCovered = prMatches.length >= Math.min(2, Math.ceil(keywords.length * 0.3));
    const igCovered = igMatches.length >= Math.min(2, Math.ceil(keywords.length * 0.3));

    // Ekstrak cuplikan kalimat
    const findSnippet = (text: string, kw: string[]) => {
      const sentences = text.split(/(?<=[.!?])\s+/);
      const match = sentences.find((s) => kw.some((k) => s.toLowerCase().includes(k)));
      return match ? match.slice(0, 100) + '...' : '-';
    };

    rows.push({
      label: `Pesan ${idx + 1}: ${item.poin}`,
      category: 'Pesan Utama',
      prStatus: prCovered ? 'tercakup' : 'tidak_tercakup',
      prSnippet: prCovered ? findSnippet(pressReleaseText, prMatches) : 'Tidak ditemukan padanan kalimat langsung',
      igStatus: igCovered ? 'tercakup' : 'tidak_tercakup',
      igSnippet: igCovered ? findSnippet(instagramText, igMatches) : 'Tidak ditemukan padanan kalimat langsung',
      discrepancyNote: prCovered !== igCovered ? 'Pesan ini hanya tercakup di salah satu produk.' : undefined,
    });
  });

  // 2. Bandingkan Fakta dan Data Kunci
  (analysis?.faktaDataPenting || []).forEach((item) => {
    const rawData = item.data.toLowerCase();
    const prHas = prNormalized.includes(rawData) || pressReleaseText.includes(item.data);
    const igHas = igNormalized.includes(rawData) || instagramText.includes(item.data);

    rows.push({
      label: item.data,
      category: 'Fakta / Data Kunci',
      prStatus: prHas ? 'tercakup' : 'tidak_tercakup',
      prSnippet: prHas ? `Tercantum: "${item.data}"` : 'Tidak tercantum di Siaran Pers',
      igStatus: igHas ? 'tercakup' : 'tidak_tercakup',
      igSnippet: igHas ? `Tercantum: "${item.data}"` : 'Tidak tercantum di Instagram',
      discrepancyNote: prHas !== igHas ? 'Data kuantitatif ini tidak sinkron di kedua produk.' : undefined,
    });
  });

  // 3. Periksa Perbedaan Angka Langsung
  const prNums = extractNumbersAndPercentages(pressReleaseText).map((n) => normalizeNumber(n));
  const igNums = extractNumbersAndPercentages(instagramText).map((n) => normalizeNumber(n));
  const prNumSet = new Set(prNums);
  const igNumSet = new Set(igNums);

  const missingInIg = prNums.filter((n) => !igNumSet.has(n));
  const missingInPr = igNums.filter((n) => !prNumSet.has(n));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0B1F3A] text-white rounded-xl">
              <ArrowLeftRight className="w-5 h-5 text-[#D32F2F]" />
            </div>
            <div>
              <h3 id="comparison-title" className="text-base font-bold text-[#0B1F3A]">
                Matriks Perbandingan Konsistensi Antar Produk
              </h3>
              <p className="text-xs text-slate-500">
                Membandingkan cakupan pesan utama, data kuantitatif, dan fakta kebijakan antara Siaran Pers vs Caption Instagram.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            aria-label="Tutup jendela perbandingan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ringkasan Keselarasan Angka */}
        {(missingInIg.length > 0 || missingInPr.length > 0) && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Peringatan Variasi Data Kuantitatif: </span>
              {missingInIg.length > 0 && (
                <span>Angka di Siaran Pers tetapi diringkas/absen di IG: [{missingInIg.join(', ')}]. </span>
              )}
              {missingInPr.length > 0 && (
                <span>Angka di Instagram tidak ada di Siaran Pers: [{missingInPr.join(', ')}]. </span>
              )}
              <span className="italic">Pastikan penyederhanaan tidak mengubah makna kebijakan.</span>
            </div>
          </div>
        )}

        {/* Tabel Perbandingan */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B1F3A] text-white">
                  <th className="p-3 font-bold w-1/3 border-r border-white/10">
                    Pesan Utama / Fakta Kunci (Sumber)
                  </th>
                  <th className="p-3 font-bold w-1/3 border-r border-white/10">
                    Produk 1: Siaran Pers
                  </th>
                  <th className="p-3 font-bold w-1/3">
                    Produk 2: Caption Instagram
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    {/* Kolom Sumber */}
                    <td className="p-3 align-top border-r border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {row.category}
                      </span>
                      <p className="font-semibold text-slate-800 leading-snug">
                        {row.label}
                      </p>
                      {row.discrepancyNote && (
                        <p className="text-[10px] text-amber-700 font-medium">
                          ⚠️ {row.discrepancyNote}
                        </p>
                      )}
                    </td>

                    {/* Kolom Siaran Pers */}
                    <td className="p-3 align-top border-r border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5">
                        {row.prStatus === 'tercakup' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" /> Tercakup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                            <XCircle className="w-3.5 h-3.5" /> Tidak Tercakup
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 italic text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {row.prSnippet}
                      </p>
                    </td>

                    {/* Kolom Caption Instagram */}
                    <td className="p-3 align-top space-y-1">
                      <div className="flex items-center gap-1.5">
                        {row.igStatus === 'tercakup' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" /> Tercakup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                            <XCircle className="w-3.5 h-3.5" /> Tidak Tercakup
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 italic text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {row.igSnippet}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {rows.length} butir diperiksa untuk memastikan konsistensi narasi publik.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Tutup Matriks
          </button>
        </div>
      </div>
    </div>
  );
};
