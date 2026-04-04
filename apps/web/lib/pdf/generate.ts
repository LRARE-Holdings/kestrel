import { jsPDF } from "jspdf";

const COLORS = {
  ink: [12, 19, 17] as [number, number, number],
  kestrel: [43, 92, 79] as [number, number, number],
  muted: [122, 133, 131] as [number, number, number],
  border: [212, 206, 198] as [number, number, number],
};

const MARGIN = { top: 20, bottom: 25, left: 25, right: 25 };
const PAGE_WIDTH = 210; // A4
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN.left - MARGIN.right;
const LINE_HEIGHT = 5.5;

interface PdfOptions {
  title: string;
  subtitle?: string;
  filename: string;
}

function createDoc(): jsPDF {
  return new jsPDF({ unit: "mm", format: "a4" });
}

function addHeader(doc: jsPDF) {
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.kestrel);
  doc.setFont("helvetica", "bold");
  doc.text("KESTREL", MARGIN.left, 12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text("kestrel.law", PAGE_WIDTH - MARGIN.right, 12, { align: "right" });
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const y = 297 - 10; // A4 height minus margin
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    "Generated using Kestrel (kestrel.law) — This document does not constitute legal advice.",
    MARGIN.left,
    y,
  );
  doc.text(
    `Page ${pageNum} of ${totalPages}`,
    PAGE_WIDTH - MARGIN.right,
    y,
    { align: "right" },
  );
}

function addAllFooters(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 297 - MARGIN.bottom) {
    doc.addPage();
    addHeader(doc);
    return MARGIN.top + 5;
  }
  return y;
}

/** Word-wrap text and render it, returning the new Y position */
function renderWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number = LINE_HEIGHT,
): number {
  let y = startY;
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      y += lineHeight;
      y = checkPageBreak(doc, y, lineHeight);
      continue;
    }

    const lines = doc.splitTextToSize(paragraph, maxWidth);
    for (const line of lines) {
      y = checkPageBreak(doc, y, lineHeight);
      doc.text(line, x, y);
      y += lineHeight;
    }
  }

  return y;
}

// === CONTRACT PDF ===

interface ContractPdfData {
  title: string;
  date: string;
  parties: {
    a: { name: string; businessName: string; address: string; email: string; companyNumber?: string };
    b: { name: string; businessName: string; address: string; email: string; companyNumber?: string };
  };
  sections: Array<{
    number: string;
    title: string;
    content: string;
    subSections?: Array<{ number: string; content: string }>;
  }>;
  includesDisputeClause: boolean;
}

export function generateContractPdf(data: ContractPdfData): jsPDF {
  const doc = createDoc();
  addHeader(doc);

  let y = MARGIN.top + 10;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "bold");
  doc.text(data.title.toUpperCase(), MARGIN.left, y);
  y += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(`Date: ${data.date}`, MARGIN.left, y);
  y += 10;

  // Horizontal rule
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN.left, y, PAGE_WIDTH - MARGIN.right, y);
  y += 8;

  // Parties
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.kestrel);
  doc.text("PARTIES", MARGIN.left, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.ink);

  // Party A
  doc.setFont("helvetica", "bold");
  doc.text(`(1) ${data.parties.a.businessName}`, MARGIN.left + 4, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  if (data.parties.a.companyNumber) {
    doc.text(`Company No. ${data.parties.a.companyNumber}`, MARGIN.left + 8, y);
    y += 4.5;
  }
  const addrLinesA = doc.splitTextToSize(data.parties.a.address, CONTENT_WIDTH - 12);
  for (const line of addrLinesA) {
    doc.text(line, MARGIN.left + 8, y);
    y += 4.5;
  }
  doc.text(`Contact: ${data.parties.a.name} (${data.parties.a.email})`, MARGIN.left + 8, y);
  y += 8;

  // Party B
  doc.setFont("helvetica", "bold");
  doc.text(`(2) ${data.parties.b.businessName}`, MARGIN.left + 4, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  if (data.parties.b.companyNumber) {
    doc.text(`Company No. ${data.parties.b.companyNumber}`, MARGIN.left + 8, y);
    y += 4.5;
  }
  const addrLinesB = doc.splitTextToSize(data.parties.b.address, CONTENT_WIDTH - 12);
  for (const line of addrLinesB) {
    doc.text(line, MARGIN.left + 8, y);
    y += 4.5;
  }
  doc.text(`Contact: ${data.parties.b.name} (${data.parties.b.email})`, MARGIN.left + 8, y);
  y += 10;

  // Rule
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN.left, y, PAGE_WIDTH - MARGIN.right, y);
  y += 8;

  // Sections
  for (const section of data.sections) {
    y = checkPageBreak(doc, y, 20);

    // Section heading
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.kestrel);
    doc.text(`${section.number}. ${section.title.toUpperCase()}`, MARGIN.left, y);
    y += 7;

    // Section content
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.ink);
    y = renderWrappedText(doc, section.content, MARGIN.left, y, CONTENT_WIDTH);
    y += 2;

    // Subsections
    if (section.subSections) {
      for (const sub of section.subSections) {
        y = checkPageBreak(doc, y, 10);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.ink);
        y = renderWrappedText(doc, `${sub.number} ${sub.content}`, MARGIN.left + 6, y, CONTENT_WIDTH - 6);
        y += 1;
      }
    }

    y += 4;
  }

  addAllFooters(doc);
  return doc;
}

// === LETTER PDF ===

interface LetterPdfData {
  subject: string;
  body: string;
  stageName: string;
  stage: number;
}

export function generateLetterPdf(data: LetterPdfData): jsPDF {
  const doc = createDoc();
  addHeader(doc);

  let y = MARGIN.top + 10;

  // Stage badge
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.kestrel);
  doc.setFont("helvetica", "bold");
  doc.text(`STAGE ${data.stage} — ${data.stageName.toUpperCase()}`, MARGIN.left, y);
  y += 8;

  // Subject
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "bold");
  const subjectLines = doc.splitTextToSize(data.subject, CONTENT_WIDTH);
  for (const line of subjectLines) {
    doc.text(line, MARGIN.left, y);
    y += 6;
  }
  y += 4;

  // Rule
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN.left, y, PAGE_WIDTH - MARGIN.right, y);
  y += 8;

  // Body
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.ink);
  y = renderWrappedText(doc, data.body, MARGIN.left, y, CONTENT_WIDTH, 5);

  addAllFooters(doc);
  return doc;
}

// === TERMS PDF ===

interface TermsPdfData {
  title: string;
  businessName: string;
  sections: Array<{ number: string; title: string; content: string }>;
  generatedAt: string;
}

export function generateTermsPdf(data: TermsPdfData): jsPDF {
  const doc = createDoc();
  addHeader(doc);

  let y = MARGIN.top + 10;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "bold");
  doc.text(data.title, MARGIN.left, y);
  y += 8;

  // Business name
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.kestrel);
  doc.text(data.businessName, MARGIN.left, y);
  y += 6;

  // Date
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...COLORS.muted);
  const dateStr = new Date(data.generatedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Last updated: ${dateStr}`, MARGIN.left, y);
  y += 8;

  // Rule
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN.left, y, PAGE_WIDTH - MARGIN.right, y);
  y += 8;

  // Sections
  for (const section of data.sections) {
    y = checkPageBreak(doc, y, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.kestrel);
    doc.text(`${section.number}. ${section.title}`, MARGIN.left, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.ink);
    y = renderWrappedText(doc, section.content, MARGIN.left, y, CONTENT_WIDTH);
    y += 5;
  }

  addAllFooters(doc);
  return doc;
}

/** Trigger a browser download of a PDF */
export function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename);
}
