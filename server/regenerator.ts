import { generateStructuredJson, isRealApiKey } from './geminiClient';
import { buildRegenerateSystemInstruction, buildRegenerateUserPrompt } from './prompts/regeneratePrompt';
import { DocumentAnalysis } from './types';
import { ruleBasedRegenerate } from './ruleBasedEngine';

export interface RegenerateResult {
  teksLengkap: string;
  catatanPerubahan: string;
}

export async function regenerateProduct(
  productType: 'siaranPers' | 'captionInstagram',
  currentText: string,
  actionType: 'perpendek' | 'perpanjang' | 'ubah_gaya',
  styleOption?: 'lebih_formal' | 'lebih_santai' | 'lebih_ringkas',
  confirmedSummary?: DocumentAnalysis,
  modelName?: string
): Promise<RegenerateResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (isRealApiKey(apiKey)) {
    try {
      const systemInstruction = buildRegenerateSystemInstruction();
      const prompt = buildRegenerateUserPrompt(productType, currentText, actionType, styleOption, confirmedSummary);

      return await generateStructuredJson<RegenerateResult>({
        model: modelName,
        systemInstruction,
        prompt,
      });
    } catch (err: any) {
      console.warn('Panggilan Gemini untuk regenerasi gagal, beralih ke regenerator berbasis aturan:', err?.message);
    }
  }

  return ruleBasedRegenerate(productType, currentText, actionType, styleOption);
}
