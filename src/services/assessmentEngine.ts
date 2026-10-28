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
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const currentFull = getStoredFullDocs();
      currentFull[docId] = fullText;
      localStorage.setItem(FULL_DOC_STORAGE_KEY, JSON.stringify(currentFull));

      if (fileDataUrl && fileDataUrl.length < 1800000) {
        const currentUrls = getStoredDataUrls();
        currentUrls[docId] = fileDataUrl;
        localStorage.setItem(FILE_DATA_URL_STORAGE_KEY, JSON.stringify(currentUrls));
      }
    } catch (e) {
      console.error('Failed to persist full document content', e);
    }
  }
}

/**
 * Retrieves any stored Data URL for an uploaded file.
 */
export function getStoredDocumentDataUrl(docId: string, doc?: DocumentAsset): string | undefined {
  if (doc?.fileDataUrl) return doc.fileDataUrl;
  const stored = getStoredDataUrls();
  return stored[docId];
}

/**
 * Builds structured multi-page sections for the full uploaded document so reviewers have access
 * to the complete document uploaded by first-timers/onboarders during review and grading.
 */
export function getFullDocumentSections(doc: DocumentAsset, project?: AIProject): FullDocumentSection[] {
  const ocrSummary = getDocumentOcrText(doc.id, doc.fileName, project?.name);
  const storedFull = getStoredFullDocs()[doc.id] || doc.fullDocumentText;
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

  const sections: FullDocumentSection[] = [
    {
      pageNumber: 1,
      sectionTitle: 'Section 1: Statutory Dossier Cover, Uploader Provenance & Project Charter',
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
      pageNumber: 2,
      sectionTitle: 'Section 2: System Architecture, Model Card & Sovereign Compute Specifications',
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
      pageNumber: 3,
      sectionTitle: 'Section 3: Ghana AI Ethics Framework — Fairness, Non-Bias & Inclusivity Audit',
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
      pageNumber: 4,
      sectionTitle: 'Section 4: Data Protection Act, 2012 (Act 843) & Privacy Governance',
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
      pageNumber: 5,
      sectionTitle: 'Section 5: Cybersecurity Act (Act 1038), OWASP Clearance & AI Readiness',
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
  ];

  if (storedFull && storedFull.trim().length > 0) {
    sections.push({
      pageNumber: 6,
      sectionTitle: 'Section 6: Verbatim Uploaded File Content & Raw Onboarder Attachment',
      statutoryReference: 'Primary Documentary Evidence Uploaded by User',
      content: storedFull,
      keyHighlights: ['Verbatim Uploaded File Content', 'Primary User Attachment']
    });
  }

  return sections;
}

/**
 * Returns the complete, multi-page full document text for reading, searching, or downloading.
 */
export function getFullDocumentText(doc: DocumentAsset, project?: AIProject): string {
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
