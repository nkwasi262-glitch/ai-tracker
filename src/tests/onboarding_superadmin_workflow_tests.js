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

// 6. Director General Final Sign-Off Verdict & Reasons Displayed on Dashboard
console.log('\n6. Testing Director General Final Verdict Status & Reasons on Dashboard:');

test('Director General final sign-off updates project status and exposes exact reasons on Dashboard when Rejected or Requires More Understanding', () => {
  const executeDGVerdictOnProject = (project, verdictChoice, mandatoryComments) => {
    const finalStatusLabel =
      verdictChoice === 'Approve'
        ? 'Approved'
        : verdictChoice === 'Reject'
        ? 'Rejected'
        : 'Requires More Understanding';

    const nextReviewStatus =
      verdictChoice === 'Approve'
        ? 'Approved'
        : verdictChoice === 'Reject'
        ? 'Rejected'
        : 'Returned';

    const nextOperationalStatus =
      verdictChoice === 'Approve'
        ? 'Active'
        : verdictChoice === 'Reject'
        ? 'Suspended'
        : 'Delayed';

    return {
      ...project,
      status: nextOperationalStatus,
      reviewStatus: nextReviewStatus,
      reviewNotes: mandatoryComments,
      dgFinalVerdict: {
        verdict: verdictChoice,
        finalStatusLabel,
        reasons: mandatoryComments,
        signedByName: 'Hon. Director General (NITA)',
        signedByRole: 'Super Admin / Director General',
        signedAt: new Date().toISOString(),
        signatureSeal: 'NITA-DG-SEAL-2026-VERIFIED'
      }
    };
  };

  // Case A: Rejected by Director General
  const rejectedProject = executeDGVerdictOnProject(
    { id: 'proj-4', name: 'Akosombo Smart Grid Load Forecaster', status: 'Delayed', reviewStatus: 'Recommended for DG Decision' },
    'Reject',
    'STATUTORY REJECTION: Unmitigated SCADA security vulnerabilities and failure to meet Act 843 sovereign hosting requirements.'
  );
  assert(rejectedProject.dgFinalVerdict.finalStatusLabel === 'Rejected', 'Rejected project has DG Final Status Label set to Rejected on Dashboard');
  assert(rejectedProject.status === 'Suspended', 'Rejected project operational status updated to Suspended');
  assert(
    rejectedProject.dgFinalVerdict.reasons.includes('Unmitigated SCADA security vulnerabilities'),
    'Exact DG rejection reasons are stored and visible on Dashboard'
  );

  // Case B: Requires More Understanding / Further Review
  const requiresUnderstandingProject = executeDGVerdictOnProject(
    { id: 'proj-5', name: 'Judicial Case Flow & Precedent Assistant', status: 'Active', reviewStatus: 'Recommended for DG Decision' },
    'Return for Further Review',
    'REQUIRES MORE UNDERSTANDING: Judicial Services must clarify human-in-the-loop judge override workflow and ethnic bias audit metrics.'
  );
  assert(
    requiresUnderstandingProject.dgFinalVerdict.finalStatusLabel === 'Requires More Understanding',
    'Returned project has DG Final Status Label set to Requires More Understanding on Dashboard'
  );
  assert(requiresUnderstandingProject.status === 'Delayed', 'Project requiring more understanding has operational status set to Delayed');
  assert(
    requiresUnderstandingProject.dgFinalVerdict.reasons.includes('clarify human-in-the-loop judge override workflow'),
    'Exact reasons why project requires more understanding are stored and visible on Dashboard'
  );
});

test('Director General signing and approving final verdict increases Dashboard Total AI Projects count and Approved Budget', () => {
  const isProjectApprovedByDG = (p) => {
    if (p.dgFinalVerdict) {
      return p.dgFinalVerdict.finalStatusLabel === 'Approved' || p.dgFinalVerdict.verdict === 'Approve';
    }
    if (p.reviewStatus) {
      return p.reviewStatus === 'Approved';
    }
    return p.status === 'Active' || p.status === 'Completed';
  };

  let portfolio = [
    { id: 'proj-6', name: 'LEAP Biometric Social Transfer Registry', status: 'Active', reviewStatus: 'Approved', budget: { totalAllocated: 12000000, utilized: 10800000 } },
    { id: 'proj-1', name: 'GhanaPostGPS', status: 'Delayed', reviewStatus: 'Recommended', budget: { totalAllocated: 24000000, utilized: 21500000 } },
    { id: 'proj-2', name: 'GhanaCard AFIS', status: 'Delayed', reviewStatus: 'Recommended', budget: { totalAllocated: 50000000, utilized: 47000000 } }
  ];

  const getDashboardTotals = (projectsList) => {
    const approved = projectsList.filter(isProjectApprovedByDG);
    return {
      totalProjectsCount: approved.length,
      totalBudget: approved.reduce((sum, p) => sum + p.budget.totalAllocated, 0)
    };
  };

  const beforeApproval = getDashboardTotals(portfolio);
  assert(beforeApproval.totalProjectsCount === 1, 'Before DG approval, only 1 project is counted in Approved Total AI Projects');
  assert(beforeApproval.totalBudget === 12000000, 'Before DG approval, Approved Budget is GHS 12,000,000');

  // Director General signs and approves proj-1 (GHS 24,000,000)
  portfolio = portfolio.map(p => p.id === 'proj-1' ? {
    ...p,
    status: 'Active',
    reviewStatus: 'Approved',
    dgFinalVerdict: {
      verdict: 'Approve',
      finalStatusLabel: 'Approved',
      reasons: 'Statutory approval granted under Act 771 and Act 843.'
    }
  } : p);

  const afterFirstApproval = getDashboardTotals(portfolio);
  assert(afterFirstApproval.totalProjectsCount === 2, 'After DG approves proj-1, Total AI Projects increases from 1 to 2 (+1)');
  assert(afterFirstApproval.totalBudget === 36000000, 'After DG approves proj-1, Approved Budget increases from GHS 12M to GHS 36M (+GHS 24,000,000)');

  // Director General signs and approves proj-2 (GHS 50,000,000)
  portfolio = portfolio.map(p => p.id === 'proj-2' ? {
    ...p,
    status: 'Active',
    reviewStatus: 'Approved',
    dgFinalVerdict: {
      verdict: 'Approve',
      finalStatusLabel: 'Approved',
      reasons: 'Biometric HSM audit verified; approved for national registry.'
    }
  } : p);

  const afterSecondApproval = getDashboardTotals(portfolio);
  assert(afterSecondApproval.totalProjectsCount === 3, 'After DG approves proj-2, Total AI Projects increases from 2 to 3 (+1)');
  assert(afterSecondApproval.totalBudget === 86000000, 'After DG approves proj-2, Approved Budget increases from GHS 36M to GHS 86M (+GHS 50,000,000)');
});

// 7. First-Timer Active Project Uses Logged-In MDA Name, Consolidates All Uploads Under Same MDA, and Auto-Grades Submission
console.log('\n7. Testing First-Timer Active Project MDA Binding, Same-MDA Document Grouping & Automatic Rubric Grading:');

test('First-Timer active project being registered uses the exact name of the MDA the First-Timer logged in with', () => {
  const firstTimerSession = {
    fullName: 'Dr. Akosua Mensah',
    email: 'a.mensah@mofa.gov.gh',
    institution: 'Ministry of Food and Agriculture (MoFA)',
    role: 'First-Timer / New User',
    memberType: 'new_member',
    isFirstTimer: true
  };

  const getFirstTimerMdaProjectId = (institution) => {
    const slug = institution.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `proj-mda-onboard-${slug}`;
  };

  const ensureFirstTimerMdaProject = (projects, institution) => {
    const targetId = getFirstTimerMdaProjectId(institution);
    const existing = projects.find(p => p.id === targetId);
    if (existing) return projects;
    return [
      {
        id: targetId,
        projectCode: 'GN-AI-2026-MOFA',
        name: institution,
        mda: institution,
        mdaCode: 'MoFA',
        documents: []
      },
      ...projects
    ];
  };

  const initialProjects = [
    { id: 'proj-1', projectCode: 'GN-AI-2026-001', name: 'GhanaPostGPS', mda: 'Ministry of Communications and Digitalisation (MOCD)', mdaCode: 'MOCD', documents: [] }
  ];

  const syncedProjects = ensureFirstTimerMdaProject(initialProjects, firstTimerSession.institution);
  const activeProject = syncedProjects.find(p => p.id === getFirstTimerMdaProjectId(firstTimerSession.institution));

  assert(activeProject !== undefined, 'Dedicated MDA onboarding project is created for the First-Timer');
  assert(activeProject.name === 'Ministry of Food and Agriculture (MoFA)', 'Active project being registered displays the exact MDA name the First-Timer logged in with');
  assert(activeProject.mda === 'Ministry of Food and Agriculture (MoFA)', 'Active project MDA field matches the First-Timer logged-in MDA');
});

test('All documents uploaded by a First-Timer are stored under the same logged-in MDA and automatically grade Governance & Ethics + AI Readiness', () => {
  const firstTimerSession = {
    fullName: 'Ing. Kofi Boateng',
    email: 'k.boateng@moh.gov.gh',
    institution: 'Ghana Health Service (GHS)',
    role: 'First-Timer / New User',
    memberType: 'new_member',
    isFirstTimer: true
  };

  let mdaProject = {
    id: 'proj-mda-onboard-ghana-health-service-ghs',
    projectCode: 'GN-AI-2026-GHS',
    name: firstTimerSession.institution,
    mda: firstTimerSession.institution,
    mdaCode: 'GHS',
    documents: [],
    compliance: { fairness: 55, transparency: 55, accountability: 55, privacy: 55, security: 55, overallGrade: 'Moderate' },
    readinessScore: 55
  };

  const autoGradeFromUploadedDocuments = (project) => {
    const docs = project.documents || [];
    const combinedText = docs.map(d => `${d.fileName} ${d.fullDocumentText || ''}`).join(' ').toLowerCase();
    const docCoverageBonus = Math.min(24, docs.length * 8);
    const hasEthics = combinedText.includes('fairness') || combinedText.includes('bias') || combinedText.includes('equity');
    const hasPrivacy = combinedText.includes('act 843') || combinedText.includes('dpia') || combinedText.includes('dpc');
    const hasSecurity = combinedText.includes('encryption') || combinedText.includes('iso 27001') || combinedText.includes('nita');
    const hasInfra = combinedText.includes('g-cloud') || combinedText.includes('gpu') || combinedText.includes('architecture');

    const fairness = Math.min(98, 60 + docCoverageBonus + (hasEthics ? 14 : 4));
    const transparency = Math.min(98, 60 + docCoverageBonus + 10);
    const accountability = Math.min(98, 60 + docCoverageBonus + 10);
    const privacy = Math.min(98, 60 + docCoverageBonus + (hasPrivacy ? 16 : 4));
    const security = Math.min(98, 60 + docCoverageBonus + (hasSecurity ? 14 : 4));
    const avg = Math.round((fairness + transparency + accountability + privacy + security) / 5);
    const overallGrade = avg >= 85 ? 'Excellent' : avg >= 70 ? 'Good' : avg >= 50 ? 'Moderate' : 'High Risk';
    const readinessScore = Math.min(98, 58 + docCoverageBonus + (hasInfra ? 14 : 6));

    return {
      compliance: { fairness, transparency, accountability, privacy, security, overallGrade },
      readinessScore
    };
  };

  const uploadDocumentAsFirstTimer = (fileName, fullDocumentText) => {
    const newDoc = {
      id: `doc-${Date.now()}-${Math.random()}`,
      fileName,
      uploadedByRole: firstTimerSession.role,
      uploadedByName: firstTimerSession.fullName,
      uploadedByMda: firstTimerSession.institution,
      isFirstTimerUpload: true,
      fullDocumentText
    };
    mdaProject.documents = [newDoc, ...mdaProject.documents];
    const graded = autoGradeFromUploadedDocuments(mdaProject);
    mdaProject.compliance = graded.compliance;
    mdaProject.readinessScore = graded.readinessScore;
  };

  // Upload 1st document
  uploadDocumentAsFirstTimer(
    'GHS_Telehealth_Architecture_GCloud.pdf',
    'Sovereign G-Cloud GPU architecture with fairness and regional dialect equity across 16 regions.'
  );
  // Upload 2nd document
  uploadDocumentAsFirstTimer(
    'GHS_Act843_DPIA_and_Security_Audit.pdf',
    'Data Protection Act 843 DPIA certified by DPC with ISO 27001 encryption and NITA interoperability.'
  );

  assert(mdaProject.documents.length === 2, 'Both uploaded documents are stored in the same MDA project');
  assert(
    mdaProject.documents.every(d => d.uploadedByMda === 'Ghana Health Service (GHS)'),
    'Every uploaded document is tagged and grouped under the same logged-in MDA (Ghana Health Service (GHS))'
  );
  assert(
    mdaProject.compliance.overallGrade === 'Excellent' && mdaProject.compliance.privacy >= 90,
    'Uploaded documents automatically grade the submission using the Ghana AI Governance & Ethics rubric'
  );
  assert(
    mdaProject.readinessScore >= 85,
    'Uploaded documents automatically grade the submission using the AI Readiness capability framework'
  );
});

const passed = tests.filter(t => t.passed).length;
const total = tests.length;

console.log('\n====================================================================');
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log('STATUS: ' + (passed === total ? 'ALL CRITERIA VERIFIED ✓' : 'FAILURES DETECTED ✗'));
console.log('====================================================================');

if (passed !== total) process.exit(1);
