import { AIProject, ComplianceScore, AutoAssessmentDetails, ZeroAssumptionAudit, DocumentAsset } from '../data/sampleProjects';
import { recordAuditEvent } from './auditService';
import { UserSession } from '../data/authTypes';

export interface FullDocumentSection {
  pageNumber: number;
  sectionTitle: string;
  statutoryReference: string;
  content: string;
  keyHighlights: string[];
}

// Initial repository of OCR texts for preloaded documents
export const MASTER_MOCK_OCR_TEXTS: Record<string, string> = {
  'doc-1-1': 'COCOBOD / MoCD Technical Specifications & Geospatial Addressing Model. Deploys custom Convolutional Neural Networks (CNN) and satellite positioning backbones. Offline storage enabled via TensorFlow Lite. Supported locations: all 16 administrative regions including Greater Accra and Western North. Hardware infrastructure meets low-bandwidth rural requirements.',
  'doc-onboard-1-2': 'First-Timer / Onboarder Full Compliance Dossier for GhanaPostGPS (GN-AI-2026-001). Uploaded by Kwame Mensah (Onboarding Officer, k.mensah@mocd.gov.gh). Comprehensive Ghana AI Ethics Framework & Act 843 Data Protection Audit. Fairness indicators checked across Ashanti, Northern, and Western regions. Gender and demographic bias balanced. Socio-economic accessibility channels (USSD *920# and local Twi/Ga/Ewe voice alerts) active. Personal Identifiable Information (PII) encrypted using SHA-256 according to Act 843 with certified DPO oversight.',
  'doc-2-1': 'National Identification Authority Biometric Security Protocol & Architecture. OWASP Top 10 vulnerabilities cleared. Enforces Hardware Security Modules (HSM) with ephemeral salted SHA-256 hashes for fingerprint matching. Sovereign hosting inside National Data Centre in Accra compliant with Act 843.',
  'doc-onboard-2-2': 'First-Timer / Onboarder Submission: NIA AFIS Model Card & Institutional AI Readiness Charter (GN-AI-2026-002). Uploaded by Abena Ofori (a.ofori@nia.gov.gh). Neural network facial and fingerprint recognition thresholds calibrated at 99.8% parity across demographic groups. Steering committee established with dedicated AI Engineers, Data Custodians, and System Administrators. Full Act 843 DPC Class-1 biometric certification and TLS 1.3 / HSM security verified.',
  'doc-3-1': 'Cocoa Management System (COCOBOD CMS) Farming Data Provenance & Inclusivity Charter. 1.2M farmer consent sheets catalogued. Steering committee instituted with MoFA and COCOBOD leadership. Multi-region satellite boundary verification arbitrated with local traditional authorities.',
  'doc-onboard-3-2': 'First-Timer / Onboarder Submission: COCOBOD Data Protection Commission (DPC) Filing & Multi-Region Fairness Audit (GN-AI-2026-003). Uploaded by Yaw Boateng (y.boateng@cocobod.gov.gh). Evaluates satellite yield prediction models across Western North, Ashanti, Bono, and Eastern cocoa districts. USSD offline farmer verification active. PII anonymized at ingestion under Ghana Data Protection Act 843.',
  'doc-4-1': 'National E-Justice Court Tracking Registry Legal Ethics & AI Audit. Whisper NLP models fine-tuned on Ghanaian court audio (English, Twi, Ga, Ewe). Model Card published detailing accuracy thresholds and error boundaries. Data Protection Commission (DPC) registration active with certified DPO.',
  'doc-5-1': 'NHIA Claims Biometric & AI Validation Engine Security Specs & Model Governance. Supervised XGBoost & OCR pipeline with SHAP explainability summaries generated for automated medical claims audits. Enforces TLS 1.3 encryption, RBAC role bindings, and zero external cross-border data replication.'
};

const OCR_STORAGE_KEY = 'gnaprms_ocr_texts_v1';
const FULL_DOC_STORAGE_KEY = 'gnaprms_full_docs_v1';
const FILE_DATA_URL_STORAGE_KEY = 'gnaprms_doc_dataurls_v1';
const IDB_DB_NAME = 'gnaprms_real_uploaded_files_db_v1';
const IDB_STORE_NAME = 'uploaded_files';

export interface StoredRealUploadedFile {
  docId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  dataUrl: string;
  extractedText: string;
  uploadedAt: string;
  blob?: Blob;
}

// In-memory cache of real uploaded files + generated Blob URLs for instant synchronous access
const REAL_FILES_MEMORY: Record<string, StoredRealUploadedFile> = {};
const BLOB_URL_CACHE: Record<string, string> = {};
const HYDRATION_LISTENERS: Set<() => void> = new Set();

export function onRealFilesHydrated(listener: () => void): () => void {
  HYDRATION_LISTENERS.add(listener);
  return () => {
    HYDRATION_LISTENERS.delete(listener);
  };
}

function notifyHydrationListeners(): void {
  HYDRATION_LISTENERS.forEach(fn => {
    try {
      fn();
    } catch {
      // ignore listener errors
    }
  });
}

function dataUrlToBlob(dataUrl: string, fallbackMime = 'application/octet-stream'): Blob | undefined {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return undefined;
    const header = parts[0];
    const base64 = parts.slice(1).join(',');
    const mimeMatch = header.match(/data:([^;]+);/);
    const mime = mimeMatch ? mimeMatch[1] : fallbackMime;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  } catch {
    return undefined;
  }
}

function openRealFilesIdb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise(resolve => {
    try {
      const req = window.indexedDB.open(IDB_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.createObjectStore(IDB_STORE_NAME, { keyPath: 'docId' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveRealFileToIdb(record: StoredRealUploadedFile): Promise<void> {
  const db = await openRealFilesIdb();
  if (!db) return;
  return new Promise(resolve => {
    try {
      const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(IDB_STORE_NAME);
      store.put({
        docId: record.docId,
        fileName: record.fileName,
        mimeType: record.mimeType,
        fileSize: record.fileSize,
        dataUrl: record.dataUrl,
        extractedText: record.extractedText,
        uploadedAt: record.uploadedAt
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function hydrateAllRealFilesFromIdb(): Promise<void> {
  const db = await openRealFilesIdb();
  if (!db) return;
  try {
    const tx = db.transaction(IDB_STORE_NAME, 'readonly');
    const store = tx.objectStore(IDB_STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const items = (req.result || []) as StoredRealUploadedFile[];
      let updated = false;
      for (const item of items) {
        if (item && item.docId && !REAL_FILES_MEMORY[item.docId]) {
          const blob = item.dataUrl ? dataUrlToBlob(item.dataUrl, item.mimeType) : undefined;
          REAL_FILES_MEMORY[item.docId] = { ...item, blob };
          if (blob && typeof URL !== 'undefined' && URL.createObjectURL) {
            BLOB_URL_CACHE[item.docId] = URL.createObjectURL(blob);
          }
          updated = true;
        }
      }
      if (updated) {
        notifyHydrationListeners();
      }
    };
  } catch {
    // ignore IDB read errors
  }
}

// Trigger background hydration from IndexedDB on load
if (typeof window !== 'undefined') {
  hydrateAllRealFilesFromIdb();
}

/**
 * Extracts real readable text from a .docx Word file (ZIP archive containing word/document.xml)
 */
async function extractTextFromDocxBuffer(buffer: ArrayBuffer): Promise<string> {
  try {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    let offset = 0;

    while (offset + 30 < bytes.length) {
      const sig = view.getUint32(offset, true);
      if (sig !== 0x04034b50) {
        offset++;
        continue;
      }
      const compressionMethod = view.getUint16(offset + 8, true);
      const compressedSize = view.getUint32(offset + 18, true);
      const fileNameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);
      const nameBytes = bytes.subarray(offset + 30, offset + 30 + fileNameLen);
      const entryName = new TextDecoder('utf-8').decode(nameBytes);
      const dataStart = offset + 30 + fileNameLen + extraLen;

      if (entryName === 'word/document.xml') {
        const compressedSlice = bytes.subarray(dataStart, dataStart + compressedSize);
        let xmlString = '';

        if (compressionMethod === 0) {
          xmlString = new TextDecoder('utf-8').decode(compressedSlice);
        } else if (compressionMethod === 8 && typeof DecompressionStream !== 'undefined') {
          const ds = new DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          writer.write(compressedSlice);
          writer.close();
          const decompressedBuf = await new Response(ds.readable).arrayBuffer();
          xmlString = new TextDecoder('utf-8').decode(decompressedBuf);
        }

        if (xmlString) {
          const withBreaks = xmlString
            .replace(/<\/w:p>/g, '\n')
            .replace(/<w:tab\/>/g, '\t')
            .replace(/<w:br[^/>]*\/>/g, '\n');
          const textMatches = withBreaks.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>|\n|\t/g);
          if (textMatches) {
            const plain = textMatches
              .map(token => {
                if (token === '\n' || token === '\t') return token;
                return token
                  .replace(/<[^>]+>/g, '')
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&apos;/g, "'");
              })
              .join('')
              .replace(/\n{3,}/g, '\n\n')
              .trim();
            if (plain.length > 0) return plain;
          }
        }
        break;
      }
      offset = dataStart + (compressedSize > 0 ? compressedSize : 1);
    }
  } catch {
    // Ignore DOCX decompression errors
  }
  return '';
}

/**
 * Extracts readable text operators from a PDF ArrayBuffer if present (while the exact PDF binary is rendered natively in iframe)
 */
async function extractTextFromPdfBuffer(buffer: ArrayBuffer): Promise<string> {
  try {
    const rawLatin1 = new TextDecoder('latin1').decode(buffer);
    const extractedChunks: string[] = [];

    // 1. Check uncompressed text blocks
    const tjRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj/g;
    let m: RegExpExecArray | null;
    while ((m = tjRegex.exec(rawLatin1)) !== null) {
      const cleaned = m[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');
      if (/[a-zA-Z0-9]{2,}/.test(cleaned)) {
        extractedChunks.push(cleaned);
      }
    }

    // 2. Also try decompressing FlateDecode streams if DecompressionStream is available
    if (extractedChunks.length < 10 && typeof DecompressionStream !== 'undefined') {
      const bytes = new Uint8Array(buffer);
      const streamMarker = new TextEncoder().encode('stream');
      const endMarker = new TextEncoder().encode('endstream');
      let pos = 0;
      let streamCount = 0;

      const findSeq = (arr: Uint8Array, seq: Uint8Array, from: number) => {
        outer: for (let i = from; i <= arr.length - seq.length; i++) {
          for (let j = 0; j < seq.length; j++) {
            if (arr[i + j] !== seq[j]) continue outer;
          }
          return i;
        }
        return -1;
      };

      while (pos < bytes.length && streamCount < 25) {
        const sIdx = findSeq(bytes, streamMarker, pos);
        if (sIdx === -1) break;
        let dataStart = sIdx + streamMarker.length;
        if (bytes[dataStart] === 0x0d && bytes[dataStart + 1] === 0x0a) dataStart += 2;
        else if (bytes[dataStart] === 0x0a || bytes[dataStart] === 0x0d) dataStart += 1;

        const eIdx = findSeq(bytes, endMarker, dataStart);
        if (eIdx === -1) break;
        pos = eIdx + endMarker.length;
        streamCount++;

        const slice = bytes.subarray(dataStart, eIdx);
        if (slice.length > 10 && slice.length < 500000) {
          try {
            const ds = new DecompressionStream('deflate');
            const writer = ds.writable.getWriter();
            writer.write(slice);
            writer.close();
            const decompressed = await new Response(ds.readable).arrayBuffer();
            const textStream = new TextDecoder('latin1').decode(decompressed);
            let sm: RegExpExecArray | null;
            const localTj = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj|\[([\s\S]*?)\]\s*TJ/g;
            while ((sm = localTj.exec(textStream)) !== null) {
              const rawPart = sm[1] || (sm[2] ? Array.from(sm[2].matchAll(/\(([^()\\]*(?:\\.[^()\\]*)*)\)/g)).map(x => x[1]).join('') : '');
              const cl = rawPart
                .replace(/\\n/g, '\n')
                .replace(/\\\(/g, '(')
                .replace(/\\\)/g, ')');
              if (/[a-zA-Z0-9]{2,}/.test(cl)) {
                extractedChunks.push(cl);
              }
            }
          } catch {
            // Not a zlib stream or failed decompression
          }
        }
      }
    }

    const joined = extractedChunks.join(' ').replace(/\s+/g, ' ').trim();
    return joined.length > 20 ? joined : '';
  } catch {
    return '';
  }
}

/**
 * Reads an uploaded File completely (DataURL + ArrayBuffer + real text extraction for TXT/DOCX/PDF)
 * and persists the real file in memory, IndexedDB, and localStorage so downloading or reviewing it
 * ALWAYS returns the exact document uploaded by the First-Timer / Onboarder.
 */
export async function readAndStoreRealUploadedFile(
  file: File,
  docId: string
): Promise<{
  dataUrl: string;
  extractedText: string;
  mimeType: string;
  blobUrl: string;
}> {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const mimeType =
    file.type ||
    (ext === 'pdf'
      ? 'application/pdf'
      : ext === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : ext === 'doc'
      ? 'application/msword'
      : ext === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/plain');

  const [dataUrl, arrayBuffer] = await Promise.all([
    new Promise<string>(resolve => {
      if (typeof FileReader === 'undefined') {
        resolve('');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    }),
    new Promise<ArrayBuffer>(resolve => {
      if (typeof file.arrayBuffer === 'function') {
        file.arrayBuffer().then(resolve).catch(() => resolve(new ArrayBuffer(0)));
        return;
      }
      if (typeof FileReader === 'undefined') {
        resolve(new ArrayBuffer(0));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result instanceof ArrayBuffer ? reader.result : new ArrayBuffer(0));
      reader.onerror = () => resolve(new ArrayBuffer(0));
      reader.readAsArrayBuffer(file);
    })
  ]);

  let extractedText = '';
  const isPlainTextExt = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'htm', 'log', 'yml', 'yaml'].includes(ext) || mimeType.startsWith('text/');

  if (isPlainTextExt && arrayBuffer.byteLength > 0) {
    extractedText = new TextDecoder('utf-8').decode(arrayBuffer);
  } else if (ext === 'docx' && arrayBuffer.byteLength > 0) {
    extractedText = await extractTextFromDocxBuffer(arrayBuffer);
  } else if (ext === 'pdf' && arrayBuffer.byteLength > 0) {
    extractedText = await extractTextFromPdfBuffer(arrayBuffer);
  } else if (arrayBuffer.byteLength > 0) {
    const rawCandidate = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
    if (!rawCandidate.includes('\u0000') && rawCandidate.trim().length > 0) {
      extractedText = rawCandidate;
    }
  }

  const blob = arrayBuffer.byteLength > 0 ? new Blob([arrayBuffer], { type: mimeType }) : dataUrlToBlob(dataUrl, mimeType);
  let blobUrl = '';
  if (blob && typeof URL !== 'undefined' && URL.createObjectURL) {
    blobUrl = URL.createObjectURL(blob);
    BLOB_URL_CACHE[docId] = blobUrl;
  }

  const record: StoredRealUploadedFile = {
    docId,
    fileName: file.name,
    mimeType,
    fileSize: file.size,
    dataUrl,
    extractedText,
    uploadedAt: new Date().toISOString(),
    blob
  };

  REAL_FILES_MEMORY[docId] = record;

  // Save in IndexedDB (handles large PDFs / DOCX files with no 5MB localStorage ceiling)
  await saveRealFileToIdb(record);

  // Also register in localStorage when within quota
  registerUploadedFullDocument(docId, extractedText, dataUrl);
  notifyHydrationListeners();

  return {
    dataUrl,
    extractedText,
    mimeType,
    blobUrl: blobUrl || dataUrl
  };
}

function getStoredOcrTexts(): Record<string, string> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return MASTER_MOCK_OCR_TEXTS;
  }
  try {
    const raw = localStorage.getItem(OCR_STORAGE_KEY);
    if (raw) {
      return { ...MASTER_MOCK_OCR_TEXTS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to parse stored OCR texts', e);
  }
  return MASTER_MOCK_OCR_TEXTS;
}

function getStoredFullDocs(): Record<string, string> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = localStorage.getItem(FULL_DOC_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse stored full documents', e);
  }
  return {};
}

function getStoredDataUrls(): Record<string, string> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = localStorage.getItem(FILE_DATA_URL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse stored document data URLs', e);
  }
  return {};
}

/**
 * Returns stored OCR text or dynamically simulates realistic text based on file name and project context.
 */
export function getDocumentOcrText(docId: string, fileName?: string, projectName?: string): string {
  const mem = REAL_FILES_MEMORY[docId];
  if (mem?.extractedText && mem.extractedText.trim().length > 0) {
    return mem.extractedText;
  }

  const current = getStoredOcrTexts();
  if (current[docId]) {
    return current[docId];
  }

  const nameLower = (fileName || '').toLowerCase();

  if (nameLower.includes('ethic') || nameLower.includes('fairness') || nameLower.includes('bias')) {
    return `Ghana National AI Ethics Framework Compliance Review for ${projectName || 'Project'}. Evaluated demographic and geographical parity across Northern, Ashanti, and Western regions. Linguistic label balance certified across English, Akan/Twi, and Ga. Low-bandwidth USSD channels active. Zero disparate impact detected under national standards.`;
  }
  if (nameLower.includes('dpc') || nameLower.includes('privacy') || nameLower.includes('act 843') || nameLower.includes('data protection')) {
    return `Data Protection Commission (DPC) Institutional Compliance Certification under Ghana Data Protection Act 843. Official DPO appointed and licensed. All personal records (PII) anonymized at ingestion using SHA-256 cryptographic salts. Database hosted on sovereign infrastructure in Accra.`;
  }
  if (nameLower.includes('secur') || nameLower.includes('cyber') || nameLower.includes('owasp') || nameLower.includes('audit')) {
    return `Comprehensive Cybersecurity & Infrastructure Audit for ${projectName || 'Project'}. Audited against OWASP Top 10 vulnerabilities with automated SAST/DAST pipelines. TLS 1.3 encryption enforced on all API endpoints. Air-gapped failover mechanisms verified by Auditor General.`;
  }
  if (nameLower.includes('model') || nameLower.includes('spec') || nameLower.includes('architecture') || nameLower.includes('card')) {
    return `Official System Architecture Specification & Model Card. Neural network hyperparameters, quantization layers, and training data provenance documented. Explanations provided via SHAP explainability metrics. Certified for sovereign cloud deployment.`;
  }
  if (nameLower.includes('readiness') || nameLower.includes('charter') || nameLower.includes('governance')) {
    return `Institutional AI Readiness Charter & Capability Framework. Steering committee established with designated AI Engineers, Data Custodians, and System Administrators. Approved capital budget allocated for compute resources, cloud hosting, and staff change-management training.`;
  }

  return `National AI Project Dossier: ${fileName || 'Document'}. Project: ${projectName || 'AI Initiative'}. Submitted to Republic of Ghana National Information Technology Agency (NITA) compliance registry. Verified authentic metadata, cryptographic checksum, and institutional endorsement under Ghana AI Policy 2026.`;
}

/**
 * Registers OCR text for newly uploaded documents to ensure subsequent scans find the contents.
 */
export function registerUploadedDocumentOcr(docId: string, text: string): void {
  MASTER_MOCK_OCR_TEXTS[docId] = text;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const current = getStoredOcrTexts();
      current[docId] = text;
      localStorage.setItem(OCR_STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to persist OCR text', e);
    }
  }
}

/**
 * Registers full document text and optional file Data URL for newly uploaded documents (e.g. by First-Timers / Onboarders).
 */
export function registerUploadedFullDocument(docId: string, fullText: string, fileDataUrl?: string): void {
  if (REAL_FILES_MEMORY[docId]) {
    if (fullText && !REAL_FILES_MEMORY[docId].extractedText) {
      REAL_FILES_MEMORY[docId].extractedText = fullText;
    }
    if (fileDataUrl && !REAL_FILES_MEMORY[docId].dataUrl) {
      REAL_FILES_MEMORY[docId].dataUrl = fileDataUrl;
    }
  } else if (fullText || fileDataUrl) {
    const blob = fileDataUrl ? dataUrlToBlob(fileDataUrl) : undefined;
    REAL_FILES_MEMORY[docId] = {
      docId,
      fileName: docId,
      mimeType: 'application/octet-stream',
      fileSize: fileDataUrl ? Math.round(fileDataUrl.length * 0.75) : (fullText?.length || 0),
      dataUrl: fileDataUrl || '',
      extractedText: fullText || '',
      uploadedAt: new Date().toISOString(),
      blob
    };
    if (blob && typeof URL !== 'undefined' && URL.createObjectURL) {
      BLOB_URL_CACHE[docId] = URL.createObjectURL(blob);
    }
    saveRealFileToIdb(REAL_FILES_MEMORY[docId]);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (fullText) {
        const currentFull = getStoredFullDocs();
        currentFull[docId] = fullText;
        localStorage.setItem(FULL_DOC_STORAGE_KEY, JSON.stringify(currentFull));
      }
    } catch (e) {
      console.warn('localStorage full text quota reached; persisted in IndexedDB', e);
    }
    try {
      if (fileDataUrl && fileDataUrl.length < 3500000) {
        const currentUrls = getStoredDataUrls();
        currentUrls[docId] = fileDataUrl;
        localStorage.setItem(FILE_DATA_URL_STORAGE_KEY, JSON.stringify(currentUrls));
      }
    } catch (e) {
      console.warn('localStorage fileDataUrl quota reached; persisted in IndexedDB', e);
    }
  }
}

/**
 * Retrieves any stored Data URL for an uploaded file (from memory, DocumentAsset, or localStorage).
 */
export function getStoredDocumentDataUrl(docId: string, doc?: DocumentAsset): string | undefined {
  if (REAL_FILES_MEMORY[docId]?.dataUrl) return REAL_FILES_MEMORY[docId].dataUrl;
  if (doc?.fileDataUrl) return doc.fileDataUrl;
  const stored = getStoredDataUrls();
  return stored[docId];
}

/**
 * Returns a browser-renderable Blob URL or Data URL for the real uploaded document (for <iframe /> or <object /> preview).
 */
export function getRealDocumentPreviewUrl(docId: string, doc?: DocumentAsset): string | undefined {
  if (BLOB_URL_CACHE[docId]) return BLOB_URL_CACHE[docId];
  const dataUrl = getStoredDocumentDataUrl(docId, doc);
  if (dataUrl) {
    const blob = dataUrlToBlob(dataUrl);
    if (blob && typeof URL !== 'undefined' && URL.createObjectURL) {
      const url = URL.createObjectURL(blob);
      BLOB_URL_CACHE[docId] = url;
      return url;
    }
    return dataUrl;
  }
  return undefined;
}

/**
 * Checks whether a document has a real user-uploaded binary file (PDF, DOCX, TXT, etc.) stored.
 */
export function hasRealUploadedFile(docId: string, doc?: DocumentAsset): boolean {
  return !!(
    REAL_FILES_MEMORY[docId]?.dataUrl ||
    REAL_FILES_MEMORY[docId]?.blob ||
    doc?.fileDataUrl ||
    getStoredDataUrls()[docId]
  );
}

/**
 * Generates a valid, standards-compliant PDF binary (%PDF-1.4) for pre-seeded sample PDF documents
 * when no local disk upload exists, so downloading a .pdf document ALWAYS downloads a real .pdf file.
 */
function buildValidPdfBlobFromText(title: string, bodyText: string): Blob {
  const lines = bodyText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .flatMap(line => {
      const wrapped: string[] = [];
      let rem = line;
      while (rem.length > 88) {
        wrapped.push(rem.slice(0, 88));
        rem = rem.slice(88);
      }
      wrapped.push(rem);
      return wrapped;
    });

  const linesPerPage = 48;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) pages.push([title]);

  const escapePdf = (str: string) =>
    str
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');

  const objects: string[] = [];
  // Obj 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  // Obj 2: Pages placeholder
  const pageObjNumbers: number[] = [];
  let nextObjNum = 4; // 3 is Font

  const pageAndContentObjs: string[] = [];
  pages.forEach((pageLines, idx) => {
    const pageObjId = nextObjNum++;
    const contentObjId = nextObjNum++;
    pageObjNumbers.push(pageObjId);

    const streamLines = [
      'BT',
      '/F1 10 Tf',
      '45 755 Td',
      '14 TL',
      `(${escapePdf(title)} - Page ${idx + 1} of ${pages.length}) Tj`,
      'T*',
      '/F1 9 Tf'
    ];
    for (const l of pageLines) {
      streamLines.push(`(${escapePdf(l)}) Tj`);
      streamLines.push('T*');
    }
    streamLines.push('ET');
    const streamContent = streamLines.join('\n');

    pageAndContentObjs.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj`
    );
    pageAndContentObjs.push(
      `${contentObjId} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`
    );
  });

  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjNumbers.map(n => `${n} 0 R`).join(' ')}] /Count ${pages.length} >>\nendobj`
  );
  objects.push('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj');
  objects.push(...pageAndContentObjs);

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

/**
 * Downloads the exact original document uploaded by the First-Timer / Onboarder (or user)
 * with its exact original fileName and binary content.
 */
export async function downloadOriginalDocument(doc: DocumentAsset, project?: AIProject): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Check in-memory cache or synchronous Data URL first
  let record: StoredRealUploadedFile | undefined = REAL_FILES_MEMORY[doc.id];
  if (!record) {
    // Try reading directly from IndexedDB in case hydration is still in flight
    const db = await openRealFilesIdb();
    if (db) {
      record = await new Promise<StoredRealUploadedFile | undefined>(resolve => {
        try {
          const tx = db.transaction(IDB_STORE_NAME, 'readonly');
          const store = tx.objectStore(IDB_STORE_NAME);
          const req = store.get(doc.id);
          req.onsuccess = () => resolve(req.result as StoredRealUploadedFile | undefined);
          req.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      });
      if (record) {
        REAL_FILES_MEMORY[doc.id] = record;
      }
    }
  }

  const dataUrl = record?.dataUrl || getStoredDocumentDataUrl(doc.id, doc);
  if (record?.blob) {
    const url = URL.createObjectURL(record.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return;
  }

  if (dataUrl) {
    const blob = dataUrlToBlob(dataUrl);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return;
    }
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // 2. Fallback for pre-seeded sample documents that were not uploaded from the user's computer:
  const fullText = getFullDocumentText(doc, project);
  const ext = (doc.fileName.split('.').pop() || doc.fileType || 'pdf').toLowerCase();
  if (ext === 'pdf') {
    const pdfBlob = buildValidPdfBlobFromText(doc.fileName, fullText);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName.endsWith('.pdf') ? doc.fileName : `${doc.fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return;
  }

  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Builds structured multi-page sections for the full uploaded document so reviewers have access
 * to the complete document uploaded by first-timers/onboarders during review and grading.
 * When a user uploads a real document, the user's actual uploaded content is returned first (Page 1+).
 */
export function getFullDocumentSections(doc: DocumentAsset, project?: AIProject): FullDocumentSection[] {
  const realMem = REAL_FILES_MEMORY[doc.id];
  const storedFull = (realMem?.extractedText && realMem.extractedText.trim().length > 0)
    ? realMem.extractedText
    : (getStoredFullDocs()[doc.id] || doc.fullDocumentText);
  const isRealUserUpload = hasRealUploadedFile(doc.id, doc) || !MASTER_MOCK_OCR_TEXTS[doc.id];

  const isFT = doc.isFirstTimerUpload ||
    doc.uploadedByRole === 'First-Timer / New User' ||
    doc.id.includes('onboard') ||
    doc.signedBy?.includes('First-Timer / New User');

  const uploaderName = doc.uploadedByName || (isFT ? 'First-Timer / Onboarding Officer' : (doc.signedBy?.[0] || 'MDA Lead Officer'));
  const uploaderEmail = doc.uploadedByEmail || (isFT ? 'onboarding.officer@gov.gh' : 'registry@nita.gov.gh');
  const uploaderRole = doc.uploadedByRole || (isFT ? 'First-Timer / New User' : 'Institutional Officer');
  const projCode = project?.projectCode || 'GN-AI-2026-REG';
  const projName = project?.name || 'National AI Initiative';
  const mdaName = project?.mda || 'Republic of Ghana MDA';
  const regionName = project ? `${project.region} (${project.district})` : 'Greater Accra';

  // If this is a real uploaded document by a First-Timer/Onboarder or officer, return the REAL uploaded content first!
  if (isRealUserUpload) {
    const realSections: FullDocumentSection[] = [];
    const cleanText = (storedFull || '').trim();

    if (cleanText.length > 0) {
      // Split large uploaded documents into readable ~3000-char pages while preserving paragraph boundaries
      const maxCharsPerPage = 3200;
      if (cleanText.length <= maxCharsPerPage) {
        realSections.push({
          pageNumber: 1,
          sectionTitle: `Original Uploaded Document: ${doc.fileName}`,
          statutoryReference: `Uploaded by ${uploaderName} (${uploaderRole}) • ${doc.fileSize || 'Original File'} • ${doc.uploadedAt}`,
          content: cleanText,
          keyHighlights: [
            'Original Uploaded File Content',
            doc.fileName,
            isFT ? 'First-Timer / Onboarder Upload' : 'User Uploaded Document'
          ]
        });
      } else {
        const paragraphs = cleanText.split(/\n\s*\n/);
        let currentChunk = '';
        let pageIdx = 1;
        for (const para of paragraphs) {
          if ((currentChunk.length + para.length + 2) > maxCharsPerPage && currentChunk.trim().length > 0) {
            realSections.push({
              pageNumber: pageIdx,
              sectionTitle: `Original Uploaded Document (${doc.fileName}) — Page ${pageIdx}`,
              statutoryReference: `Uploaded by ${uploaderName} (${uploaderRole}) • ${doc.fileSize || 'Original File'}`,
              content: currentChunk.trim(),
              keyHighlights: [
                `Page ${pageIdx} of Uploaded File`,
                doc.fileName,
                isFT ? 'First-Timer / Onboarder Upload' : 'User Uploaded Document'
              ]
            });
            pageIdx++;
            currentChunk = para + '\n\n';
          } else {
            currentChunk += para + '\n\n';
          }
        }
        if (currentChunk.trim().length > 0) {
          realSections.push({
            pageNumber: pageIdx,
            sectionTitle: `Original Uploaded Document (${doc.fileName}) — Page ${pageIdx}`,
            statutoryReference: `Uploaded by ${uploaderName} (${uploaderRole}) • ${doc.fileSize || 'Original File'}`,
            content: currentChunk.trim(),
            keyHighlights: [
              `Page ${pageIdx} of Uploaded File`,
              doc.fileName,
              isFT ? 'First-Timer / Onboarder Upload' : 'User Uploaded Document'
            ]
          });
        }
      }
    } else {
      // Binary file where plain text stream was not extractable (e.g. scanned PDF or compressed stream),
      // while the exact original binary is stored and rendered in the embedded viewer / available for download.
      realSections.push({
        pageNumber: 1,
        sectionTitle: `Original Uploaded File: ${doc.fileName}`,
        statutoryReference: `Uploaded by ${uploaderName} (${uploaderRole}) • ${doc.fileSize || 'Original Binary'} • ${doc.uploadedAt}`,
        content: `ORIGINAL UPLOADED DOCUMENT ATTACHED (${doc.fileName})\n` +
          `================================================================================\n` +
          `File Name:        ${doc.fileName}\n` +
          `File Type:        ${doc.fileType.toUpperCase()}\n` +
          `File Size:        ${doc.fileSize || 'Verified Binary'}\n` +
          `Uploaded By:      ${uploaderName} (${uploaderRole} — ${uploaderEmail})\n` +
          `Uploaded Date:    ${doc.uploadedAt}\n` +
          `Target Project:   [${projCode}] ${projName} (${mdaName})\n\n` +
          `The exact file you uploaded ("${doc.fileName}") is preserved in its original binary format.\n` +
          `• If this is a PDF, view the live embedded PDF document directly above or in the Original File tab.\n` +
          `• Click "Download Original File" to download the exact "${doc.fileName}" file that was uploaded.`,
        keyHighlights: [
          'Original Binary File Preserved',
          doc.fileName,
          isFT ? 'First-Timer / Onboarder Upload' : 'User Uploaded Document'
        ]
      });
    }

    return realSections;
  }

  const ocrSummary = getDocumentOcrText(doc.id, doc.fileName, project?.name);

  // If a pre-seeded onboarder document has explicit fullDocumentText, place it on Page 1 so reviewers see it immediately
  const sections: FullDocumentSection[] = [];

  if (storedFull && storedFull.trim().length > 0) {
    sections.push({
      pageNumber: 1,
      sectionTitle: `Section 1: Verbatim Uploaded Document (${doc.fileName})`,
      statutoryReference: `Primary Documentary Evidence Uploaded by ${uploaderName} (${uploaderRole})`,
      content: storedFull,
      keyHighlights: ['Verbatim Uploaded File Content', isFT ? 'First-Timer / Onboarder Full Dossier' : 'Primary User Attachment', doc.fileName]
    });
  }

  const pageOffset = sections.length;

  sections.push(
    {
      pageNumber: pageOffset + 1,
      sectionTitle: `Section ${pageOffset + 1}: Statutory Dossier Cover, Uploader Provenance & Project Charter`,
      statutoryReference: 'NITA Act 771 & Ghana National AI Strategy 2026',
      content: `REPUBLIC OF GHANA — NATIONAL INFORMATION TECHNOLOGY AGENCY (NITA)
STATUTORY FULL COMPLIANCE DOSSIER & ONBOARDING SUBMISSION
================================================================================
Document Title:       ${doc.fileName}
Document ID:          ${doc.id} (Version ${doc.version}.0 • ${doc.fileType.toUpperCase()})
Submission Date:      ${doc.uploadedAt}
Submission Track:     ${isFT ? 'FIRST-TIMER / ONBOARDER STATUTORY SUBMISSION' : 'INSTITUTIONAL COMPLIANCE FILING'}
Submitted By:         ${uploaderName} (${uploaderRole})
Official Email:       ${uploaderEmail}
Target AI Project:    [${projCode}] ${projName}
Managing Institution: ${mdaName}
Deployment Zone:      ${regionName}
Digital Signatures:   ${(doc.signedBy && doc.signedBy.length > 0) ? doc.signedBy.join(', ') : 'Pending Statutory Counter-Signature'}

1.1 EXECUTIVE SUMMARY & PROJECT SCOPE
${project?.description || 'This project deploys sovereign artificial intelligence infrastructure to modernize public service delivery across Ghana.'}

1.2 PRIMARY OCR & DOSSIER ABSTRACT
${ocrSummary}

1.3 STATUTORY DECLARATION BY ONBOARDER / SUBMITTING OFFICER
The submitting officer (${uploaderName}) certifies that all architectural specifications, dataset provenance logs, and privacy controls contained in this full document represent primary verifiable evidence for review and grading by the Director General, Super Admin, Technical Director, and Technical Clearance Team.`,
      keyHighlights: ['Project Charter Verified', isFT ? 'First-Timer / Onboarder Full Dossier' : 'Institutional Filing', 'NITA Act 771 Compliant']
    },
    {
      pageNumber: pageOffset + 2,
      sectionTitle: `Section ${pageOffset + 2}: System Architecture, Model Card & Sovereign Compute Specifications`,
      statutoryReference: 'ISO/IEC 42001 Annex A & NITA Sovereign Cloud Standards',
      content: `2.1 MODEL ARCHITECTURE & ALGORITHMIC SPECIFICATIONS
• Primary AI Category: ${project?.category || 'Machine Learning & Predictive Analytics'} (${project?.sector || 'Public'} Sector)
• Lifecycle Stage: ${project?.stage || 'Deployment'} | Operational Status: ${project?.status || 'Active'}
• Model Backbone & Inference Pipeline: Production weights quantized and validated with deterministic input/output schema boundaries.
• Explainability & Interpretability (Transparency Pillar): Automated SHAP (SHapley Additive exPlanations) and plain-language decision logs generated for every citizen-facing inference to guarantee algorithmic transparency and human-in-the-loop override capability.

2.2 SOVEREIGN INFRASTRUCTURE & LOW-BANDWIDTH RESILIENCE
• Primary Hosting Node: Republic of Ghana National Data Centre (NITA Tier-III Sovereign Cloud, Accra) with regional disaster-recovery replication in Kumasi.
• Rural & Edge Telemetry: Supports offline caching via TensorFlow Lite / edge synchronization and USSD (*920#) gateway fallback for low-bandwidth rural districts.
• Compute & API Throughput: Load-tested for 10,000+ concurrent citizen transactions with sub-250ms p95 latency.`,
      keyHighlights: ['Model Card Published', 'SHAP Explainability Active', 'NITA Tier-III Sovereign Hosting']
    },
    {
      pageNumber: pageOffset + 3,
      sectionTitle: `Section ${pageOffset + 3}: Ghana AI Ethics Framework — Fairness, Non-Bias & Inclusivity Audit`,
      statutoryReference: 'Ghana Ethical AI Framework — Pillar 1 (Fairness) & Pillar 2 (Transparency)',
      content: `3.1 MULTI-REGIONAL & DEMOGRAPHIC PARITY EVALUATION
• Geographic Representation: Training and validation datasets audited across all 16 administrative regions of Ghana (including Greater Accra, Ashanti, Western North, Northern, Upper East, Volta, and Savannah zones).
• Disparate Impact & Four-Fifths Rule Audit: Selection and classification accuracy parity verified at >= 94.2% across urban and rural cohorts, gender groups, and age brackets.
• Current Assessed Fairness Rating: ${project?.compliance?.fairness ?? 80}% | Transparency Rating: ${project?.compliance?.transparency ?? 75}%

3.2 LINGUISTIC & SOCIO-ECONOMIC ACCESSIBILITY
• Local Language Corpus Support: Acoustic and NLP interfaces evaluated across English, Akan (Twi/Fante), Ga, Ewe, and Dagbani to prevent linguistic exclusion.
• Assistive & Non-Smartphone Channels: Voice-guided interactive prompts and SMS/USSD channels active for citizens without smartphones or broadband connectivity.`,
      keyHighlights: ['16-Region Demographic Parity', 'Local Languages (Twi, Ga, Ewe)', 'USSD/Offline Accessibility']
    },
    {
      pageNumber: pageOffset + 4,
      sectionTitle: `Section ${pageOffset + 4}: Data Protection Act, 2012 (Act 843) & Privacy Governance`,
      statutoryReference: 'Ghana Data Protection Act, 2012 (Act 843) & DPC Statutory Guidelines',
      content: `4.1 DATA PROTECTION COMMISSION (DPC) REGISTRATION & DPO OVERSIGHT
• DPC Certificate Reference: ${project?.dpcCertificateNumber || 'GH-DPC-2026-VERIFIED'}
• Data Protection Officer (DPO): Certified institutional DPO appointed and registered with the Data Protection Commission under Section 58 of Act 843.
• Data Provenance & Citizen Consent: Explicit opt-in consent forms and statutory authority mandates catalogued prior to ingestion.

4.2 CRYPTOGRAPHIC PII ANONYMIZATION & DATA RESIDENCY
• Ingestion Masking: All Personal Identifiable Information (PII), GhanaCard PINs, biometric templates, and health/financial records are salted and hashed using SHA-256 cryptographic primitives at ingestion.
• Data Localization Covenant: 100% of citizen records reside physically within sovereign boundaries of the Republic of Ghana. Zero unauthorized cross-border data transfers or third-party commercial model training permitted.
• Current Assessed Privacy Rating: ${project?.compliance?.privacy ?? 85}% | Accountability Rating: ${project?.compliance?.accountability ?? 85}%`,
      keyHighlights: ['Act 843 DPC Certified', 'SHA-256 PII Cryptographic Hashing', '100% Sovereign Data Residency']
    },
    {
      pageNumber: pageOffset + 5,
      sectionTitle: `Section ${pageOffset + 5}: Cybersecurity Act (Act 1038), OWASP Clearance & AI Readiness`,
      statutoryReference: 'Cybersecurity Act 2020 (Act 1038) & National AI Readiness Rubric',
      content: `5.1 CYBERSECURITY & VULNERABILITY AUDIT (SECURITY PILLAR)
• Application Security: Source code and container images cleared against OWASP Top 10 and OWASP LLM Top 10 vulnerabilities via automated SAST/DAST pipelines.
• Cryptographic Transport & Hardware Security: Enforces mutual TLS 1.3 encryption in transit, AES-256 at rest, and FIPS 140-2 Level 3 Hardware Security Modules (HSM) for key management.
• National CERT Telemetry: Real-time intrusion detection and emergency kill-switch hooks linked to the Cyber Security Authority (CSA) National CERT.
• Current Assessed Security Rating: ${project?.compliance?.security ?? 88}%

5.2 INSTITUTIONAL AI READINESS & FINANCIAL VERIFICATION
• Overall AI Readiness Score: ${project?.readinessScore ?? 80}%
• Readiness Pillars: Compute Infrastructure (${project?.autoAssessment?.readinessPillars?.infrastructure ?? 82}%), Data Governance (${project?.autoAssessment?.readinessPillars?.dataGovernance ?? 85}%), Technical Engineering Staff (${project?.autoAssessment?.readinessPillars?.technicalStaff ?? 78}%), Policy & Steering Leadership (${project?.autoAssessment?.readinessPillars?.policyLeadership ?? 82}%).
• Fiscal Allocation: ${project?.budget ? `${project.budget.currency} ${project.budget.totalAllocated.toLocaleString()} Allocated (${project.budget.verificationStatus || 'Under Verification'})` : 'Budget logged in National Registry'}.`,
      keyHighlights: ['OWASP Top 10 Cleared', 'TLS 1.3 & HSM Active', `AI Readiness: ${project?.readinessScore ?? 80}%`]
    }
  );

  return sections;
}

/**
 * Returns the complete, multi-page full document text for reading, searching, or downloading.
 * For real user uploads, returns the exact extracted text of the uploaded document.
 */
export function getFullDocumentText(doc: DocumentAsset, project?: AIProject): string {
  const realMem = REAL_FILES_MEMORY[doc.id];
  const storedFull = (realMem?.extractedText && realMem.extractedText.trim().length > 0)
    ? realMem.extractedText
    : (getStoredFullDocs()[doc.id] || doc.fullDocumentText);
  const isRealUserUpload = hasRealUploadedFile(doc.id, doc) || !MASTER_MOCK_OCR_TEXTS[doc.id];

  if (isRealUserUpload && storedFull && storedFull.trim().length > 0) {
    return storedFull;
  }

  const sections = getFullDocumentSections(doc, project);
  return sections
    .map(s => `--- [PAGE ${s.pageNumber} • ${s.sectionTitle.toUpperCase()}] ---\nStatutory Ref: ${s.statutoryReference}\n\n${s.content}\n`)
    .join('\n================================================================================\n\n');
}

/**
 * Automatically evaluates Governance & Ethics and AI Readiness based on all uploaded project documents.
 */
export function generateAssessmentFromDocuments(
  project: AIProject,
  session?: UserSession
): {
  compliance: ComplianceScore;
  readinessScore: number;
  details: AutoAssessmentDetails;
  zeroAssumptionAudit: ZeroAssumptionAudit;
} {
  const docs = project.documents || [];
  const docCount = docs.length;

  // If no documents exist, project receives low baseline/unverified ratings
  if (docCount === 0) {
    const compliance: ComplianceScore = {
      fairness: 35,
      transparency: 30,
      accountability: 35,
      privacy: 25,
      security: 30,
      overallGrade: 'High Risk'
    };
    const readinessScore = 28;
    const details: AutoAssessmentDetails = {
      generatedAt: new Date().toISOString(),
      generatedBy: session?.fullName || 'GNAPRMS Automated Document AI Engine',
      documentCount: 0,
      documentsAnalyzed: [],
      ethicsSummary: 'No compliance documents or technical dossiers have been uploaded yet. Statutory regulatory requirements under Ghana Act 843 and Ghana AI Ethics Framework are unverified.',
      readinessSummary: 'Institutional readiness stands at baseline 28%. Missing written project charter, architecture specs, data governance policies, and staff competency certificates.',
      keySignals: ['Pending Document Upload', 'Act 843 Verification Required', 'Unverified Architecture'],
      fairnessRationale: 'Demographic balance and regional inclusivity cannot be evaluated without dataset provenance documents.',
      transparencyRationale: 'No Model Card or architecture specification submitted.',
      accountabilityRationale: 'Steering committee and oversight structure undocumented.',
      privacyRationale: 'Zero Data Protection Commission (DPC) filings found in project vault.',
      securityRationale: 'Cybersecurity vulnerability audit report missing.',
      readinessPillars: {
        infrastructure: 25,
        dataGovernance: 20,
        technicalStaff: 35,
        policyLeadership: 30
      }
    };

    if (session) {
      recordAuditEvent({
        eventType: 'ASSESSMENT_AUTO_GENERATED',
        actorName: session.fullName,
        actorEmail: session.email,
        actorRole: session.role,
        actorInstitution: session.institution,
        targetModule: 'documents',
        targetEntityId: project.id,
        actionDetails: `Auto-generated baseline assessment for ${project.projectCode} (0 documents uploaded). Overall grade: High Risk, Readiness: 28%.`
      });
    }

    const zeroAssumptionAudit: ZeroAssumptionAudit = {
      isFullyVerified: false,
      evidenceBackingScore: 15,
      verifiedSignals: [],
      unverifiedAssumptions: [
        'No project charter or technical architecture submitted; readiness is at baseline assumption',
        'No Data Protection Commission filing found in repository',
        'Ethical governance parameters unverified by documentary evidence'
      ],
      lastAuditedDate: new Date().toISOString(),
      auditedBy: session?.fullName || 'GNAPRMS Document AI Engine',
      assumptionsEliminatedCount: 0
    };

    return { compliance, readinessScore, details, zeroAssumptionAudit };
  }

  // Aggregate all document texts
  const documentNames = docs.map(d => d.fileName);
  const combinedTexts = docs
    .map(d => `${d.fileName} ${getDocumentOcrText(d.id, d.fileName, project.name)}`)
    .join(' ')
    .toLowerCase();

  // Helper keyword counter
  const containsAny = (keywords: string[]) => keywords.some(k => combinedTexts.includes(k));
  const countMatches = (keywords: string[]) => keywords.filter(k => combinedTexts.includes(k)).length;

  // 1. FAIRNESS SCORING
  let fairness = 50;
  if (containsAny(['fairness', 'demographic', 'bias', 'gender'])) fairness += 15;
  if (containsAny(['ashanti', 'northern', 'western', 'regional', 'rural', 'accra'])) fairness += 15;
  if (containsAny(['language', 'twi', 'ewe', 'ga', 'akan', 'local', 'inclusiv'])) fairness += 10;
  if (containsAny(['low-bandwidth', 'ussd', 'sms', 'offline', 'accessibility'])) fairness += 8;
  fairness = Math.min(98, Math.max(40, fairness + countMatches(['bias', 'parity', 'demographic', 'inclusivity']) * 2));

  // 2. TRANSPARENCY SCORING
  let transparency = 50;
  if (containsAny(['model card', 'modelcard', 'architecture', 'spec'])) transparency += 15;
  if (containsAny(['hyperparameter', 'quantization', 'convolutional', 'xgboost', 'nlp', 'pipeline'])) transparency += 12;
  if (containsAny(['provenance', 'consent', 'dataset', 'origins', 'labeler'])) transparency += 12;
  if (containsAny(['explainab', 'shap', 'lime', 'interpret'])) transparency += 8;
  transparency = Math.min(98, Math.max(40, transparency + countMatches(['model', 'provenance', 'explainability']) * 2));

  // 3. ACCOUNTABILITY SCORING
  let accountability = 50;
  if (containsAny(['committee', 'steering', 'charter', 'oversight'])) accountability += 15;
  if (containsAny(['signed', 'sign-off', 'officer', 'custodian', 'director'])) accountability += 15;
  if (containsAny(['audit log', 'monitoring', 'review', 'arbitration'])) accountability += 12;
  // Extra points if documents have verified digital signatures
  const totalSigns = docs.reduce((acc, d) => acc + (d.signedBy?.length || 0), 0);
  if (totalSigns > 0) accountability += Math.min(10, totalSigns * 3);
  accountability = Math.min(98, Math.max(40, accountability));

  // 4. PRIVACY SCORING
  let privacy = 50;
  if (containsAny(['act 843', 'data protection', 'dpc', 'commission'])) privacy += 18;
  if (containsAny(['pii', 'anonymiz', 'hash', 'sha-256', 'salt'])) privacy += 14;
  if (containsAny(['sovereign', 'localization', 'residency', 'datacenter', 'data centre'])) privacy += 10;
  if (containsAny(['dpo', 'consent'])) privacy += 6;
  privacy = Math.min(98, Math.max(40, privacy + countMatches(['act 843', 'dpc', 'sha-256', 'pii']) * 2));

  // 5. SECURITY SCORING
  let security = 50;
  if (containsAny(['owasp', 'vulnerabilit', 'cybersecurity'])) security += 16;
  if (containsAny(['tls 1.3', 'tls', 'encryption', 'hashing'])) security += 12;
  if (containsAny(['hsm', 'hardware security', 'air-gapped', 'failover'])) security += 12;
  if (containsAny(['rbac', 'access control', 'sast', 'dast'])) security += 8;
  security = Math.min(98, Math.max(40, security + countMatches(['owasp', 'tls', 'encryption', 'security']) * 2));

  // Compute Overall Grade
  const avgEthics = Math.round((fairness + transparency + accountability + privacy + security) / 5);
  let overallGrade: ComplianceScore['overallGrade'] = 'Moderate';
  if (avgEthics >= 85) overallGrade = 'Excellent';
  else if (avgEthics >= 70) overallGrade = 'Good';
  else if (avgEthics < 55) overallGrade = 'High Risk';

  const compliance: ComplianceScore = {
    fairness,
    transparency,
    accountability,
    privacy,
    security,
    overallGrade
  };

  // 6. AI READINESS SCORING & PILLARS
  let pillarInfra = 55;
  if (containsAny(['hardware', 'server', 'datacenter', 'cloud', 'compute', 'infrastructure'])) pillarInfra += 20;
  if (containsAny(['tensorflow', 'pytorch', 'lite', 'edge', 'bandwidth', 'offline'])) pillarInfra += 15;
  pillarInfra = Math.min(96, Math.max(45, pillarInfra));

  let pillarData = 50;
  if (containsAny(['dataset', 'provenance', 'cleaning', 'label', 'schema'])) pillarData += 20;
  if (containsAny(['custodian', 'consent', 'pii', 'sanitiz'])) pillarData += 18;
  pillarData = Math.min(98, Math.max(40, pillarData));

  let pillarStaff = 55;
  if (containsAny(['engineer', 'scientist', 'developer', 'specialist'])) pillarStaff += 20;
  if (containsAny(['administrator', 'curriculum', 'training', 'team'])) pillarStaff += 16;
  pillarStaff = Math.min(95, Math.max(40, pillarStaff));

  let pillarPolicy = 50;
  if (containsAny(['charter', 'committee', 'leadership', 'policy', 'steering'])) pillarPolicy += 22;
  if (containsAny(['budget', 'allocated', 'monitoring', 'escalation', 'statutory'])) pillarPolicy += 18;
  pillarPolicy = Math.min(98, Math.max(40, pillarPolicy));

  const readinessScore = Math.round((pillarInfra + pillarData + pillarStaff + pillarPolicy) / 4);

  // Key Signals Extracted
  const keySignals: string[] = [];
  if (containsAny(['act 843', 'dpc'])) keySignals.push('Ghana Act 843 / DPC Compliant');
  if (containsAny(['owasp', 'cybersecurity'])) keySignals.push('OWASP Vulnerability Cleared');
  if (containsAny(['model card', 'modelcard', 'specs'])) keySignals.push('Model Card & Architecture Validated');
  if (containsAny(['sha-256', 'hash', 'salt'])) keySignals.push('Cryptographic PII Hashing');
  if (containsAny(['fairness', 'demographic', 'regional'])) keySignals.push('Multi-Region Inclusivity Verified');
  if (containsAny(['committee', 'steering'])) keySignals.push('Steering Committee Oversight Active');
  if (containsAny(['sovereign', 'datacenter'])) keySignals.push('National Sovereign Data Hosting');
  if (keySignals.length === 0) keySignals.push('Standard Technical Document Registered');

  const details: AutoAssessmentDetails = {
    generatedAt: new Date().toISOString(),
    generatedBy: session?.fullName || 'GNAPRMS Automated Document AI Engine',
    documentCount: docCount,
    documentsAnalyzed: documentNames,
    ethicsSummary: `Automated scan of ${docCount} uploaded document(s) verified compliance across Ghana AI Ethics pillars. Fairness (${fairness}%), Transparency (${transparency}%), Privacy (${privacy}%), and Security (${security}%). Overall Grade: ${overallGrade}.`,
    readinessSummary: `Institutional AI readiness computed at ${readinessScore}% based on documented compute capacity (${pillarInfra}%), data provenance (${pillarData}%), technical staffing (${pillarStaff}%), and policy leadership (${pillarPolicy}%).`,
    keySignals,
    fairnessRationale: fairness >= 80 
      ? 'Balanced training records and multi-region geographic representation detected in uploaded documentation.' 
      : 'Fairness indicators partially verified; demographic parity clauses could be expanded.',
    transparencyRationale: transparency >= 80
      ? 'System architecture parameters and model card specifications fully catalogued.'
      : 'Basic technical specs present; detailed model hyperparameters recommended.',
    accountabilityRationale: accountability >= 80
      ? 'Institutional steering committee and officer approval signatures authenticated on files.'
      : 'Accountability sign-offs verified at standard institutional level.',
    privacyRationale: privacy >= 80
      ? 'Official Data Protection Act (Act 843) compliance and SHA-256 PII masking confirmed.'
      : 'Privacy safeguards detected; active DPC registration certificate should remain updated.',
    securityRationale: security >= 80
      ? 'OWASP Top 10 clearance and TLS 1.3 / HSM cryptographic standards validated.'
      : 'Standard cybersecurity protocols verified in documentation.',
    readinessPillars: {
      infrastructure: pillarInfra,
      dataGovernance: pillarData,
      technicalStaff: pillarStaff,
      policyLeadership: pillarPolicy
    },
    submittedByFirstTimer: session?.role === 'First-Timer / New User' || !!session?.isFirstTimer,
    firstTimerOfficerName: (session?.role === 'First-Timer / New User' || !!session?.isFirstTimer) ? session?.fullName : undefined,
    firstTimerOfficerEmail: (session?.role === 'First-Timer / New User' || !!session?.isFirstTimer) ? session?.email : undefined
  };

  if (session) {
    recordAuditEvent({
      eventType: 'ASSESSMENT_AUTO_GENERATED',
      actorName: session.fullName,
      actorEmail: session.email,
      actorRole: session.role,
      actorInstitution: session.institution,
      targetModule: 'documents',
      targetEntityId: project.id,
      actionDetails: `Auto-generated compliance from ${docCount} documents for ${project.projectCode}. Overall Ethics: ${overallGrade} (${avgEthics}%), AI Readiness: ${readinessScore}%. Key signals: ${keySignals.slice(0, 3).join(', ')}.`
    });
  }

  const zeroAssumptionAudit: ZeroAssumptionAudit = {
    isFullyVerified: docCount >= 3 && avgEthics >= 80,
    evidenceBackingScore: Math.min(100, Math.round((docCount * 25) + (avgEthics * 0.25))),
    verifiedSignals: keySignals,
    unverifiedAssumptions: docCount < 3 
      ? ['Partial documentary coverage: additional penetration test and fiscal reconciliation required to eliminate remaining assumptions.'] 
      : [],
    lastAuditedDate: new Date().toISOString(),
    auditedBy: session?.fullName || 'GNAPRMS Document AI Engine',
    assumptionsEliminatedCount: docCount * 2
  };

  return { compliance, readinessScore, details, zeroAssumptionAudit };
}
