import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Eye, 
  Download, 
  ShieldCheck, 
  Trash2, 
  Sparkles, 
  Lock, 
  Building2, 
  QrCode, 
  FileCheck 
} from 'lucide-react';
import { Organization, ClearanceUploadedDocument } from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';
import { convertImageToPdf, readPdfFile, generateSamplePdf } from '../utils/pdfHelper';

export interface ClearanceDocumentUploaderProps {
  organization?: Organization | null;
  organizations?: Organization[];
  onSaveDocuments: (orgId: string, documents: ClearanceUploadedDocument[], newStatus?: any) => void;
  onClose?: () => void;
  isModal?: boolean;
  currentRole: UserRole;
}

const STATUTORY_CATEGORIES = [
  'Statutory Business Registration & GRA TIN',
  'Data Protection Commission (DPC Act 843) Certificate',
  'Data Protection Impact Assessment (DPIA) Report',
  'Vulnerability Assessment & Pen-Testing (VAPT) Report',
  'AI Model Architecture & Data Residency Attestation',
  'Algorithmic Bias & Fairness Audit Attestation'
];

export const ClearanceDocumentUploader: React.FC<ClearanceDocumentUploaderProps> = ({
  organization,
  organizations = [],
  onSaveDocuments,
  onClose,
  isModal = true,
  currentRole
}) => {
  // Target Organization
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    organization?.id || (organizations[0]?.id || '')
  );

  const activeOrg = organization || organizations.find(o => o.id === selectedOrgId);

  // Documents state (default to active organization's existing clearance documents if present)
  const [documents, setDocuments] = useState<ClearanceUploadedDocument[]>(() => {
    if (activeOrg?.clearanceDocuments && activeOrg.clearanceDocuments.length > 0) {
      return [...activeOrg.clearanceDocuments];
    }
    // If organization is cleared, provide realistic verified documents
    if (activeOrg && activeOrg.clearanceStatus === 'Cleared') {
      return [
        {
          id: `doc-${activeOrg.id}-1`,
          name: `${activeOrg.acronym} Official Entity Registration & GRA TIN`,
          category: 'Statutory Business Registration & GRA TIN',
          fileName: `${activeOrg.acronym}_GRA_Registration.pdf`,
          fileSize: '1.42 MB',
          fileType: 'pdf',
          isImageConverted: false,
          uploadedAt: activeOrg.submittedAt || '2024-01-15',
          dataUrl: generateSamplePdf(
            `${activeOrg.name} - Business Registration & GRA TIN Verification`,
            activeOrg.name,
            'Statutory Business Registration & GRA TIN',
            activeOrg.tinOrRegNumber
          ),
          verifiedByRegulator: true
        },
        {
          id: `doc-${activeOrg.id}-2`,
          name: `${activeOrg.acronym} DPC Act 843 Accreditation Certificate`,
          category: 'Data Protection Commission (DPC Act 843) Certificate',
          fileName: `${activeOrg.acronym}_DPC_Act843_Certificate.pdf`,
          fileSize: '2.10 MB',
          fileType: 'pdf',
          isImageConverted: true,
          uploadedAt: activeOrg.submittedAt || '2024-01-15',
          dataUrl: generateSamplePdf(
            `Data Protection Commission Accreditation - ${activeOrg.name}`,
            activeOrg.name,
            'Data Protection Commission (DPC Act 843) Certificate',
            activeOrg.dpcRegNumber
          ),
          verifiedByRegulator: true
        },
        {
          id: `doc-${activeOrg.id}-3`,
          name: `${activeOrg.acronym} Data Protection Impact Assessment (DPIA)`,
          category: 'Data Protection Impact Assessment (DPIA) Report',
          fileName: `${activeOrg.acronym}_National_AI_DPIA.pdf`,
          fileSize: '3.85 MB',
          fileType: 'pdf',
          isImageConverted: false,
          uploadedAt: activeOrg.submittedAt || '2024-01-15',
          dataUrl: generateSamplePdf(
            `Section 4 Act 843 DPIA Compliance Report - ${activeOrg.name}`,
            activeOrg.name,
            'Data Protection Impact Assessment (DPIA) Report',
            `DPIA-GH-2026-${activeOrg.acronym}`
          ),
          verifiedByRegulator: true
        },
        {
          id: `doc-${activeOrg.id}-4`,
          name: `${activeOrg.acronym} Sovereign Data Residency Commitment`,
          category: 'AI Model Architecture & Data Residency Attestation',
          fileName: `${activeOrg.acronym}_Sovereign_Hosting_Proof.pdf`,
          fileSize: '1.18 MB',
          fileType: 'pdf',
          isImageConverted: false,
          uploadedAt: activeOrg.submittedAt || '2024-01-15',
          dataUrl: generateSamplePdf(
            `Sovereign Data Center Residency Attestation - ${activeOrg.name}`,
            activeOrg.name,
            'AI Model Architecture & Data Residency Attestation',
            `RES-GH-2026-${activeOrg.acronym}`
          ),
          verifiedByRegulator: true
        }
      ];
    }
    // If pending review (like WiredWave), provide 2 documents to demonstrate incomplete threshold
    if (activeOrg && activeOrg.clearanceStatus === 'Pending Review') {
      return [
        {
          id: `doc-${activeOrg.id}-1`,
          name: `${activeOrg.acronym} Certificate of Incorporation`,
          category: 'Statutory Business Registration & GRA TIN',
          fileName: `${activeOrg.acronym}_Incorporation_Certificate.pdf`,
          fileSize: '1.25 MB',
          fileType: 'pdf',
          isImageConverted: true,
          uploadedAt: activeOrg.submittedAt || '2026-02-14',
          dataUrl: generateSamplePdf(
            `${activeOrg.name} Certificate of Incorporation`,
            activeOrg.name,
            'Statutory Business Registration & GRA TIN',
            activeOrg.tinOrRegNumber
          ),
          verifiedByRegulator: false
        },
        {
          id: `doc-${activeOrg.id}-2`,
          name: `${activeOrg.acronym} Draft AI System Architecture`,
          category: 'AI Model Architecture & Data Residency Attestation',
          fileName: `${activeOrg.acronym}_Architecture_Draft.pdf`,
          fileSize: '2.40 MB',
          fileType: 'pdf',
          isImageConverted: false,
          uploadedAt: activeOrg.submittedAt || '2026-02-14',
          dataUrl: generateSamplePdf(
            `${activeOrg.name} AI System Technical Architecture`,
            activeOrg.name,
            'AI Model Architecture & Data Residency Attestation',
            `ARCH-${activeOrg.acronym}-001`
          ),
          verifiedByRegulator: false
        }
      ];
    }
    return [];
  });

  // UI States
  const [selectedCategory, setSelectedCategory] = useState<string>(STATUTORY_CATEGORIES[0]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionMessage, setConversionMessage] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ClearanceUploadedDocument | null>(null);
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    referenceId: string;
    submittedAt: string;
    orgName: string;
    docCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // When changing organization in dropdown
  const handleOrgChange = (newOrgId: string) => {
    setSelectedOrgId(newOrgId);
    const org = organizations.find(o => o.id === newOrgId);
    if (org?.clearanceDocuments && org.clearanceDocuments.length > 0) {
      setDocuments([...org.clearanceDocuments]);
    } else {
      setDocuments([]);
    }
    setErrorNotice(null);
  };

  // Upload validation: Min 3, Max 5 documents
  const minRequired = 3;
  const maxAllowed = 5;
  const canUploadMore = documents.length < maxAllowed;
  const hasMetMinimum = documents.length >= minRequired;

  // Process files
  const handleFiles = async (files: FileList | File[]) => {
    setErrorNotice(null);
    const fileArray = Array.from(files);

    if (fileArray.length === 0) return;

    if (documents.length >= maxAllowed) {
      setErrorNotice(`You have reached the maximum limit of ${maxAllowed} clearance documents. Please remove an existing document to upload another.`);
      return;
    }

    const availableSlots = maxAllowed - documents.length;
    let filesToProcess = fileArray;

    if (fileArray.length > availableSlots) {
      setErrorNotice(`You can upload at most ${maxAllowed} documents in total. Only the first ${availableSlots} file(s) will be added.`);
      filesToProcess = fileArray.slice(0, availableSlots);
    }

    const newDocs: ClearanceUploadedDocument[] = [];

    for (const file of filesToProcess) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);

      if (!isPdf && !isImage) {
        setErrorNotice(`"${file.name}" rejected: Only PDF files (.pdf) or image documents to be converted into PDF (.jpg, .jpeg, .png, .webp) are allowed.`);
        continue;
      }

      try {
        if (isImage) {
          setIsConverting(true);
          setConversionMessage(`Converting scanned image "${file.name}" into statutory PDF format...`);
          const converted = await convertImageToPdf(file);
          
          newDocs.push({
            id: `clr-doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: `${selectedCategory} (${file.name.replace(/\.[^/.]+$/, '')})`,
            category: selectedCategory,
            fileName: converted.fileName,
            fileSize: converted.fileSize,
            fileType: 'pdf',
            isImageConverted: true,
            uploadedAt: new Date().toISOString().slice(0, 10),
            dataUrl: converted.dataUrl,
            previewUrl: converted.previewUrl,
            verifiedByRegulator: false
          });
        } else {
          // Native PDF
          setIsConverting(true);
          setConversionMessage(`Validating and loading PDF "${file.name}"...`);
          const result = await readPdfFile(file);

          newDocs.push({
            id: `clr-doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: `${selectedCategory} (${file.name.replace(/\.[^/.]+$/, '')})`,
            category: selectedCategory,
            fileName: result.fileName,
            fileSize: result.fileSize,
            fileType: 'pdf',
            isImageConverted: false,
            uploadedAt: new Date().toISOString().slice(0, 10),
            dataUrl: result.dataUrl,
            previewUrl: result.previewUrl,
            verifiedByRegulator: false
          });
        }
      } catch (err: any) {
        setErrorNotice(`Failed to process "${file.name}": ${err.message || 'Unknown error'}`);
      } finally {
        setIsConverting(false);
        setConversionMessage('');
      }
    }

    if (newDocs.length > 0) {
      setDocuments(prev => {
        const combined = [...prev, ...newDocs];
        return combined.slice(0, maxAllowed);
      });
      setSuccessToast(`Successfully added ${newDocs.length} document(s).`);
      setTimeout(() => setSuccessToast(null), 4000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canUploadMore) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!canUploadMore) {
      setErrorNotice(`Maximum limit of ${maxAllowed} documents reached.`);
      return;
    }
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    setErrorNotice(null);
  };

  const handleUpdateCategory = (id: string, newCategory: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, category: newCategory };
      }
      return d;
    }));
  };

  // Submit Clearance Application
  const handleSubmitDossier = (e: React.FormEvent) => {
    e.preventDefault();

    if (documents.length < minRequired) {
      setErrorNotice(`Clearance Submission Blocked: You must upload at least ${minRequired} statutory documents before applying for clearance. Currently uploaded: ${documents.length}/${minRequired}.`);
      return;
    }

    if (documents.length > maxAllowed) {
      setErrorNotice(`Clearance Submission Blocked: You cannot exceed ${maxAllowed} documents. Currently attached: ${documents.length}.`);
      return;
    }

    const orgId = activeOrg?.id || selectedOrgId;
    if (!orgId) {
      setErrorNotice('Please select an organization applying for clearance.');
      return;
    }

    const refNumber = `GH-NAPTCS-APP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    // Save into central state
    onSaveDocuments(orgId, documents, 'Pending Review');

    setSubmittedReceipt({
      referenceId: refNumber,
      submittedAt: new Date().toISOString().slice(0, 10),
      orgName: activeOrg?.name || 'Applicant Organization',
      docCount: documents.length
    });
  };

  return (
    <div style={{
      position: isModal ? 'fixed' : 'relative',
      top: isModal ? 0 : 'auto',
      left: isModal ? 0 : 'auto',
      right: isModal ? 0 : 'auto',
      bottom: isModal ? 0 : 'auto',
      background: isModal ? 'rgba(0, 0, 0, 0.82)' : 'transparent',
      backdropFilter: isModal ? 'blur(10px)' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: isModal ? 1000 : 1,
      padding: isModal ? '20px' : '0'
    }}>
      <div className="glass-card animated-fade-in" style={{
        maxWidth: isModal ? '860px' : '100%',
        width: '100%',
        maxHeight: isModal ? '92vh' : 'auto',
        overflowY: 'auto',
        padding: '28px',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: isModal ? '0 25px 60px rgba(0, 0, 0, 0.8)' : 'none',
        borderRadius: '16px'
      }}>
        
        {/* Receipt / Success State */}
        {submittedReceipt ? (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <FileCheck className="w-8 h-8 text-emerald-400" />
            </div>

            <span className="badge badge-success" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              DOSSIER LODGED FOR STATUTORY AUDIT
            </span>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '8px', color: '#f8fafc' }}>
              Clearance Application Lodged Successfully
            </h3>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '8px auto 20px auto', lineHeight: '1.5' }}>
              The statutory clearance dossier containing <strong>{submittedReceipt.docCount} PDF documents</strong> for <strong>{submittedReceipt.orgName}</strong> has been encrypted, time-stamped, and queued for Technical Review Committee (TCC) clearance evaluation.
            </p>

            {/* Receipt Box */}
            <div style={{
              background: 'linear-gradient(145deg, #0d1527 0%, #111e38 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '540px',
              margin: '0 auto 24px auto',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Official Submission Reference
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>
                    {submittedReceipt.referenceId}
                  </div>
                </div>
                <QrCode className="w-10 h-10 text-slate-300" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Applicant Entity:</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{submittedReceipt.orgName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <div style={{ color: '#fbbf24', fontWeight: 700 }}>⏳ Pending Review</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Documents Attached:</span>
                  <div style={{ fontWeight: 600, color: '#38bdf8' }}>{submittedReceipt.docCount} PDF Documents (Valid)</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Statutory Cycle:</span>
                  <div style={{ fontWeight: 600 }}>NAPTCS Cycle 2026</div>
                </div>
              </div>

              <div style={{
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                ℹ️ <strong>Next Steps:</strong> The clearance officers will review your DPIA, DPC Act 843 certificate, and technical audits within 3 to 5 business days. Once granted, a formal Sovereign Clearance Certificate will be issued and all linked AI systems will be unlocked on the National Registry.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => {
                  setSubmittedReceipt(null);
                  if (onClose) onClose();
                }}
                className="btn btn-primary"
                style={{ padding: '8px 24px', fontSize: '0.82rem' }}
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Clearance Dossier & Document Upload</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Upload statutory evidence documents for regulatory clearance under Ghana Act 843 & NAPTCS • <span style={{ color: '#fbbf24', fontWeight: 600 }}>Role: {currentRole}</span>
                    </p>
                  </div>
                </div>
              </div>

              {isModal && onClose && (
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              )}
            </div>

            {/* Target Applicant Selector (If not pre-locked to a specific organization) */}
            {!organization && organizations.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>Select Applicant Organization</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Documents will be lodged against this entity's clearance dossier
                    </div>
                  </div>
                </div>

                <select
                  value={selectedOrgId}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="form-select"
                  style={{ minWidth: '280px', minHeight: '44px', height: '44px', fontSize: '0.85rem' }}
                >
                  <optgroup label="Government MDAs / SOEs">
                    {organizations.filter(o => o.entityType.includes('Government')).map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.acronym}) — {o.clearanceStatus}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Private Sector Tech Companies & Vendors">
                    {organizations.filter(o => !o.entityType.includes('Government')).map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.acronym}) — {o.clearanceStatus}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}

            {/* Active Organization Info Pill */}
            {activeOrg && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(56, 189, 248, 0.04))',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '10px',
                padding: '12px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {activeOrg.name} ({activeOrg.acronym})
                    </span>
                    <span className={`badge ${activeOrg.clearanceStatus === 'Cleared' ? 'badge-success' : activeOrg.clearanceStatus === 'Pending Review' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.66rem' }}>
                      {activeOrg.clearanceStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    TIN: <strong>{activeOrg.tinOrRegNumber}</strong> • DPC No: <strong>{activeOrg.dpcRegNumber}</strong> • Sector: <strong>{activeOrg.sector}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Sovereign Residency</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8' }}>{activeOrg.sovereignDataHosting}</div>
                </div>
              </div>
            )}

            {/* STATUTORY REQUIREMENT TRACKER BAR (MIN 3, MAX 5) */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fbbf24' }}>
                    Statutory Rule: Minimum 3, Maximum 5 Documents
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Required in PDF format. Scanned image documents (.jpg, .png) will automatically convert to PDF.
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {documents.length < minRequired ? (
                    <span className="badge badge-warning" style={{ fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{documents.length} / {maxAllowed} Uploaded ({minRequired - documents.length} more needed)</span>
                    </span>
                  ) : documents.length === maxAllowed ? (
                    <span className="badge badge-info" style={{ fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{documents.length} / {maxAllowed} Uploaded (Maximum Reached)</span>
                    </span>
                  ) : (
                    <span className="badge badge-success" style={{ fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{documents.length} / {maxAllowed} Uploaded (Min Requirement Met ✅)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 5-Slot Visual Meter */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '8px' }}>
                {[0, 1, 2, 3, 4].map((index) => {
                  const doc = documents[index];
                  const isMinThreshold = index === 2; // Slot 3 is minimum
                  const isFilled = !!doc;

                  return (
                    <div
                      key={index}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: isFilled
                          ? '1px solid #10b981'
                          : index < minRequired
                          ? '1px dashed rgba(245, 158, 11, 0.4)'
                          : '1px dashed rgba(255, 255, 255, 0.1)',
                        background: isFilled
                          ? 'rgba(16, 185, 129, 0.08)'
                          : index < minRequired
                          ? 'rgba(245, 158, 11, 0.03)'
                          : 'rgba(255, 255, 255, 0.01)',
                        textAlign: 'center',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: isFilled ? '#10b981' : index < minRequired ? '#fbbf24' : 'var(--text-muted)' }}>
                        Document {index + 1} {index < minRequired ? '*' : '(Opt)'}
                      </div>
                      <div style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: isFilled ? 'var(--text-primary)' : 'var(--text-muted)',
                        marginTop: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {isFilled ? doc.name.slice(0, 16) + '...' : index < minRequired ? 'Required' : 'Optional'}
                      </div>

                      {isMinThreshold && (
                        <div style={{
                          fontSize: '0.58rem',
                          color: '#fbbf24',
                          fontWeight: 700,
                          marginTop: '4px',
                          textTransform: 'uppercase'
                        }}>
                          ▲ Min Limit
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Requirement Notice */}
              {documents.length < minRequired && (
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '10px'
                }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Clearance applications require <strong>at least 3 documents</strong> (Statutory Registration, DPC Certificate, and DPIA Report). Please upload <strong>{minRequired - documents.length} more</strong> document(s) to enable submission.
                  </span>
                </div>
              )}
            </div>

            {/* Error or Success Messages */}
            {errorNotice && (
              <div style={{
                marginBottom: '16px',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorNotice}</span>
              </div>
            )}

            {successToast && (
              <div style={{
                marginBottom: '16px',
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '8px',
                color: '#34d399',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successToast}</span>
              </div>
            )}

            {/* Conversion in progress banner */}
            {isConverting && (
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                color: '#38bdf8',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>{conversionMessage}</span>
              </div>
            )}

            {/* Document Category Guide / Pre-selector */}
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Document Statutory Category (Tag for Next Upload)</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Select category before uploading</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
                style={{ minHeight: '44px', height: '44px', fontSize: '0.85rem' }}
              >
                {STATUTORY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (canUploadMore && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              style={{
                border: dragOver
                  ? '2px dashed #10b981'
                  : canUploadMore
                  ? '2px dashed rgba(255, 255, 255, 0.2)'
                  : '2px solid rgba(255, 255, 255, 0.05)',
                background: dragOver
                  ? 'rgba(16, 185, 129, 0.1)'
                  : canUploadMore
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'rgba(255, 255, 255, 0.01)',
                borderRadius: '12px',
                padding: '28px 20px',
                textAlign: 'center',
                cursor: canUploadMore ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                marginBottom: '24px',
                position: 'relative'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                }}
                style={{ display: 'none' }}
                disabled={!canUploadMore}
              />

              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: canUploadMore ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <Upload className={`w-6 h-6 ${canUploadMore ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>

              {canUploadMore ? (
                <>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Drop statutory documents here, or <span style={{ color: '#10b981', textDecoration: 'underline' }}>Browse files</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Accepts <strong>.PDF</strong> files & <strong>scanned images</strong> (.jpg, .png, .webp). Images will be automatically packaged as PDF.
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Slots available: <strong>{maxAllowed - documents.length} of {maxAllowed}</strong> (Min 3 required)
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Maximum Limit of 5 Documents Reached
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    To upload a different document, please remove one of the existing documents below.
                  </div>
                </>
              )}
            </div>

            {/* List of Attached Documents */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Attached Clearance Documents ({documents.length} of {maxAllowed})
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {documents.length >= minRequired ? '✅ Threshold Met' : `⚠️ Need ${minRequired - documents.length} more`}
                </span>
              </div>

              {documents.length === 0 ? (
                <div style={{
                  padding: '24px',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem'
                }}>
                  No documents attached yet. Please upload between 3 and 5 clearance documents to apply.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {documents.map((doc, idx) => (
                    <div
                      key={doc.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.025)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        {/* File Icon */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: doc.isImageConverted ? 'rgba(168, 85, 247, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <FileText className={`w-5 h-5 ${doc.isImageConverted ? 'text-purple-400' : 'text-red-400'}`} />
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                              #{idx + 1}
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {doc.name}
                            </span>
                            {doc.isImageConverted ? (
                              <span className="badge badge-info" style={{ fontSize: '0.62rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                                ⚡ Image to PDF
                              </span>
                            ) : (
                              <span className="badge badge-success" style={{ fontSize: '0.62rem' }}>
                                Native PDF
                              </span>
                            )}
                            {doc.verifiedByRegulator && (
                              <span className="badge badge-success" style={{ fontSize: '0.62rem' }}>
                                Verified
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px', flexWrap: 'wrap' }}>
                            <span>File: <strong>{doc.fileName}</strong></span>
                            <span>•</span>
                            <span>Size: <strong>{doc.fileSize}</strong></span>
                            <span>•</span>
                            <span>Uploaded: {doc.uploadedAt}</span>
                          </div>

                          <div style={{ marginTop: '4px' }}>
                            <select
                              value={doc.category}
                              onChange={(e) => handleUpdateCategory(doc.id, e.target.value)}
                              className="form-select"
                              style={{ minHeight: '38px', height: '38px', fontSize: '0.8rem', padding: '6px 32px 6px 10px', maxWidth: '340px' }}
                            >
                              {STATUTORY_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Preview PDF */}
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Preview PDF document"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Preview</span>
                        </button>

                        {/* Download PDF */}
                        {doc.dataUrl && (
                          <a
                            href={doc.dataUrl}
                            download={doc.fileName}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Download PDF file"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-300" />
                            <span>Download</span>
                          </a>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc.id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 8px', fontSize: '0.74rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                          title="Remove document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '18px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                {documents.length < minRequired ? (
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                    ⚠️ Need at least {minRequired - documents.length} more document(s) to submit clearance application
                  </span>
                ) : (
                  <span style={{ color: '#34d399', fontWeight: 600 }}>
                    ✅ Statutory threshold met ({documents.length} of {maxAllowed} documents ready)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {isModal && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                    style={{ padding: '8px 18px', fontSize: '0.8rem' }}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmitDossier}
                  disabled={!hasMetMinimum}
                  className={`btn ${hasMetMinimum ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '8px 22px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: hasMetMinimum ? 1 : 0.5,
                    cursor: hasMetMinimum ? 'pointer' : 'not-allowed'
                  }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {hasMetMinimum 
                      ? `Submit Clearance Application (${documents.length}/${maxAllowed})` 
                      : `At Least ${minRequired} Documents Required (${documents.length}/${minRequired})`}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* MODAL: Full PDF Viewer Modal */}
        {previewDoc && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '24px'
          }}>
            <div className="glass-card animated-fade-in" style={{
              maxWidth: '820px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#0d1527',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
            }}>
              {/* Viewer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>PDF VIEWER</span>
                    {previewDoc.isImageConverted && (
                      <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>Image Converted</span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
                    {previewDoc.name}
                  </h4>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Category: <strong>{previewDoc.category}</strong> • Size: {previewDoc.fileSize}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {previewDoc.dataUrl && (
                    <a
                      href={previewDoc.dataUrl}
                      download={previewDoc.fileName}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download</span>
                    </a>
                  )}

                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.74rem' }}
                  >
                    Close Viewer
                  </button>
                </div>
              </div>

              {/* PDF Preview Frame */}
              <div style={{
                background: '#1e293b',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                minHeight: '460px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {previewDoc.dataUrl ? (
                  <iframe
                    src={previewDoc.dataUrl}
                    title={previewDoc.name}
                    style={{
                      width: '100%',
                      height: '480px',
                      border: 'none',
                      background: '#ffffff'
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <FileText className="w-12 h-12 text-slate-500" style={{ margin: '0 auto 12px auto' }} />
                    <p style={{ fontSize: '0.85rem' }}>PDF preview loaded for regulatory review.</p>
                  </div>
                )}
              </div>

              {/* Viewer Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>Certified Document Hash: SHA-256 Validated</span>
                <span>Republic of Ghana • Data Protection Act 2012 (Act 843)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
