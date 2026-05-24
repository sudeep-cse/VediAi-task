import PDFDocument from 'pdfkit';
import { StructuredPaper, Difficulty } from '../types';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
};

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: '#16a34a',
  moderate: '#d97706',
  hard: '#dc2626',
};

/**
 * Renders a clean, exam-style PDF from the structured paper.
 * Returns a Buffer (streamed to the client by the controller).
 */
export function renderPaperPdf(paper: StructuredPaper): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // ---- Header ----
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#111111');
    doc.text(paper.schoolName, { align: 'center' });
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(12).fillColor('#222222');
    doc.text(`Subject: ${paper.subject}`, { align: 'center' });
    doc.text(`Class: ${paper.className}`, { align: 'center' });
    doc.moveDown(0.6);

    // Time / Max marks row
    const rowY = doc.y;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#111111');
    doc.text(`Time Allowed: ${paper.timeAllowed}`, doc.page.margins.left, rowY);
    doc.text(`Maximum Marks: ${paper.maximumMarks}`, doc.page.margins.left, rowY, {
      width: pageWidth,
      align: 'right',
    });
    doc.moveDown(0.8);

    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#333333');
    doc.text(paper.generalInstructions);
    doc.moveDown(0.6);

    // Student info lines
    doc.font('Helvetica').fontSize(10).fillColor('#111111');
    doc.text('Name: ______________________________');
    doc.text('Roll Number: ______________________');
    doc.text(`Class: ${paper.className}   Section: ____________`);
    doc.moveDown(0.4);
    divider(doc, pageWidth);

    // ---- Sections ----
    for (const section of paper.sections) {
      ensureSpace(doc, 80);
      doc.moveDown(0.6);
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#111111');
      doc.text(`Section ${section.id}`, { align: 'center' });
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#111111').text(section.title);
      if (section.instruction) {
        doc.font('Helvetica-Oblique').fontSize(9.5).fillColor('#555555').text(section.instruction);
      }
      doc.moveDown(0.3);

      for (const q of section.questions) {
        ensureSpace(doc, 40);
        const label = `${q.number}. `;
        doc.font('Helvetica').fontSize(10.5).fillColor('#111111');
        doc.text(label, { continued: true });

        // difficulty tag inline
        doc.font('Helvetica-Bold').fillColor(DIFFICULTY_COLOR[q.difficulty]);
        doc.text(`[${DIFFICULTY_LABEL[q.difficulty]}] `, { continued: true });

        doc.font('Helvetica').fillColor('#111111');
        doc.text(`${q.text}  `, { continued: true });
        doc.font('Helvetica-Bold').fillColor('#444444').text(`[${q.marks} Mark${q.marks === 1 ? '' : 's'}]`);
        doc.moveDown(0.25);
      }
    }

    doc.moveDown(0.6);
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#111111').text('End of Question Paper', { align: 'center' });

    // ---- Answer Key ----
    const hasAnswers = paper.sections.some((s) => s.questions.some((q) => q.answer));
    if (hasAnswers) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#111111').text('Answer Key');
      doc.moveDown(0.4);
      for (const section of paper.sections) {
        for (const q of section.questions) {
          if (!q.answer) continue;
          ensureSpace(doc, 30);
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#111111').text(`${q.number}. `, { continued: true });
          doc.font('Helvetica').fillColor('#333333').text(q.answer);
          doc.moveDown(0.2);
        }
      }
    }

    doc.end();
  });
}

function divider(doc: PDFKit.PDFDocument, width: number) {
  const y = doc.y + 4;
  doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.margins.left + width, y).strokeColor('#dddddd').lineWidth(1).stroke();
  doc.moveDown(0.4);
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}
