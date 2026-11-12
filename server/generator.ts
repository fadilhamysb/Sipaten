import { generateStructuredJson, isRealApiKey } from './geminiClient';
import { buildGeneratorSystemInstruction, buildGeneratorUserPrompt } from './prompts/generatorPrompt';
import { DocumentAnalysis, ClassifiedItem, GeneratedProducts } from './types';
import { ruleBasedGenerate } from './ruleBasedEngine';

export async function generateTwoProducts(
  confirmedSummary: DocumentAnalysis,
  classifications: ClassifiedItem[],
  customInstruction?: string,
  modelName?: string
): Promise<GeneratedProducts> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (isRealApiKey(apiKey)) {
    try {
      const systemInstruction = buildGeneratorSystemInstruction();
      const prompt = buildGeneratorUserPrompt(confirmedSummary, classifications, customInstruction);

      const result = await generateStructuredJson<GeneratedProducts>({
        model: modelName,
        systemInstruction,
        prompt,
      });

      const igFullText = result.captionInstagram.teksLengkap || 
        `${result.captionInstagram.pembuka}\n\n${result.captionInstagram.intiKebijakan}\n\n${result.captionInstagram.manfaatMasyarakat}\n\n${result.captionInstagram.callToAction || ''}\n\n${(result.captionInstagram.hashtags || []).join(' ')}`.trim();

      const prFullText = result.siaranPers.teksLengkap ||
        `SIARAN PERS\n${result.siaranPers.judul}\n${result.siaranPers.subjudul ? result.siaranPers.subjudul + '\n' : ''}\n${result.siaranPers.lead}\n\n${result.siaranPers.isi}\n\n${result.siaranPers.pernyataanPejabat ? result.siaranPers.pernyataanPejabat + '\n\n' : ''}${result.siaranPers.penutup}`.trim();

      return {
        siaranPers: {
          ...result.siaranPers,
          teksLengkap: prFullText,
        },
        captionInstagram: {
          ...result.captionInstagram,
          teksLengkap: igFullText,
          karakterCount: igFullText.length,
        },
      };
    } catch (err: any) {
      console.warn('Panggilan Gemini untuk generator produk gagal, beralih ke generator deterministik berbasis aturan:', err?.message);
    }
  }

  return ruleBasedGenerate(confirmedSummary, classifications, customInstruction);
}
