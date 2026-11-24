import { jsPDF } from 'jspdf';
import { CHAPTERS, COVER_ILLUSTRATION, getChapterParagraphs, type StoryMode } from '../data/chapters';

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

function sanitizeForPdfTimes(text: string): string {
  return text
    .replace(/ā/g, 'a')
    .replace(/Ā/g, 'A')
    .replace(/ē/g, 'e')
    .replace(/ī/g, 'i')
    .replace(/ō/g, 'o')
    .replace(/ū/g, 'u')
    .replace(/→/g, '->');
}

async function loadImageAsDataUrl(src: string): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.86),
          width: canvas.width,
          height: canvas.height,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function renderRalewayHeaderBanner(
  chapterNum: number,
  title: string,
  location: string,
): string {
  const scale = 3;
  const w = 520;
  const h = 82;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // NZTA Highway Green Sign Rectangle
  ctx.fillStyle = '#00583A';
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 8);
  ctx.fill();

  // Inner white highway sign border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(5, 5, w - 10, h - 10, 5);
  ctx.stroke();

  // Top metadata line in Raleway
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '600 10px "Raleway", sans-serif';
  ctx.fillText(`CHAPTER ${String(chapterNum).padStart(2, '0')}  ·  ${location.toUpperCase()}`, 18, 25);

  // Main chapter title in crisp Raleway Bold
  ctx.fillStyle = '#FFFFFF';
  let fontSize = 21;
  ctx.font = `700 ${fontSize}px "Raleway", sans-serif`;
  while (ctx.measureText(title).width > w - 36 && fontSize > 14) {
    fontSize -= 1;
    ctx.font = `700 ${fontSize}px "Raleway", sans-serif`;
  }
  ctx.fillText(title, 18, 58);

  return canvas.toDataURL('image/png');
}

function renderRalewayCoverHeader(): string {
  const scale = 3;
  const w = 520;
  const h = 116;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  ctx.fillStyle = '#00583A';
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 8);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(6, 6, w - 12, h - 12, 5);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '600 11px "Raleway", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ILLUSTRATED NEW ZEALAND EDITION  ·  CHAPTERS 1–20', w / 2, 30);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 30px "Raleway", sans-serif';
  ctx.fillText('OSCAR JONES', w / 2, 68);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '500 13px "Raleway", sans-serif';
  ctx.fillText('From Ellery & Auckland to Moonspire, Copperville & Nightbramble', w / 2, 95);

  return canvas.toDataURL('image/png');
}


export interface PdfOptions {
  showImages?: boolean;
  storyMode?: StoryMode;
}

export async function generateBookPdf(
  onProgress?: (step: number, total: number, status: string) => void,
  options: PdfOptions = {},
): Promise<void> {
  const showImages = options.showImages ?? true;
  const storyMode: StoryMode = options.storyMode ?? 'original';

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89
  const marginX = 56;
  const contentWidth = pageWidth - marginX * 2;
  const topY = 58;
  const bottomLimit = pageHeight - 54;

  const totalSteps = CHAPTERS.length + 2;
  onProgress?.(
    1,
    totalSteps,
    showImages ? 'Preparing cover & illustrations...' : 'Preparing text-only edition...',
  );

  // Preload unique illustrations only when images are enabled
  const imageCache = new Map<string, LoadedImage>();
  if (showImages) {
    const imagePaths = new Set<string>([COVER_ILLUSTRATION.src]);
    CHAPTERS.forEach((ch) => {
      if (ch.illustration) imagePaths.add(ch.illustration.src);
    });

    await Promise.all(
      Array.from(imagePaths).map(async (src) => {
        const loaded = await loadImageAsDataUrl(src);
        if (loaded) imageCache.set(src, loaded);
      }),
    );
  }

  // Page 1: Cover Page
  doc.setFillColor(251, 249, 245);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  const coverBanner = renderRalewayCoverHeader();
  const coverBannerH = (contentWidth * 116) / 520;
  doc.addImage(
    coverBanner,
    'PNG',
    marginX,
    showImages ? 54 : 260,
    contentWidth,
    coverBannerH,
  );

  if (showImages) {
    const coverImg = imageCache.get(COVER_ILLUSTRATION.src);
    if (coverImg) {
      const maxImgW = 330;
      const imgH = (maxImgW * coverImg.height) / coverImg.width;
      const imgX = (pageWidth - maxImgW) / 2;
      doc.setDrawColor(214, 206, 190);
      doc.setLineWidth(1);
      doc.rect(imgX - 4, 196, maxImgW + 8, imgH + 8);
      doc.addImage(coverImg.dataUrl, 'JPEG', imgX, 200, maxImgW, imgH);
    }
  }

  const editionLabel =
    storyMode === 'original'
      ? 'Original Story Edition (Chapters 1-12 Original · Chapters 13-20 Continuation)'
      : 'Edited Edition · Grammar & Punctuation Revised in New Zealand English';

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 95, 88);
  doc.text(editionLabel, pageWidth / 2, showImages ? 700 : 420, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(41, 37, 36);
  doc.text(
    'Titles in Raleway (NZTA Directional Sign Style) · Body Prose in Classic Serif',
    pageWidth / 2,
    showImages ? 720 : 442,
    { align: 'center' },
  );

  // Page 2: Table of Contents
  doc.addPage();
  doc.setFillColor(251, 249, 245);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 88, 58);
  doc.text('Table of Contents', marginX, 66);
  doc.setDrawColor(214, 206, 190);
  doc.line(marginX, 76, pageWidth - marginX, 76);

  let tocY = 104;
  let lastPart = '';
  for (const ch of CHAPTERS) {
    if (ch.part !== lastPart) {
      lastPart = ch.part;
      tocY += 8;
      doc.setFont('times', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(120, 113, 108);
      doc.text(ch.part.toUpperCase(), marginX, tocY);
      tocY += 16;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(28, 25, 23);
    doc.text(`Chapter ${String(ch.number).padStart(2, '0')}`, marginX, tocY);

    doc.setFont('times', 'normal');
    doc.text(sanitizeForPdfTimes(ch.title), marginX + 68, tocY);

    tocY += 21;
  }

  // Chapters 1-20
  let pageCount = 2;
  const addRunningHeaderFooter = (chNum: number, chTitle: string) => {
    pageCount += 1;
    doc.setFillColor(251, 249, 245);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 113, 108);
    doc.text('Oscar Jones', marginX, 34);
    doc.text(`Chapter ${chNum} · ${chTitle}`, pageWidth - marginX, 34, { align: 'right' });
    doc.setDrawColor(225, 220, 210);
    doc.line(marginX, 40, pageWidth - marginX, 40);

    doc.line(marginX, pageHeight - 40, pageWidth - marginX, pageHeight - 40);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text(`${pageCount}`, pageWidth / 2, pageHeight - 24, { align: 'center' });
  };

  for (let idx = 0; idx < CHAPTERS.length; idx++) {
    const ch = CHAPTERS[idx];
    onProgress?.(idx + 2, totalSteps, `Typesetting Chapter ${ch.number}: ${ch.title}...`);

    doc.addPage();
    addRunningHeaderFooter(ch.number, ch.title);

    let y = topY;

    // Raleway NZTA-style chapter banner
    const banner = renderRalewayHeaderBanner(ch.number, ch.title, ch.location);
    const bannerH = (contentWidth * 82) / 520;
    doc.addImage(banner, 'PNG', marginX, y, contentWidth, bannerH);
    y += bannerH + 18;

    // Chapter Illustration
    if (showImages && ch.illustration) {
      const loaded = imageCache.get(ch.illustration.src);
      if (loaded) {
        const targetW = ch.illustration.aspect === '3:4' ? 240 : 380;
        const targetH = (targetW * loaded.height) / loaded.width;
        const imgX = (pageWidth - targetW) / 2;
        doc.setDrawColor(214, 206, 190);
        doc.rect(imgX - 3, y - 3, targetW + 6, targetH + 6);
        doc.addImage(loaded.dataUrl, 'JPEG', imgX, y, targetW, targetH);
        y += targetH + 13;

        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 95, 88);
        const capLines = doc.splitTextToSize(
          sanitizeForPdfTimes(ch.illustration.caption),
          contentWidth - 20,
        );
        doc.text(capLines, pageWidth / 2, y, { align: 'center' });
        y += capLines.length * 12 + 12;
      }
    }

    // Body prose in classic Times serif
    doc.setFont('times', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(28, 25, 23);
    const lineHeight = 17.5;

    const paragraphs = getChapterParagraphs(ch, storyMode);
    for (const para of paragraphs) {
      const wrapped = doc.splitTextToSize(sanitizeForPdfTimes(para), contentWidth);
      for (const line of wrapped) {
        if (y + lineHeight > bottomLimit) {
          doc.addPage();
          addRunningHeaderFooter(ch.number, ch.title);
          y = topY + 4;
          doc.setFont('times', 'normal');
          doc.setFontSize(11.5);
          doc.setTextColor(28, 25, 23);
        }
        doc.text(line, marginX, y);
        y += lineHeight;
      }
      y += 7;
    }
  }

  onProgress?.(totalSteps, totalSteps, 'Saving PDF...');
  doc.save('Oscar-Jones-Chapters-1-20.pdf');
}
