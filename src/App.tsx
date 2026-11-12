import React, { useState, useEffect } from 'react';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { UploadStep } from './components/NewContent/UploadStep';
import { SummaryStep } from './components/NewContent/SummaryStep';
import { ClassificationStep } from './components/NewContent/ClassificationStep';
import { ResultLayout } from './components/ResultView/ResultLayout';
import { HistoryView } from './components/HistoryView';
import { GuideView } from './components/GuideView';
import { SettingsView } from './components/SettingsView';
import {
  StoredDocument,
  DocumentAnalysis,
  ClassifiedItem,
  GeneratedProducts,
  ProductVersion,
  AppSettings,
  VerificationResult,
} from './types';
import {
  getAllDocuments,
  saveDocument,
  deleteDocument,
  getSettings,
} from './services/db';
import {
  requestAnalysis,
  requestClassification,
  requestGeneration,
  requestVerification,
} from './services/api';
import { Loader2 } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    selectedModel: 'gemini-3.8-flash',
    defaultTone: 'formal',
    enableAutoVerify: true,
  });

  // State Pipeline Pembuatan Konten
  const [activeDoc, setActiveDoc] = useState<StoredDocument | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Load dokumen & setting saat pertama kali dibuka
  useEffect(() => {
    refreshDocuments();
    getSettings().then(setAppSettings);
  }, []);

  const refreshDocuments = async () => {
    try {
      const docs = await getAllDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents from IndexedDB:', err);
    }
  };

  // Navigasi ke pembuatan konten baru
  const handleStartNewContent = () => {
    setActiveDoc(null);
    setCurrentStep(1);
    setCurrentTab('create');
  };

  // Callback dari UploadStep saat ekstraksi berhasil
  const handleExtractionSuccess = (data: {
    extractedText: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    supportingSource?: string;
    isOcr?: boolean;
    pageCount?: number;
  }) => {
    const newDoc: StoredDocument = {
      id: `doc-${Date.now()}`,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      uploadedAt: new Date().toISOString(),
      extractedText: data.extractedText,
      supportingSource: data.supportingSource,
      isOcr: data.isOcr,
      pageCount: data.pageCount,
      pressReleaseHistory: [],
      instagramHistory: [],
      currentStep: 1,
    };
    setActiveDoc(newDoc);
  };

  // Mulai Analisis & Otomatis Generate 2 Produk dari UploadStep
  const handleStartAnalysis = async (sourceText: string, supportingSource?: string) => {
    setIsLoading(true);
    setLoadingMessage('Tahap 1/3: Menganalisis dokumen kebijakan secara mendalam...');
    try {
      // 1. Analisis Dokumen
      const analysis = await requestAnalysis(sourceText, supportingSource, appSettings.selectedModel);
      
      // 2. Penyaringan & Klasifikasi KIP
      setLoadingMessage('Tahap 2/3: Menyaring keterbukaan informasi publik (UU KIP No. 14 Tahun 2008)...');
      const classifications = await requestClassification(analysis, appSettings.selectedModel);

      // 3. Generasi 2 Produk (Siaran Pers dan Caption Instagram)
      setLoadingMessage('Tahap 3/3: Menghasilkan Siaran Pers & Caption Instagram yang konsisten...');
      const products = await requestGeneration(
        analysis,
        classifications,
        undefined,
        appSettings.selectedModel
      );

      // Inisialisasi riwayat versi pertama
      const prVersion: ProductVersion = {
        id: `pr-v1-${Date.now()}`,
        text: products.siaranPers.teksLengkap,
        timestamp: new Date().toISOString(),
        actionNote: 'Draf Pertama Hasil Generasi AI',
      };

      const igVersion: ProductVersion = {
        id: `ig-v1-${Date.now()}`,
        text: products.captionInstagram.teksLengkap,
        timestamp: new Date().toISOString(),
        actionNote: 'Draf Pertama Hasil Generasi AI',
      };

      // 4. Verifikasi Berbasis Sumber
      setLoadingMessage('Menjalankan audit verifikasi 2 lapis (Deterministik + AI Fact-Checker)...');
      let verificationResult: VerificationResult | undefined;
      try {
        verificationResult = await requestVerification(
          sourceText,
          products.siaranPers.teksLengkap,
          products.captionInstagram.teksLengkap,
          appSettings.selectedModel
        );
      } catch (verifyErr) {
        console.warn('Verifikasi otomatis mengalami kendala:', verifyErr);
      }

      const updatedDoc: StoredDocument = {
        ...(activeDoc || {
          id: `doc-${Date.now()}`,
          fileName: 'Dokumen_Kebijakan.txt',
          fileSize: sourceText.length,
          fileType: 'txt',
          uploadedAt: new Date().toISOString(),
          extractedText: sourceText,
          pressReleaseHistory: [],
          instagramHistory: [],
          currentStep: 6,
        }),
        extractedText: sourceText,
        supportingSource,
        analysis,
        classifications,
        products,
        pressReleaseHistory: [prVersion],
        instagramHistory: [igVersion],
        verification: verificationResult,
        currentStep: 6,
      };

      setActiveDoc(updatedDoc);
      setCurrentStep(6);
      setCurrentTab('results');
      await saveDocument(updatedDoc);
      await refreshDocuments();
    } catch (err: any) {
      console.error('Error during end-to-end pipeline:', err);
      alert(`Gagal memproses dokumen: ${err.message || 'Kesalahan server'}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Konfirmasi Ringkasan dari SummaryStep -> Lanjut ke Penyaringan KIP
  const handleConfirmSummary = async (confirmedAnalysis: DocumentAnalysis) => {
    if (!activeDoc) return;
    setIsLoading(true);
    setLoadingMessage('Menyaring informasi berdasarkan UU No. 14 Tahun 2008 tentang KIP...');

    try {
      const classifications = await requestClassification(confirmedAnalysis, appSettings.selectedModel);
      
      const updatedDoc: StoredDocument = {
        ...activeDoc,
        analysis: confirmedAnalysis,
        classifications,
        currentStep: 3,
      };

      setActiveDoc(updatedDoc);
      setCurrentStep(3);
      await saveDocument(updatedDoc);
      await refreshDocuments();
    } catch (err: any) {
      alert(`Klasifikasi KIP Gagal: ${err.message || 'Kesalahan server'}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Konfirmasi Klasifikasi dari ClassificationStep -> Lanjut ke Generasi 2 Produk
  const handleConfirmClassifications = async (confirmedClassifications: ClassifiedItem[]) => {
    if (!activeDoc || !activeDoc.analysis) return;
    setIsLoading(true);
    setLoadingMessage('Membuat Siaran Pers & Caption Instagram secara konsisten...');

    try {
      // 1. Generasi 2 Produk
      const products = await requestGeneration(
        activeDoc.analysis,
        confirmedClassifications,
        undefined,
        appSettings.selectedModel
      );

      // Inisialisasi riwayat versi pertama
      const prVersion: ProductVersion = {
        id: `pr-v1-${Date.now()}`,
        text: products.siaranPers.teksLengkap,
        timestamp: new Date().toISOString(),
        actionNote: 'Draf Pertama Hasil Generasi AI',
      };

      const igVersion: ProductVersion = {
        id: `ig-v1-${Date.now()}`,
        text: products.captionInstagram.teksLengkap,
        timestamp: new Date().toISOString(),
        actionNote: 'Draf Pertama Hasil Generasi AI',
      };

      // 2. Jalankan Verifikasi Berbasis Sumber secara otomatis
      setLoadingMessage('Menjalankan audit verifikasi 2 lapis (Deterministik + Gemini Fact-Checker)...');
      let verificationResult: VerificationResult | undefined;

      try {
        verificationResult = await requestVerification(
          activeDoc.extractedText,
          products.siaranPers.teksLengkap,
          products.captionInstagram.teksLengkap,
          appSettings.selectedModel
        );
      } catch (verifyErr) {
        console.warn('Verifikasi otomatis mengalami kendala:', verifyErr);
      }

      const updatedDoc: StoredDocument = {
        ...activeDoc,
        classifications: confirmedClassifications,
        products,
        pressReleaseHistory: [prVersion],
        instagramHistory: [igVersion],
        verification: verificationResult,
        currentStep: 6, // Langsung ke tahap Human Review / Hasil
      };

      setActiveDoc(updatedDoc);
      setCurrentStep(6);
      setCurrentTab('results');
      await saveDocument(updatedDoc);
      await refreshDocuments();
    } catch (err: any) {
      alert(`Generasi Produk Gagal: ${err.message || 'Kesalahan server'}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Update teks produk dari editor (penyuntingan manual atau AI rewriting)
  const handleUpdateProductText = async (
    product: 'siaranPers' | 'captionInstagram',
    newText: string,
    actionNote: string
  ) => {
    if (!activeDoc || !activeDoc.products) return;

    const newVersion: ProductVersion = {
      id: `${product}-${Date.now()}`,
      text: newText,
      timestamp: new Date().toISOString(),
      actionNote,
    };

    let updatedProducts: GeneratedProducts;
    let updatedPrHistory = [...activeDoc.pressReleaseHistory];
    let updatedIgHistory = [...activeDoc.instagramHistory];

    if (product === 'siaranPers') {
      updatedProducts = {
        ...activeDoc.products,
        siaranPers: {
          ...activeDoc.products.siaranPers,
          teksLengkap: newText,
        },
      };
      updatedPrHistory = [newVersion, ...updatedPrHistory];
    } else {
      updatedProducts = {
        ...activeDoc.products,
        captionInstagram: {
          ...activeDoc.products.captionInstagram,
          teksLengkap: newText,
          karakterCount: newText.length,
        },
      };
      updatedIgHistory = [newVersion, ...updatedIgHistory];
    }

    // Setiap perubahan teks membatalkan status terverifikasi jika ada
    const updatedDoc: StoredDocument = {
      ...activeDoc,
      products: updatedProducts,
      pressReleaseHistory: updatedPrHistory,
      instagramHistory: updatedIgHistory,
      audit: undefined, // Perlu verifikasi ulang
    };

    setActiveDoc(updatedDoc);
    await saveDocument(updatedDoc);
    await refreshDocuments();
  };

  // Undo versi produk
  const handleUndoProduct = async (product: 'siaranPers' | 'captionInstagram') => {
    if (!activeDoc || !activeDoc.products) return;

    if (product === 'siaranPers') {
      if (activeDoc.pressReleaseHistory.length <= 1) return;
      const previousVersion = activeDoc.pressReleaseHistory[1];
      const newHistory = activeDoc.pressReleaseHistory.slice(1);

      const updatedDoc: StoredDocument = {
        ...activeDoc,
        products: {
          ...activeDoc.products,
          siaranPers: {
            ...activeDoc.products.siaranPers,
            teksLengkap: previousVersion.text,
          },
        },
        pressReleaseHistory: newHistory,
        audit: undefined,
      };
      setActiveDoc(updatedDoc);
      await saveDocument(updatedDoc);
      await refreshDocuments();
    } else {
      if (activeDoc.instagramHistory.length <= 1) return;
      const previousVersion = activeDoc.instagramHistory[1];
      const newHistory = activeDoc.instagramHistory.slice(1);

      const updatedDoc: StoredDocument = {
        ...activeDoc,
        products: {
          ...activeDoc.products,
          captionInstagram: {
            ...activeDoc.products.captionInstagram,
            teksLengkap: previousVersion.text,
            karakterCount: previousVersion.text.length,
          },
        },
        instagramHistory: newHistory,
        audit: undefined,
      };
      setActiveDoc(updatedDoc);
      await saveDocument(updatedDoc);
      await refreshDocuments();
    }
  };

  // Tandai Sudah Diverifikasi (Human Review Approval)
  const handleMarkVerified = async (reviewerName: string, notes: string) => {
    if (!activeDoc) return;

    const updatedDoc: StoredDocument = {
      ...activeDoc,
      audit: {
        isVerified: true,
        reviewerName,
        notes,
        verifiedAt: new Date().toISOString(),
      },
      currentStep: 7, // Tahap 7: Output Siap Publikasi
    };

    setActiveDoc(updatedDoc);
    setCurrentStep(7);
    await saveDocument(updatedDoc);
    await refreshDocuments();
    alert(`Dokumen berhasil diverifikasi secara resmi oleh ${reviewerName}. Header DOCX kini berstatus "TERVERIFIKASI".`);
  };

  // Verifikasi Ulang
  const handleRerunVerification = async () => {
    if (!activeDoc || !activeDoc.products) return;
    setIsLoading(true);
    setLoadingMessage('Menjalankan audit verifikasi ulang terhadap dokumen sumber...');

    try {
      const verification = await requestVerification(
        activeDoc.extractedText,
        activeDoc.products.siaranPers.teksLengkap,
        activeDoc.products.captionInstagram.teksLengkap,
        appSettings.selectedModel
      );

      const updatedDoc: StoredDocument = {
        ...activeDoc,
        verification,
      };

      setActiveDoc(updatedDoc);
      await saveDocument(updatedDoc);
      await refreshDocuments();
    } catch (err: any) {
      alert(`Verifikasi Ulang Gagal: ${err.message || 'Kesalahan server'}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Buka dokumen dari Dashboard atau Riwayat
  const handleOpenDocument = (doc: StoredDocument) => {
    setActiveDoc(doc);
    if (doc.products) {
      setCurrentStep(doc.audit?.isVerified ? 7 : 6);
      setCurrentTab('results');
    } else if (doc.classifications) {
      setCurrentStep(3);
      setCurrentTab('create');
    } else if (doc.analysis) {
      setCurrentStep(2);
      setCurrentTab('create');
    } else {
      setCurrentStep(1);
      setCurrentTab('create');
    }
  };

  // Hapus dokumen dari riwayat
  const handleDeleteDocument = async (id: string) => {
    await deleteDocument(id);
    if (activeDoc?.id === id) {
      setActiveDoc(null);
      setCurrentStep(1);
      setCurrentTab('dashboard');
    }
    await refreshDocuments();
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex font-sans antialiased">
      {/* Sidebar Navigasi Kiri */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'results' && !activeDoc?.products) {
            alert('Belum ada hasil generasi yang aktif. Harap buat konten baru atau buka dokumen dari riwayat.');
            return;
          }
          setCurrentTab(tab);
        }}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        hasActiveResult={Boolean(activeDoc?.products)}
      />

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onNewContent={handleStartNewContent}
          activeDocTitle={activeDoc?.analysis?.judul || activeDoc?.fileName}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Global Loading Overlay */}
          {isLoading && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/70 backdrop-blur-xs"
              role="status"
              aria-live="polite"
            >
              <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#0B1F3A]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D32F2F]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#0B1F3A]">Memproses dengan AI</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {loadingMessage || 'Sedang memproses...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <Dashboard
              documents={documents}
              onStartNewContent={handleStartNewContent}
              onOpenDocument={handleOpenDocument}
            />
          )}

          {/* TAB 2: BUAT KONTEN BARU (PIPELINE) */}
          {currentTab === 'create' && (
            <div className="space-y-6">
              {currentStep === 1 && (
                <UploadStep
                  onExtractionSuccess={handleExtractionSuccess}
                  onStartAnalysis={handleStartAnalysis}
                  isLoading={isLoading}
                />
              )}

              {currentStep === 2 && activeDoc?.analysis && (
                <SummaryStep
                  initialAnalysis={activeDoc.analysis}
                  onConfirmSummary={handleConfirmSummary}
                  isLoading={isLoading}
                />
              )}

              {currentStep === 3 && activeDoc?.classifications && (
                <ClassificationStep
                  initialClassifications={activeDoc.classifications}
                  onConfirmClassifications={handleConfirmClassifications}
                  onBack={() => setCurrentStep(2)}
                  isLoading={isLoading}
                />
              )}
            </div>
          )}

          {/* TAB 3: HASIL GENERASI & RUANG KERJA EDITOR */}
          {currentTab === 'results' && activeDoc?.products && (
            <ResultLayout
              analysis={activeDoc.analysis}
              classifications={activeDoc.classifications}
              products={activeDoc.products}
              verification={activeDoc.verification}
              audit={activeDoc.audit}
              pressReleaseHistory={activeDoc.pressReleaseHistory}
              instagramHistory={activeDoc.instagramHistory}
              currentStep={currentStep}
              isLoading={isLoading}
              onUpdateText={handleUpdateProductText}
              onUndo={handleUndoProduct}
              onMarkVerified={handleMarkVerified}
              onRerunVerification={handleRerunVerification}
              sourceTitle={activeDoc.analysis?.judul || activeDoc.fileName}
              onNavigateStep={(step) => {
                setCurrentStep(step);
                if (step <= 3) {
                  setCurrentTab('create');
                }
              }}
            />
          )}

          {/* TAB 4: RIWAYAT DOKUMEN */}
          {currentTab === 'history' && (
            <HistoryView
              documents={documents}
              onOpenDocument={handleOpenDocument}
              onDeleteDocument={handleDeleteDocument}
              onStartNew={handleStartNewContent}
            />
          )}

          {/* TAB 5: PANDUAN PENGGUNAAN */}
          {currentTab === 'guide' && <GuideView />}

          {/* TAB 6: PENGATURAN */}
          {currentTab === 'settings' && (
            <SettingsView
              onDataCleared={() => {
                setDocuments([]);
                setActiveDoc(null);
                setCurrentStep(1);
                setCurrentTab('dashboard');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
