import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeText,
  normalizeNumber,
  extractQuotes,
  extractNumbersAndPercentages,
  extractIndonesianDates,
  runDeterministicVerification,
  mergeVerificationFindings,
} from './deterministicVerification';
import { VerificationFinding } from '../../server/types';

test('normalizeNumber correctly handles Indonesian formatted thousands and decimals', () => {
  assert.equal(normalizeNumber('1.000,5'), '1000.5');
  assert.equal(normalizeNumber('15.000'), '15000');
  assert.equal(normalizeNumber('25,4%'), '25.4%');
});

test('extractQuotes extracts double quotes and smart quotes', () => {
  const sample = 'Menteri menyatakan: "Kebijakan ini bertujuan menjaga stabilitas nasional" dan “Langkah terpadu segera dijalankan”.';
  const quotes = extractQuotes(sample);
  assert.equal(quotes.length, 2);
  assert.equal(quotes[0], 'Kebijakan ini bertujuan menjaga stabilitas nasional');
  assert.equal(quotes[1], 'Langkah terpadu segera dijalankan');
});

test('runDeterministicVerification detects verified quotes and catches hallucinated/fabricated quotes', () => {
  const source = 'Dokumen resmi Kemenko Polkam: Menko menyatakan "Stabilitas politik dan keamanan adalah fondasi utama pembangunan nasional". Anggaran dialokasikan Rp 500 miliar pada 15 Mei 2024.';
  
  // Teks rilis dengan kutipan valid
  const prValid = 'Menko Polkam menegaskan "Stabilitas politik dan keamanan adalah fondasi utama pembangunan nasional" di Jakarta.';
  const igValid = 'Pemerintah memastikan langkah ini berjalan lancar.';
  
  const findingsValid = runDeterministicVerification(source, prValid, igValid);
  const quoteFinding = findingsValid.find(f => f.tipeTemuan === 'kutipan');
  assert.ok(quoteFinding);
  assert.equal(quoteFinding?.status, 'terverifikasi');

  // Teks rilis dengan kutipan karangan / tidak ada di sumber
  const prFabricated = 'Menko Polkam mengatakan "Kami akan membagikan bantuan tunai langsung kepada seluruh masyarakat besok pagi".';
  const findingsFabricated = runDeterministicVerification(source, prFabricated, igValid);
  const fabricatedFinding = findingsFabricated.find(f => f.tipeTemuan === 'kutipan' && f.status === 'tidak_ditemukan');
  assert.ok(fabricatedFinding, 'Harus mendeteksi kutipan yang tidak ada dalam sumber');
});

test('runDeterministicVerification detects numbers absent in source text', () => {
  const source = 'Target penurunan angka kejahatan siber adalah 15% pada tahun 2024 dengan total 10.000 personel.';
  const pr = 'Pemerintah menargetkan penurunan hingga 95% dengan 50.000 personel.';
  const ig = 'Target 95% penurunan kejahatan.';

  const findings = runDeterministicVerification(source, pr, ig);
  const missingNumFinding = findings.filter(f => f.tipeTemuan === 'angka_data' && f.status === 'tidak_ditemukan');
  assert.ok(missingNumFinding.length > 0, 'Harus mendeteksi angka yang tidak ada di sumber');
});

test('mergeVerificationFindings prioritizes the more cautious status', () => {
  const detFindings: VerificationFinding[] = [
    {
      id: '1',
      targetProduk: 'siaranPers',
      tipeTemuan: 'angka_data',
      klaimDiuji: 'Rp 500 miliar',
      status: 'terverifikasi',
      catatanPenjelasan: 'Ada di teks',
    },
  ];

  const aiFindings: VerificationFinding[] = [
    {
      id: 'ai-1',
      targetProduk: 'siaranPers',
      tipeTemuan: 'angka_data',
      klaimDiuji: 'Rp 500 miliar',
      status: 'perlu_pemeriksaan', // Lebih berhati-hati dari terverifikasi
      catatanPenjelasan: 'Angka ini draf estimasi',
    },
  ];

  const merged = mergeVerificationFindings(detFindings, aiFindings);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].status, 'perlu_pemeriksaan');
});
