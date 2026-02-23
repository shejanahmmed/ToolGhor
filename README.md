# 🛠️ ToolGhor — All-in-One Privacy-First File Utility

[![License: MIT](https://img.shields.io/badge/License-MIT-white.svg)](https://opensource.org/licenses/MIT)
![Vanilla JS](https://img.shields.io/badge/Made%20with-Vanilla%20JS-F7DF1E.svg)
![Client-Side](https://img.shields.io/badge/Processing-100%25%20Client--Side-brightgreen.svg)

**ToolGhor** is a lightweight, high-performance file utility suite designed with a "Privacy First" philosophy. It allows users to manipulate PDFs, images, and videos entirely within their own browser. No files are ever uploaded to a server, ensuring your sensitive data remains on your device.

**Live Demo**: [https://shejanahmmed.github.io/ToolGhor/](https://shejanahmmed.github.io/ToolGhor/)

---

## ✨ Key Features

### 📄 PDF Mastery
- **Merge & Combine**: Seamlessly join multiple PDFs into a single document.
- **PDF to Images**: Convert PDF pages into high-quality PNGs, automatically bundled into a ZIP archive.
- **Images to PDF**: Create PDF documents from various image formats (PNG, JPG, WebP, etc.).
- **Page Management**: Reorder pages, delete specific ranges, or rotate documents by 90/180/270 degrees.

### 🖼️ Image & OCR Tools
- **Smart OCR**: Extract text from images and PDFs using Tesseract.js. Features an intelligent fallback for **scanned PDFs** without a text layer.
- **Universal Converter**: Convert between PNG, JPG, and WebP formats with optimized quality.

### 🎬 Video Processing (WebAssembly)
- **Format Conversion**: Change video formats (MP4, WebM, AVI) locally using FFmpeg WASM.
- **Precision Trimming**: Cut video clips with millisecond precision directly in your browser.

### 📦 Archive Management
- **ZIP Creation**: Compress multiple queued files into a single archive.
- **ZIP Extraction**: Unpack archives and download individual contents instantly.

---

## 🔒 Privacy & Security

Most online file tools require you to upload your documents to their servers. **ToolGhor changes that.**
- **Zero Uploads**: All processing happens in your browser's RAM via Web Workers and WebAssembly.
- **Secure by Design**: Ideal for sensitive documents, contracts, and private media.
- **No Tracking**: No accounts, no cookies, no telemetry.

---

## 🚀 Tech Stack

ToolGhor leverages the power of modern Web APIs and specialized libraries:
- **Core**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **PDF Logic**: [pdf-lib](https://pdf-lib.js.org/) & [pdf.js](https://mozilla.github.io/pdf.js/)
- **Video Engine**: [@ffmpeg/ffmpeg](https://ffmpegwasm.netlify.app/) (WebAssembly)
- **OCR Engine**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Compression**: [JSZip](https://stuk.github.io/jszip/)
- **UX**: Fuzzy search algorithm for tool discovery, Drag-and-Drop API, and Object URL memory management.

---

## 🛠️ Local Development

ToolGhor is a static web application. You can run it locally without any complex build steps.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shejanahmmed/ToolGhor.git
   cd ToolGhor
   ```

2. **Serve the files**:
   Since the app uses WebAssembly (FFmpeg), it is recommended to use a local server to handle COOP/COEP headers correctly:
   ```bash
   # Using Python
   python -m http.server 8000
   ```
   *Then open `http://localhost:8000` in your browser.*

---

## 📖 Usage Guide

1. **Add Files**: Drag and drop files into the dashboard or use the "Choose Files" button.
2. **Search**: Use the search bar (top right) to quickly find the tool you need (e.g., type "merge" or "ocr").
3. **Configure**: Set your parameters (rotation angle, output format, or trim timestamps).
4. **Execute**: Click the tool button and monitor the real-time progress bar.
5. **Download**: Once processed, your file will download automatically.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to fork, modify, and use it for your own projects.

---

### 🌟 Credits
Created by [Shejan Ahmmed](https://github.com/shejanahmmed). If you find this tool useful, please consider giving the repository a star!
