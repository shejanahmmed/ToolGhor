/**
 * End-to-end QA test for ToolGhor
 * Run: npx playwright test qa-test.mjs --project=chromium
 * Or: node qa-test.mjs (if using puppeteer)
 */

import { chromium } from 'playwright';
import { createWriteStream } from 'fs';
import path from 'path';

const BASE_URL = 'https://shejanahmmed.github.io/ToolGhor/';
const results = { passed: [], failed: [], partial: [], notes: [] };

function log(msg, type = 'info') {
  const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
  console.log(line);
  return line;
}

// Create minimal test files
async function createTestFiles(page) {
  // Minimal 1x1 PNG (base64)
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const jpgBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAPh//9k=';

  return {
    pngBlob: Buffer.from(pngBase64, 'base64'),
    jpgBlob: Buffer.from(jpgBase64, 'base64'),
  };
}

async function runQATests() {
  log('Starting ToolGhor QA pass...', 'info');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // Capture console errors
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      results.notes.push(`Console error: ${text}`);
    }
  });

  try {
    // 1. Load page
    log('1. Navigating to ' + BASE_URL);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 2. Verify main UI sections
    log('2. Verifying main UI sections...');
    const sections = ['Upload Files', 'PDF Tools', 'Image Tools', 'Video Tools', 'Archive Tools', 'Progress'];
    for (const sec of sections) {
      const found = await page.locator(`text=${sec}`).first().isVisible();
      if (found) results.passed.push(`Section visible: ${sec}`);
      else results.failed.push(`Section missing: ${sec}`);
    }

    // 3. Verify buttons
    const buttons = ['Merge PDFs', 'Images → PDF', 'PDF → Images', 'Rotate PDF', 'Delete Pages', 'Reorder Pages',
      'Convert Format', 'Extract Text (OCR)', 'Convert Video', 'Trim Video', 'Create ZIP', 'Extract ZIP'];
    for (const btn of buttons) {
      const found = await page.locator(`button:has-text("${btn}")`).first().isVisible().catch(() => false);
      if (found) results.passed.push(`Button visible: ${btn}`);
      else results.failed.push(`Button missing/not found: ${btn}`);
    }

    // 4. Click without files - should show validation
    log('4. Testing validation (no files)...');
    await page.click('button:has-text("Merge PDFs")');
    await page.waitForTimeout(500);
    const statusNoPdf = await page.locator('#status').textContent();
    if (statusNoPdf && statusNoPdf.includes('No PDF')) {
      results.passed.push('Merge PDFs validation: shows "No PDFs" when empty');
    } else {
      results.failed.push(`Merge PDFs validation: expected "No PDFs", got "${statusNoPdf}"`);
    }

    await page.click('button:has-text("Create ZIP")');
    await page.waitForTimeout(300);
    const statusNoFiles = await page.locator('#status').textContent();
    if (statusNoFiles && statusNoFiles.includes('No files')) {
      results.passed.push('Create ZIP validation: shows "No files" when empty');
    } else {
      results.failed.push(`Create ZIP validation: expected "No files", got "${statusNoFiles}"`);
    }

    // 5. Test file upload via drop zone
    log('5. Testing file upload...');
    const dropZone = page.locator('#drop');
    const fileInput = page.locator('#fileInput');

    // Create minimal test files
    const testPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const testPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF', 'utf8');

    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: testPng,
    });
    await page.waitForTimeout(500);

    const queueCount = await page.locator('#queueInfo').textContent();
    if (queueCount && queueCount.includes('1')) {
      results.passed.push('File upload: queue shows 1 file');
    } else {
      results.failed.push(`File upload: expected 1 file in queue, got "${queueCount}"`);
    }

    // 6. Test Images → PDF
    log('6. Testing Images → PDF...');
    await page.click('button:has-text("Images → PDF")');
    await page.waitForTimeout(3000);

    const [download1] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
      page.waitForTimeout(500),
    ]);
    if (download1) {
      const fn = await download1.suggestedFilename();
      results.passed.push(`Images → PDF: download triggered (${fn})`);
      await download1.path().catch(() => null);
    } else {
      const status = await page.locator('#status').textContent();
      results.partial.push(`Images → PDF: no download event (status: ${status})`);
    }

    // 7. Test Convert Format (PNG)
    log('7. Testing Image Convert Format...');
    await page.click('button:has-text("Convert Format")');
    await page.waitForTimeout(2000);
    const [download2] = await Promise.all([
      page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
      page.waitForTimeout(500),
    ]);
    if (download2) {
      results.passed.push('Image Convert Format: download triggered');
    } else {
      results.partial.push('Image Convert Format: no download event');
    }

    // 8. Test Create ZIP
    log('8. Testing Create ZIP...');
    await page.click('button:has-text("Create ZIP")');
    await page.waitForTimeout(2000);
    const [download3] = await Promise.all([
      page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
      page.waitForTimeout(500),
    ]);
    if (download3) {
      results.passed.push('Create ZIP: download triggered');
    } else {
      results.partial.push('Create ZIP: no download event');
    }

    // 9. Narrow viewport (mobile)
    log('9. Testing narrow viewport (375px)...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const mergeVisible = await page.locator('button:has-text("Merge PDFs")').first().isVisible();
    const dropVisible = await page.locator('#drop').isVisible();
    if (mergeVisible && dropVisible) {
      results.passed.push('Mobile viewport: main elements visible and accessible');
    } else {
      results.failed.push(`Mobile viewport: Merge button visible=${mergeVisible}, drop zone=${dropVisible}`);
    }

    // 10. Rotate PDF - needs prompt; add PDF first
    log('10. Adding PDF for Rotate test...');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.click('button:has-text("Clear")');
    await page.waitForTimeout(300);
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: testPdf,
    });
    await page.waitForTimeout(500);

    page.once('dialog', (d) => d.accept('90'));
    await page.click('button:has-text("Rotate PDF")');
    await page.waitForTimeout(2000);
    const [downloadRotate] = await Promise.all([
      page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
      page.waitForTimeout(500),
    ]);
    if (downloadRotate) {
      results.passed.push('Rotate PDF: download triggered');
    } else {
      results.partial.push('Rotate PDF: no download (may need valid PDF)');
    }

  } catch (err) {
    results.failed.push(`Test error: ${err.message}`);
    log('ERROR: ' + err.message, 'error');
  } finally {
    await browser.close();
  }

  return results;
}

runQATests().then((r) => {
  console.log('\n========== QA REPORT ==========');
  console.log('PASSED:', r.passed.length);
  r.passed.forEach((x) => console.log('  ✓', x));
  console.log('\nFAILED:', r.failed.length);
  r.failed.forEach((x) => console.log('  ✗', x));
  console.log('\nPARTIAL / UNVERIFIED:', r.partial.length);
  r.partial.forEach((x) => console.log('  ~', x));
  if (r.notes.length) {
    console.log('\nCONSOLE ERRORS:', r.notes.length);
    r.notes.forEach((x) => console.log('  !', x));
  }
  console.log('\n===============================');
  process.exit(r.failed.length > 0 ? 1 : 0);
}).catch((err) => {
  console.error('QA script failed:', err);
  process.exit(1);
});
