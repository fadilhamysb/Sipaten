import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { AVAILABLE_MODELS, DEFAULT_MODELS } from './server/config';
import { extractTextFromBuffer } from './server/extractor';
import { analyzeDocument } from './server/analyzer';
import { classifyInformation } from './server/classifier';
import { generateTwoProducts } from './server/generator';
import { regenerateProduct } from './server/regenerator';
import { verifyProductsAgainstSource } from './server/verifier';
import { performOcrOnImage } from './server/geminiClient';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware JSON parser dengan limit aman
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage (Stateless: tidak menyimpan berkas ke disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB batas maksimal
  },
});

// Endpoint untuk daftar model & status konfigurasi
app.get('/api/models', (_req: Request, res: Response) => {
  res.json({
    available: AVAILABLE_MODELS,
    defaultModels: DEFAULT_MODELS,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  });
});

// Endpoint Ekstraksi Dokumen (POST /api/extract)
app.post('/api/extract', upload.single('file'), async (req: Request, res: Response) => {
  try {
    // 1. Cek apakah ada file yang diunggah
    if (req.file) {
      const { buffer, originalname, mimetype, size } = req.file;
      const result = await extractTextFromBuffer(buffer, originalname, mimetype);
      return res.json({
        success: true,
        text: result.text,
        format: result.format,
        pageCount: result.pageCount,
        charCount: result.charCount,
        fileName: originalname,
        fileSize: size,
      });
    }

    // 2. Cek apakah input teks langsung dikirim
    const directText = (req.body?.text || '').trim();
    const fileName = req.body?.fileName || 'Dokumen_Teks_Langsung.txt';
    if (directText) {
      if (directText.length < 200) {
        return res.status(400).json({
          success: false,
          error: 'Gagal dibaca: Teks langsung kurang dari 200 karakter. Masukkan dokumen kebijakan yang lebih komprehensif.',
        });
      }
      return res.json({
        success: true,
        text: directText,
        format: 'txt',
        charCount: directText.length,
        fileName,
        fileSize: Buffer.byteLength(directText, 'utf-8'),
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Tidak ada berkas atau teks yang diunggah.',
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Gagal mengekstrak teks dokumen.',
    });
  }
});

// Endpoint OCR alternatif jika dokumen scan disetujui pengguna (POST /api/ocr)
app.post('/api/ocr', async (req: Request, res: Response) => {
  try {
    const { base64Data, mimeType } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'Data gambar base64 tidak ditemukan.' });
    }
    const ocrText = await performOcrOnImage(base64Data, mimeType || 'image/png');
    return res.json({
      success: true,
      text: ocrText,
      isOcr: true,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `Gagal menjalankan OCR: ${err.message || 'Kesalahan server'}`,
    });
  }
});

// Endpoint Analisis Dokumen (POST /api/analyze)
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { sourceText, supportingSource, model } = req.body;
    if (!sourceText || sourceText.trim().length < 200) {
      return res.status(400).json({
        success: false,
        error: 'Teks sumber tidak valid atau kurang dari 200 karakter.',
      });
    }

    const analysis = await analyzeDocument(sourceText, supportingSource, model);
    return res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('Error in /api/analyze:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Gagal menganalisis dokumen kebijakan.',
    });
  }
});

// Endpoint Klasifikasi KIP (POST /api/classify)
app.post('/api/classify', async (req: Request, res: Response) => {
  try {
    const { analysis, model } = req.body;
    if (!analysis) {
      return res.status(400).json({ success: false, error: 'Hasil analisis tidak diberikan.' });
    }

    const classifications = await classifyInformation(analysis, model);
    return res.json({ success: true, classifications });
  } catch (err: any) {
    console.error('Error in /api/classify:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Gagal melakukan klasifikasi informasi keterbukaan publik.',
    });
  }
});

// Endpoint Generasi 2 Produk (POST /api/generate)
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { confirmedSummary, classifications, customInstruction, model } = req.body;
    if (!confirmedSummary) {
      return res.status(400).json({ success: false, error: 'Ringkasan terkonfirmasi wajib ada.' });
    }

    const products = await generateTwoProducts(
      confirmedSummary,
      classifications || [],
      customInstruction,
      model
    );
    return res.json({ success: true, products });
  } catch (err: any) {
    console.error('Error in /api/generate:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Gagal membuat produk komunikasi.',
    });
  }
});

// Endpoint Regenerasi / Modifikasi Konten (POST /api/regenerate)
app.post('/api/regenerate', async (req: Request, res: Response) => {
  try {
    const { productType, currentText, actionType, styleOption, confirmedSummary, model } = req.body;
    if (!productType || !currentText || !actionType) {
      return res.status(400).json({ success: false, error: 'Parameter regenerasi tidak lengkap.' });
    }

    const result = await regenerateProduct(
      productType,
      currentText,
      actionType,
      styleOption,
      confirmedSummary,
      model
    );
    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('Error in /api/regenerate:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Gagal meregenerasi konten produk.',
    });
  }
});

// Endpoint Verifikasi Berbasis Sumber (POST /api/verify)
app.post('/api/verify', async (req: Request, res: Response) => {
  try {
    const { originalSourceText, pressReleaseText, instagramText, model } = req.body;
    if (!originalSourceText || !pressReleaseText || !instagramText) {
      return res.status(400).json({
        success: false,
        error: 'Teks sumber dan kedua teks produk wajib ada untuk verifikasi.',
      });
    }

    const verification = await verifyProductsAgainstSource(
      originalSourceText,
      pressReleaseText,
      instagramText,
      model
    );
    return res.json({ success: true, verification });
  } catch (err: any) {
    console.error('Error in /api/verify:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Gagal melakukan verifikasi produk terhadap dokumen sumber.',
    });
  }
});

// Setup Server & Frontend Routing
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode dengan Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server SIPATEN berjalan pada port ${PORT} (${isProduction ? 'Production' : 'Development'})`);
  });
}

startServer();
