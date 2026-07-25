'use strict';

/**
 * SAMPLE: PDF Generation (puppeteer + pdf-lib + ejs)
 * ────────────────────────────────────────────────────
 * puppeteer — render HTML → PDF berkualitas tinggi (via headless Chrome)
 * pdf-lib   — manipulasi PDF: merge, watermark, isi form field
 * ejs       — template engine HTML untuk konten PDF
 *
 * Cara pakai di controller:
 *   const pdf = require('@my_module/samples/pdf.sample');
 */

const puppeteer = require('puppeteer');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const ejs  = require('ejs');
const path = require('path');
const fs   = require('fs');

// ─────────────────────────────────────────────────────────────────
// 1. GENERATE PDF dari HTML template (EJS + Puppeteer)
// ─────────────────────────────────────────────────────────────────
/**
 * Render template EJS → HTML → PDF → kirim sebagai download
 *
 * Contoh penggunaan di controller:
 *
 * const { renderPdf } = require('@my_module/samples/pdf.sample');
 *
 * const downloadInvoice = async (req, res) => {
 *   const data = {
 *     invoiceNo: 'INV-2026-001',
 *     date: '2026-07-25',
 *     items: [
 *       { name: 'Produk A', qty: 2, price: 150000 },
 *       { name: 'Produk B', qty: 1, price: 200000 },
 *     ],
 *     total: 500000,
 *   };
 *   // Template ada di: src/lib/samples/templates/invoice.ejs
 *   await renderPdf(res, 'invoice', data, 'Invoice-2026-001');
 * };
 */
const renderPdf = async (res, templateName, data = {}, filename = 'document') => {
  // Render EJS template
  const templatePath = path.join(__dirname, 'templates', `${templateName}.ejs`);
  const html = await ejs.renderFile(templatePath, data, { async: true });

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format:      'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.end(pdfBuffer);
  } finally {
    await browser.close();
  }
};

/**
 * Generate PDF dari HTML string langsung (tanpa template file)
 *
 * const { htmlToPdf } = require('@my_module/samples/pdf.sample');
 *
 * const html = `<h1>Hello</h1><p>This is a PDF</p>`;
 * const pdfBuffer = await htmlToPdf(html);
 * res.setHeader('Content-Type', 'application/pdf');
 * res.end(pdfBuffer);
 */
const htmlToPdf = async (htmlString, options = {}) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlString, { waitUntil: 'networkidle0' });
    return await page.pdf({
      format: options.format || 'A4',
      printBackground: true,
      margin: options.margin || { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });
  } finally {
    await browser.close();
  }
};

// ─────────────────────────────────────────────────────────────────
// 2. MANIPULASI PDF (pdf-lib)
// ─────────────────────────────────────────────────────────────────

/**
 * Gabungkan beberapa file PDF menjadi satu
 *
 * const { mergePdfs } = require('@my_module/samples/pdf.sample');
 *
 * const mergePdfsHandler = async (req, res) => {
 *   const buffers = [
 *     fs.readFileSync('/tmp/doc1.pdf'),
 *     fs.readFileSync('/tmp/doc2.pdf'),
 *   ];
 *   const merged = await mergePdfs(buffers);
 *   res.setHeader('Content-Type', 'application/pdf');
 *   res.end(merged);
 * };
 */
const mergePdfs = async (pdfBuffers) => {
  const merged = await PDFDocument.create();
  for (const buffer of pdfBuffers) {
    const doc   = await PDFDocument.load(buffer);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach(page => merged.addPage(page));
  }
  return Buffer.from(await merged.save());
};

/**
 * Tambahkan watermark teks ke setiap halaman PDF
 *
 * const { addWatermark } = require('@my_module/samples/pdf.sample');
 *
 * const watermarked = await addWatermark(fs.readFileSync('/tmp/doc.pdf'), 'CONFIDENTIAL');
 * res.setHeader('Content-Type', 'application/pdf');
 * res.end(watermarked);
 */
const addWatermark = async (pdfBuffer, text = 'DRAFT', options = {}) => {
  const doc  = await PDFDocument.load(pdfBuffer);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();
  const color = options.color || rgb(0.8, 0.8, 0.8);
  const size  = options.size  || 60;
  const opacity = options.opacity || 0.3;

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x:        width / 2 - (text.length * size * 0.3),
      y:        height / 2,
      size,
      font,
      color,
      opacity,
      rotate:   { type: 'degrees', angle: -45 },
    });
  }

  return Buffer.from(await doc.save());
};

module.exports = { renderPdf, htmlToPdf, mergePdfs, addWatermark };
