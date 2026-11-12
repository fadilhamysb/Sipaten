import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Trash2,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { AppSettings } from '../types';
import { getSettings, saveSettings, clearAllData } from '../services/db';

interface SettingsViewProps {
  onDataCleared: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataCleared }) => {
  const [settings, setSettings] = useState<AppSettings>({
    selectedModel: 'gemini-3.8-flash',
    defaultTone: 'formal',
    enableAutoVerify: true,
  });
  const [isSaved, setIsSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    getSettings().then((s) => setSettings(s));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearAll = async () => {
    await clearAllData();
    setShowClearConfirm(false);
    onDataCleared();
    alert('Seluruh data dokumen, riwayat suntingan, dan pengaturan peramban berhasil dihapus.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0B1F3A] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#D32F2F]" />
          Pengaturan Aplikasi
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi model kecerdasan buatan, preferensi penyusunan konten, dan privasi lokal.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* 1. Pemilihan Model Gemini */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#0B1F3A]" />
            Model Gemini AI
          </label>
          <p className="text-xs text-slate-500">
            Model resmi yang digunakan untuk analisis dokumen, klasifikasi KIP, generasi produk, dan verifikasi.
          </p>

          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-[#0B1F3A] cursor-pointer transition-colors bg-slate-50/50">
              <input
                type="radio"
                name="gemini_model"
                value="gemini-3.8-flash"
                checked={settings.selectedModel === 'gemini-3.8-flash'}
                onChange={() => setSettings({ ...settings, selectedModel: 'gemini-3.8-flash' })}
                className="mt-1 text-[#0B1F3A] focus:ring-[#0B1F3A]"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-900 block">
                  Gemini 3.8 Flash (Direkomendasikan)
                </span>
                <span className="text-slate-500">
                  Model generasi teks ultra cepat dengan latensi rendah, penalaran terstruktur, dan akurasi ekstraksi tinggi.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-[#0B1F3A] cursor-pointer transition-colors bg-slate-50/50">
              <input
                type="radio"
                name="gemini_model"
                value="gemini-3.1-flash-lite"
                checked={settings.selectedModel === 'gemini-3.1-flash-lite'}
                onChange={() => setSettings({ ...settings, selectedModel: 'gemini-3.1-flash-lite' })}
                className="mt-1 text-[#0B1F3A] focus:ring-[#0B1F3A]"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-900 block">
                  Gemini 3.1 Flash Lite
                </span>
                <span className="text-slate-500">
                  Model hemat kuota untuk dokumen yang berukuran sangat panjang.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* 2. Gaya Bahasa Default */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0B1F3A]" />
            Gaya Bahasa Default
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, defaultTone: 'formal' })}
              className={`p-3 rounded-xl border text-left transition-colors ${
                settings.defaultTone === 'formal'
                  ? 'border-[#0B1F3A] bg-[#0B1F3A]/5 font-bold text-[#0B1F3A]'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Formal & Institusional
              <p className="font-normal text-[11px] text-slate-500 mt-0.5">
                Standar siaran pers kementerian
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, defaultTone: 'santai' })}
              className={`p-3 rounded-xl border text-left transition-colors ${
                settings.defaultTone === 'santai'
                  ? 'border-[#0B1F3A] bg-[#0B1F3A]/5 font-bold text-[#0B1F3A]'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Komunikatif & Mengalir
              <p className="font-normal text-[11px] text-slate-500 mt-0.5">
                Bahasa ramah publik medsos
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, defaultTone: 'ringkas' })}
              className={`p-3 rounded-xl border text-left transition-colors ${
                settings.defaultTone === 'ringkas'
                  ? 'border-[#0B1F3A] bg-[#0B1F3A]/5 font-bold text-[#0B1F3A]'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Padat & Langsung Inti
              <p className="font-normal text-[11px] text-slate-500 mt-0.5">
                Bullet point fakta pokok
              </p>
            </button>
          </div>
        </div>

        {/* 3. Auto Verify Toggle */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-slate-800">
              Jalankan Verifikasi Otomatis Setelah Generasi
            </label>
            <p className="text-[11px] text-slate-500">
              Audit 2 lapis langsung dijalankan saat Siaran Pers dan Caption Instagram selesai digenerasi.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.enableAutoVerify}
            onChange={(e) => setSettings({ ...settings, enableAutoVerify: e.target.checked })}
            className="w-4 h-4 rounded text-[#0B1F3A] focus:ring-[#0B1F3A]"
          />
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Pengaturan berhasil disimpan.
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </form>

      {/* Zona Bahaya: Hapus Semua Data */}
      <div className="bg-red-50/60 border border-red-200 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-[#D32F2F] flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Hapus Semua Data Lokal (IndexedDB)
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Tindakan ini akan mengosongkan seluruh riwayat dokumen kebijakan, teks sumber yang diekstrak, hasil generasi siaran pers, riwayat versi suntingan, dan catatan verifikasi dari peramban Anda.
        </p>

        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="px-4 py-2 bg-[#D32F2F] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
        >
          Hapus Semua Data Sekarang
        </button>
      </div>

      {/* Modal Konfirmasi Hapus Data */}
      {showClearConfirm && (
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
                <h4 className="text-base font-bold text-[#0B1F3A]">
                  Konfirmasi Penghapusan Seluruh Data
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus seluruh data yang tersimpan di IndexedDB? Data yang dihapus tidak dapat dipulihkan kembali.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 bg-[#D32F2F] hover:bg-red-700 text-white rounded-lg font-bold"
              >
                Ya, Hapus Semua Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
