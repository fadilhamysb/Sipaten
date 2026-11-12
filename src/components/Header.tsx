import React from 'react';
import { Menu, ShieldCheck, PlusCircle } from 'lucide-react';
import { Logo } from './Logo';
import { NavItemKey } from './Sidebar';

interface HeaderProps {
  currentTab: NavItemKey;
  onOpenMobileSidebar: () => void;
  onNewContent: () => void;
  activeDocTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onNewContent,
  activeDocTitle,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard Monitoring & Ringkasan';
      case 'create':
        return 'Buat Konten Baru (Analisis & Generasi)';
      case 'results':
        return 'Hasil Generasi & Ruang Kerja Editor';
      case 'history':
        return 'Riwayat Dokumen & Arsip Kebijakan';
      case 'guide':
        return 'Panduan Penggunaan & Regulasi KIP';
      case 'settings':
        return 'Pengaturan Sistem & Model AI';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Tombol hamburger di mobile */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo terlihat di header jika mobile, jika desktop tampilkan breadcrumb */}
        <div className="lg:hidden">
          <Logo size="sm" showSubtitle={false} />
        </div>

        <div className="hidden lg:flex flex-col">
          <h1 className="text-base font-bold text-[#0B1F3A] leading-tight">
            {getTabTitle()}
          </h1>
          <p className="text-xs text-slate-500">
            Satu Sumber Kebijakan, Dua Produk Komunikasi Strategis
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {activeDocTitle && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 max-w-xs truncate">
            <span className="font-semibold text-[#0B1F3A] shrink-0">Aktif:</span>
            <span className="truncate">{activeDocTitle}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Pemeriksaan Manusia Wajib</span>
          <span className="sm:hidden">Verifikasi</span>
        </div>

        {currentTab !== 'create' && (
          <button
            onClick={onNewContent}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-[#0B1F3A] hover:bg-[#15325b] rounded-lg transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#D32F2F]" />
            <span className="whitespace-nowrap">Buat Konten</span>
          </button>
        )}
      </div>
    </header>
  );
};
