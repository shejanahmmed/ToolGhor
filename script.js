// DOM elements
const fileInput = document.getElementById('fileInput');
const drop = document.getElementById('drop');
const fileList = document.getElementById('fileList');
const btnAdd = document.getElementById('btnAdd');
const clearQueue = document.getElementById('clearQueue');
const queueInfo = document.getElementById('queueInfo');
const statusText = document.getElementById('status');
const prog = document.getElementById('prog');

let queue = [];
let ffmpeg = null;

// Animate loading percentage
let percent = 0;
const percentElement = document.querySelector('.loading-percent');
const percentInterval = setInterval(() => {
  percent += 5;
  if (percentElement) percentElement.textContent = percent + '%';
  if (percent >= 100) clearInterval(percentInterval);
}, 100);

// Initialize FFmpeg
async function initFFmpeg() {
  if (!ffmpeg) {
    const { FFmpeg } = FFmpegWASM;
    ffmpeg = new FFmpeg();
    await ffmpeg.load();
  }
  return ffmpeg;
}

// Update file queue display
function renderQueue() {
  fileList.innerHTML = '';
  queue.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'row';
    const type = f.type.includes('pdf') ? 'PDF' : 
                f.type.includes('image') ? 'IMG' :
                f.type.includes('video') ? 'VID' :
                f.type.includes('zip') ? 'ZIP' : 'FILE';
    row.innerHTML = `
      <div>
        <strong>${type}</strong> — ${f.name}
      </div>
      <button data-i="${i}" class="remove">Remove</button>
    `;
    fileList.appendChild(row);
  });

  queueInfo.textContent = `${queue.length} files`;

  document.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.i);
      queue.splice(i, 1);
      renderQueue();
    });
  });
}

// Add files to queue
function handleFiles(filesObj) {
  const files = Array.from(filesObj);
  files.forEach(f => queue.push(f));
  renderQueue();
  statusText.textContent = 'Files added';
}

// Drag & drop handlers
drop.addEventListener('dragover', e => {
  e.preventDefault();
  drop.style.borderColor = 'rgba(255,255,255,0.3)';
});

drop.addEventListener('dragleave', () => {
  drop.style.borderColor = 'rgba(255,255,255,0.15)';
});

drop.addEventListener('drop', e => {
  e.preventDefault();
  drop.style.borderColor = 'rgba(255,255,255,0.15)';
  handleFiles(e.dataTransfer.files);
});

// File input handlers
fileInput.addEventListener('change', () => handleFiles(fileInput.files));
btnAdd.addEventListener('click', () => handleFiles(fileInput.files));
clearQueue.addEventListener('click', () => {
  queue = [];
  renderQueue();
  statusText.textContent = 'Queue cleared';
  prog.style.width = '0%';
});

// UI helpers
function setProgress(p) { prog.style.width = `${p}%`; }
function setStatus(t) { statusText.textContent = t; }

// PDF Tools
document.getElementById('mergePdf').addEventListener('click', async () => {
  const pdfFiles = queue.filter(f => f.type === 'application/pdf');
  if (!pdfFiles.length) {
    setStatus('No PDFs in queue');
    return;
  }

  setStatus('Merging PDFs...');
  setProgress(5);

  const mergedPdf = await PDFLib.PDFDocument.create();
  let processed = 0;

  for (const f of pdfFiles) {
    const bytes = await f.arrayBuffer();
    const donor = await PDFLib.PDFDocument.load(bytes);
    const pages = await mergedPdf.copyPages(donor, donor.getPageIndices());
    pages.forEach(p => mergedPdf.addPage(p));

    processed++;
    setProgress(5 + Math.floor((processed / pdfFiles.length) * 90));
  }

  const output = await mergedPdf.save();
  saveAs(new Blob([output], { type: 'application/pdf' }), 'merged.pdf');

  setStatus('Merge complete');
  setProgress(100);
});

document.getElementById('imagesToPdf').addEventListener('click', async () => {
  const imgs = queue.filter(f => f.type.startsWith('image/'));
  if (!imgs.length) {
    setStatus('No images in queue');
    return;
  }

  setStatus('Converting images to PDF...');
  setProgress(5);

  const pdfDoc = await PDFLib.PDFDocument.create();
  let processed = 0;

  for (const f of imgs) {
    const arr = await f.arrayBuffer();
    const img = f.type === 'image/png'
      ? await pdfDoc.embedPng(arr)
      : await pdfDoc.embedJpg(arr);

    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

    processed++;
    setProgress(5 + Math.floor((processed / imgs.length) * 90));
  }

  const out = await pdfDoc.save();
  saveAs(new Blob([out], { type: 'application/pdf' }), 'images.pdf');

  setStatus('Conversion complete');
  setProgress(100);
});

document.getElementById('pdfToImages').addEventListener('click', async () => {
  const pdfs = queue.filter(f => f.type === 'application/pdf');
  if (!pdfs.length) {
    setStatus('No PDFs in queue');
    return;
  }

  setStatus('Converting PDF to images...');
  setProgress(10);

  let processed = 0;

  for (const f of pdfs) {
    const arr = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arr }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    canvas.toBlob(blob => {
      saveAs(blob, f.name.replace(/\.pdf$/, '.png'));
    });

    processed++;
    setProgress(10 + Math.floor((processed / pdfs.length) * 90));
  }

  setStatus('Images saved');
  setProgress(100);
});

document.getElementById('rotatePdf').addEventListener('click', async () => {
  const pdfs = queue.filter(f => f.type === 'application/pdf');
  if (!pdfs.length) {
    setStatus('No PDFs in queue');
    return;
  }

  const angle = prompt('Rotation angle (90, 180, 270):', '90');
  if (!['90', '180', '270'].includes(angle)) {
    setStatus('Invalid angle');
    return;
  }

  setStatus('Rotating PDF...');
  setProgress(10);

  for (const f of pdfs) {
    const bytes = await f.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(bytes);
    const pages = pdfDoc.getPages();
    
    pages.forEach(page => page.setRotation(PDFLib.degrees(parseInt(angle))));
    
    const output = await pdfDoc.save();
    saveAs(new Blob([output], { type: 'application/pdf' }), `rotated_${f.name}`);
  }

  setStatus('Rotation complete');
  setProgress(100);
});

document.getElementById('deletePdfPages').addEventListener('click', async () => {
  const pdfs = queue.filter(f => f.type === 'application/pdf');
  if (!pdfs.length) {
    setStatus('No PDFs in queue');
    return;
  }

  const pagesToDelete = prompt('Pages to delete (e.g., 1,3,5 or 2-4):', '');
  if (!pagesToDelete) return;

  setStatus('Deleting pages...');
  setProgress(10);

  for (const f of pdfs) {
    const bytes = await f.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(bytes);
    const totalPages = pdfDoc.getPageCount();
    
    const deleteIndices = [];
    pagesToDelete.split(',').forEach(range => {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end; i++) {
          if (i > 0 && i <= totalPages) deleteIndices.push(i - 1);
        }
      } else {
        const page = parseInt(range.trim());
        if (page > 0 && page <= totalPages) deleteIndices.push(page - 1);
      }
    });

    deleteIndices.sort((a, b) => b - a).forEach(index => {
      pdfDoc.removePage(index);
    });

    const output = await pdfDoc.save();
    saveAs(new Blob([output], { type: 'application/pdf' }), `edited_${f.name}`);
  }

  setStatus('Pages deleted');
  setProgress(100);
});

document.getElementById('reorderPdfPages').addEventListener('click', async () => {
  const pdfs = queue.filter(f => f.type === 'application/pdf');
  if (!pdfs.length) {
    setStatus('No PDFs in queue');
    return;
  }

  const newOrder = prompt('New page order (e.g., 3,1,2,4):', '');
  if (!newOrder) return;

  setStatus('Reordering pages...');
  setProgress(10);

  for (const f of pdfs) {
    const bytes = await f.arrayBuffer();
    const sourcePdf = await PDFLib.PDFDocument.load(bytes);
    const newPdf = await PDFLib.PDFDocument.create();
    
    const pageIndices = newOrder.split(',').map(n => parseInt(n.trim()) - 1);
    const pages = await newPdf.copyPages(sourcePdf, pageIndices);
    pages.forEach(page => newPdf.addPage(page));

    const output = await newPdf.save();
    saveAs(new Blob([output], { type: 'application/pdf' }), `reordered_${f.name}`);
  }

  setStatus('Pages reordered');
  setProgress(100);
});

// Image Tools
document.getElementById('convertImage').addEventListener('click', async () => {
  const imgs = queue.filter(f => f.type.startsWith('image/'));
  if (!imgs.length) {
    setStatus('No images in queue');
    return;
  }

  const format = prompt('Convert to format (png, jpg, webp):', 'png');
  if (!['png', 'jpg', 'webp'].includes(format)) {
    setStatus('Invalid format');
    return;
  }

  setStatus('Converting images...');
  setProgress(10);

  let processed = 0;

  for (const f of imgs) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    await new Promise(resolve => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
        canvas.toBlob(blob => {
          const ext = format === 'jpg' ? 'jpg' : format;
          const name = f.name.replace(/\.[^.]+$/, `.${ext}`);
          saveAs(blob, name);
          resolve();
        }, mimeType, 0.9);
      };
      img.src = URL.createObjectURL(f);
    });

    processed++;
    setProgress(10 + Math.floor((processed / imgs.length) * 90));
  }

  setStatus('Conversion complete');
  setProgress(100);
});

document.getElementById('extractText').addEventListener('click', async () => {
  const files = queue.filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
  if (!files.length) {
    setStatus('No images or PDFs in queue');
    return;
  }

  setStatus('Extracting text...');
  setProgress(10);

  let allText = '';
  let processed = 0;

  for (const f of files) {
    if (f.type.startsWith('image/')) {
      const result = await Tesseract.recognize(f, 'eng');
      allText += `--- ${f.name} ---\n${result.data.text}\n\n`;
    } else if (f.type === 'application/pdf') {
      const arr = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arr }).promise;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        allText += `--- ${f.name} Page ${i} ---\n${text}\n\n`;
      }
    }

    processed++;
    setProgress(10 + Math.floor((processed / files.length) * 90));
  }

  const blob = new Blob([allText], { type: 'text/plain' });
  saveAs(blob, 'extracted_text.txt');

  setStatus('Text extraction complete');
  setProgress(100);
});

// Video Tools
document.getElementById('convertVideo').addEventListener('click', async () => {
  const videos = queue.filter(f => f.type.startsWith('video/'));
  if (!videos.length) {
    setStatus('No videos in queue');
    return;
  }

  const format = prompt('Convert to format (mp4, webm, avi):', 'mp4');
  if (!['mp4', 'webm', 'avi'].includes(format)) {
    setStatus('Invalid format');
    return;
  }

  setStatus('Initializing video converter...');
  setProgress(5);

  const ffmpegInstance = await initFFmpeg();
  
  for (const f of videos) {
    setStatus(`Converting ${f.name}...`);
    
    const inputName = `input.${f.name.split('.').pop()}`;
    const outputName = `output.${format}`;
    
    await ffmpegInstance.writeFile(inputName, new Uint8Array(await f.arrayBuffer()));
    await ffmpegInstance.exec(['-i', inputName, outputName]);
    
    const data = await ffmpegInstance.readFile(outputName);
    const blob = new Blob([data.buffer], { type: `video/${format}` });
    saveAs(blob, f.name.replace(/\.[^.]+$/, `.${format}`));
    
    await ffmpegInstance.deleteFile(inputName);
    await ffmpegInstance.deleteFile(outputName);
  }

  setStatus('Video conversion complete');
  setProgress(100);
});

document.getElementById('trimVideo').addEventListener('click', async () => {
  const videos = queue.filter(f => f.type.startsWith('video/'));
  if (!videos.length) {
    setStatus('No videos in queue');
    return;
  }

  const startTime = prompt('Start time (HH:MM:SS or seconds):', '00:00:00');
  const duration = prompt('Duration (HH:MM:SS or seconds):', '00:00:10');
  
  if (!startTime || !duration) return;

  setStatus('Initializing video trimmer...');
  setProgress(5);

  const ffmpegInstance = await initFFmpeg();
  
  for (const f of videos) {
    setStatus(`Trimming ${f.name}...`);
    
    const inputName = `input.${f.name.split('.').pop()}`;
    const outputName = `trimmed.${f.name.split('.').pop()}`;
    
    await ffmpegInstance.writeFile(inputName, new Uint8Array(await f.arrayBuffer()));
    await ffmpegInstance.exec(['-i', inputName, '-ss', startTime, '-t', duration, '-c', 'copy', outputName]);
    
    const data = await ffmpegInstance.readFile(outputName);
    const blob = new Blob([data.buffer], { type: f.type });
    saveAs(blob, `trimmed_${f.name}`);
    
    await ffmpegInstance.deleteFile(inputName);
    await ffmpegInstance.deleteFile(outputName);
  }

  setStatus('Video trimming complete');
  setProgress(100);
});

// Archive Tools
document.getElementById('createZip').addEventListener('click', async () => {
  if (!queue.length) {
    setStatus('No files in queue');
    return;
  }

  setStatus('Creating ZIP...');
  setProgress(10);

  const zip = new JSZip();
  let processed = 0;

  for (const f of queue) {
    zip.file(f.name, f);
    processed++;
    setProgress(10 + Math.floor((processed / queue.length) * 80));
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'archive.zip');

  setStatus('ZIP created');
  setProgress(100);
});

document.getElementById('extractZip').addEventListener('click', async () => {
  const zipFiles = queue.filter(f => f.name.endsWith('.zip'));
  if (!zipFiles.length) {
    setStatus('No ZIP files in queue');
    return;
  }

  setStatus('Extracting ZIP...');
  setProgress(10);

  for (const f of zipFiles) {
    const zip = await JSZip.loadAsync(f);
    const files = Object.keys(zip.files);
    let processed = 0;

    for (const filename of files) {
      if (!zip.files[filename].dir) {
        const blob = await zip.files[filename].async('blob');
        saveAs(blob, filename);
      }
      processed++;
      setProgress(10 + Math.floor((processed / files.length) * 90));
    }
  }

  setStatus('ZIP extraction complete');
  setProgress(100);
});