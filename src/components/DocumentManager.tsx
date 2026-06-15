import React, { useState } from 'react';
import { Upload, Search, FileText, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { AIProject, DocumentAsset } from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';

interface DocumentManagerProps {
  projects: AIProject[];
  onAddDocument: (projectId: string, newDoc: DocumentAsset) => void;
  onSignDocument: (projectId: string, docId: string, signerName: string) => void;
  currentRole: UserRole;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  projects,
  onAddDocument,
  onSignDocument,
  currentRole
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId);

  // Search states
  const [ocrSearchQuery, setOcrSearchQuery] = useState('');
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrWorking, setOcrWorking] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  // Version history states
  const [selectedDoc, setSelectedDoc] = useState<DocumentAsset | null>(null);

  // Mock full-text OCR dictionary for search simulations
  const mockOcrTexts: { [key: string]: string } = {
    'doc-1-1': 'COCOBOD Technical Specifications Model leaf analysis. Deploys custom Convolutional Neural Networks (CNN) using MobileNetV3 backbones. Offline storage enabled via TensorFlow Lite. Supported locations: Sefwi Wiawso.',
    'doc-1-2': 'Western North Cocoa Board Inclusivity Ethics Audit. Fairness indicators checked across Ashanti and Western regions. Gender bias balanced. Personal Identifiable Information (PII) encrypted according to Act 843.',
    'doc-2-1': 'Volta River Authority Akosombo Dam Hydrological Smart Grid Cybersecurity Audit. OWASP Top 10 vulnerabilities cleared. Enforces air-gapped critical hardware switches for gate activations. Inspected by Auditor General.',
    'doc-3-1': 'Speech Corpus Collection Privacy Consent form signed. Patient recordings anonymized using SHA-256 hash protocols. Registered under the Ghana Data Protection Commission (DPC).',
    'doc-5-1': 'GRA Revenue Fraud Engine security specs. Auditing transactions for predictive evasion algorithms. Enforces TLS 1.3 encryption and RBAC role bindings. Checked by GRA Commissioner General.'
  };

  // Run mock full-text search
  const handleOcrSearch = () => {
    if (!ocrSearchQuery) return [];
    
    const results: { doc: DocumentAsset; project: AIProject; snippet: string }[] = [];
    projects.forEach(proj => {
      proj.documents.forEach(doc => {
        const fullText = mockOcrTexts[doc.id] || '';
        if (fullText.toLowerCase().includes(ocrSearchQuery.toLowerCase())) {
          // Extract a 60 character snippet around the query
          const idx = fullText.toLowerCase().indexOf(ocrSearchQuery.toLowerCase());
          const start = Math.max(0, idx - 20);
          const end = Math.min(fullText.length, idx + ocrSearchQuery.length + 40);
          const snippet = '...' + fullText.substring(start, end) + '...';
          results.push({ doc, project: proj, snippet });
        }
      });
    });
    return results;
  };

  const searchResults = handleOcrSearch();

  // Handles simulated upload sequence
  const triggerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewFileName(file.name);
      setUploading(true);
      setUploadProgress(10);

      // 1. Simulate fast server upload ticks
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            setUploading(false);
            setOcrWorking(true);
            
            // 2. Simulate background OCR workers
            setTimeout(() => {
              setOcrWorking(false);
              const nextDocId = `doc-new-${Date.now()}`;
              const doc: DocumentAsset = {
                id: nextDocId,
                fileName: file.name,
                fileType: 'pdf',
                uploadedAt: new Date().toISOString().split('T')[0],
                version: 1,
                signedBy: [currentRole]
              };
              onAddDocument(selectedProjectId, doc);
              setNewFileName('');
            }, 1800);

            return 100;
          }
          return prev + 25;
        });
      }, 300);
    }
  };

  const handleDigitalSign = (docId: string) => {
    const canSign = ['Super Administrator', 'National AI Authority', 'Government Administrator', 'Auditor'].includes(currentRole);
    if (!canSign) return;

    onSignDocument(selectedProjectId, docId, currentRole);
    if (selectedDoc?.id === docId) {
      setSelectedDoc(prev => prev ? { ...prev, signedBy: [...prev.signedBy, currentRole] } : null);
    }
  };

  const canEdit = ['Super Administrator', 'Institution Administrator', 'Project Manager'].includes(currentRole);
  const canSign = ['Super Administrator', 'National AI Authority', 'Government Administrator', 'Auditor'].includes(currentRole);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Project documents grid and OCR uploads */}
        <div className="glass-card" style={{ minHeight: '620px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Target Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Secure Documents Vault</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Manage plans, contracts, and ethical certifications.
              </p>
            </div>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedDoc(null);
              }}
              className="form-select"
              style={{ width: '180px', padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.mdaCode} - {p.category}</option>
              ))}
            </select>
          </div>

          {activeProject && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              
              {/* Simple grid list of documents */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {activeProject.documents.length === 0 ? (
                  <div style={{ padding: '40px', textTransform: 'none', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No documents uploaded for this registry entry.
                  </div>
                ) : (
                  activeProject.documents.map(d => (
                    <div 
                      key={d.id}
                      onClick={() => setSelectedDoc(d)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: selectedDoc?.id === d.id ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.01)',
                        border: '1px solid',
                        borderColor: selectedDoc?.id === d.id ? 'rgba(16,185,129,0.3)' : 'var(--border-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{d.fileName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Version {d.version} • Uploaded {d.uploadedAt}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {d.signedBy.length > 0 ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--ghana-emerald)', fontWeight: 600 }}>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Signed ({d.signedBy.length})</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unsigned</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Upload panel simulation */}
              <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
                {uploading ? (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ghana-gold)', marginBottom: '8px' }}>
                      Uploading {newFileName} to sovereign S3 server...
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--ghana-gold)', transition: 'width 0.2s ease' }} />
                    </div>
                  </div>
                ) : ocrWorking ? (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div className="badge badge-warning" style={{ fontSize: '0.65rem', marginBottom: '8px', textTransform: 'uppercase' }}>OCR Engine Active</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Extracting metadata and indexing full text...
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ cursor: canEdit ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Upload className="w-8 h-8 text-emerald-400" />
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Click to select a project proposal file
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Upload simulates real-time OCR text parsing and pre-signed S3 token allocations
                        </div>
                      </div>
                      {canEdit ? (
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={triggerUpload}
                          style={{ display: 'none' }}
                        />
                      ) : (
                        <span className="badge badge-danger" style={{ fontSize: '0.65rem', marginTop: '6px' }}>Upload Blocked</span>
                      )}
                    </label>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* RIGHT COLUMN: OCR Search / Signatures drawer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Dynamic full-text OCR search bar */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Full-Text OCR Search</span>
            </h3>

            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Query words like 'OWASP' or 'Twi'..."
                value={ocrSearchQuery}
                onChange={(e) => setOcrSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingRight: '36px', fontSize: '0.82rem' }}
              />
            </div>

            {/* Render OCR search hits list */}
            {ocrSearchQuery && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--ghana-emerald)' }}>
                  Found {searchResults.length} instances in files:
                </div>
                {searchResults.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '10px 0' }}>No occurrences located.</div>
                ) : (
                  searchResults.map((res, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSelectedProjectId(res.project.id);
                        setSelectedDoc(res.doc);
                      }}
                      style={{ padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.18)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{res.doc.fileName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Project: {res.project.mdaCode}</div>
                      <div style={{ color: 'var(--ghana-gold)', fontStyle: 'italic', marginTop: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px' }}>
                        {res.snippet}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Details drawer for Selected Document */}
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '16px' }}>Digital Auditing Drawer</h3>
            
            {selectedDoc ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, animation: 'fadeIn 0.3s ease' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {selectedDoc.fileName}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Pre-signed URL: bucket/secure/{selectedDoc.id}.pdf
                </span>

                <div style={{ margin: '16px 0 12px 0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Authenticity Signatures ({selectedDoc.signedBy.length})
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedDoc.signedBy.map((signer, idx) => (
                      <span key={idx} className="badge badge-success" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{signer}</span>
                      </span>
                    ))}
                    {selectedDoc.signedBy.length === 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending regulatory signatures.</span>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => handleDigitalSign(selectedDoc.id)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px', fontSize: '0.82rem' }}
                    disabled={!canSign || selectedDoc.signedBy.includes(currentRole)}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Apply Signature Identity</span>
                  </button>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Signatures bind identity and role metrics immutably.
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '10px' }}>
                <HelpCircle className="w-10 h-10 text-slate-500 mb-8" />
                <span>Select a document in the main vault to audit version history and sign approvals.</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
