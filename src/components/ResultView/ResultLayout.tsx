import React, { useState } from 'react';
import {
  CheckCircle2,
  BookOpen,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Stepper } from './Stepper';
import { ProductEditor } from './ProductEditor';
import { VerificationFindings } from './VerificationFindings';
import { ComparisonModal } from './ComparisonModal';
import {
  DocumentAnalysis,
  GeneratedProducts,
  ProductVersion,
  VerificationAudit,
  VerificationResult,
  ClassifiedItem,
} from '../../types';

interface ResultLayoutProps {
  analysis?: DocumentAnalysis;
  classifications?: ClassifiedItem[];
  products: GeneratedProducts;
  verification?: VerificationResult;
  audit?: VerificationAudit;
  pressReleaseHistory: ProductVersion[];
  instagramHistory: ProductVersion[];
  currentStep: number;
  isLoading: boolean;
  onUpdateText: (product: 'siaranPers' | 'captionInstagram', newText: string, note: string) => void;
  onUndo: (product: 'siaranPers' | 'captionInstagram') => void;
  onMarkVerified: (reviewerName: string, notes: string) => void;
  onRerunVerification: () => void;
  sourceTitle: string;
  onNavigateStep?: (step: number) => void;
}

export const ResultLayout: React.FC<ResultLayoutProps> = ({
  analysis,
  classifications,
  products,
  verification,
  audit,
  pressReleaseHistory,
  instagramHistory,
  currentStep,
  isLoading,
  onUpdateText,
  onUndo,
  onMarkVerified,
  onRerunVerification,
  sourceTitle,
  onNavigateStep,
}) => {
  const [activeTab, setActiveTab] = useState<'siaranPers' | 'captionInstagram'>('siaranPers');
  const [mobilePanel, setMobilePanel] = useState<'summary' | 'editor' | 'verification'>('editor');
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [highlightedClaim, setHighlightedClaim] = useState<string | undefined>(undefined);

  const sensitiveItems = (classifications || []).filter(c => c.kategori === 'sensitif');

  const handleSelectFinding = (claimText: string, targetProduct: 'siaranPers' | 'captionInstagram' | 'keduanya') => {
    if (targetProduct === 'siaranPers') setActiveTab('siaranPers');
    else if (targetProduct === 'captionInstagram') setActiveTab('captionInstagram');
    setHighlightedClaim(claimText);
    setMobilePanel('editor');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Banner Selesai Sesuai Spesifikasi Bagian 4.K */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-sm text-emerald-950">
            Dokumen berhasil dianalisis. Dua produk komunikasi telah disiapkan untuk ditinjau.
          </p>
          <p className="text-emerald-800 leading-relaxed">
            Periksa Siaran Pers dan Caption Instagram pada panel editor. Jalankan peninjauan berbasis sumber pada panel kanan sebelum menandai status verifikasi akhir.
          </p>
        </div>
      </div>

      {/* Stepper 7 Tahap Proses */}
      <Stepper
        currentStep={currentStep}
        isLoading={isLoading}
        onStepClick={onNavigateStep}
      />

      {/* Mobile Tab Switcher untuk 3 Panel */}
      <div className="lg:hidden flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setMobilePanel('summary')}
          className={`flex-1 py-2 rounded-lg transition-colors text-center ${
            mobilePanel === 'summary'
              ? 'bg-white text-[#0B1F3A] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ringkasan Dokumen
        </button>
        <button
          onClick={() => setMobilePanel('editor')}
          className={`flex-1 py-2 rounded-lg transition-colors text-center ${
            mobilePanel === 'editor'
              ? 'bg-white text-[#0B1F3A] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Editor Produk (2 Tab)
        </button>
        <button
          onClick={() => setMobilePanel('verification')}
          className={`flex-1 py-2 rounded-lg transition-colors text-center ${
            mobilePanel === 'verification'
              ? 'bg-white text-[#0B1F3A] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Verifikasi
        </button>
      </div>

      {/* 3-Panel Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANEL KIRI: Ringkasan Dokumen & Pesan Utama (lg:col-span-3) */}
        <div
          className={`lg:col-span-3 space-y-4 ${
            mobilePanel === 'summary' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Panel Sumber
              </span>
              <h3 className="text-sm font-bold text-[#0B1F3A] truncate mt-0.5" title={analysis?.judul}>
                {analysis?.judul || 'Dokumen Kebijakan'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {analysis?.jenisDokumen || 'Dokumen Resmi'}
              </p>
            </div>

            {/* Pesan Utama */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0B1F3A]" />
                Pesan Utama Kebijakan
              </h4>
              <div className="space-y-2">
                {(analysis?.pesanUtama || []).map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-[#0B1F3A] mr-1">{idx + 1}.</span>
                    <span className="text-slate-700 leading-snug">{p.poin}</span>
                    <div className="mt-1 text-[10px] text-slate-400">{p.referensi}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pejabat & Kutipan Terkonfirmasi */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700">Pejabat Berwenang</h4>
              {(analysis?.pejabat || []).map((pej, idx) => (
                <div key={idx} className="text-xs p-2 rounded-lg bg-slate-50 text-slate-700">
                  <p className="font-bold text-[#0B1F3A]">{pej.nama}</p>
                  <p className="text-[11px] text-slate-500">{pej.jabatan}</p>
                </div>
              ))}
            </div>

            {/* Catatan KIP / Informasi Sensitif Terkait */}
            {sensitiveItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-red-800 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#D32F2F]" />
                  Informasi Sensitif ({sensitiveItems.length})
                </h4>
                <div className="space-y-1.5">
                  {sensitiveItems.map((s) => (
                    <div key={s.id} className="p-2 bg-red-50/70 border border-red-200 rounded-lg text-[11px]">
                      <p className="font-semibold text-red-950">{s.judulItem}</p>
                      <p className="text-slate-600 mt-0.5">Keputusan: {s.keputusanPengguna || 'Belum diputuskan'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PANEL TENGAH: Editor Produk Dua Tab (lg:col-span-6) */}
        <div
          className={`lg:col-span-6 min-h-[600px] ${
            mobilePanel === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ProductEditor
            products={products}
            confirmedSummary={analysis}
            pressReleaseHistory={pressReleaseHistory}
            instagramHistory={instagramHistory}
            audit={audit}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onUpdateText={onUpdateText}
            onUndo={onUndo}
            onMarkVerified={onMarkVerified}
            sourceTitle={sourceTitle}
            onTriggerReverify={onRerunVerification}
            highlightedText={highlightedClaim}
            onOpenComparison={() => setIsComparisonOpen(true)}
          />
        </div>

        {/* PANEL KANAN: Status Verifikasi & Temuan Audit (lg:col-span-3) */}
        <div
          className={`lg:col-span-3 ${
            mobilePanel === 'verification' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <VerificationFindings
              verification={verification}
              onRerunVerification={onRerunVerification}
              isLoading={isLoading}
              onSelectFinding={handleSelectFinding}
            />
          </div>
        </div>
      </div>

      {/* Modal Matriks Perbandingan Konsistensi */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        analysis={analysis}
        pressReleaseText={products.siaranPers.teksLengkap}
        instagramText={products.captionInstagram.teksLengkap}
      />
    </div>
  );
};
