import { generateStructuredJson, isRealApiKey } from './geminiClient';
import { buildClassifierSystemInstruction, buildClassifierUserPrompt } from './prompts/classifierPrompt';
import { DocumentAnalysis, ClassifiedItem } from './types';
import { ruleBasedClassify } from './ruleBasedEngine';

export async function classifyInformation(
  analysis: DocumentAnalysis,
  modelName?: string
): Promise<ClassifiedItem[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (isRealApiKey(apiKey)) {
    try {
      const systemInstruction = buildClassifierSystemInstruction();
      const prompt = buildClassifierUserPrompt(analysis);

      const items = await generateStructuredJson<ClassifiedItem[]>({
        model: modelName,
        systemInstruction,
        prompt,
      });

      return items.map((item, idx) => ({
        ...item,
        id: item.id || `kip-${idx + 1}`,
        keputusanPengguna: item.kategori === 'sensitif' ? undefined : 'gunakan',
      }));
    } catch (err: any) {
      console.warn('Panggilan Gemini untuk klasifikasi gagal, beralih ke mesin klasifikasi deterministik:', err?.message);
    }
  }

  return ruleBasedClassify(analysis);
}
