import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTemplatePath() {
  const p1 = path.join(process.cwd(), 'templates/Certificate RRCE (1).pptx');
  if (fs.existsSync(p1)) return p1;
  return path.join(__dirname, '../templates/Certificate RRCE (1).pptx');
}

function getAssetsDir() {
  const p1 = path.join(process.cwd(), 'templates/assets');
  if (fs.existsSync(p1)) return p1;
  return path.join(__dirname, '../templates/assets');
}

/**
 * Generate modified PPTX for the student
 */
export async function generatePptxCertificate(studentName, usn) {
  const templatePath = getTemplatePath();
  const fileData = fs.readFileSync(templatePath);
  const zip = await JSZip.loadAsync(fileData);
  
  let slide1Xml = await zip.file('ppt/slides/slide1.xml').async('string');
  
  // Replace the placeholder dots with student name and USN
  if (slide1Xml.includes('…………………………………….….')) {
    slide1Xml = slide1Xml.replace('…………………………………….….', studentName);
    slide1Xml = slide1Xml.replace('……….……….……….........', usn);
  } else {
    // Regex fallback
    slide1Xml = slide1Xml.replace(/Mr\.\/Ms\.[^<]+of USN:[^<]+has/g, `Mr./Ms. ${studentName} of USN: ${usn} has`);
  }
  
  zip.file('ppt/slides/slide1.xml', slide1Xml);
  const modifiedBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  return modifiedBuffer;
}

/**
 * Generate pixel-perfect A4 Landscape PDF certificate
 * Signatories order (Left to Right):
 * 1. Mr. Sankar K (CEO @ Tekzow) - FIRST SIGN
 * 2. Mr. Dineshkumar M (Staff Coordinator)
 * 3. Dr. D. Sivakumar (Staff Coordinator)
 * 4. Dr. Sreenivasa Murthy V (HOD - ISE)
 * 5. Dr. R Balakrishna (Principal)
 *
 * Apache Hadoop logo is an official workshop design element.
 */
export async function generatePdfCertificate(studentName, usn, certNumber = 'RRCE-BDH-2026-0001') {
  // A4 Landscape in points: 841.89 x 595.28
  const width = 841.89;
  const height = 595.28;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);

  // Embed standard fonts
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const timesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Load Logos & Element Images
  const assetsDir = getAssetsDir();
  const rrceLogoBytes = fs.readFileSync(path.join(assetsDir, 'image1.png'));
  const tekzowLogoBytes = fs.readFileSync(path.join(assetsDir, 'image4.jpeg'));
  const csiLogoBytes = fs.readFileSync(path.join(assetsDir, 'image2.jpeg'));
  const hadoopLogoBytes = fs.readFileSync(path.join(assetsDir, 'hadoop-logo.png'));
  
  // Signatures
  const sigSankarBytes = fs.readFileSync(path.join(assetsDir, 'sig-sankar.png'));
  const sigDineshBytes = fs.readFileSync(path.join(assetsDir, 'image7.png'));
  const sigSivaBytes = fs.readFileSync(path.join(assetsDir, 'image8.png'));
  const sigSreenivasaBytes = fs.readFileSync(path.join(assetsDir, 'image9.png'));
  const sigBalaBytes = fs.readFileSync(path.join(assetsDir, 'image6.png'));

  const rrceLogo = await pdfDoc.embedPng(rrceLogoBytes);
  const tekzowLogo = await pdfDoc.embedJpg(tekzowLogoBytes);
  const csiLogo = await pdfDoc.embedJpg(csiLogoBytes);
  const hadoopLogo = await pdfDoc.embedPng(hadoopLogoBytes);

  const sigSankar = await pdfDoc.embedPng(sigSankarBytes);
  const sigDinesh = await pdfDoc.embedPng(sigDineshBytes);
  const sigSiva = await pdfDoc.embedPng(sigSivaBytes);
  const sigSreenivasa = await pdfDoc.embedPng(sigSreenivasaBytes);
  const sigBala = await pdfDoc.embedPng(sigBalaBytes);

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 1, 1),
  });

  // Outer decorative border
  const margin = 18;
  page.drawRectangle({
    x: margin,
    y: margin,
    width: width - margin * 2,
    height: height - margin * 2,
    borderColor: rgb(0.12, 0.23, 0.54), // Deep Navy #1e3a8a
    borderWidth: 2.5,
  });

  // Inner thin golden border
  const innerMargin = 22;
  page.drawRectangle({
    x: innerMargin,
    y: innerMargin,
    width: width - innerMargin * 2,
    height: height - innerMargin * 2,
    borderColor: rgb(0.85, 0.65, 0.13), // Elegant Gold
    borderWidth: 1,
  });

  // Corner decorative flourishes
  const drawCorner = (cx, cy) => {
    page.drawCircle({ x: cx, y: cy, size: 3.5, color: rgb(0.85, 0.65, 0.13) });
  };
  drawCorner(innerMargin + 6, height - innerMargin - 6);
  drawCorner(width - innerMargin - 6, height - innerMargin - 6);
  drawCorner(innerMargin + 6, innerMargin + 6);
  drawCorner(width - innerMargin - 6, innerMargin + 6);

  // TOP HEADER SECTION
  // RRCE Logo (top-left)
  page.drawImage(rrceLogo, {
    x: 34,
    y: height - 108,
    width: 82,
    height: 72,
  });

  // CSI Logo (top-mid-right)
  page.drawImage(csiLogo, {
    x: width - 215,
    y: height - 106,
    width: 72,
    height: 72,
  });

  // Tekzow Logo (top-right)
  page.drawImage(tekzowLogo, {
    x: width - 124,
    y: height - 98,
    width: 86,
    height: 60,
  });

  // Central Header Text
  const drawCenterText = (text, y, font, size, color) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
  };

  drawCenterText('RajaRajeswari College of Engineering', height - 48, timesBold, 17, rgb(0.1, 0.18, 0.4));
  drawCenterText('(An Autonomous Institution under Visvesvaraya Technological University, Belagavi)', height - 63, timesRoman, 10.5, rgb(0.2, 0.2, 0.2));
  drawCenterText('#14, Ramohalli Cross, Kumbalgodu, Mysore Road, Bengaluru - 560 074', height - 76, timesRoman, 9.5, rgb(0.3, 0.3, 0.3));
  drawCenterText('Department of Information Science and Engineering', height - 92, timesBold, 12.5, rgb(0.12, 0.12, 0.12));
  drawCenterText('&', height - 105, timesBold, 11, rgb(0.2, 0.2, 0.2));
  drawCenterText('CSI Chapter of RRCE & "VO\'ISE"', height - 118, timesBold, 11.5, rgb(0.1, 0.18, 0.4));

  // Decorative divider line
  page.drawLine({
    start: { x: 120, y: height - 130 },
    end: { x: width - 120, y: height - 130 },
    thickness: 1.2,
    color: rgb(0.85, 0.65, 0.13),
  });

  // CERTIFICATE OF PARTICIPATION TITLE
  drawCenterText('Certificate of Participation', height - 165, timesBoldItalic, 23, rgb(0.1, 0.22, 0.55));

  // CERTIFICATE BODY
  const certText1 = `This is to certify that Mr./Ms. `;
  const certText2 = ` of USN: `;
  const certText3 = ` has attended 2 days workshop on`;

  const nameFont = timesBold;
  const usnFont = timesBold;
  const bodyFont = timesRoman;
  const bodySize = 13.5;

  const w1 = bodyFont.widthOfTextAtSize(certText1, bodySize);
  const wName = nameFont.widthOfTextAtSize(studentName, bodySize + 1);
  const w2 = bodyFont.widthOfTextAtSize(certText2, bodySize);
  const wUsn = usnFont.widthOfTextAtSize(usn, bodySize + 1);
  const w3 = bodyFont.widthOfTextAtSize(certText3, bodySize);

  const totalLineWidth = w1 + wName + w2 + wUsn + w3;
  let curX = (width - totalLineWidth) / 2;
  const line1Y = height - 215;

  page.drawText(certText1, { x: curX, y: line1Y, size: bodySize, font: bodyFont, color: rgb(0.15, 0.15, 0.15) });
  curX += w1;

  // Student Name
  page.drawText(studentName, { x: curX, y: line1Y, size: bodySize + 1, font: nameFont, color: rgb(0.08, 0.2, 0.5) });
  page.drawLine({
    start: { x: curX, y: line1Y - 2 },
    end: { x: curX + wName, y: line1Y - 2 },
    thickness: 1,
    color: rgb(0.08, 0.2, 0.5),
  });
  curX += wName;

  page.drawText(certText2, { x: curX, y: line1Y, size: bodySize, font: bodyFont, color: rgb(0.15, 0.15, 0.15) });
  curX += w2;

  // USN
  page.drawText(usn, { x: curX, y: line1Y, size: bodySize + 1, font: usnFont, color: rgb(0.08, 0.2, 0.5) });
  page.drawLine({
    start: { x: curX, y: line1Y - 2 },
    end: { x: curX + wUsn, y: line1Y - 2 },
    thickness: 1,
    color: rgb(0.08, 0.2, 0.5),
  });
  curX += wUsn;

  page.drawText(certText3, { x: curX, y: line1Y, size: bodySize, font: bodyFont, color: rgb(0.15, 0.15, 0.15) });

  // WORKSHOP TITLE WITH APACHE HADOOP ELEMENT
  // Hadoop logo is an official element of this certificate
  const hadoopElemW = 86;
  const hadoopElemH = 44;
  const wsTitle = '“Nex - Gen Big Data & Hadoop”';
  const wsTitleW = timesBold.widthOfTextAtSize(wsTitle, 18);
  const totalWsW = hadoopElemW + 16 + wsTitleW;
  const wsStartX = (width - totalWsW) / 2;
  const wsY = height - 262;

  // Draw Apache Hadoop Element
  page.drawImage(hadoopLogo, {
    x: wsStartX,
    y: wsY - 10,
    width: hadoopElemW,
    height: hadoopElemH,
  });

  // Draw Workshop Title
  page.drawText(wsTitle, {
    x: wsStartX + hadoopElemW + 16,
    y: wsY + 4,
    size: 18,
    font: timesBold,
    color: rgb(0.1, 0.22, 0.55),
  });

  // Presenter line
  const pLine = 'presented by Mr. Sankar K, CEO, Tekzow and Tekzow Academy, Bengaluru,';
  drawCenterText(pLine, height - 286, timesRoman, 12.5, rgb(0.15, 0.15, 0.15));

  // Date line
  const dateLine = 'on 30th & 31st Oct 2026.';
  drawCenterText(dateLine, height - 304, timesBold, 12.5, rgb(0.15, 0.15, 0.15));

  // -------------------------------------------------------------
  // SIGNATORIES ROW (5 DISTINCT COLUMNS ACROSS THE BOTTOM)
  // First Sign is for: Mr. Sankar K (CEO @ Tekzow)
  // Followed by RRCE coordinators, HOD, and Principal
  // -------------------------------------------------------------
  const sigColY = 118; // baseline for signature image bottom
  const textColY = 94; // name
  const desigColY = 80; // designation

  const colWidth = 140;
  const signatories = [
    {
      name: 'Mr. Sankar K',
      desig: 'CEO @ Tekzow',
      sigImg: sigSankar,
      sigW: 82,
      sigH: 40,
      sigOffY: 2,
      x: 48, // 1st Sign on the left
    },
    {
      name: 'Mr. Dineshkumar M',
      desig: 'Staff Coordinator',
      sigImg: sigDinesh,
      sigW: 78,
      sigH: 38,
      sigOffY: 2,
      x: 206, // 2nd Sign
    },
    {
      name: 'Dr. D. Sivakumar',
      desig: 'Staff Coordinator',
      sigImg: sigSiva,
      sigW: 76,
      sigH: 36,
      sigOffY: 3,
      x: 362, // 3rd Sign
    },
    {
      name: 'Dr. Sreenivasa Murthy V',
      desig: 'HOD - ISE',
      sigImg: sigSreenivasa,
      sigW: 82,
      sigH: 38,
      sigOffY: 2,
      x: 518, // 4th Sign
    },
    {
      name: 'Dr. R Balakrishna',
      desig: 'Principal',
      sigImg: sigBala,
      sigW: 80,
      sigH: 38,
      sigOffY: 2,
      x: 672, // 5th Sign
    },
  ];

  signatories.forEach((col) => {
    // Draw Signature Image
    const imgX = col.x + (colWidth - col.sigW) / 2;
    page.drawImage(col.sigImg, {
      x: imgX,
      y: sigColY + col.sigOffY,
      width: col.sigW,
      height: col.sigH,
    });

    // Draw Name
    const nameWidth = timesBold.widthOfTextAtSize(col.name, 11);
    page.drawText(col.name, {
      x: col.x + (colWidth - nameWidth) / 2,
      y: textColY,
      size: 11,
      font: timesBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Draw Designation
    const desigWidth = timesRoman.widthOfTextAtSize(col.desig, 9.5);
    page.drawText(col.desig, {
      x: col.x + (colWidth - desigWidth) / 2,
      y: desigColY,
      size: 9.5,
      font: timesRoman,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  // Footer metadata & Certificate Number
  page.drawText(`Certificate ID: ${certNumber}`, {
    x: 34,
    y: 28,
    size: 8,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  const verifyText = 'Verified & Issued by RajaRajeswari College of Engineering & Tekzow Academy';
  const verifyWidth = helvetica.widthOfTextAtSize(verifyText, 8);
  page.drawText(verifyText, {
    x: (width - verifyWidth) / 2,
    y: 28,
    size: 8,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  const genDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const dateText = `Issued: ${genDate}`;
  const dateWidth = helvetica.widthOfTextAtSize(dateText, 8);
  page.drawText(dateText, {
    x: width - 34 - dateWidth,
    y: 28,
    size: 8,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
