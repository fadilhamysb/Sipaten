import React, { useState } from 'react';
import {
  Copy,
  Download,
  FileDown,
  RotateCcw,
  Sparkles,
  Scissors,
  Maximize2,
  Sliders,
  CheckCircle2,
  Clock,
  History,
  AlertTriangle,
  Check,
  FileText,
  Instagram,
  Undo2,
  Lock,
} from 'lucide-react';
import { GeneratedProducts, ProductVersion, VerificationAudit, DocumentAnalysis } from '../../types';
import { checkForPlaceholders, downloadTextFile, exportSingleDocx, exportCombinedDocx } from '../../services/docxExport';
import { requestRegeneration } from '../../services/api';

interface ProductEditorProps {
  products: GeneratedProducts;
  confirmedSummary?: DocumentAnalysis;
  pressReleaseHistory: ProductVersion[];
  instagramHistory: ProductVersion[];
  audit?: VerificationAudit;
  activeTab: 'siaranPers' | 'captionInstagram';
  setActiveTab: (tab: 'siaranPers' | 'captionInstagram') => void;
  onUpdateText: (product: 'siaranPers' | 'captionInstagram', newText: string, note: string) => void;
  onUndo: (product: 'siaranPers' | 'captionInstagram') => void;
  onMarkVerified: (reviewerName: string, notes: string) => void;
  sourceTitle: string;
  onTriggerReverify: () => void;
  highlightedText?: string;
  onOpenComparison: () => void;
}

export const ProductEditor: React.FC<ProductEditorProps> = ({
  products,
  confirmedSummary,
  pressReleaseHistory,
  instagramHistory,
  audit,
  activeTab,
  setActiveTab,
  onUpdateText,
  onUndo,
  onMarkVerified,
  sourceTitle,
  onTriggerReverify,
  highlightedText,
  onOpenComparison,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPlaceholderWarning, setShowPlaceholderWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Form verifikasi audit
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [acknowledgedUnverified, setAcknowledgedUnverified] = useState(false);

  const currentText =
    activeTab === 'siaranPers'
      ? products.siaranPers.teksLengkap
      : products.captionInstagram.teksLengkap;

  const currentHistory = activeTab === 'siaranPers' ? pressReleaseHistory : instagramHistory;

  const handleStartEdit = () => {
    setEditText(currentText);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdateText(activeTab, editText, 'Penyuntingan teks manual oleh analis');
    setIsEditing(false);
    onTriggerReverify();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Handler untuk AI Rewriting: Perpendek, Perpanjang, Ubah Gaya
  const handleAiAction = async (
    actionType: 'perpendek' | 'perpanjang' | 'ubah_gaya',
    styleOption?: 'lebih_formal' | 'lebih_santai' | 'lebih_ringkas'
  ) => {
    setIsRegenerating(true);
    setShowStyleMenu(false);
    try {
      const result = await requestRegeneration(
        activeTab,
        currentText,
        actionType,
        styleOption,
        confirmedSummary
      );
      const noteLabel =
        actionType === 'perpendek'
          ? 'Diperpendek oleh AI'
          : actionType === 'perpanjang'
          ? 'Diperpanjang oleh AI'
          : `Gaya bahasa diubah (${styleOption}) oleh AI`;

      onUpdateText(activeTab, result.teksLengkap, noteLabel);
      onTriggerReverify();
    } catch (err: any) {
      alert(`Gagal merevisi konten: ${err.message || 'Kesalahan server'}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Validasi placeholder sebelum Salin / Unduh
  const executeSafeAction = (action: () => void) => {
    const placeholders = checkForPlaceholders(currentText);
    if (placeholders.length > 0) {
      setPendingAction(() => action);
      setShowPlaceholderWarning(true);
    } else {
      action();
    }
  };

  const handleCopy = () => {
    executeSafeAction(async () => {
      await navigator.clipboard.writeText(currentText);
      alert('Konten berhasil disalin ke clipboard.');
    });
  };

  const handleDownloadTxt = () => {
    executeSafeAction(() => {
      const prefix = activeTab === 'siaranPers' ? 'Siaran_Pers' : 'Caption_Instagram';
      downloadTextFile(`${prefix}_SIPATEN.txt`, currentText);
    });
  };

  const handleDownloadDocx = () => {
    executeSafeAction(async () => {
      const productName = activeTab === 'siaranPers' ? 'Siaran Pers' : 'Caption Instagram';
      const blob = await exportSingleDocx(productName, currentText, sourceTitle, audit);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName.replace(/\s+/g, '_')}_SIPATEN.docx`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleDownloadAll = async () => {
    const allText = products.siaranPers.teksLengkap + ' ' + products.captionInstagram.teksLengkap;
    const placeholders = checkForPlaceholders(allText);

    const doDownload = async () => {
      const blob = await exportCombinedDocx(
        products.siaranPers.teksLengkap,
        products.captionInstagram.teksLengkap,
        sourceTitle,
        audit
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SIPATEN_Dua_Produk_Komunikasi_${Date.now()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    };

    if (placeholders.length > 0) {
      setPendingAction(() => doDownload);
      setShowPlaceholderWarning(true);
    } else {
      await doDownload();
    }
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      alert('Nama pemeriksa wajib diisi.');
      return;
    }
    if (!acknowledgedUnverified) {
      alert('Anda harus mencentang konfirmasi peninjauan temuan verifikasi.');
      return;
    }
    onMarkVerified(reviewerName.trim(), reviewerNotes.trim());
    setShowVerifyModal(false);
  };

  // Highlight helper for editor view
  const renderFormattedText = (text: string) => {
    // Cari placeholder umum untuk disorot dengan warna peringatan
    const parts = text.split(/(\[PERLU DILENGKAPI\]|\[TIDAK TERSEDIA DALAM SUMBER\]|\[PERLU VERIFIKASI\])/g);

    return parts.map((part, idx) => {
      if (part === '[PERLU DILENGKAPI]' || part === '[TIDAK TERSEDIA DALAM SUMBER]') {
        return (
          <span key={idx} className="bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded border border-red-300">
            {part}
          </span>
        );
      }
      if (part === '[PERLU VERIFIKASI]') {
        return (
          <span key={idx} className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-300">
            {part}
          </span>
        );
      }

      // Jika teks cocok dengan klaim yang diklik di panel kanan
      if (highlightedText && part.toLowerCase().includes(highlightedText.toLowerCase())) {
        return (
          <mark key={idx} className="bg-yellow-200 text-slate-900 px-1 rounded font-semibold">
            {part}
          </mark>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  const igCharCount = products.captionInstagram.teksLengkap.length;
  const isIgOverLimit = igCharCount > 2200;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Tab Navigasi Produk */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 pt-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('siaranPers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-colors border-t border-x ${
              activeTab === 'siaranPers'
                ? 'bg-white text-[#0B1F3A] border-slate-200 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-[#0B1F3A]" />
            <span>Siaran Pers (Press Release)</span>
          </button>

          <button
            onClick={() => setActiveTab('captionInstagram')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-colors border-t border-x ${
              activeTab === 'captionInstagram'
                ? 'bg-white text-[#0B1F3A] border-slate-200 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Instagram className="w-4 h-4 text-[#D32F2F]" />
            <span>Caption Instagram</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isIgOverLimit
                  ? 'bg-red-100 text-red-700 font-bold'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {igCharCount}/2.200
            </span>
          </button>
        </div>

        {/* Tombol Bandingkan Produk & Riwayat */}
        <div className="flex items-center gap-2 pb-2">
          <button
            onClick={onOpenComparison}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B1F3A] hover:bg-white rounded-lg border border-slate-300 transition-colors shadow-2xs"
            title="Buka Matriks Konsistensi Antar Produk"
          >
            <Sliders className="w-3.5 h-3.5 text-[#D32F2F]" />
            <span className="hidden sm:inline">Bandingkan Produk</span>
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B1F3A] hover:bg-white rounded-lg transition-colors"
            title="Lihat Riwayat Versi"
          >
            <History className="w-4 h-4" />
            <span className="text-xs">v{currentHistory.length}</span>
          </button>

          {currentHistory.length > 1 && (
            <button
              onClick={() => onUndo(activeTab)}
              className="p-1.5 text-slate-600 hover:text-[#0B1F3A] hover:bg-white rounded-lg transition-colors"
              title="Undo ke versi sebelumnya"
              aria-label="Undo versi"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar Aksi Konten */}
      <div className="p-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Grup Kiri: Modifikasi AI & Manual */}
        <div className="flex flex-wrap items-center gap-1.5">
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Edit Manual
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors"
              >
                Simpan Suntingan
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
            </div>
          )}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Tombol Perpendek */}
          <button
            onClick={() => handleAiAction('perpendek')}
            disabled={isRegenerating || isEditing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Perpendek konten dengan mempertahankan fakta inti"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Perpendek</span>
          </button>

          {/* Tombol Perpanjang */}
          <button
            onClick={() => handleAiAction('perpanjang')}
            disabled={isRegenerating || isEditing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Perpanjang konten dengan detail konteks dari ringkasan"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Perpanjang</span>
          </button>

          {/* Menu Ubah Gaya Bahasa */}
          <div className="relative">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              disabled={isRegenerating || isEditing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D32F2F]" />
              <span>Ubah Gaya Bahasa</span>
            </button>

            {showStyleMenu && (
              <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                <button
                  onClick={() => handleAiAction('ubah_gaya', 'lebih_formal')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium text-slate-800"
                >
                  Lebih Formal & Institusional
                </button>
                <button
                  onClick={() => handleAiAction('ubah_gaya', 'lebih_santai')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium text-slate-800"
                >
                  Lebih Santai & Mengalir
                </button>
                <button
                  onClick={() => handleAiAction('ubah_gaya', 'lebih_ringkas')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium text-slate-800"
                >
                  Lebih Ringkas & Padat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grup Kanan: Salin, Ekspor & Tandai Verifikasi */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Salin Konten ke Clipboard"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Unduh format teks"
          >
            <Download className="w-3.5 h-3.5" />
            <span>TXT</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Unduh format DOCX resmi"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>DOCX</span>
          </button>

          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors"
            title="Unduh Siaran Pers dan Caption Instagram dalam 1 Dokumen DOCX"
          >
            <FileDown className="w-3.5 h-3.5 text-[#0B1F3A]" />
            <span>Unduh Semua</span>
          </button>

          <button
            onClick={() => setShowVerifyModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-2xs ${
              audit?.isVerified
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-[#0B1F3A] hover:bg-[#15325b] text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {audit?.isVerified ? 'Telah Diverifikasi' : 'Tandai Sudah Diverifikasi'}
            </span>
          </button>
        </div>
      </div>

      {/* Audit Banner jika sudah diverifikasi */}
      {audit?.isVerified && (
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>
              <strong>Terverifikasi secara resmi oleh:</strong> {audit.reviewerName} (
              {new Date(audit.verifiedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              )
            </span>
          </div>
          {audit.notes && <span className="italic truncate max-w-xs">"{audit.notes}"</span>}
        </div>
      )}

      {/* Area Teks Konten / Textarea Editor */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full h-full min-h-[420px] p-4 font-mono text-sm leading-relaxed border border-[#0B1F3A] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          />
        ) : (
          <div className="prose max-w-none text-slate-800 font-sans text-sm leading-relaxed whitespace-pre-wrap select-text">
            {renderFormattedText(currentText)}
          </div>
        )}
      </div>

      {/* Footer Info Karakter Instagram & Status */}
      {activeTab === 'captionInstagram' && (
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Batas Instagram: 2.200 karakter</span>
            {isIgOverLimit && (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Melebihi batas {igCharCount - 2200} karakter! Harap gunakan tombol "Perpendek".
              </span>
            )}
          </div>
          <span className="font-mono font-semibold tabular-nums text-slate-700">
            {igCharCount} / 2.200 karakter
          </span>
        </div>
      )}

      {/* Modal Dialog: Tandai Sudah Diverifikasi */}
      {showVerifyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B1F3A]">
                  Tandai Dokumen Telah Diverifikasi
                </h3>
                <p className="text-xs text-slate-500">
                  Human-in-the-Loop: Tanggung jawab penetapan rilis akhir.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Petugas / Analis Pemeriksa *</label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso (Analis Media Kemenko Polkam)"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Catatan Verifikasi</label>
                <textarea
                  rows={2}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Catatan klarifikasi atau konfirmasi nomor surat/data..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgedUnverified}
                  onChange={(e) => setAcknowledgedUnverified(e.target.checked)}
                  className="mt-0.5 rounded text-[#0B1F3A] focus:ring-[#0B1F3A]"
                />
                <span className="text-slate-700 leading-snug">
                  Saya menyatakan bahwa temuan <strong>"Tidak ditemukan dalam sumber"</strong> dan <strong>"Berpotensi tidak konsisten"</strong> telah ditinjau secara manual dan disetujui untuk rilis publik.
                </span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Simpan Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog: Peringatan Placeholder Masih Ada */}
      {showPlaceholderWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-100 text-[#D32F2F] rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0B1F3A]">
                  Peringatan: Terdapat Placeholder yang Belum Dilengkapi
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Konten ini masih memuat label seperti <code>[PERLU DILENGKAPI]</code>, <code>[TIDAK TERSEDIA DALAM SUMBER]</code>, atau <code>[PERLU VERIFIKASI]</code>. Harap periksa dan lengkapi sebelum mempublikasikannya.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowPlaceholderWarning(false);
                  setPendingAction(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
              >
                Batal & Periksa Teks
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPlaceholderWarning(false);
                  if (pendingAction) pendingAction();
                  setPendingAction(null);
                }}
                className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#15325b] text-white rounded-lg font-bold"
              >
                Tetap Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: Riwayat Versi */}
      {showHistoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-[#0B1F3A] flex items-center gap-2">
                <History className="w-5 h-5 text-[#0B1F3A]" />
                Riwayat Versi {activeTab === 'siaranPers' ? 'Siaran Pers' : 'Caption Instagram'}
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                Tutup
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 space-y-2 text-xs">
              {currentHistory.map((ver, idx) => (
                <div key={ver.id} className="pt-2.5 pb-2">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>
                      Versi {currentHistory.length - idx} {idx === 0 ? '(Saat Ini)' : ''}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {new Date(ver.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{ver.actionNote}</p>
                  <p className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 line-clamp-3">
                    {ver.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
