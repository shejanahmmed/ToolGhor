## ToolGhor — All‑in‑One File Utility Website

**Live demo**: `https://shejanahmmed.github.io/ToolGhor/`

ToolGhor is a fast, lightweight, and privacy‑focused file utility website built with plain HTML, CSS, and JavaScript.  
It runs entirely in the browser, so your files never leave your device and no data is uploaded to any server.

---

## ✨ Key Features

- **PDF tools**
  - **Merge PDFs**: Combine multiple PDF files into a single document.
  - **Images → PDF**: Convert one or more images into a PDF file (supports PNG, JPG, WebP, GIF, BMP via client‑side processing).
  - **PDF → Images**: Export every page of a PDF as individual PNG images.
  - **Rotate PDF**: Rotate all pages in a PDF by 90°, 180°, or 270°.
  - **Delete pages**: Remove specific pages or ranges (for example, `1,3,5` or `2-4`).
  - **Reorder pages**: Change the page order (for example, `3,1,2,4`).

- **Image tools**
  - **Convert format**: Convert images between PNG, JPG, and WebP.
  - **Extract text (OCR)**: Use Tesseract.js and pdf.js to extract text from images and PDFs.

- **Video tools**
  - **Convert video**: Change video format (MP4, WebM, AVI) using FFmpeg compiled to WebAssembly.
  - **Trim video**: Cut clips between a start and end time, fully in the browser.

- **Archive tools**
  - **Create ZIP**: Compress all queued files into a downloadable ZIP archive.
  - **Extract ZIP**: Extract files from ZIP archives (case‑insensitive `.zip` detection).

- **User experience**
  - **Drag‑and‑drop uploads** plus traditional file picker.
  - **Queue management** (add, remove, clear) with file type badges.
  - **Global progress bar** and status messages for long‑running tasks.
  - **Responsive layout** optimized for both desktop and mobile browsers.
  - **No login, no accounts, no tracking.**

---

## 🔒 Privacy & Security

- All processing happens **locally in your browser** using Web APIs and WebAssembly.  
- Files are **never uploaded** to any backend server or third party.  
- You can safely use ToolGhor with **sensitive PDFs, images, and videos** as long as you trust your own device.

> If you are building on top of ToolGhor, make sure any new features preserve this client‑side privacy guarantee.

---

## 🧰 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF processing**: `pdf-lib`, `pdfjs-dist`
- **File download helper**: `FileSaver.js`
- **OCR**: `Tesseract.js`
- **Video processing**: `@ffmpeg/ffmpeg` (WebAssembly build)
- **Archiving**: `JSZip`

All dependencies are loaded via CDN and run in the browser; there is no backend server.

---

## 🚀 Getting Started (Local Development)

You can run ToolGhor locally as a static website.

### 1. Clone the repository

```bash
git clone https://github.com/shejanahmmed/ToolGhor.git
cd ToolGhor
```

### 2. Open in your browser

You can either:

- Open `index.html` directly in your browser, **or**
- Serve the folder with a simple static server, for example:

```bash
# Using Python 3
python -m http.server 8000

# Then open in your browser:
# http://localhost:8000
```

> Using a local server is recommended for the best experience with some browser security settings.

---

## 🧪 Usage Overview

1. **Upload files**
   - Drag and drop files into the upload area, or click “choose files” and then “Add to queue”.
2. **Choose a tool**
   - Pick the appropriate tool under **PDF Tools**, **Image Tools**, **Video Tools**, or **Archive Tools**.
3. **Configure options (if needed)**
   - For example, select the output format, page ranges, or video start/end times.
4. **Run the tool**
   - Watch the **progress bar** and **status text** for feedback.
   - When finished, the browser will prompt you to **download** the resulting file(s).

---

## 📄 License

ToolGhor is open source and available under the **MIT License**.  
See the `LICENSE` file for full license text.

# ToolGhor — All in One File Utility Website

**Live Website:**  
👉 https://shejanahmmed.github.io/ToolGhor/

ToolGhor is a fast lightweight and privacy friendly file utility website built with HTML CSS and JavaScript. All processing happens inside the user’s browser so no files are uploaded to any server.

---

## ✨ Features
- Merge multiple PDF files into one  
- Convert images to PDF  
- Convert PDF to image  
- Drag and drop upload  
- Fully client side  
- Works on mobile and desktop  
- No login needed  

---

## 🔒 Privacy
ToolGhor is fully client side  
Your files never leave your device or get uploaded anywhere.

---

## 📁 Technologies Used
- HTML5  
- CSS3  
- Vanilla JavaScript  
- pdf-lib  
- pdfjs-dist  
- FileSaver.js  

---

## 📄 License
ToolGhor is open source and available under the MIT License. See the `LICENSE` file for details.

---

## 🚀 How to Run Locally
```bash
git clone https://github.com/shejanahmmed/ToolGhor.git
cd ToolGhor
open index.html
