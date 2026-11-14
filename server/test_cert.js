import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePdfCertificate, generatePptxCertificate } from './certGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  console.log("Testing PDF generation...");
  const pdfBuf = await generatePdfCertificate("CHANDANA S", "1RR23IS015", "RRCE-BDH-2026-TEST");
  const testPdfPath = path.join(__dirname, 'test_output.pdf');
  fs.writeFileSync(testPdfPath, pdfBuf);
  console.log(`PDF generated successfully: ${testPdfPath} (${pdfBuf.length} bytes)`);

  console.log("Testing PPTX generation...");
  const pptxBuf = await generatePptxCertificate("CHANDANA S", "1RR23IS015");
  const testPptxPath = path.join(__dirname, 'test_output.pptx');
  fs.writeFileSync(testPptxPath, pptxBuf);
  console.log(`PPTX generated successfully: ${testPptxPath} (${pptxBuf.length} bytes)`);
}

test().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
