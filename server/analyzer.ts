import { generateStructuredJson, isRealApiKey } from './geminiClient';
import { buildAnalyzerSystemInstruction, buildAnalyzerUserPrompt } from './prompts/analyzerPrompt';
import { DocumentAnalysis } from './types';
import { ruleBasedAnalyze } from './ruleBasedEngine';

export async function analyzeDocument(
  sourceText: string,
  supportingSource?: string,
  modelName?: string
): Promise<DocumentAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (isRealApiKey(apiKey)) {
    try {
      const systemInstruction = buildAnalyzerSystemInstruction();
      const prompt = buildAnalyzerUserPrompt(sourceText, supportingSource);

      return await generateStructuredJson<DocumentAnalysis>({
        model: modelName,
        systemInstruction,
        prompt,
      });
    } catch (err: any) {
      console.warn('Panggilan Gemini untuk analisis gagal, beralih ke mesin analisis deterministik berbasis aturan:', err?.message);
    }
  }

  return ruleBasedAnalyze(sourceText, supportingSource);
}
