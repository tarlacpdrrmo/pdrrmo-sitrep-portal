// src/services/pdfScanner.js

export async function initPdfWorker() {
  if (!window.pdfjsLib) return;
  try {
    const res = await fetch("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js");
    const code = await res.text();
    const blob = new Blob([code], { type: "application/javascript" });
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
  } catch (e) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
}

export async function scanSitrepPdfFile(file, store) {
  let extractedText = "";
  let pageCount = 0;

  if (file.name.toLowerCase().endsWith(".pdf") && window.pdfjsLib) {
    const arrayBuf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuf }).promise;
    pageCount = pdf.numPages;
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      const yBuckets = {};
      content.items.forEach(item => {
        const y = Math.round(item.transform[5] / 3) * 3;
        if (!yBuckets[y]) yBuckets[y] = [];
        yBuckets[y].push({ x: item.transform[4], str: item.str });
      });
      Object.keys(yBuckets).map(Number).sort((a, b) => b - a).forEach(y => {
        const line = yBuckets[y].sort((a, b) => a.x - b.x).map(i => i.str).join(" ");
        extractedText += line + "\n";
      });
    }
  } else {
    extractedText = await file.text();
    pageCount = 1;
  }

  const textMatch = extractedText.match(/Update\s*#(\d+)/i);
  const nameMatch = file.name.match(/#(\d+)/) || file.name.match(/(\d+)/);
  let detectedKey = textMatch ? String(textMatch[1]) : (nameMatch ? String(nameMatch[1]) : "31");

  // Fall back to nearest archived SitRep if an unindexed number is uploaded
  if (!store.snapshots[detectedKey]) {
    const available = store.getSortedKeys().map(Number).sort((a, b) => a - b);
    const target = Number(detectedKey) || 31;
    const closest = available.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
    detectedKey = String(closest);
  }

  store.setSitrep(detectedKey);
  return {
    sitrepKey: detectedKey,
    pageCount,
    fileName: file.name
  };
}
