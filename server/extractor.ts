import mammoth from 'mammoth';
import JSZip from 'jszip';
import { PDFParse } from 'pdf-parse';

export interface ExtractionResult {
  text: string;
  pageCount?: number;
  format: 'pdf' | 'docx' | 'pptx' | 'txt';
  charCount: number;
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  originalFilename: string,
  mimeType?: string
): Promise<ExtractionResult> {
  const ext = originalFilename.split('.').pop()?.toLowerCase() || '';

  if (ext === 'txt' || mimeType === 'text/plain') {
    const text = buffer.toString('utf-8').trim();
    if (text.length < 200) {
      throw new Error('Gagal dibaca: Teks dalam dokumen kurang dari 200 karakter. Dokumen terlalu pendek atau kosong.');
    }
    return {
      text,
      format: 'txt',
      charCount: text.length,
    };
  }

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    let parser: any = null;
    try {
      parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      const pages: Array<{ text: string; num: number }> = textResult?.pages || [];

      let combinedText = '';
      if (pages.length > 0) {
        for (const p of pages) {
          const pageContent = (p.text || '').trim();
          if (pageContent) {
            combinedText += `\n\n[Halaman ${p.num}]\n` + pageContent;
          }
        }
      } else if (textResult?.text) {
        combinedText = textResult.text;
      }

      const cleanedText = combinedText.trim();
      if (cleanedText.length < 200) {
        throw new Error('Gagal dibaca: Teks PDF kosong atau kurang dari 200 karakter. Dokumen kemungkinan adalah hasil scan/gambar tanpa lapisan teks OCR.');
      }

      return {
        text: cleanedText,
        pageCount: pages.length || textResult?.total || 1,
        format: 'pdf',
        charCount: cleanedText.length,
      };
    } catch (err: any) {
      if (err.message?.includes('Gagal dibaca')) throw err;
      throw new Error(`Gagal membaca berkas PDF: ${err.message || 'Format tidak valid'}`);
    } finally {
      if (parser && typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
        } catch {
          // Abaikan kesalahan destroy
        }
      }
    }
  }

  if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = (result.value || '').trim();
      if (text.length < 200) {
        throw new Error('Gagal dibaca: Teks dalam berkas DOCX kosong atau kurang dari 200 karakter.');
      }
      return {
        text,
        format: 'docx',
        charCount: text.length,
      };
    } catch (err: any) {
      if (err.message?.includes('Gagal dibaca')) throw err;
      throw new Error(`Gagal membaca berkas DOCX: ${err.message || 'Format tidak valid'}`);
    }
  }

  if (ext === 'pptx' || mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    try {
      const zip = await JSZip.loadAsync(buffer);
      const slideFiles = Object.keys(zip.files).filter(fileName =>
        fileName.startsWith('ppt/slides/slide') && fileName.endsWith('.xml')
      );

      // Urutkan slide berdasarkan nomor slide
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
        const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
        return numA - numB;
      });

      if (slideFiles.length === 0) {
        throw new Error('Gagal membaca berkas PPTX: Tidak ditemukan slide dalam presentasi.');
      }

      let combinedText = '';
      let slideIndex = 1;

      for (const slidePath of slideFiles) {
        const slideXml = await zip.file(slidePath)?.async('text');
        if (slideXml) {
          // Ekstrak teks dari tag <a:t>...</a:t>
          const textMatches = slideXml.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [];
          const slideText = textMatches
            .map(m => m.replace(/<\/?a:t>/g, ''))
            .join(' ')
            .trim();

          if (slideText) {
            combinedText += `\n\n[Slide ${slideIndex}]\n` + slideText;
          }
        }
        slideIndex++;
      }

      const trimmedText = combinedText.trim();
      if (trimmedText.length < 200) {
        throw new Error('Gagal dibaca: Teks dalam PPTX kosong atau kurang dari 200 karakter. Slide kemungkinan hanya memuat gambar.');
      }

      return {
        text: trimmedText,
        pageCount: slideFiles.length,
        format: 'pptx',
        charCount: trimmedText.length,
      };
    } catch (err: any) {
      if (err.message?.includes('Gagal dibaca')) throw err;
      throw new Error(`Gagal membaca berkas PPTX: ${err.message || 'Format tidak didukung'}`);
    }
  }

  throw new Error(`Format berkas .${ext} tidak didukung. Format yang didukung: PDF, DOCX, PPTX, TXT.`);
}
