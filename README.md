# ToolGhor - File Processing Tools

A comprehensive client-side file processing toolkit that runs entirely in your browser. No server uploads, complete privacy.

## Features

### PDF Tools
- **Merge PDFs** - Combine multiple PDF files into one
- **Images → PDF** - Convert images to PDF format
- **PDF → Images** - Extract pages as images
- **Rotate PDF** - Rotate pages by 90°, 180°, or 270°
- **Delete Pages** - Remove specific pages from PDFs
- **Reorder Pages** - Rearrange page order

### Image Tools
- **Format Converter** - Convert between PNG, JPG, and WebP
- **OCR Text Extraction** - Extract text from images and PDFs

### Video Tools
- **Format Converter** - Convert between MP4, WebM, and AVI
- **Video Trimmer** - Cut video segments by time

### Archive Tools
- **Create ZIP** - Bundle files into ZIP archives
- **Extract ZIP** - Unpack ZIP files

## Usage

1. **Upload Files**: Drag & drop or click to select files
2. **Choose Tool**: Select the appropriate tool for your task
3. **Process**: Files are processed locally in your browser
4. **Download**: Processed files download automatically

## Privacy & Security

- **100% Client-Side**: All processing happens in your browser
- **No Uploads**: Files never leave your device
- **No Storage**: Files aren't stored on any server
- **Open Source**: Full transparency of code

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Libraries Used

- **PDF-lib** - PDF manipulation
- **PDF.js** - PDF rendering
- **Tesseract.js** - OCR functionality
- **FFmpeg.wasm** - Video processing
- **JSZip** - Archive handling
- **FileSaver.js** - File downloads

## Development

Simply open `index.html` in a modern browser. No build process required.

## GitHub Pages Deployment

This project is designed to work seamlessly on GitHub Pages:

1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Access via `https://yourusername.github.io/ToolGhor`

## License

MIT License - Feel free to use and modify.