import React, { useState } from 'react';
import {
  History,
  Search,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { StoredDocument } from '../types';

interface HistoryViewProps {
  documents: StoredDocument[];
  onOpenDocument: (doc: StoredDocument) => void;
  onDeleteDocument: (id: string) => void;
  onStartNew: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  documents,
  onOpenDocument,
  onDeleteDocument,
  onStartNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.analysis?.judul && doc.analysis.judul.toLowerCase().includes(searchQuery.toLowerCase()));

    const isVerified = Boolean(doc.audit?.isVerified);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'verified' && isVerified) ||
      (statusFilter === 'pending' && !isVerified);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] flex items-center gap-2">
            <History className="w-5 h-5 text-[#D32F2F]" />
            Riwayat Dokumen & Arsip Kebijakan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Semua dokumen dan draf hasil disimpan secara lokal di peramban Anda (IndexedDB).
          </p>
        </div>

        <button
          onClick={onStartNew}
          className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
        >
          + Buat Konten Baru
        </button>
      </div>

      {/* Filter & Pencarian */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama berkas atau judul..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#0B1F3A] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua ({documents.length})
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'verified'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Terverifikasi ({documents.filter((d) => d.audit?.isVerified).length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-amber-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Menunggu ({documents.filter((d) => !d.audit?.isVerified).length})
          </button>
        </div>
      </div>

      {/* Daftar Dokumen */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada dokumen riwayat yang ditemukan</p>
            <p className="mt-1 text-slate-400">
              Dokumen kebijakan yang Anda analisis akan tersimpan otomatis di sini.
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isVerified = Boolean(doc.audit?.isVerified);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-[#0B1F3A]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-3 bg-slate-100 text-[#0B1F3A] rounded-xl shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {doc.fileType}
                      </span>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Terverifikasi oleh {doc.audit?.reviewerName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Menunggu Verifikasi Manual
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#0B1F3A] truncate">
                      {doc.analysis?.judul || doc.fileName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
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
                      {doc.products && (
                        <>
                          <span>·</span>
                          <span className="text-purple-700 font-medium">Siaran Pers & Instagram Siap</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onOpenDocument(doc)}
                    className="px-4 py-2 bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
                  >
                    Buka Kembali
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus dokumen "${doc.fileName}" dari riwayat?`)) {
                        onDeleteDocument(doc.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-[#D32F2F] hover:bg-red-50 rounded-xl transition-colors"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
