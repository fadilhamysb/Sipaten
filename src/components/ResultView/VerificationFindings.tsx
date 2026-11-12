import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { VerificationFinding, VerificationResult, VerificationStatusType } from '../../types';

interface VerificationFindingsProps {
  verification?: VerificationResult;
  onRerunVerification: () => void;
  isLoading: boolean;
  onSelectFinding: (claimText: string, targetProduct: 'siaranPers' | 'captionInstagram' | 'keduanya') => void;
}

export const VerificationFindings: React.FC<VerificationFindingsProps> = ({
  verification,
  onRerunVerification,
  isLoading,
  onSelectFinding,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const findings = verification?.findings || [];
  const summary = verification?.statusRingkasan || {
    terverifikasiCount: 0,
    perluPemeriksaanCount: 0,
    tidakDitemukanCount: 0,
    berpotensiTidakKonsistenCount: 0,
  };

  const getStatusBadge = (status: VerificationStatusType) => {
    switch (status) {
      case 'terverifikasi':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Terverifikasi dari Sumber
          </span>
        );
      case 'perlu_pemeriksaan':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Perlu Pemeriksaan Manual
          </span>
        );
      case 'tidak_ditemukan':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-[#D32F2F] shrink-0" />
            Tidak Ditemukan dalam Sumber
          </span>
        );
      case 'berpotensi_tidak_konsisten':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            Berpotensi Tidak Konsisten
          </span>
        );
    }
  };

  const filteredFindings = findings.filter((f) => {
    const matchesFilter = filterStatus === 'all' || f.status === filterStatus;
    const matchesSearch =
      f.klaimDiuji.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.catatanPenjelasan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D32F2F]" />
            Audit Berbasis Sumber Asli
          </h3>
          <p className="text-[11px] text-slate-500">
            Verifikasi 2 lapis: Deterministik + Gemini Fact-Checker
          </p>
        </div>

        <button
          onClick={onRerunVerification}
          disabled={isLoading}
          className="p-1.5 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
          title="Verifikasi Ulang Konten"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#D32F2F]' : ''}`} />
          <span className="hidden sm:inline">Verifikasi Ulang</span>
        </button>
      </div>

      {/* Ringkasan Skor Verifikasi */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="text-[10px] text-emerald-800 font-medium block">Terverifikasi</span>
          <span className="text-lg font-bold text-emerald-700 tabular-nums">
            {summary.terverifikasiCount}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <span className="text-[10px] text-amber-800 font-medium block">Perlu Pemeriksaan</span>
          <span className="text-lg font-bold text-amber-700 tabular-nums">
            {summary.perluPemeriksaanCount}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
          <span className="text-[10px] text-red-800 font-medium block">Tidak di Sumber</span>
          <span className="text-lg font-bold text-red-700 tabular-nums">
            {summary.tidakDitemukanCount}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200">
          <span className="text-[10px] text-purple-800 font-medium block">Tidak Konsisten</span>
          <span className="text-lg font-bold text-purple-700 tabular-nums">
            {summary.berpotensiTidakKonsistenCount}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-white text-[#0B1F3A] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({findings.length})
          </button>
          <button
            onClick={() => setFilterStatus('tidak_ditemukan')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filterStatus === 'tidak_ditemukan'
                ? 'bg-red-100 text-red-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tidak di Sumber ({summary.tidakDitemukanCount})
          </button>
          <button
            onClick={() => setFilterStatus('berpotensi_tidak_konsisten')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filterStatus === 'berpotensi_tidak_konsisten'
                ? 'bg-purple-100 text-purple-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tidak Konsisten ({summary.berpotensiTidakKonsistenCount})
          </button>
          <button
            onClick={() => setFilterStatus('perlu_pemeriksaan')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filterStatus === 'perlu_pemeriksaan'
                ? 'bg-amber-100 text-amber-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Perlu Periksa ({summary.perluPemeriksaanCount})
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari temuan klaim..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0B1F3A]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Daftar Temuan */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredFindings.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            Tidak ada temuan yang cocok dengan filter.
          </div>
        ) : (
          filteredFindings.map((f) => (
            <div
              key={f.id}
              onClick={() => onSelectFinding(f.klaimDiuji, f.targetProduk)}
              className="p-3 bg-white border border-slate-200 hover:border-[#0B1F3A] rounded-xl text-xs space-y-1.5 cursor-pointer transition-all hover:shadow-xs group"
              title="Klik untuk menyorot klaim ini di editor"
            >
              <div className="flex items-center justify-between gap-2">
                {getStatusBadge(f.status)}
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {f.targetProduk === 'siaranPers'
                    ? 'Siaran Pers'
                    : f.targetProduk === 'captionInstagram'
                    ? 'Instagram'
                    : 'Keduanya'}
                </span>
              </div>

              <p className="font-semibold text-slate-800 leading-snug group-hover:text-[#0B1F3A]">
                {f.klaimDiuji}
              </p>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {f.catatanPenjelasan}
              </p>

              {(f.referensiSumber || f.sumberKutipan) && f.sumberKutipan !== '-' && (
                <div className="p-2 rounded-lg bg-slate-50 text-[10px] text-slate-600 font-mono space-y-0.5">
                  <div className="flex items-center justify-between text-slate-500 font-bold">
                    <span>Bukti Sumber:</span>
                    <span>{f.referensiSumber || '-'}</span>
                  </div>
                  {f.sumberKutipan && (
                    <p className="italic text-slate-700">"{f.sumberKutipan}"</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
