// DOM elements
const fileInput = document.getElementById('fileInput');
const drop = document.getElementById('drop');
const fileList = document.getElementById('fileList');
const btnAdd = document.getElementById('btnAdd');
const clearQueue = document.getElementById('clearQueue');
const queueInfo = document.getElementById('queueInfo');
const statusText = document.getElementById('status');
const prog = document.getElementById('prog');
const searchInput = document.getElementById('searchInput');

let queue = [];
let ffmpeg = null;

// Tool definitions for search
const tools = [
  { id: 'mergePdf', name: 'Merge PDFs', keywords: ['merge', 'combine', 'join', 'pdf', 'unite'] },
  { id: 'imagesToPdf', name: 'Images to PDF', keywords: ['image', 'convert', 'pdf', 'img', 'picture', 'photo'] },
  { id: 'pdfToImages', name: 'PDF to Images', keywords: ['pdf', 'image', 'convert', 'extract', 'img', 'picture'] },
  { id: 'rotatePdf', name: 'Rotate PDF', keywords: ['rotate', 'turn', 'pdf', 'orientation'] },
  { id: 'deletePdfPages', name: 'Delete Pages', keywords: ['delete', 'remove', 'pdf', 'pages', 'page'] },
  { id: 'reorderPdfPages', name: 'Reorder Pages', keywords: ['reorder', 'rearrange', 'pdf', 'pages', 'sort'] },
  { id: 'convertImage', name: 'Convert Format', keywords: ['convert', 'image', 'format', 'png', 'jpg', 'webp'] },
  { id: 'extractText', name: 'Extract Text (OCR)', keywords: ['extract', 'text', 'ocr', 'read', 'scan'] },
  { id: 'convertVideo', name: 'Convert Video', keywords: ['convert', 'video', 'format', 'mp4', 'webm', 'avi'] },
  { id: 'trimVideo', name: 'Trim Video', keywords: ['trim', 'cut', 'video', 'clip', 'edit'] },
  { id: 'createZip', name: 'Create ZIP', keywords: ['create', 'zip', 'archive', 'compress'] },
  { id: 'extractZip', name: 'Extract ZIP', keywords: ['extract', 'unzip', 'decompress', 'archive'] }
];

// Fuzzy search function
function fuzzyMatch(query, text) {
  query = query.toLowerCase();
  text = text.toLowerCase();
  
  let queryIndex = 0;
  let textIndex = 0;
  
  while (queryIndex < query.length && textIndex < text.length) {
    if (query[queryIndex] === text[textIndex]) {
      queryIndex++;
    }
    textIndex++;
  }
  
  return queryIndex === query.length;
}

// Search tools function
function searchTools(query) {
  if (!query.trim()) return tools;
  
  return tools.filter(tool => {
    const searchText = [tool.name, ...tool.keywords].join(' ');
    return fuzzyMatch(query, searchText) || searchText.includes(query.toLowerCase());
  });
}

// Filter tools display
function filterTools(matchedTools) {
  const sections = document.querySelectorAll('h3');
  const actionsDivs = document.querySelectorAll('.actions');
  const matchedIds = new Set(matchedTools.map(t => t.id));

  // Hide all sections and actions initially
  sections.forEach(s => {
    if (['PDF Tools', 'Image Tools', 'Video Tools', 'Archive Tools'].includes(s.textContent)) {
      s.style.display = 'none';
    }
  });
  actionsDivs.forEach(a => a.style.display = 'none');

  // Hide all buttons and specialized containers
  document.querySelectorAll('.actions > button, .tool-group, .video-trim-section').forEach(el => {
    el.style.display = 'none';
  });

  matchedTools.forEach(tool => {
    const btn = document.getElementById(tool.id);
    if (btn) {
      // Show the button or its container
      let container = btn.closest('.tool-group') || btn.closest('.video-trim-section') || btn;
      
      if (container.classList.contains('video-trim-section')) {
        container.style.display = 'flex';
      } else if (container.classList.contains('tool-group')) {
        container.style.display = 'flex';
      } else {
        container.style.display = 'inline-block';
      }

      // Show the actions div and h3
      const actions = btn.closest('.actions');
      if (actions) {
        actions.style.display = 'flex';
        const section = actions.previousElementSibling;
        if (section && section.tagName === 'H3') {
          section.style.display = 'block';
        }
      }
    }
  });
}

// Search input handler
searchInput.addEventListener('input', (e) => {
  const query = e.target.value;
  const matchedTools = searchTools(query);
  filterTools(matchedTools);
});

// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
});

// Mobile search toggle
const searchIcon = document.getElementById('searchIcon');

searchIcon.addEventListener('click', () => {
  searchInput.classList.toggle('active');
  if (searchInput.classList.contains('active')) {
    searchInput.focus();
  }
});

// Close search on blur
searchInput.addEventListener('blur', () => {
  if (!searchInput.value) {
    searchInput.classList.remove('active');
  }
});

// Animate loading percentage
let percent = 0;
const percentElement = document.querySelector('.loading-percent');
const percentInterval = setInterval(() => {
  percent += 5;
  if (percentElement) percentElement.textContent = percent + '%';
  if (percent >= 100) clearInterval(percentInterval);
}, 100);

// Initialize search on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  filterTools(tools); // Show all tools initially
  
  // Set PDF.js worker source to match the version in index.html
  if (typeof pdfjsLib !== 'undefined') {
    console.log('pdfjsLib found');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  } else {
    console.error('pdfjsLib NOT found');
  }
});

// Initialize FFmpeg
async function initFFmpeg() {
  if (typeof FFmpegWASM === 'undefined') {
    throw new Error('FFmpeg library not loaded. Please check your internet connection and refresh.');
  }
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
drop.addEventListener('click', () => fileInput.click());
clearQueue.addEventListener('click', () => {
  queue = [];
  renderQueue();
  statusText.textContent = 'Queue cleared';
  prog.style.width = '0%';
});

// UI helpers
function setProgress(p) { prog.style.width = `${p}%`; }
function setStatus(t) { statusText.textContent = t; }

// Canvas helpers
function canvasToBlob(canvas, mimeType = 'image/png', quality) {
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), mimeType, quality);
  });
}

async function imageFileToPngBlob(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, 'image/png');
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

// PDF Tools
document.getElementById('mergePdf').addEventListener('click', async () => {
  try {
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
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
});

document.getElementById('imagesToPdf').addEventListener('click', async () => {
  try {
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
      let embeddedImage;

      if (f.type === 'image/png' || f.type === 'image/jpeg') {
        const arr = await f.arrayBuffer();
        embeddedImage = f.type === 'image/png'
          ? await pdfDoc.embedPng(arr)
          : await pdfDoc.embedJpg(arr);
      } else {
        // Fallback for formats like WebP, GIF, BMP: rasterize to PNG via canvas first
        const pngBlob = await imageFileToPngBlob(f);
        const pngBuffer = await pngBlob.arrayBuffer();
        embeddedImage = await pdfDoc.embedPng(pngBuffer);
      }

      const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
      page.drawImage(embeddedImage, { x: 0, y: 0, width: embeddedImage.width, height: embeddedImage.height });

      processed++;
      setProgress(5 + Math.floor((processed / imgs.length) * 90));
    }

    const out = await pdfDoc.save();
    saveAs(new Blob([out], { type: 'application/pdf' }), 'images.pdf');

    setStatus('Conversion complete');
    setProgress(100);
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
});

document.getElementById('pdfToImages').addEventListener('click', async () => {
  console.log('PDF to Images clicked');
  try {
    const pdfs = queue.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (!pdfs.length) {
      setStatus('No PDFs in queue');
      return;
    }

    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF conversion engine not loaded. Please wait or refresh.');
    }

    setStatus('Preparing PDF documents...');
    setProgress(5);

    const zip = new JSZip();
    let totalPagesProcessed = 0;
    
    // First, calculate total pages for progress bar
    let totalPossiblePages = 0;
    for (const f of pdfs) {
      const arr = new Uint8Array(await f.arrayBuffer());
      // disableWorker: true is essential for direct file:// protocol use!
      const pdf = await pdfjsLib.getDocument({ data: arr, disableWorker: true }).promise;
      totalPossiblePages += pdf.numPages;
      await pdf.destroy();
    }

    setStatus('Converting PDF to images...');
    for (const f of pdfs) {
      const arr = new Uint8Array(await f.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: arr, disableWorker: true }).promise;
      const baseName = f.name.replace(/\.pdf$/i, '');
      const folder = pdfs.length > 1 ? zip.folder(baseName) : zip;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        // More robust blob conversion
        const blob = await new Promise((resolve) => {
          if (canvas.toBlob) {
            canvas.toBlob(resolve, 'image/png');
          } else {
            // Fallback for very old/specific environments
            const dataUrl = canvas.toDataURL('image/png');
            const binStr = atob(dataUrl.split(',')[1]);
            const len = binStr.length;
            const arr = new Uint8Array(len);
            for (let i = 0; i < len; i++) arr[i] = binStr.charCodeAt(i);
            resolve(new Blob([arr], { type: 'image/png' }));
          }
        });

        folder.file(`${baseName}_page${pageNumber}.png`, blob);

        totalPagesProcessed++;
        setProgress(10 + Math.floor((totalPagesProcessed / totalPossiblePages) * 80));
        setStatus(`Processing ${f.name} - Page ${pageNumber}/${pdf.numPages}`);
      }
      await pdf.destroy();
    }

    setStatus('Generating ZIP archive...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'pdf_images.zip');

    setStatus('Images saved to ZIP');
    setProgress(100);
  } catch (err) {
    console.error('PDF to Image Error:', err);
    setStatus(`Error: ${err.message}`);
    setProgress(0);
  }
});

document.getElementById('rotatePdf').addEventListener('click', async () => {
  try {
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
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
});

document.getElementById('deletePdfPages').addEventListener('click', async () => {
  try {
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
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
});

document.getElementById('reorderPdfPages').addEventListener('click', async () => {
  try {
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

      const totalPages = sourcePdf.getPageCount();
      const rawOrder = newOrder.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !Number.isNaN(n));

      // Validate page order for this PDF
      if (!rawOrder.length) {
        setStatus(`Invalid page order for ${f.name}`);
        continue;
      }

      const invalidPage = rawOrder.some(n => n < 1 || n > totalPages);
      const hasDuplicates = new Set(rawOrder).size !== rawOrder.length;

      if (invalidPage || hasDuplicates) {
        setStatus(`Invalid page order for ${f.name}`);
        continue;
      }

      const pageIndices = rawOrder.map(n => n - 1);
      const pages = await newPdf.copyPages(sourcePdf, pageIndices);
      pages.forEach(page => newPdf.addPage(page));

      const output = await newPdf.save();
      saveAs(new Blob([output], { type: 'application/pdf' }), `reordered_${f.name}`);
    }

    setStatus('Pages reordered');
    setProgress(100);
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
});

// Image Tools
document.getElementById('convertImage').addEventListener('click', async () => {
  try {
    const imgs = queue.filter(f => f.type.startsWith('image/'));
    if (!imgs.length) {
      setStatus('No images in queue');
      return;
    }

    const format = document.getElementById('imageFormat').value;

    setStatus('Converting images...');
    setProgress(10);

    let processed = 0;

    for (const f of imgs) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const url = URL.createObjectURL(f);

      await new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
          const quality = format === 'jpg' ? 0.9 : undefined;
          
          canvas.toBlob(blob => {
            URL.revokeObjectURL(url);
            const name = f.name.replace(/\.[^.]+$/, `.${format}`);
            saveAs(blob, name);
            resolve();
          }, mimeType, quality);
        };
        img.onerror = (err) => {
          URL.revokeObjectURL(url);
          reject(err);
        };
        img.src = url;
      });

      processed++;
      setProgress(10 + Math.floor((processed / imgs.length) * 90));
    }

    setStatus('Conversion complete');
    setProgress(100);
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
});

document.getElementById('extractText').addEventListener('click', async () => {
  try {
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
      } else if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
        const arr = new Uint8Array(await f.arrayBuffer());
        if (typeof pdfjsLib === 'undefined') throw new Error('PDF engine not ready');
        const pdf = await pdfjsLib.getDocument({ data: arr, disableWorker: true }).promise;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          let text = textContent.items.map(item => item.str).join(' ').trim();
          
          // Fallback to OCR if no text layer found (scanned PDF)
          if (text.length < 10) {
            setStatus(`Performing OCR on ${f.name} page ${i}...`);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport }).promise;
            
            const result = await Tesseract.recognize(canvas, 'eng');
            text = result.data.text;
          }
          
          allText += `--- ${f.name} Page ${i} ---\n${text}\n\n`;
          setProgress(10 + Math.floor(((processed + (i / pdf.numPages)) / files.length) * 90));
        }
        await pdf.destroy();
      }

      processed++;
      setProgress(10 + Math.floor((processed / files.length) * 90));
    }

    const blob = new Blob([allText], { type: 'text/plain' });
    saveAs(blob, 'extracted_text.txt');

    setStatus('Text extraction complete');
    setProgress(100);
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
});

// Video Tools
document.getElementById('convertVideo').addEventListener('click', async () => {
  try {
    const videos = queue.filter(f => f.type.startsWith('video/'));
    if (!videos.length) {
      setStatus('No videos in queue');
      return;
    }

    const format = document.getElementById('videoFormat').value;

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
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
});

function timeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

document.getElementById('trimVideo').addEventListener('click', async () => {
  try {
    const videos = queue.filter(f => f.type.startsWith('video/'));
    if (!videos.length) {
      setStatus('No videos in queue');
      return;
    }

    const startTimeStr = document.getElementById('startTime').value;
    const endTimeStr = document.getElementById('endTime').value;
    
    if (!startTimeStr || !endTimeStr) {
      setStatus('Please set start and end times');
      return;
    }
    
    const startSeconds = timeToSeconds(startTimeStr);
    const endSeconds = timeToSeconds(endTimeStr);
    const duration = endSeconds - startSeconds;
    
    if (duration <= 0 || isNaN(duration)) {
      setStatus('End time must be after start time');
      return;
    }

    setStatus('Initializing video trimmer...');
    setProgress(5);

    const ffmpegInstance = await initFFmpeg();
    
    for (const f of videos) {
      setStatus(`Trimming ${f.name}...`);
      
      const inputName = `input.${f.name.split('.').pop()}`;
      const outputName = `trimmed.${f.name.split('.').pop()}`;
      
      await ffmpegInstance.writeFile(inputName, new Uint8Array(await f.arrayBuffer()));
      await ffmpegInstance.exec(['-i', inputName, '-ss', startTimeStr, '-t', duration.toString(), '-c', 'copy', outputName]);
      
      const data = await ffmpegInstance.readFile(outputName);
      const blob = new Blob([data.buffer], { type: f.type });
      saveAs(blob, `trimmed_${f.name}`);
      
      await ffmpegInstance.deleteFile(inputName);
      await ffmpegInstance.deleteFile(outputName);
    }

    setStatus('Video trimming complete');
    setProgress(100);
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
});

// Archive Tools
document.getElementById('createZip').addEventListener('click', async () => {
  try {
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
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
});

document.getElementById('extractZip').addEventListener('click', async () => {
  try {
    const zipFiles = queue.filter(f => /\.zip$/i.test(f.name));
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
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  }
});