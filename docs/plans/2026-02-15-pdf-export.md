# PDF Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Save report" button to the Recommendations page that exports the full evaluation as a styled PDF.

**Architecture:** Client-side PDF generation using jsPDF. A new pure service function (`generateReport`) takes all evaluation data as typed input and produces a PDF download. The Recommendations component receives additional props from App.tsx and wires a button to trigger the export.

**Tech Stack:** jsPDF, TypeScript, React

---

### Task 1: Install jsPDF dependency

**Files:**
- Modify: `client/package.json`

**Step 1: Install jspdf in the client workspace**

Run:
```bash
npm install jspdf --workspace=client
```

**Step 2: Verify installation**

Run:
```bash
node -e "require('jspdf')" 2>&1 || echo "Installed as ESM — checking package.json"
grep jspdf client/package.json
```
Expected: `jspdf` appears in client/package.json dependencies.

**Step 3: Commit**

```bash
git add client/package.json package-lock.json
git commit -m "feat: add jspdf dependency for PDF export"
```

---

### Task 2: Create the PDF export service

**Files:**
- Create: `client/src/services/pdfExport.ts`

**Context:**
- The `computeSuccessScore` function currently lives inside `client/src/components/PersonaReactions.tsx:6-20`. We will duplicate its logic here rather than extracting it to a shared location — YAGNI, and it keeps the export service fully self-contained.
- Audience categories are in `client/src/data/audienceCategories.ts` — import for looking up category labels.
- All types come from `@deckster/shared/types`.

**Step 1: Create `client/src/services/pdfExport.ts`**

This is the core of the feature. The function:
1. Creates an A4 jsPDF document
2. Renders each section with manual y-positioning
3. Handles page breaks when content overflows
4. Adds footers to every page
5. Triggers a browser download

```typescript
import { jsPDF } from 'jspdf';
import type { Persona, PersonaEvaluation, OverallSummary, Recommendation } from '@deckster/shared/types';
import { audienceCategories } from '../data/audienceCategories';

interface ReportData {
  goal: string;
  personas: Persona[];
  evaluations: PersonaEvaluation[];
  overallSummary: OverallSummary | null;
  mainAdvice: string;
  recommendations: Recommendation[];
}

// ── Layout constants ──
const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_HEIGHT = 15;
const BOTTOM_LIMIT = PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT;

// ── Colors ──
const COLORS = {
  black: [0, 0, 0] as [number, number, number],
  darkGray: [30, 30, 30] as [number, number, number],
  gray: [100, 100, 100] as [number, number, number],
  lightGray: [180, 180, 180] as [number, number, number],
  border: [220, 220, 220] as [number, number, number],
  accent: [0, 21, 255] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
  greenBg: [240, 253, 244] as [number, number, number],
  redBg: [254, 242, 242] as [number, number, number],
  amberBg: [255, 251, 235] as [number, number, number],
  accentBg: [245, 247, 255] as [number, number, number],
};

function getSentimentColor(sentiment: string): [number, number, number] {
  if (sentiment === 'positive') return COLORS.green;
  if (sentiment === 'negative') return COLORS.red;
  return COLORS.amber;
}

function getSentimentBg(sentiment: string): [number, number, number] {
  if (sentiment === 'positive') return COLORS.greenBg;
  if (sentiment === 'negative') return COLORS.redBg;
  return COLORS.amberBg;
}

function getSentimentLabel(sentiment: string): string {
  if (sentiment === 'positive') return 'POSITIVE';
  if (sentiment === 'negative') return 'NEGATIVE';
  return 'MIXED';
}

function computeScore(evaluations: PersonaEvaluation[]): { percent: number; label: string } {
  if (evaluations.length === 0) return { percent: 0, label: 'No data' };
  const total = evaluations.reduce((sum, ev) => {
    if (ev.decisionSentiment === 'positive') return sum + 1;
    if (ev.decisionSentiment === 'mixed') return sum + 0.5;
    return sum;
  }, 0);
  const percent = Math.round((total / evaluations.length) * 100);
  if (percent >= 80) return { percent, label: 'High chance' };
  if (percent >= 60) return { percent, label: 'Good chance' };
  if (percent >= 40) return { percent, label: 'Moderate' };
  if (percent >= 20) return { percent, label: 'Challenging' };
  return { percent, label: 'Low chance' };
}

function getCategoryLabel(categoryId: string): string {
  return audienceCategories.find((c) => c.id === categoryId)?.label ?? categoryId;
}

function getPersonaLabel(id: string, personas: Persona[]): string {
  const p = personas.find((p) => p.id === id);
  return p ? p.name : id;
}

/** Check if we need a new page, and add one if so. Returns the new y position. */
function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > BOTTOM_LIMIT) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function addFooters(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.lightGray);
    doc.text(`Generated by Deckster Evaluator — ${dateStr}`, MARGIN, PAGE_HEIGHT - MARGIN + 5);
    doc.text(`${i} / ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - MARGIN + 5, { align: 'right' });
  }
}

export function generateReport(data: ReportData): void {
  const { goal, personas, evaluations, overallSummary, mainAdvice, recommendations } = data;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  // ── Header ──
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text('Deckster', MARGIN, y + 7);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text('EVALUATION REPORT', MARGIN + 42, y + 7);
  y += 16;

  // Divider
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;

  // ── Goal ──
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.gray);
  doc.text('PRESENTATION GOAL', MARGIN, y);
  y += 5;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkGray);
  const goalLines = doc.splitTextToSize(goal, CONTENT_WIDTH);
  doc.text(goalLines, MARGIN, y);
  y += goalLines.length * 5 + 8;

  // ── Success Score ──
  const score = computeScore(evaluations);
  const scoreColor = score.percent >= 60 ? COLORS.green : score.percent >= 40 ? COLORS.amber : COLORS.red;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.gray);
  doc.text('CHANCE OF SUCCESS', MARGIN, y);
  y += 6;
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...scoreColor);
  doc.text(`${score.percent}%`, MARGIN, y + 2);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(score.label, MARGIN + 24, y + 2);
  y += 12;

  // ── Overall Summary ──
  if (overallSummary) {
    y = ensureSpace(doc, y, 30);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkGray);
    const summaryLines = doc.splitTextToSize(overallSummary.text, CONTENT_WIDTH);
    doc.text(summaryLines, MARGIN, y);
    y += summaryLines.length * 4.5 + 8;

    // Strengths
    if (overallSummary.strengths.length > 0) {
      y = ensureSpace(doc, y, 20);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.green);
      doc.text('WHAT WORKS WELL', MARGIN, y);
      y += 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.darkGray);
      for (const s of overallSummary.strengths) {
        y = ensureSpace(doc, y, 6);
        doc.setFillColor(...COLORS.green);
        doc.circle(MARGIN + 2, y - 1, 1, 'F');
        const lines = doc.splitTextToSize(s, CONTENT_WIDTH - 8);
        doc.text(lines, MARGIN + 6, y);
        y += lines.length * 4 + 2;
      }
      y += 4;
    }

    // Weaknesses
    if (overallSummary.weaknesses.length > 0) {
      y = ensureSpace(doc, y, 20);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.red);
      doc.text('WHAT NEEDS WORK', MARGIN, y);
      y += 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.darkGray);
      for (const w of overallSummary.weaknesses) {
        y = ensureSpace(doc, y, 6);
        doc.setFillColor(...COLORS.red);
        doc.circle(MARGIN + 2, y - 1, 1, 'F');
        const lines = doc.splitTextToSize(w, CONTENT_WIDTH - 8);
        doc.text(lines, MARGIN + 6, y);
        y += lines.length * 4 + 2;
      }
      y += 4;
    }
  }

  // ── Panel Feedback ──
  y = ensureSpace(doc, y, 30);
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text('Panel Feedback', MARGIN, y);
  y += 8;

  for (const persona of personas) {
    const evaluation = evaluations.find((e) => e.personaId === persona.id);
    if (!evaluation) continue;

    // Estimate space needed: name + decision + core points
    const estimatedHeight = 30 + evaluation.corePoints.length * 6;
    y = ensureSpace(doc, y, estimatedHeight);

    // Sentiment background bar
    const sentBg = getSentimentBg(evaluation.decisionSentiment);
    doc.setFillColor(...sentBg);
    doc.roundedRect(MARGIN, y - 3, CONTENT_WIDTH, 9, 1, 1, 'F');

    // Persona name and title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.black);
    doc.text(persona.name, MARGIN + 3, y + 3);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.gray);
    const titleText = `${persona.title} — ${getCategoryLabel(persona.audienceCategoryId)}`;
    doc.text(titleText, MARGIN + 3 + doc.getTextWidth(persona.name) + 3, y + 3);
    y += 10;

    // Decision
    const sentColor = getSentimentColor(evaluation.decisionSentiment);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...sentColor);
    doc.text(getSentimentLabel(evaluation.decisionSentiment), MARGIN + 3, y);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.darkGray);
    y += 5;
    const decisionLines = doc.splitTextToSize(evaluation.decision, CONTENT_WIDTH - 6);
    doc.text(decisionLines, MARGIN + 3, y);
    y += decisionLines.length * 4 + 4;

    // Core points
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkGray);
    for (const point of evaluation.corePoints) {
      y = ensureSpace(doc, y, 6);
      doc.setFillColor(...COLORS.accent);
      doc.circle(MARGIN + 5, y - 1, 0.8, 'F');
      const pointLines = doc.splitTextToSize(point, CONTENT_WIDTH - 12);
      doc.text(pointLines, MARGIN + 9, y);
      y += pointLines.length * 4 + 2;
    }
    y += 6;
  }

  // ── Recommendations ──
  y = ensureSpace(doc, y, 30);
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.black);
  doc.text('Recommendations', MARGIN, y);
  y += 8;

  // Main advice
  if (mainAdvice) {
    y = ensureSpace(doc, y, 20);
    doc.setFillColor(...COLORS.accentBg);
    const adviceLines = doc.splitTextToSize(mainAdvice, CONTENT_WIDTH - 10);
    const adviceHeight = adviceLines.length * 4.5 + 10;
    doc.roundedRect(MARGIN, y - 3, CONTENT_WIDTH, adviceHeight, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text('MAIN ADVICE', MARGIN + 5, y + 2);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkGray);
    doc.text(adviceLines, MARGIN + 5, y + 8);
    y += adviceHeight + 6;
  }

  // Individual recommendations
  const priorityLabels: Record<string, string> = { top: 'TOP PRIORITY', important: 'IMPORTANT', consider: 'CONSIDER' };
  const priorityColors: Record<string, [number, number, number]> = {
    top: COLORS.red,
    important: COLORS.amber,
    consider: COLORS.gray,
  };

  for (const rec of recommendations) {
    const recLines = doc.splitTextToSize(rec.text, CONTENT_WIDTH - 16);
    const rationaleLines = rec.priorityRationale ? doc.splitTextToSize(rec.priorityRationale, CONTENT_WIDTH - 16) : [];
    const personaNames = rec.relatedPersonaIds.map((id) => getPersonaLabel(id, personas)).join(', ');
    const estimatedHeight = 20 + recLines.length * 4 + rationaleLines.length * 4 + (personaNames ? 8 : 0);
    y = ensureSpace(doc, y, estimatedHeight);

    // Number circle
    const pColor = priorityColors[rec.priority] ?? COLORS.gray;
    doc.setFillColor(...pColor);
    doc.circle(MARGIN + 4, y + 1, 3.5, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(String(rec.number), MARGIN + 4, y + 2.5, { align: 'center' });

    // Title + priority badge
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.black);
    doc.text(rec.title, MARGIN + 12, y + 2);

    const badgeLabel = priorityLabels[rec.priority] ?? 'CONSIDER';
    const titleWidth = doc.getTextWidth(rec.title);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...pColor);
    doc.text(badgeLabel, MARGIN + 12 + titleWidth + 4, y + 2);
    y += 8;

    // Description
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkGray);
    doc.text(recLines, MARGIN + 12, y);
    y += recLines.length * 4 + 2;

    // Rationale
    if (rationaleLines.length > 0) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.gray);
      doc.text('Why? ', MARGIN + 12, y);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...COLORS.gray);
      doc.text(rationaleLines, MARGIN + 12 + doc.getTextWidth('Why? '), y);
      y += rationaleLines.length * 3.5 + 2;
    }

    // Related personas
    if (personaNames) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.accent);
      const personaLines = doc.splitTextToSize(`Raised by: ${personaNames}`, CONTENT_WIDTH - 12);
      doc.text(personaLines, MARGIN + 12, y);
      y += personaLines.length * 3.5 + 2;
    }

    y += 4;
  }

  // ── Footers ──
  addFooters(doc);

  // ── Download ──
  doc.save('deckster-evaluation-report.pdf');
}
```

**Step 2: Verify the file compiles**

Run:
```bash
cd client && npx tsc --noEmit
```
Expected: No type errors.

**Step 3: Commit**

```bash
git add client/src/services/pdfExport.ts
git commit -m "feat: add PDF export service with jsPDF"
```

---

### Task 3: Thread additional props through to Recommendations

**Files:**
- Modify: `client/src/components/Recommendations.tsx` (lines 3-9 interface)
- Modify: `client/src/App.tsx` (lines 125-133 Recommendations render)

**Step 1: Update Recommendations props interface**

In `client/src/components/Recommendations.tsx`, add the new props to the interface (around line 3-9):

Change:
```typescript
interface RecommendationsProps {
  mainAdvice: string;
  recommendations: Recommendation[];
  personas: Persona[];
  isLoading?: boolean;
  onBack: () => void;
  onStartOver: () => void;
}
```

To:
```typescript
interface RecommendationsProps {
  mainAdvice: string;
  recommendations: Recommendation[];
  personas: Persona[];
  evaluations: PersonaEvaluation[];
  overallSummary: OverallSummary | null;
  goal: string;
  isLoading?: boolean;
  onBack: () => void;
  onStartOver: () => void;
}
```

Also add the imports at the top of the file:
```typescript
import type { Recommendation, Persona, PersonaEvaluation, OverallSummary } from '@deckster/shared/types';
```

Update the destructuring in the function signature:
```typescript
export function Recommendations({
  mainAdvice,
  recommendations,
  personas,
  evaluations,
  overallSummary,
  goal,
  isLoading,
  onBack,
  onStartOver,
}: RecommendationsProps) {
```

**Step 2: Pass props from App.tsx**

In `client/src/App.tsx`, update the Recommendations render (around line 126):

Change:
```tsx
<Recommendations
  mainAdvice={mainAdvice}
  recommendations={recommendations}
  personas={personas}
  onBack={handleBackToResults}
  onStartOver={handleStartOver}
/>
```

To:
```tsx
<Recommendations
  mainAdvice={mainAdvice}
  recommendations={recommendations}
  personas={personas}
  evaluations={evaluations}
  overallSummary={overallSummary}
  goal={goal}
  onBack={handleBackToResults}
  onStartOver={handleStartOver}
/>
```

**Step 3: Verify it compiles**

Run:
```bash
cd client && npx tsc --noEmit
```
Expected: No type errors.

**Step 4: Commit**

```bash
git add client/src/components/Recommendations.tsx client/src/App.tsx
git commit -m "feat: pass evaluation data to Recommendations component"
```

---

### Task 4: Add "Save report" button and wire up PDF export

**Files:**
- Modify: `client/src/components/Recommendations.tsx`

**Step 1: Import the export function and add the button**

Add import at top of `client/src/components/Recommendations.tsx`:
```typescript
import { generateReport } from '../services/pdfExport';
```

Add a handler inside the component function body (after `getPersonaLabel`):
```typescript
const handleSaveReport = () => {
  generateReport({
    goal,
    personas,
    evaluations,
    overallSummary,
    mainAdvice,
    recommendations,
  });
};
```

Add a "Save report" button in the header bar, between the "Back" and "Start over" buttons. Replace the existing header `<div>` (around line 89):

Change:
```tsx
<div className="flex items-center justify-between animate-fade-in-up">
  <button
    className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-sm cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary hover:bg-bg-primary"
    onClick={onBack}
    type="button"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="hidden sm:inline">Back to reactions</span>
    <span className="sm:hidden">Back</span>
  </button>
  <button
    className="px-3 sm:px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-[13px] cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary hover:bg-bg-primary"
    onClick={onStartOver}
    type="button"
  >
    Start over
  </button>
</div>
```

To:
```tsx
<div className="flex items-center justify-between animate-fade-in-up">
  <button
    className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-sm cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary hover:bg-bg-primary"
    onClick={onBack}
    type="button"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="hidden sm:inline">Back to reactions</span>
    <span className="sm:hidden">Back</span>
  </button>
  <div className="flex items-center gap-2">
    <button
      className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-[13px] cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary hover:bg-bg-primary"
      onClick={handleSaveReport}
      type="button"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">Save report</span>
      <span className="sm:hidden">Save</span>
    </button>
    <button
      className="px-3 sm:px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-[13px] cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary hover:bg-bg-primary"
      onClick={onStartOver}
      type="button"
    >
      Start over
    </button>
  </div>
</div>
```

**Step 2: Verify it compiles**

Run:
```bash
cd client && npx tsc --noEmit
```
Expected: No type errors.

**Step 3: Manual test**

1. Run the app: `npm run dev` (in both client and server)
2. Upload a presentation, configure, evaluate
3. Navigate to Recommendations page
4. Click "Save report" button
5. Verify a PDF downloads named `deckster-evaluation-report.pdf`
6. Open the PDF and verify it contains: header, goal, score, summary, strengths/weaknesses, persona feedback, recommendations

**Step 4: Commit**

```bash
git add client/src/components/Recommendations.tsx
git commit -m "feat: add Save report button with PDF export"
```
