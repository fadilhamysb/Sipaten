import React from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  History,
  FileText,
  BookOpen,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react';
import { Logo } from './Logo';

export type NavItemKey =
  | 'dashboard'
  | 'create'
  | 'history'
  | 'results'
  | 'guide'
  | 'settings';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  hasActiveResult?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  hasActiveResult = false,
}) => {
  const menuItems = [
    {
      key: 'dashboard' as NavItemKey,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Statistik & Ringkasan Dokumen',
    },
    {
      key: 'create' as NavItemKey,
      label: 'Buat Konten Baru',
      icon: FilePlus2,
      description: 'Unggah Dokumen Kebijakan',
    },
    {
      key: 'results' as NavItemKey,
      label: 'Hasil Generasi',
      icon: FileText,
      description: 'Editor & Verifikasi Produk',
      badge: hasActiveResult ? 'Aktif' : undefined,
    },
    {
      key: 'history' as NavItemKey,
      label: 'Riwayat Dokumen',
      icon: History,
      description: 'Arsip & Versi Tersimpan',
    },
    {
      key: 'guide' as NavItemKey,
      label: 'Panduan Penggunaan',
      icon: BookOpen,
      description: 'Alur Kerja & UU KIP',
    },
    {
      key: 'settings' as NavItemKey,
      label: 'Pengaturan',
      icon: Settings,
      description: 'Model AI & Preferensi',
    },
  ];

  const handleSelect = (key: NavItemKey) => {
    onSelectTab(key);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#0B1F3A] text-white">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Logo SVG dengan teks putih di background navy */}
          <div className="bg-white/10 p-2 rounded-xl border border-white/10">
            <svg
              width="30"
              height="30"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 6C10 4.89543 10.8954 4 12 4H28L38 14V42C38 43.1046 37.1046 44 36 44H12C10.8954 44 10 43.1046 10 42V6Z"
                fill="#FFFFFF"
              />
              <path d="M28 4V12C28 13.1046 28.8954 14 30 14H38L28 4Z" fill="#CBD5E1" />
              <rect x="16" y="18" width="16" height="2" rx="1" fill="#0B1F3A" />
              <rect x="16" y="24" width="12" height="2" rx="1" fill="#0B1F3A" />
              <path
                d="M24 28C24 25.7909 25.7909 24 28 24H40C42.2091 24 44 25.7909 44 28V36C44 38.2091 42.2091 40 40 40H34L28 44V40H28C25.7909 40 24 38.2091 24 36V28Z"
                fill="#D32F2F"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <circle cx="31" cy="32" r="1.5" fill="#FFFFFF" />
              <circle cx="35" cy="32" r="1.5" fill="#FFFFFF" />
              <circle cx="39" cy="32" r="1.5" fill="#FFFFFF" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white leading-tight">
              SIPATEN
            </span>
            <span className="text-[11px] text-slate-300 font-normal">
              Aplikasi Pembuatan Konten
            </span>
          </div>
        </div>

        {/* Tombol tutup di mobile */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          aria-label="Tutup menu navigasi"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Identitas Instansi */}
      <div className="px-5 py-3 border-b border-white/5 bg-black/15 text-[11px] text-slate-300">
        <p className="font-medium text-slate-200">Kemenko Polkam</p>
        <p className="text-slate-400 truncate">Asdep Koordinasi Media Komunikasi & Informasi</p>
      </div>

      {/* Menu Navigasi Utama */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Menu Utama">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleSelect(item.key)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all text-sm font-medium ${
                isActive
                  ? 'bg-white text-[#0B1F3A] font-semibold shadow-md'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[#D32F2F]' : 'text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-[#D32F2F] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-white/10 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300">Tagline Kebijakan:</p>
        <p className="italic mt-0.5 text-slate-400 leading-relaxed">
          "Satu Sumber Kebijakan, Dua Produk Komunikasi Strategis."
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Pinned */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Content */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out lg:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>
    </>
  );
};
