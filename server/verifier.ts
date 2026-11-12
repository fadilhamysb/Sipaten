import { generateStructuredJson, isRealApiKey } from './geminiClient';
import { buildVerifierSystemInstruction, buildVerifierUserPrompt } from './prompts/verifierPrompt';
import { VerificationFinding, VerificationResult } from './types';
import { runDeterministicVerification, mergeVerificationFindings } from '../src/utils/deterministicVerification';
import { DEFAULT_MODELS } from './config';

export async function verifyProductsAgainstSource(
  originalSourceText: string,
  pressReleaseText: string,
  instagramText: string,
  modelName?: string
): Promise<VerificationResult> {
  // Lapis 1: Deterministik murni (kode, regex, ekstraksi fakta & angka)
  const deterministicFindings = runDeterministicVerification(
    originalSourceText,
    pressReleaseText,
    instagramText
  );

  // Lapis 2: Gemini Fact-Checker terhadap teks sumber asli jika API Key tersedia
  let aiFindings: VerificationFinding[] = [];
  const apiKey = process.env.GEMINI_API_KEY;

  if (isRealApiKey(apiKey)) {
    try {
      const systemInstruction = buildVerifierSystemInstruction();
      const prompt = buildVerifierUserPrompt(originalSourceText, pressReleaseText, instagramText);

      const aiResponse = await generateStructuredJson<{ findings: VerificationFinding[] }>({
        model: modelName || DEFAULT_MODELS.verifier,
        systemInstruction,
        prompt,
      });

      if (Array.isArray(aiResponse.findings)) {
        aiFindings = aiResponse.findings;
      }
    } catch (err: any) {
      console.warn('Lapis verifikasi Gemini gagal atau timeout, menggunakan temuan deterministik:', err?.message);
    }
  }

  // Gabungkan kedua lapis dengan aturan status yang paling berhati-hati
  const finalFindings = mergeVerificationFindings(deterministicFindings, aiFindings);

  // Hitung ringkasan status
  let terverifikasiCount = 0;
  let perluPemeriksaanCount = 0;
  let tidakDitemukanCount = 0;
  let berpotensiTidakKonsistenCount = 0;

  for (const f of finalFindings) {
    switch (f.status) {
      case 'terverifikasi':
        terverifikasiCount++;
        break;
      case 'perlu_pemeriksaan':
        perluPemeriksaanCount++;
        break;
      case 'tidak_ditemukan':
        tidakDitemukanCount++;
        break;
      case 'berpotensi_tidak_konsisten':
        berpotensiTidakKonsistenCount++;
        break;
    }
  }

  return {
    statusRingkasan: {
      terverifikasiCount,
      perluPemeriksaanCount,
      tidakDitemukanCount,
      berpotensiTidakKonsistenCount,
    },
    findings: finalFindings,
    timestamp: new Date().toISOString(),
  };
}
