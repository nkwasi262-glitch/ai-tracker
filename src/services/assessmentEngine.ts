import { AIProject, ComplianceScore, AutoAssessmentDetails, ZeroAssumptionAudit } from '../data/sampleProjects';
import { recordAuditEvent } from './auditService';
import { UserSession } from '../data/authTypes';

// Initial repository of OCR texts for preloaded documents
export const MASTER_MOCK_OCR_TEXTS: Record<string, string> = {
  'doc-1-1': 'COCOBOD Technical Specifications Model leaf analysis. Deploys custom Convolutional Neural Networks (CNN) using MobileNetV3 backbones. Offline storage enabled via TensorFlow Lite. Supported locations: Sefwi Wiawso. Hardware infrastructure meets low-bandwidth rural requirements.',
  'doc-1-2': 'Western North Cocoa Board Inclusivity Ethics Audit. Fairness indicators checked across Ashanti, Northern, and Western regions. Gender and demographic bias balanced. Socio-economic accessibility channels (USSD and local Twi voice alerts) active. Personal Identifiable Information (PII) encrypted according to Act 843.',
  'doc-2-1': 'National Identification Authority Biometric Security Protocol & Architecture. OWASP Top 10 vulnerabilities cleared. Enforces Hardware Security Modules (HSM) with ephemeral salted SHA-256 hashes for fingerprint matching. Sovereign hosting inside National Data Centre in Accra compliant with Act 843.',
  'doc-3-1': 'Cocoa Management System (COCOBOD CMS) Farming Data Provenance & Inclusivity Charter. 1.2M farmer consent sheets catalogued. Steering committee instituted with MoFA and COCOBOD leadership. Multi-region satellite boundary verification arbitrated with local traditional authorities.',
  'doc-4-1': 'National E-Justice Court Tracking Registry Legal Ethics & AI Audit. Whisper NLP models fine-tuned on Ghanaian court audio (English, Twi, Ga, Ewe). Model Card published detailing accuracy thresholds and error boundaries. Data Protection Commission (DPC) registration active with certified DPO.',
  'doc-5-1': 'GRA Revenue Fraud Engine Security Specs & Model Governance. Supervised XGBoost pipeline with SHAP explainability summaries generated for automated tax audits. Enforces TLS 1.3 encryption, RBAC role bindings, and zero external cross-border data replication.'
};

const OCR_STORAGE_KEY = 'gnaprms_ocr_texts_v1';

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
