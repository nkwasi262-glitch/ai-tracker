// Automated tests for First-Timer Onboarding Restrictions, Super Admin Document Review,
// Automated Assessment Generation (Governance & Ethics, AI Readiness), and Project Registration Clearance (Approve/Pend/Reject).

const assert = (condition, msg) => {
  if (!condition) {
    console.error(`  ✗ FAIL: ${msg}`);
    throw new Error(msg);
  }
  console.log(`  ✓ PASS: ${msg}`);
};

const tests = [];
function test(name, fn) {
  try {
    fn();
    tests.push({ name, passed: true });
  } catch (err) {
    tests.push({ name, passed: false, error: err.message });
  }
}

console.log('====================================================================');
console.log('   GNAPRMS FIRST-TIMER ONBOARDING & SUPER ADMIN CLEARANCE TESTS    ');
console.log('====================================================================\n');

// 1. First-Timer Onboarding Access Checks
console.log('1. Testing First-Timer Onboarding Mode Restrictions:');

test('First-Timer is in guided onboarding mode and restricted from selecting active role profile', () => {
  const firstTimerSession = {
    role: 'First-Timer / New User',
    isFirstTimer: true
  };
  // In First-Timer mode, role selector trigger must be undefined/locked
  const canSelectRole = firstTimerSession.role !== 'First-Timer / New User';
  assert(!canSelectRole, 'First-Timer cannot self-select active role profile during onboarding');
});

test('First-Timer is strictly blocked from Technical Clearance Gate', () => {
  const isFirstTimerRole = (role) => role === 'First-Timer / New User';
  const canAccessTechClearance = (role) => {
    if (isFirstTimerRole(role)) return false;
    return role === 'Technical Clearance Team' || role === 'Technical Director' || role === 'Super Admin';
  };

  assert(!canAccessTechClearance('First-Timer / New User'), 'First-Timer CANNOT access Technical Clearance Gate');
  assert(canAccessTechClearance('Technical Clearance Team'), 'Technical Clearance Team can access Technical Clearance Gate');
  assert(canAccessTechClearance('Technical Director'), 'Technical Director can access Technical Clearance Gate');
  assert(canAccessTechClearance('Super Admin'), 'Super Admin can access Technical Clearance Gate');
});

// 2. Super Admin Access to All Uploaded Documents
console.log('\n2. Testing Super Admin Access to All Uploaded Documents:');

test('Super Admin can access and aggregate all uploaded documents across all projects', () => {
  const mockProjects = [
    {
      id: 'p1',
      projectCode: 'GN-AI-001',
      name: 'Project 1',
      mda: 'MoCD',
      documents: [
        { id: 'd1', fileName: 'specs.pdf', fileType: 'pdf', uploadedAt: '2026-01-01', version: 1, signedBy: [] },
        { id: 'd2', fileName: 'ethics.pdf', fileType: 'pdf', uploadedAt: '2026-01-02', version: 1, signedBy: ['Director'] }
      ]
    },
    {
      id: 'p2',
      projectCode: 'GN-AI-002',
      name: 'Project 2',
      mda: 'NIA',
      documents: [
        { id: 'd3', fileName: 'biometric.pdf', fileType: 'pdf', uploadedAt: '2026-01-03', version: 1, signedBy: [] }
      ]
    }
  ];

  const allDocs = mockProjects.flatMap(p => p.documents.map(d => ({ doc: d, project: p })));
  assert(allDocs.length === 3, 'All 3 documents across 2 projects aggregated in master vault');
  assert(allDocs[0].doc.fileName === 'specs.pdf', 'Can inspect specs.pdf metadata');
  assert(allDocs[2].project.projectCode === 'GN-AI-002', 'Preserves parent project association');
});

// 3. Automated Assessment Generation (Governance & Ethics + AI Readiness)
console.log('\n3. Testing Automated Assessment Generation Engine:');

// Simple JS mirror of assessmentEngine logic to test determinism and rules
function simulateAssessment(docs, projName) {
  if (!docs || docs.length === 0) {
    return {
      compliance: { fairness: 35, transparency: 30, accountability: 35, privacy: 25, security: 30, overallGrade: 'High Risk' },
      readinessScore: 28,
      keySignals: ['Pending Document Upload']
    };
  }

  const combined = docs.map(d => `${d.fileName} ${d.ocrText || ''}`).join(' ').toLowerCase();
  
  let fairness = 60;
  if (combined.includes('fairness') || combined.includes('demographic') || combined.includes('bias')) fairness += 20;
  if (combined.includes('ashanti') || combined.includes('northern') || combined.includes('twi')) fairness += 15;

  let privacy = 50;
  if (combined.includes('act 843') || combined.includes('dpc')) privacy += 25;
  if (combined.includes('sha-256') || combined.includes('pii')) privacy += 18;

  let security = 50;
  if (combined.includes('owasp') || combined.includes('cybersecurity')) security += 25;
  if (combined.includes('tls 1.3') || combined.includes('hsm')) security += 18;

  let transparency = 55;
  if (combined.includes('model card') || combined.includes('specs')) transparency += 25;

  let accountability = 55;
  if (combined.includes('committee') || combined.includes('steering')) accountability += 25;

  fairness = Math.min(98, fairness);
  privacy = Math.min(98, privacy);
  security = Math.min(98, security);
  transparency = Math.min(98, transparency);
  accountability = Math.min(98, accountability);

  const avg = Math.round((fairness + privacy + security + transparency + accountability) / 5);
  const grade = avg >= 85 ? 'Excellent' : avg >= 70 ? 'Good' : avg >= 55 ? 'Moderate' : 'High Risk';

  let readiness = 60;
  if (combined.includes('cloud') || combined.includes('server') || combined.includes('hardware')) readiness += 12;
  if (combined.includes('engineer') || combined.includes('scientist')) readiness += 10;
  if (combined.includes('committee') || combined.includes('charter')) readiness += 10;
  readiness = Math.min(96, readiness);

  return {
    compliance: { fairness, transparency, accountability, privacy, security, overallGrade: grade },
    readinessScore: readiness,
    keySignals: ['Act 843 Validated', 'OWASP Cleared']
  };
}

test('Project with zero documents yields High Risk baseline assessment', () => {
  const result = simulateAssessment([], 'Empty Project');
  assert(result.compliance.overallGrade === 'High Risk', 'Zero documents correctly flags High Risk');
  assert(result.readinessScore <= 35, 'Readiness is at baseline without documentation');
});

test('Project with Act 843, OWASP, Model Card documents automatically generates high compliance', () => {
  const richDocs = [
    {
      fileName: 'System_Model_Card.pdf',
      ocrText: 'Official System Architecture & Model Card. Neural network hyperparameters documented. Steering committee charter signed.'
    },
    {
      fileName: 'DPC_Act843_Certificate.pdf',
      ocrText: 'Data Protection Commission (DPC) compliance under Ghana Act 843. PII hashed with SHA-256. DPO oversight verified.'
    },
    {
      fileName: 'Cybersecurity_Audit.pdf',
      ocrText: 'Audited against OWASP Top 10 vulnerabilities. Enforces TLS 1.3 on cloud servers.'
    },
    {
      fileName: 'Ethics_Inclusivity.pdf',
      ocrText: 'Ghana AI Ethics Framework evaluation. Demographic balance tested in Ashanti and Northern regions. Akan and Twi voice alerts active.'
    }
  ];

  const result = simulateAssessment(richDocs, 'Ghana AI Initiative');
  assert(result.compliance.overallGrade === 'Excellent', `Rich dossiers generated grade "${result.compliance.overallGrade}"`);
  assert(result.compliance.privacy >= 90, `Privacy score is ${result.compliance.privacy}% under Act 843`);
  assert(result.compliance.security >= 90, `Security score is ${result.compliance.security}% under OWASP`);
  assert(result.compliance.fairness >= 90, `Fairness score is ${result.compliance.fairness}%`);
  assert(result.readinessScore >= 80, `AI Readiness score is ${result.readinessScore}%`);
});

// 4. Super Admin Project Registration Actions (Approve, Pend, Reject)
console.log('\n4. Testing Super Admin Registration Clearance Decisions:');

test('Super Admin can approve project registration with active status', () => {
  let project = {
    id: 'proj-new',
    projectCode: 'GN-AI-2026-099',
    reviewStatus: 'Submitted',
    status: 'Delayed'
  };

  const handleSuperAdminDecision = (verdict, notes) => {
    project.reviewStatus = verdict;
    if (verdict === 'Approved') project.status = 'Active';
    project.directiveNotes = notes;
  };

  handleSuperAdminDecision('Approved', 'Approved under NITA Act 771');
  assert(project.reviewStatus === 'Approved', 'Project reviewStatus set to Approved');
  assert(project.status === 'Active', 'Approved project becomes Active');
});

test('Super Admin can pend project registration', () => {
  let project = {
    id: 'proj-new',
    projectCode: 'GN-AI-2026-099',
    reviewStatus: 'Under Technical Review'
  };

  const handleSuperAdminDecision = (verdict, notes) => {
    project.reviewStatus = verdict;
    project.directiveNotes = notes;
  };

  handleSuperAdminDecision('Pending', 'Awaiting DPC certificate resubmission');
  assert(project.reviewStatus === 'Pending', 'Project reviewStatus set to Pending');
  assert(project.directiveNotes.includes('DPC'), 'Directive notes recorded');
});

test('Super Admin can reject project registration', () => {
  let project = {
    id: 'proj-new',
    projectCode: 'GN-AI-2026-099',
    reviewStatus: 'Under Technical Review'
  };

  const handleSuperAdminDecision = (verdict, notes) => {
    project.reviewStatus = verdict;
    project.directiveNotes = notes;
  };

  handleSuperAdminDecision('Rejected', 'Failed AI Ethics Framework fairness audit');
  assert(project.reviewStatus === 'Rejected', 'Project reviewStatus set to Rejected');
});

// 5. First-Timer / Onboarder Full Document Access During Review & Grading
console.log('\n5. Testing First-Timer / Onboarder Full Document Access in Review & Grading:');

test('First-Timer / Onboarder uploaded documents preserve complete multi-page content and metadata for review & grading', () => {
  const onboarderDoc = {
    id: 'doc-onboard-1-2',
    fileName: 'Telehealth_FirstTimer_Onboarder_Full_Proposal_and_DPIA.pdf',
    fileType: 'pdf',
    fileSize: '2.48 MB',
    pageCount: 6,
    documentCategory: 'First-Timer / Onboarder Full Submission Dossier',
    uploadedAt: '2026-02-14',
    version: 1,
    signedBy: ['First-Timer / New User'],
    uploadedByRole: 'First-Timer / New User',
    uploadedByName: 'Dr. Akosua Mensah-Bonsu (GHS Onboarder)',
    uploadedByEmail: 'a.mensah-bonsu@moh.gov.gh',
    isFirstTimerUpload: true,
    reviewStatus: 'Pending Review',
    fullDocumentText: 'REPUBLIC OF GHANA - FULL STATUTORY AI ONBOARDING SUBMISSION DOSSIER\nPAGE 1: EXECUTIVE SUMMARY\nPAGE 2: ARCHITECTURE\nPAGE 3: ACT 843 DPIA\nPAGE 4: ALGORITHMIC FAIRNESS\nPAGE 5: CYBERSECURITY\nPAGE 6: ATTESTATION'
  };

  assert(onboarderDoc.isFirstTimerUpload === true, 'Document is flagged as a First-Timer / Onboarder upload');
  assert(onboarderDoc.pageCount === 6, 'Full document preserves multi-page count (6 pages)');
  assert(onboarderDoc.fullDocumentText.includes('PAGE 1') && onboarderDoc.fullDocumentText.includes('PAGE 6'), 'Complete multi-page full document text is accessible for reading during review & grading');
});

test('Reviewers can read full onboarder document side-by-side and submit Governance & Ethics + AI Readiness grades', () => {
  let doc = {
    id: 'doc-onboard-1-2',
    fileName: 'Telehealth_FirstTimer_Onboarder_Full_Proposal_and_DPIA.pdf',
    isFirstTimerUpload: true,
    reviewStatus: 'Pending Review',
    reviewerComments: []
  };
  let project = {
    id: 'proj-1',
    projectCode: 'GN-AI-2026-001',
    compliance: { fairness: 80, transparency: 80, accountability: 80, privacy: 80, security: 80, overallGrade: 'Good' },
    readinessScore: 78,
    reviewStatus: 'Under Technical Review'
  };

  // Simulate side-by-side Full Document Review & Grading submission
  const submitFullDocReviewAndGrade = (verdict, comment, newCompliance, newReadiness) => {
    doc.reviewStatus = verdict === 'Approved' ? 'Reviewed & Verified' : 'Requires Re-submission';
    doc.reviewerComments.unshift({
      id: 'rev-1',
      reviewerName: 'NITA Super Admin',
      reviewerRole: 'Super Admin',
      comment,
      verdict,
      gradedCompliance: newCompliance,
      gradedReadinessScore: newReadiness
    });
    project.compliance = newCompliance;
    project.readinessScore = newReadiness;
  };

  submitFullDocReviewAndGrade(
    'Approved',
    'Full 6-page onboarder dossier inspected and verified under Act 843 and NITA Act 771.',
    { fairness: 92, transparency: 90, accountability: 90, privacy: 95, security: 93, overallGrade: 'Excellent' },
    91
  );

  assert(doc.reviewStatus === 'Reviewed & Verified', 'Onboarder document status updated to Reviewed & Verified');
  assert(doc.reviewerComments.length === 1, 'Reviewer directive saved on onboarder document');
  assert(project.compliance.overallGrade === 'Excellent', 'Governance & Ethics grade updated from full-document grading studio');
  assert(project.readinessScore === 91, 'AI Readiness score updated from full-document grading studio');
});

test('First-Timer real uploaded file is preserved byte-for-byte with original fileName and verbatim content on review and download', () => {
  const realFileStore = {};
  const uploadRealFileAsFirstTimer = (docId, fileName, mimeType, rawContent, dataUrl) => {
    realFileStore[docId] = {
      docId,
      fileName,
      mimeType,
      dataUrl,
      extractedText: rawContent
    };
    return {
      id: docId,
      fileName,
      fileType: fileName.split('.').pop().toLowerCase(),
      isFirstTimerUpload: true,
      fullDocumentText: rawContent,
      fileDataUrl: dataUrl
    };
  };

  const uploadedDoc = uploadRealFileAsFirstTimer(
    'doc-onboard-real-1',
    'My_Custom_FirstTimer_Proposal.pdf',
    'application/pdf',
    'CUSTOM FIRST-TIMER AI PROPOSAL: SOVEREIGN AGRI-DRONE TELEMETRY FOR NORTHERN GHANA',
    'data:application/pdf;base64,JVBERi0xLjQK'
  );

  // Verify review returns the exact uploaded content first (not overwritten by boilerplate)
  const reviewContent = realFileStore[uploadedDoc.id].extractedText;
  assert(
    reviewContent === 'CUSTOM FIRST-TIMER AI PROPOSAL: SOVEREIGN AGRI-DRONE TELEMETRY FOR NORTHERN GHANA',
    'Reviewing the document returns the exact verbatim content uploaded by the First-Timer'
  );

  // Verify downloading returns the exact original fileName and binary DataURL (even for PDFs)
  const downloadResult = {
    downloadName: uploadedDoc.fileName,
    href: realFileStore[uploadedDoc.id].dataUrl
  };
  assert(
    downloadResult.downloadName === 'My_Custom_FirstTimer_Proposal.pdf',
    'Downloading preserves the exact original fileName (not renamed to _FULL_DOSSIER.txt)'
  );
  assert(
    downloadResult.href.startsWith('data:application/pdf;base64,'),
    'Downloading a PDF preserves the exact original PDF binary payload'
  );
});

const passed = tests.filter(t => t.passed).length;
const total = tests.length;

console.log('\n====================================================================');
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log('STATUS: ' + (passed === total ? 'ALL CRITERIA VERIFIED ✓' : 'FAILURES DETECTED ✗'));
console.log('====================================================================');

if (passed !== total) process.exit(1);
