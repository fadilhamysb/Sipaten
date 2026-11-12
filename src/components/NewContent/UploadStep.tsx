import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  FileWarning,
  Loader2,
  ScanText,
} from 'lucide-react';
import { extractDocument, runOcr } from '../../services/api';

interface UploadStepProps {
  onExtractionSuccess: (data: {
    extractedText: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    supportingSource?: string;
    isOcr?: boolean;
    pageCount?: number;
  }) => void;
  onStartAnalysis: (sourceText: string, supportingSource?: string) => void;
  isLoading: boolean;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  onExtractionSuccess,
  onStartAnalysis,
  isLoading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [directText, setDirectText] = useState('');
  const [supportingSource, setSupportingSource] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [showSourcePanel, setShowSourcePanel] = useState(false);
  const [isOcrText, setIsOcrText] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['pdf', 'docx', 'pptx', 'txt'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext)) {
      setExtractionError(`Format berkas .${ext} tidak didukung. Harap unggah berkas PDF, DOCX, PPTX, atau TXT.`);
      setSelectedFile(null);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setExtractionError('Ukuran berkas melebihi batas maksimal 20 MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setExtractionError(null);
    setIsExtracting(true);

    try {
      const result = await extractDocument(file);
      setExtractedText(result.text);
      setIsOcrText(false);
      onExtractionSuccess({
        extractedText: result.text,
        fileName: file.name,
        fileSize: file.size,
        fileType: ext,
        supportingSource,
        pageCount: result.pageCount,
      });
    } catch (err: any) {
      setExtractionError(err.message || 'Gagal mengekstrak teks dokumen.');
      setExtractedText('');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDirectTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setDirectText(text);
    setExtractionError(null);
    if (text.trim().length >= 200) {
      setExtractedText(text.trim());
      onExtractionSuccess({
        extractedText: text.trim(),
        fileName: 'Teks_Langsung_Kebijakan.txt',
        fileSize: text.length,
        fileType: 'txt',
        supportingSource,
      });
    } else {
      setExtractedText('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setExtractedText('');
    setExtractionError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTriggerOcr = async () => {
    if (!selectedFile) return;
    setOcrLoading(true);
    setExtractionError(null);
    try {
      // Baca file sebagai base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const ocrText = await runOcr(base64Data, selectedFile.type || 'image/png');
          setExtractedText(ocrText);
          setIsOcrText(true);
          onExtractionSuccess({
            extractedText: ocrText,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: 'ocr',
            supportingSource,
            isOcr: true,
          });
        } catch (ocrErr: any) {
          setExtractionError(`OCR Gagal: ${ocrErr.message}`);
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      setOcrLoading(false);
    }
  };

  const handleProceed = () => {
    const textToProcess = extractedText || directText;
    if (!textToProcess || textToProcess.trim().length < 200) {
      setExtractionError('Gagal dibaca: Teks kosong atau kurang dari 200 karakter. Dokumen kebijakan harus memiliki isi substansial sebelum dianalisis.');
      return;
    }
    onStartAnalysis(textToProcess, supportingSource);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Kartu Input Dokumen Utama */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] tracking-tight">
            Unggah dokumen kebijakan Anda di sini
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            PDF, DOCX, PPTX, atau masukkan teks secara langsung. Dokumen yang diunggah adalah satu-satunya sumber kebenaran utama.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        {!selectedFile && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#0B1F3A] hover:bg-slate-50/70 transition-all rounded-xl p-8 text-center cursor-pointer group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.pptx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-[#0B1F3A]/10 text-slate-500 group-hover:text-[#0B1F3A] flex items-center justify-center mx-auto mb-3 transition-colors">
              <UploadCloud className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Klik untuk memilih berkas atau seret berkas ke sini
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Maksimal 20 MB · Format PDF, DOCX, PPTX, TXT
            </p>
          </div>
        )}

        {/* Daftar Berkas Terpilih & Status Ekstraksi */}
        {selectedFile && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-[#0B1F3A] text-white rounded-lg shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  <span>·</span>
                  {isExtracting ? (
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" /> Sedang mengekstrak teks...
                    </span>
                  ) : extractedText ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Berhasil diekstrak ({extractedText.length.toLocaleString('id-ID')} karakter)
                    </span>
                  ) : (
                    <span className="text-amber-700">Menunggu ekstraksi</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-2 text-slate-400 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus berkas"
                aria-label="Hapus berkas"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Notifikasi Kesalahan Ekstraksi / File < 200 karakter */}
        {extractionError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2">
            <div className="flex items-start gap-2">
              <FileWarning className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-[#D32F2F]">{extractionError}</p>
                <p className="text-slate-600 leading-relaxed">
                  Jika dokumen Anda merupakan hasil pindaian (scan) tanpa lapisan teks digital, Anda dapat mencoba menjalankan fitur OCR via Gemini atau menempel teks dokumen secara langsung di bawah.
                </p>
              </div>
            </div>

            {selectedFile && !isOcrText && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTriggerOcr}
                  disabled={ocrLoading}
                  className="px-3 py-1.5 bg-[#0B1F3A] text-white rounded-lg text-xs font-semibold hover:bg-[#15325b] flex items-center gap-1.5 disabled:opacity-50"
                >
                  {ocrLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ScanText className="w-3.5 h-3.5" />
                  )}
                  Jalankan OCR via Gemini
                </button>
                <span className="text-[11px] text-slate-500 italic">
                  (Hasil OCR akan dilabeli "[teks hasil OCR, perlu diperiksa]")
                </span>
              </div>
            )}
          </div>
        )}

        {/* Kolom Masukkan Teks Langsung */}
        {!selectedFile && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="direct-text" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Atau Tempel Teks Kebijakan Secara Langsung
              </label>
              <span className="text-xs text-slate-400">
                {directText.length} karakter (minimal 200 karakter)
              </span>
            </div>
            <textarea
              id="direct-text"
              rows={6}
              value={directText}
              onChange={handleDirectTextChange}
              placeholder="Tempelkan isi surat edaran, peraturan, instruksi menteri, atau draf kebijakan pemerintah di sini..."
              className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent leading-relaxed"
            />
          </div>
        )}

        {/* Kolom Sumber Pendukung (Opsional) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label htmlFor="supporting-source" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>Sumber pendukung (opsional)</span>
            <span className="text-[11px] font-normal text-slate-400">
              — Dilabeli terpisah, prioritas tetap pada dokumen utama
            </span>
          </label>
          <textarea
            id="supporting-source"
            rows={2}
            value={supportingSource}
            onChange={(e) => setSupportingSource(e.target.value)}
            placeholder="Contoh: Lampiran rilis pers terdahulu, catatan konferensi pers, atau latar belakang tambahan..."
            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
          />
        </div>

        {/* Panel Teks Sumber untuk Memeriksa Hasil Ekstraksi */}
        {extractedText && (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              type="button"
              onClick={() => setShowSourcePanel(!showSourcePanel)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0B1F3A]" />
                <span>Panel Teks Sumber (Hasil Ekstraksi)</span>
                {isOcrText && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Teks Hasil OCR, Perlu Diperiksa
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                {showSourcePanel ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" /> Sembunyikan
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" /> Periksa ({extractedText.length.toLocaleString('id-ID')} karakter)
                  </>
                )}
              </div>
            </button>

            {showSourcePanel && (
              <div className="p-4 bg-white border-t border-slate-200 max-h-64 overflow-y-auto font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap select-text">
                {extractedText}
              </div>
            )}
          </div>
        )}

        {/* Tombol Utama: ANALISIS & GENERATE 2 PRODUK */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dokumen tidak disimpan ke disk server (Stateless & Rahasia)</span>
          </div>

          <button
            type="button"
            onClick={handleProceed}
            disabled={isLoading || isExtracting || (!extractedText && directText.trim().length < 200)}
            className="w-full sm:w-auto px-6 py-3 bg-[#0B1F3A] hover:bg-[#15325b] active:scale-98 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D32F2F]" />
                <span>Menganalisis Dokumen...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D32F2F]" />
                <span>ANALISIS & GENERATE 2 PRODUK</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
