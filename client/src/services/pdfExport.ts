import { jsPDF } from 'jspdf';
import type {
  Persona,
  PersonaEvaluation,
  OverallSummary,
  Recommendation,
} from '@deckster/shared/types';
import { audienceCategories } from '../data/audienceCategories';

// ── Report Data Interface ──

export interface ReportData {
  goal: string;
  personas: Persona[];
  evaluations: PersonaEvaluation[];
  overallSummary: OverallSummary | null;
  mainAdvice: string;
  recommendations: Recommendation[];
}

// ── Color Palette ──

const colors = {
  black: [0, 0, 0] as const,
  darkGray: [30, 30, 30] as const,
  gray: [100, 100, 100] as const,
  lightGray: [180, 180, 180] as const,
  border: [220, 220, 220] as const,
  accent: [0, 21, 255] as const,
  green: [22, 163, 74] as const,
  red: [220, 38, 38] as const,
  orange: [234, 88, 12] as const,
  amber: [217, 119, 6] as const,
  greenBg: [240, 253, 244] as const,
  redBg: [254, 242, 242] as const,
  amberBg: [255, 251, 235] as const,
  accentBg: [245, 247, 255] as const,
};

type RGB = readonly [number, number, number];

// ── Layout Constants ──

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const FOOTER_HEIGHT = 15;
const USABLE_BOTTOM = PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT;

// ── Helpers ──

function setTextColor(doc: jsPDF, color: RGB): void {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setFillColor(doc: jsPDF, color: RGB): void {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setDrawColor(doc: jsPDF, color: RGB): void {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > USABLE_BOTTOM) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function getCategoryLabel(audienceCategoryId: string): string {
  const cat = audienceCategories.find((c) => c.id === audienceCategoryId);
  return cat ? cat.label : audienceCategoryId;
}

function sentimentColor(sentiment: 'positive' | 'negative' | 'mixed'): RGB {
  if (sentiment === 'positive') return colors.green;
  if (sentiment === 'negative') return colors.red;
  return colors.amber;
}

function sentimentBgColor(sentiment: 'positive' | 'negative' | 'mixed'): RGB {
  if (sentiment === 'positive') return colors.greenBg;
  if (sentiment === 'negative') return colors.redBg;
  return colors.amberBg;
}

function sentimentLabel(sentiment: 'positive' | 'negative' | 'mixed'): string {
  if (sentiment === 'positive') return 'POSITIVE';
  if (sentiment === 'negative') return 'NEGATIVE';
  return 'MIXED';
}

function computeScore(evaluations: PersonaEvaluation[]): number {
  if (evaluations.length === 0) return 0;
  const total = evaluations.reduce((sum, ev) => {
    if (ev.decisionSentiment === 'positive') return sum + 1;
    if (ev.decisionSentiment === 'mixed') return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((total / evaluations.length) * 100);
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'High chance';
  if (score >= 60) return 'Good chance';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Challenging';
  return 'Low chance';
}

function scoreColor(score: number): RGB {
  if (score >= 60) return colors.green;
  if (score >= 40) return colors.amber;
  return colors.red;
}

function priorityColor(priority: 'top' | 'critical' | 'important' | 'consider'): RGB {
  if (priority === 'top') return colors.red;
  if (priority === 'critical') return colors.orange;
  if (priority === 'important') return colors.amber;
  return colors.gray;
}

function priorityLabel(priority: 'top' | 'critical' | 'important' | 'consider'): string {
  if (priority === 'top') return 'TOP PRIORITY';
  if (priority === 'critical') return 'CRITICAL';
  if (priority === 'important') return 'IMPORTANT';
  return 'CONSIDER';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Draw a thin horizontal divider line */
function drawDivider(doc: jsPDF, y: number): number {
  setDrawColor(doc, colors.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
  return y + 4;
}

/** Draw a section header with divider */
function drawSectionHeader(doc: jsPDF, y: number, title: string): number {
  y = ensureSpace(doc, y, 16);
  y = drawDivider(doc, y);
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  setTextColor(doc, colors.darkGray);
  doc.text(title, MARGIN, y);
  y += 8;
  return y;
}

/** Render wrapped text and return new y position */
function renderWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines: string[] = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

// ── Main Export Function ──

export function generateReport(data: ReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = MARGIN;

  // ── 1. Header ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setTextColor(doc, colors.darkGray);
  doc.text('Deckster', MARGIN, y);

  const decksterWidth = doc.getTextWidth('Deckster');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setTextColor(doc, colors.gray);
  doc.text('EVALUATION REPORT', MARGIN + decksterWidth + 3, y);

  y += 4;
  y = drawDivider(doc, y);
  y += 4;

  // ── 2. Goal ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setTextColor(doc, colors.gray);
  doc.text('PRESENTATION GOAL', MARGIN, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  setTextColor(doc, colors.darkGray);
  y = renderWrappedText(doc, data.goal, MARGIN, y, CONTENT_WIDTH, 5);
  y += 6;

  // ── 3. Success Score ──
  const score = computeScore(data.evaluations);
  const sColor = scoreColor(score);

  y = ensureSpace(doc, y, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setTextColor(doc, colors.gray);
  doc.text('CHANCE OF SUCCESS', MARGIN, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  setTextColor(doc, sColor);
  const scoreText = `${score}%`;
  doc.text(scoreText, MARGIN, y);

  const scoreTextWidth = doc.getTextWidth(scoreText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  setTextColor(doc, sColor);
  doc.text(scoreLabel(score), MARGIN + scoreTextWidth + 3, y);

  y += 10;

  // ── 4. Overall Summary ──
  if (data.overallSummary) {
    y = ensureSpace(doc, y, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setTextColor(doc, colors.darkGray);
    y = renderWrappedText(
      doc,
      data.overallSummary.text,
      MARGIN,
      y,
      CONTENT_WIDTH,
      4.5
    );
    y += 6;

    // Strengths
    if (data.overallSummary.strengths.length > 0) {
      y = ensureSpace(doc, y, 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      setTextColor(doc, colors.green);
      doc.text('WHAT WORKS WELL', MARGIN, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setTextColor(doc, colors.darkGray);
      for (const strength of data.overallSummary.strengths) {
        const strengthLines = doc.splitTextToSize(strength, CONTENT_WIDTH - 6);
        y = ensureSpace(doc, y, strengthLines.length * 4 + 1);
        setFillColor(doc, colors.green);
        doc.circle(MARGIN + 2, y - 1.2, 1, 'F');
        y = renderWrappedText(doc, strength, MARGIN + 6, y, CONTENT_WIDTH - 6, 4);
        y += 1;
      }
      y += 3;
    }

    // Weaknesses
    if (data.overallSummary.weaknesses.length > 0) {
      y = ensureSpace(doc, y, 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      setTextColor(doc, colors.red);
      doc.text('WHAT NEEDS WORK', MARGIN, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setTextColor(doc, colors.darkGray);
      for (const weakness of data.overallSummary.weaknesses) {
        const weaknessLines = doc.splitTextToSize(weakness, CONTENT_WIDTH - 6);
        y = ensureSpace(doc, y, weaknessLines.length * 4 + 1);
        setFillColor(doc, colors.red);
        doc.circle(MARGIN + 2, y - 1.2, 1, 'F');
        y = renderWrappedText(doc, weakness, MARGIN + 6, y, CONTENT_WIDTH - 6, 4);
        y += 1;
      }
      y += 3;
    }
  }

  y += 4;

  // ── 5. Panel Feedback ──
  y = drawSectionHeader(doc, y, 'Panel Feedback');

  for (const persona of data.personas) {
    const evaluation = data.evaluations.find(
      (ev) => ev.personaId === persona.id
    );
    if (!evaluation) continue;

    const sentiment = evaluation.decisionSentiment;
    const bgColor = sentimentBgColor(sentiment);
    const accentCol = sentimentColor(sentiment);
    const categoryLabel = getCategoryLabel(persona.audienceCategoryId);

    // Ensure space for persona header bar (name + title); core points handle their own overflow
    y = ensureSpace(doc, y, 24);

    // Background bar for persona header
    setFillColor(doc, bgColor);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 12, 1.5, 1.5, 'F');

    // Persona name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setTextColor(doc, colors.darkGray);
    doc.text(persona.name, MARGIN + 4, y + 7);

    // Title and category
    const nameWidth = doc.getTextWidth(persona.name);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setTextColor(doc, colors.gray);
    const subtitle = `${persona.title} \u2014 ${categoryLabel}`;
    doc.text(subtitle, MARGIN + 4 + nameWidth + 3, y + 7);

    y += 16;

    // Sentiment label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setTextColor(doc, accentCol);
    doc.text(sentimentLabel(sentiment), MARGIN + 4, y);

    const sentLabelWidth = doc.getTextWidth(sentimentLabel(sentiment));

    // Decision text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setTextColor(doc, colors.darkGray);
    const decisionLines: string[] = doc.splitTextToSize(
      evaluation.decision,
      CONTENT_WIDTH - 8 - sentLabelWidth - 3
    );
    // Ensure space for all decision lines before printing any
    y = ensureSpace(doc, y, decisionLines.length * 4);
    if (decisionLines.length > 0) {
      doc.text(decisionLines[0], MARGIN + 4 + sentLabelWidth + 3, y);
    }
    y += 4;

    // Additional wrapped lines use full width
    if (decisionLines.length > 1) {
      for (let i = 1; i < decisionLines.length; i++) {
        doc.text(decisionLines[i], MARGIN + 4, y);
        y += 4;
      }
    }
    y += 2;

    // Green flags
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setTextColor(doc, [22, 163, 74]);
    doc.text('GREEN FLAGS', MARGIN + 4, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setTextColor(doc, colors.darkGray);
    for (const point of evaluation.greenFlags) {
      y = ensureSpace(doc, y, 5);
      setFillColor(doc, [22, 163, 74]);
      doc.circle(MARGIN + 6, y - 1.2, 0.8, 'F');
      y = renderWrappedText(doc, point, MARGIN + 10, y, CONTENT_WIDTH - 10, 4);
      y += 1;
    }
    y += 3;

    // Red flags
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setTextColor(doc, [220, 38, 38]);
    doc.text('RED FLAGS', MARGIN + 4, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setTextColor(doc, colors.darkGray);
    for (const point of evaluation.redFlags) {
      y = ensureSpace(doc, y, 5);
      setFillColor(doc, [220, 38, 38]);
      doc.circle(MARGIN + 6, y - 1.2, 0.8, 'F');
      y = renderWrappedText(doc, point, MARGIN + 10, y, CONTENT_WIDTH - 10, 4);
      y += 1;
    }
    y += 3;

    // Questions they'd ask
    if (evaluation.questions?.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setTextColor(doc, [100, 116, 139]); // slate-500
      doc.text('QUESTIONS THEY\'D ASK', MARGIN + 4, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setTextColor(doc, colors.darkGray);
      for (const q of evaluation.questions) {
        y = ensureSpace(doc, y, 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setTextColor(doc, [148, 163, 184]); // slate-400
        doc.text('?', MARGIN + 6, y);
        setTextColor(doc, colors.darkGray);
        y = renderWrappedText(doc, q, MARGIN + 10, y, CONTENT_WIDTH - 10, 4);
        y += 1;
      }
    }

    y += 6;
  }

  // ── 6. Recommendations ──
  y = drawSectionHeader(doc, y, 'Recommendations');

  // Main advice box
  if (data.mainAdvice && data.mainAdvice.trim()) {
    const adviceLines: string[] = doc.splitTextToSize(
      data.mainAdvice,
      CONTENT_WIDTH - 16
    );
    const adviceHeight = adviceLines.length * 4.5 + 14;
    y = ensureSpace(doc, y, adviceHeight);

    setFillColor(doc, colors.accentBg);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, adviceHeight, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setTextColor(doc, colors.accent);
    doc.text('MAIN ADVICE', MARGIN + 8, y + 6);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setTextColor(doc, colors.darkGray);
    for (const line of adviceLines) {
      doc.text(line, MARGIN + 8, y);
      y += 4.5;
    }

    y += 6;
  }

  // Individual recommendations
  for (const rec of data.recommendations) {
    const pColor = priorityColor(rec.priority);

    // Estimate needed space (title + text + rationale + raised by)
    y = ensureSpace(doc, y, 25);

    // Number circle
    setFillColor(doc, pColor);
    doc.circle(MARGIN + 4, y, 3.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setTextColor(doc, [255, 255, 255]);
    const numStr = String(rec.number);
    const numWidth = doc.getTextWidth(numStr);
    doc.text(numStr, MARGIN + 4 - numWidth / 2, y + 1);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setTextColor(doc, colors.darkGray);
    doc.text(rec.title, MARGIN + 12, y + 1);

    // Priority badge text
    const titleWidth = doc.getTextWidth(rec.title);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    setTextColor(doc, pColor);
    doc.text(priorityLabel(rec.priority), MARGIN + 12 + titleWidth + 3, y + 1);

    y += 7;

    // Description text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setTextColor(doc, colors.darkGray);
    y = renderWrappedText(doc, rec.text, MARGIN + 12, y, CONTENT_WIDTH - 12, 4);
    y += 2;

    // Why? rationale
    if (rec.priorityRationale) {
      y = ensureSpace(doc, y, 5);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      setTextColor(doc, colors.gray);
      y = renderWrappedText(
        doc,
        `Why? ${rec.priorityRationale}`,
        MARGIN + 12,
        y,
        CONTENT_WIDTH - 12,
        3.5
      );
      y += 2;
    }

    // Raised by persona names
    if (rec.relatedPersonaIds.length > 0) {
      y = ensureSpace(doc, y, 5);
      const personaNames = rec.relatedPersonaIds
        .map((id) => {
          const p = data.personas.find((persona) => persona.id === id);
          return p ? p.name : id;
        })
        .join(', ');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setTextColor(doc, colors.accent);
      y = renderWrappedText(
        doc,
        `Raised by: ${personaNames}`,
        MARGIN + 12,
        y,
        CONTENT_WIDTH - 12,
        3.5
      );
      y += 2;
    }

    y += 5;
  }

  // ── 7. Footers ──
  const totalPages = doc.getNumberOfPages();
  const dateStr = formatDate();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setTextColor(doc, colors.lightGray);

    // Left footer
    doc.text(
      `Generated ${dateStr}`,
      MARGIN,
      PAGE_HEIGHT - MARGIN + 5
    );

    // Center footer - Powered by Deckster (clickable)
    doc.setFont('helvetica', 'normal');
    const poweredText = 'Powered by ';
    const decksterText = 'Deckster';
    const poweredWidth = doc.getTextWidth(poweredText);
    const decksterWidth = doc.getTextWidth(decksterText);
    const totalWidth = poweredWidth + decksterWidth;
    const centerX = PAGE_WIDTH / 2 - totalWidth / 2;

    setTextColor(doc, colors.lightGray);
    doc.text(poweredText, centerX, PAGE_HEIGHT - MARGIN + 5);
    setTextColor(doc, colors.accent);
    doc.text(decksterText, centerX + poweredWidth, PAGE_HEIGHT - MARGIN + 5);

    // Add clickable link to Deckster
    doc.link(
      centerX + poweredWidth,
      PAGE_HEIGHT - MARGIN + 3,
      decksterWidth,
      3,
      { url: 'https://deckster.pro/' }
    );

    // Right footer - page numbers
    const pageText = `${i} / ${totalPages}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    setTextColor(doc, colors.lightGray);
    doc.text(
      pageText,
      PAGE_WIDTH - MARGIN - pageTextWidth,
      PAGE_HEIGHT - MARGIN + 5
    );
  }

  // ── Save ──
  doc.save('deckster-evaluation-report.pdf');
}
