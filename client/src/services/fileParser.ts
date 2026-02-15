import JSZip from 'jszip';
import type { SlideContent } from '@deckster/shared/types';

/**
 * Parse a PPTX file by extracting text from each slide's XML.
 * PPTX is a ZIP archive containing slide XML files at ppt/slides/slide{N}.xml.
 */
async function parsePPTX(file: File): Promise<SlideContent[]> {
  const zip = await JSZip.loadAsync(file);
  const slideFiles: { name: string; index: number }[] = [];

  zip.forEach((relativePath) => {
    const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/);
    if (match) {
      slideFiles.push({ name: relativePath, index: parseInt(match[1], 10) });
    }
  });

  slideFiles.sort((a, b) => a.index - b.index);

  const slides: SlideContent[] = [];

  for (const sf of slideFiles) {
    const xml = await zip.file(sf.name)!.async('text');
    const text = extractTextFromXml(xml);
    if (text.trim()) {
      slides.push({ slideNumber: sf.index, text: text.trim() });
    }
  }

  return slides;
}

/**
 * Extract visible text from PowerPoint slide XML.
 * Text nodes live inside <a:t> tags within the slide XML.
 */
function extractTextFromXml(xml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  // <a:t> tags contain the actual text runs in OOXML
  const textNodes = doc.getElementsByTagName('a:t');
  const paragraphs: string[] = [];
  let currentParagraph = '';

  // Walk through the XML to reconstruct paragraphs
  const pNodes = doc.getElementsByTagName('a:p');
  for (let i = 0; i < pNodes.length; i++) {
    const tNodes = pNodes[i].getElementsByTagName('a:t');
    const parts: string[] = [];
    for (let j = 0; j < tNodes.length; j++) {
      const text = tNodes[j].textContent;
      if (text) parts.push(text);
    }
    if (parts.length > 0) {
      paragraphs.push(parts.join(''));
    }
  }

  return paragraphs.join('\n');
}

/**
 * Parse a PDF file using pdf.js to extract text per page.
 */
async function parsePDF(file: File): Promise<SlideContent[]> {
  // Dynamic import to avoid loading pdf.js upfront
  const pdfjsLib = await import('pdfjs-dist');

  // Set the worker source to the bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const slides: SlideContent[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text) {
      slides.push({ slideNumber: i, text });
    }
  }

  return slides;
}

/**
 * Parse an uploaded file (PPTX or PDF) and return slide contents.
 */
export async function parseFile(file: File): Promise<SlideContent[]> {
  const ext = file.name.toLowerCase().split('.').pop();

  if (ext === 'pptx') {
    return parsePPTX(file);
  } else if (ext === 'pdf') {
    return parsePDF(file);
  } else {
    throw new Error(`Unsupported file type: .${ext}. Please upload a .pptx or .pdf file.`);
  }
}
