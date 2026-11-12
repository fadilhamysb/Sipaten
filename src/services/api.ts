import { DocumentAnalysis, ClassifiedItem, GeneratedProducts, VerificationResult } from '../types';

export interface ExtractionResponse {
  success: boolean;
  text: string;
  format: 'pdf' | 'docx' | 'pptx' | 'txt';
  pageCount?: number;
  charCount: number;
  fileName: string;
  fileSize: number;
  error?: string;
}

export async function extractDocument(
  file: File | null,
  directText?: string,
  fileName?: string
): Promise<ExtractionResponse> {
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/extract', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal mengekstrak berkas.');
    }
    return data;
  }

  if (directText) {
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: directText, fileName: fileName || 'Teks_Langsung.txt' }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal mengekstrak teks langsung.');
    }
    return data;
  }

  throw new Error('Tidak ada dokumen atau teks yang disediakan.');
}

export async function runOcr(base64Data: string, mimeType: string): Promise<string> {
  const res = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data, mimeType }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal menjalankan OCR.');
  }
  return data.text;
}

export async function requestAnalysis(
  sourceText: string,
  supportingSource?: string,
  model?: string
): Promise<DocumentAnalysis> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceText, supportingSource, model }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal menganalisis dokumen kebijakan.');
  }
  return data.analysis;
}

export async function requestClassification(
  analysis: DocumentAnalysis,
  model?: string
): Promise<ClassifiedItem[]> {
  const res = await fetch('/api/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis, model }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal mengklasifikasikan informasi.');
  }
  return data.classifications;
}

export async function requestGeneration(
  confirmedSummary: DocumentAnalysis,
  classifications: ClassifiedItem[],
  customInstruction?: string,
  model?: string
): Promise<GeneratedProducts> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmedSummary, classifications, customInstruction, model }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal membuat 2 produk komunikasi.');
  }
  return data.products;
}

export async function requestRegeneration(
  productType: 'siaranPers' | 'captionInstagram',
  currentText: string,
  actionType: 'perpendek' | 'perpanjang' | 'ubah_gaya',
  styleOption?: 'lebih_formal' | 'lebih_santai' | 'lebih_ringkas',
  confirmedSummary?: DocumentAnalysis,
  model?: string
): Promise<{ teksLengkap: string; catatanPerubahan: string }> {
  const res = await fetch('/api/regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productType,
      currentText,
      actionType,
      styleOption,
      confirmedSummary,
      model,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal merevisi konten.');
  }
  return data.result;
}

export async function requestVerification(
  originalSourceText: string,
  pressReleaseText: string,
  instagramText: string,
  model?: string
): Promise<VerificationResult> {
  const res = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalSourceText, pressReleaseText, instagramText, model }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal melakukan verifikasi terhadap sumber.');
  }
  return data.verification;
}

export async function fetchAvailableModels(): Promise<any> {
  const res = await fetch('/api/models');
  return await res.json();
}
