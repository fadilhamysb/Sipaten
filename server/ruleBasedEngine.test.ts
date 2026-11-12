import test from 'node:test';
import assert from 'node:assert/strict';
import { ruleBasedAnalyze, ruleBasedClassify, ruleBasedGenerate } from './ruleBasedEngine';

const sampleText = `KEMENTERIAN KOORDINATOR BIDANG POLITIK DAN KEAMANAN REPUBLIK INDONESIA
SURAT EDARAN NOMOR: SE-14/POLKAM/V/2024
TENTANG PENGUATAN KOORDINASI DAN INTEGRASI INFORMASI KEBIJAKAN PUBLIK DALAM RANGKA MENJAGA STABILITAS NASIONAL

Menko Polkam menegaskan: "Stabilitas politik dan keamanan adalah fondasi utama keberlanjutan pembangunan ekonomi dan perlindungan hak asasi seluruh warga negara."

Kebijakan ini menetapkan alokasi anggaran Rp 500 miliar pada 15 Mei 2024 di Jakarta dengan target peningkatan ketahanan informasi publik sebesar 45% dan melibatkan 12.000 personel gabungan kementerian/lembaga.

Tujuan utama kebijakan adalah mempercepat respons aduan disinformasi dan menjamin transparansi data publik sesuai UU KIP No. 14 Tahun 2008. Seluruh kementerian dan lembaga diwajibkan menyelaraskan narasi komunikasi publik dengan satu sumber data terverifikasi guna mencegah kebingungan di tengah masyarakat.`;

test('ruleBasedAnalyze extracts title, quote, numbers, and key points from source text', () => {
  const analysis = ruleBasedAnalyze(sampleText);

  assert.ok(analysis.judul.includes('PENGUATAN KOORDINASI') || analysis.judul.includes('Surat Edaran'));
  assert.equal(analysis.jenisDokumen, 'Surat Edaran');
  assert.ok(analysis.dasarHukum.length > 0);
  assert.ok(analysis.faktaDataPenting.some(f => f.data.includes('500 miliar') || f.data.includes('45%')));
  assert.ok(analysis.kutipanResmi.length > 0);
  assert.ok(analysis.kutipanResmi[0].kutipan.includes('Stabilitas politik dan keamanan'));
  assert.ok(analysis.pesanUtama.length >= 3);
});

test('ruleBasedClassify produces KIP items with categories', () => {
  const analysis = ruleBasedAnalyze(sampleText);
  const items = ruleBasedClassify(analysis);

  assert.ok(items.length >= 3);
  assert.ok(items.every(i => Boolean(i.alasanKip)));
});

test('ruleBasedGenerate produces Press Release and Instagram Caption under 2200 chars', () => {
  const analysis = ruleBasedAnalyze(sampleText);
  const classifications = ruleBasedClassify(analysis);
  const products = ruleBasedGenerate(analysis, classifications);

  // Periksa Siaran Pers
  assert.ok(products.siaranPers.judul.length > 10);
  assert.ok(products.siaranPers.lead.includes('Jakarta') || products.siaranPers.lead.includes('Kemenko Polkam'));
  assert.ok(products.siaranPers.teksLengkap.includes('SIARAN PERS'));

  // Periksa Caption Instagram
  assert.ok(products.captionInstagram.pembuka.length > 5);
  assert.ok(products.captionInstagram.hashtags.length >= 3);
  assert.ok(products.captionInstagram.teksLengkap.length < 2200, 'Caption Instagram harus di bawah 2200 karakter');
  assert.equal(products.captionInstagram.karakterCount, products.captionInstagram.teksLengkap.length);
});
