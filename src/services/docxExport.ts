import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header } from 'docx';
import { VerificationAudit } from '../types';

export function checkForPlaceholders(text: string): string[] {
  const placeholders = [
    '[PERLU DILENGKAPI]',
    '[TIDAK TERSEDIA DALAM SUMBER]',
    '[PERLU VERIFIKASI]',
  ];
  return placeholders.filter(p => text.includes(p));
}

export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportSingleDocx(
  productName: 'Siaran Pers' | 'Caption Instagram',
  content: string,
  sourceTitle: string,
  audit?: VerificationAudit
): Promise<Blob> {
  const isVerified = audit?.isVerified;
  const headerText = isVerified
    ? `TERVERIFIKASI OLEH: ${audit?.reviewerName || 'Petugas'} (${new Date(audit?.verifiedAt || Date.now()).toLocaleDateString('id-ID')})`
    : 'DRAF – BELUM DIVERIFIKASI';

  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: headerText,
          bold: true,
          color: isVerified ? '2E7D32' : 'D32F2F',
          size: 20, // 10pt
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: `SIPATEN — ${productName.toUpperCase()}`,
          bold: true,
          size: 32, // 16pt
          color: '0B1F3A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Dokumen Sumber: ${sourceTitle}`,
          italics: true,
          size: 22,
          color: '555555',
        }),
      ],
    }),
  ];

  // Tambahkan baris konten
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ spacing: { after: 120 } }));
    } else {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: line,
              size: 24, // 12pt
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `SIPATEN Kemenko Polkam · ${headerText}`,
                    italics: true,
                    size: 18,
                    color: '888888',
                  }),
                ],
              }),
            ],
          }),
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export async function exportCombinedDocx(
  pressReleaseText: string,
  instagramText: string,
  sourceTitle: string,
  audit?: VerificationAudit
): Promise<Blob> {
  const isVerified = audit?.isVerified;
  const headerText = isVerified
    ? `TERVERIFIKASI OLEH: ${audit?.reviewerName || 'Petugas'} (${new Date(audit?.verifiedAt || Date.now()).toLocaleDateString('id-ID')})`
    : 'DRAF – BELUM DIVERIFIKASI';

  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: headerText,
          bold: true,
          color: isVerified ? '2E7D32' : 'D32F2F',
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: 'SIPATEN — PRODUK KOMUNIKASI STRATEGIS',
          bold: true,
          size: 32,
          color: '0B1F3A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Satu Sumber Kebijakan: ${sourceTitle}`,
          italics: true,
          size: 22,
          color: '555555',
        }),
      ],
    }),

    // Section 1: Siaran Pers
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({
          text: '1. SIARAN PERS RESMI',
          bold: true,
          size: 28,
          color: '0B1F3A',
        }),
      ],
    }),
  ];

  for (const line of pressReleaseText.split('\n')) {
    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
    } else {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: line, size: 24 })],
        })
      );
    }
  }

  // Section 2: Caption Instagram
  paragraphs.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 150 },
      children: [
        new TextRun({
          text: '2. CAPTION MEDIA SOSIAL (INSTAGRAM)',
          bold: true,
          size: 28,
          color: '0B1F3A',
        }),
      ],
    })
  );

  for (const line of instagramText.split('\n')) {
    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
    } else {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: line, size: 24 })],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `SIPATEN Kemenko Polkam · ${headerText}`,
                    italics: true,
                    size: 18,
                    color: '888888',
                  }),
                ],
              }),
            ],
          }),
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
