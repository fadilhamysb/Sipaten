import { GoogleGenAI } from '@google/genai';
import { DEFAULT_MODELS } from './config';

let clientInstance: GoogleGenAI | null = null;

export function isRealApiKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === '' ||
    trimmed === 'MY_GEMINI_API_KEY' ||
    trimmed === 'YOUR_GEMINI_API_KEY' ||
    trimmed.startsWith('MY_')
  ) {
    return false;
  }
  return true;
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!clientInstance) {
    clientInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
        timeout: 10000, // 10 detik timeout ketat
      },
    });
  }
  return clientInstance;
}

export interface JsonGenerationOptions {
  model?: string;
  systemInstruction: string;
  prompt: string;
}

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

export async function generateStructuredJson<T>(options: JsonGenerationOptions): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!isRealApiKey(apiKey)) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi di panel Secrets.');
  }

  const ai = getGeminiClient();
  const model = options.model || DEFAULT_MODELS.fast;

  const runCall = async () => {
    const response = await ai.models.generateContent({
      model,
      contents: options.prompt,
      config: {
        systemInstruction: options.systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '';
    if (!rawText.trim()) {
      throw new Error('Model mengembalikan respons kosong.');
    }

    const cleaned = cleanJsonString(rawText);
    return JSON.parse(cleaned) as T;
  };

  try {
    return await runCall();
  } catch (firstErr: any) {
    const isAuthOrPermError =
      firstErr?.status === 403 ||
      firstErr?.status === 400 ||
      firstErr?.message?.includes('Permission denied') ||
      firstErr?.message?.includes('PERMISSION_DENIED') ||
      firstErr?.message?.includes('API key');

    if (isAuthOrPermError) {
      throw firstErr;
    }

    console.warn('Percobaan pertama JSON generation gagal, mencoba ulang sekali:', firstErr?.message);
    try {
      return await runCall();
    } catch (secondErr: any) {
      console.error('Percobaan kedua JSON generation gagal:', secondErr);
      throw secondErr;
    }
  }
}

// Vision OCR untuk gambar/halaman scan
export async function performOcrOnImage(base64Image: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!isRealApiKey(apiKey)) {
    throw new Error('Fitur OCR memerlukan GEMINI_API_KEY yang valid di Settings > Secrets.');
  }

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: DEFAULT_MODELS.fast,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
        {
          text: `Ekstrak seluruh teks dalam gambar/dokumen scan ini secara kata demi kata tanpa menambah atau mengurangi fakta. Berikan label "[teks hasil OCR, perlu diperiksa]" di bagian awal.`,
        },
      ],
    },
    config: {
      systemInstruction: 'Anda adalah mesin OCR presisi tinggi untuk dokumen kebijakan pemerintah Indonesia.',
    },
  });

  return (response.text || '').trim();
}
