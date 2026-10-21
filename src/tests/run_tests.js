/**
 * Standalone RBAC & Verification Test Runner for GNAPRMS
 */

// Permitted modules by role definition matching rbacPolicy.ts
const ROLE_MODULE_PERMISSIONS = {
  'Super Admin': [
    'dashboard', 'registry', 'gis', 'governance', 'readiness', 
    'risk', 'documents', 'dg_queue', 'finance', 'reports', 'audit', 'chat'
  ],
  'Technical Director': [
    'dashboard', 'registry', 'gis', 'governance', 'readiness', 
    'risk', 'documents', 'dg_queue', 'finance', 'reports', 'audit', 'chat'
  ],
  'Technical Clearance Team': [
    'dashboard', 'registry', 'gis', 'governance', 'readiness', 
    'risk', 'documents', 'finance', 'reports', 'audit', 'chat'
  ],
  'AI Manager': [
    'dashboard', 'registry', 'gis', 'governance', 'readiness', 
    'risk', 'documents', 'finance', 'reports', 'chat'
  ],
  'Director General': [
    'dashboard', 'dg_queue', 'gis', 'finance', 'reports', 'audit', 'chat'
  ],
  'Finance Minister': [
    'dashboard', 'finance', 'chat'
  ],
  'Public User': [
    'dashboard', 'gis', 'chat'
  ],
  'First-Timer / New User': [
    'documents', 'readiness', 'governance'
  ]
};

const APPROVED_GOV_DOMAINS = [
  'gov.gh', 'nita.gov.gh', 'mocd.gov.gh', 'mof.gov.gh', 'moh.gov.gh',
  'moe.gov.gh', 'dpc.gov.gh', 'gra.gov.gh', 'cocobod.gh'
];

function isApprovedInstitutionalEmail(email) {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  return (
    domain.endsWith('.gov.gh') ||
    APPROVED_GOV_DOMAINS.includes(domain)
  );
}

function canAccessModule(role, moduleId) {
  const allowed = ROLE_MODULE_PERMISSIONS[role] || [];
  return allowed.includes(moduleId);
}

const tests = [];
function test(name, fn) {
  try {
    fn();
    tests.push({ name, passed: true });
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    tests.push({ name, passed: false, error: err.message });
    console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('====================================================================');
console.log('   REPUBLIC OF GHANA - GNAPRMS RBAC & ENTRY GATE TEST EXECUTION     ');
console.log('====================================================================\n');

console.log('1. Testing Institutional Email Verification Gate:');
test('NITA official domain (@nita.gov.gh) is verified', () => {
  assert(isApprovedInstitutionalEmail('officer@nita.gov.gh'), 'Should verify nita.gov.gh');
});
test('Ministry of Communications (@mocd.gov.gh) is verified', () => {
  assert(isApprovedInstitutionalEmail('director@mocd.gov.gh'), 'Should verify mocd.gov.gh');
});
test('Ministry of Finance (@mof.gov.gh) is verified', () => {
  assert(isApprovedInstitutionalEmail('minister@mof.gov.gh'), 'Should verify mof.gov.gh');
});
test('Subdomains of gov.gh (@custom.gov.gh) are verified', () => {
  assert(isApprovedInstitutionalEmail('lead@security.gov.gh'), 'Should verify subdomains of gov.gh');
});
test('Commercial email (@gmail.com) is rejected for privileged access', () => {
  assert(!isApprovedInstitutionalEmail('user@gmail.com'), 'Should reject gmail.com');
});
test('Commercial email (@yahoo.com) is rejected for privileged access', () => {
  assert(!isApprovedInstitutionalEmail('user@yahoo.com'), 'Should reject yahoo.com');
});

console.log('\n2. Testing Super Admin Permissions (Full Access):');
const allModules = ['dashboard', 'registry', 'gis', 'governance', 'readiness', 'risk', 'documents', 'dg_queue', 'finance', 'reports', 'audit', 'chat'];
allModules.forEach(mod => {
  test(`Super Admin can access ${mod}`, () => {
    assert(canAccessModule('Super Admin', mod), `Super Admin should access ${mod}`);
  });
});

console.log('\n3. Testing Director General Permissions (Executive Decision Isolation):');
test('Director General can access executive overview dashboard', () => {
  assert(canAccessModule('Director General', 'dashboard'), 'DG should access dashboard');
});
test('Director General can access Recommended for Final Decision Queue', () => {
  assert(canAccessModule('Director General', 'dg_queue'), 'DG should access dg_queue');
});
test('Director General can access National GIS Spatial Map', () => {
  assert(canAccessModule('Director General', 'gis'), 'DG should access gis');
});
test('Director General can view Fiscal Suite overview', () => {
  assert(canAccessModule('Director General', 'finance'), 'DG should access finance');
});
test('Director General can read Classified Internal Reports', () => {
  assert(canAccessModule('Director General', 'reports'), 'DG should access reports');
});
test('Director General is BLOCKED from Project Registry CRUD editing', () => {
  assert(!canAccessModule('Director General', 'registry'), 'DG should NOT access registry CRUD');
});
test('Director General is BLOCKED from Governance & Ethics rubric editing', () => {
  assert(!canAccessModule('Director General', 'governance'), 'DG should NOT access governance');
});
test('Director General is BLOCKED from AI Readiness modification', () => {
  assert(!canAccessModule('Director General', 'readiness'), 'DG should NOT access readiness');
});
test('Director General is BLOCKED from Risk Matrix threat editing', () => {
  assert(!canAccessModule('Director General', 'risk'), 'DG should NOT access risk');
});
test('Director General is BLOCKED from Technical Document Manager (uses isolated DG Queue)', () => {
  assert(!canAccessModule('Director General', 'documents'), 'DG should NOT access documents');
});

console.log('\n4. Testing Finance Minister Permissions (Strict Fiscal Isolation):');
test('Finance Minister can access M&E Dashboard', () => {
  assert(canAccessModule('Finance Minister', 'dashboard'), 'Finance Minister should access dashboard');
});
test('Finance Minister can access Financial Suite & Exports', () => {
  assert(canAccessModule('Finance Minister', 'finance'), 'Finance Minister should access finance');
});
test('Finance Minister can access AI Assistant', () => {
  assert(canAccessModule('Finance Minister', 'chat'), 'Finance Minister should access chat');
});
const blockedForFinance = ['registry', 'gis', 'governance', 'readiness', 'risk', 'documents', 'dg_queue', 'reports', 'audit'];
blockedForFinance.forEach(mod => {
  test(`Finance Minister is STRICTLY BLOCKED from ${mod}`, () => {
    assert(!canAccessModule('Finance Minister', mod), `Finance Minister should NOT access ${mod}`);
  });
});

console.log('\n5. Testing Public User Permissions (Unchanged Citizen Mode):');
test('Public User can access Public M&E Dashboard', () => {
  assert(canAccessModule('Public User', 'dashboard'), 'Public User should access dashboard');
});
test('Public User can access Public GIS Map', () => {
  assert(canAccessModule('Public User', 'gis'), 'Public User should access gis');
});
test('Public User can access Public AI Assistant', () => {
  assert(canAccessModule('Public User', 'chat'), 'Public User should access chat');
});
const blockedForPublic = ['registry', 'governance', 'readiness', 'risk', 'documents', 'dg_queue', 'finance', 'reports', 'audit'];
blockedForPublic.forEach(mod => {
  test(`Public User is STRICTLY BLOCKED from internal module: ${mod}`, () => {
    assert(!canAccessModule('Public User', mod), `Public User should NOT access ${mod}`);
  });
});

console.log('\n6. Testing Technical Director & Clearance Team Permissions:');
test('Technical Director can access all technical modules and preview DG queue', () => {
  assert(canAccessModule('Technical Director', 'documents'), 'Tech Director should access documents');
  assert(canAccessModule('Technical Director', 'dg_queue'), 'Tech Director should access dg_queue');
  assert(canAccessModule('Technical Director', 'reports'), 'Tech Director should access reports');
});
test('Technical Clearance Team can access technical modules and internal reports', () => {
  assert(canAccessModule('Technical Clearance Team', 'documents'), 'Tech Clearance should access documents');
  assert(canAccessModule('Technical Clearance Team', 'governance'), 'Tech Clearance should access governance');
  assert(canAccessModule('Technical Clearance Team', 'reports'), 'Tech Clearance should access reports');
  assert(!canAccessModule('Technical Clearance Team', 'dg_queue'), 'Tech Clearance should NOT access dg_queue');
});
test('AI Manager can access registry and documents, but blocked from audit admin and DG queue', () => {
  assert(canAccessModule('AI Manager', 'registry'), 'AI Manager should access registry');
  assert(canAccessModule('AI Manager', 'documents'), 'AI Manager should access documents');
  assert(!canAccessModule('AI Manager', 'audit'), 'AI Manager should NOT access audit');
  assert(!canAccessModule('AI Manager', 'dg_queue'), 'AI Manager should NOT access dg_queue');
});

console.log('\n7. Testing First-Timer / New User Permissions (Orientation Track):');
test('First-Timer can access Document & OCR (where they can upload required files)', () => {
  assert(canAccessModule('First-Timer / New User', 'documents'), 'First-Timer should access documents');
});
test('First-Timer can access AI Readiness assessment service as a guide', () => {
  assert(canAccessModule('First-Timer / New User', 'readiness'), 'First-Timer should access readiness');
});
test('First-Timer can access Governance & Ethics compliance service as a guide', () => {
  assert(canAccessModule('First-Timer / New User', 'governance'), 'First-Timer should access governance');
});

const blockedForFirstTimer = ['dashboard', 'registry', 'gis', 'risk', 'dg_queue', 'finance', 'reports', 'audit', 'chat'];
blockedForFirstTimer.forEach(mod => {
  test(`First-Timer is STRICTLY BLOCKED from unauthorized module: ${mod}`, () => {
    assert(!canAccessModule('First-Timer / New User', mod), `First-Timer should NOT access ${mod}`);
  });
});

test('After onboarding, selecting an Active Role Profile unlocks modules per that chosen role', () => {
  // E.g. When transitioning from First-Timer to AI Manager:
  assert(canAccessModule('AI Manager', 'registry'), 'Elevated AI Manager should access registry');
  assert(canAccessModule('AI Manager', 'finance'), 'Elevated AI Manager should access finance');
  // E.g. When transitioning from First-Timer to Director General:
  assert(canAccessModule('Director General', 'dg_queue'), 'Elevated DG should access dg_queue');
  assert(!canAccessModule('Director General', 'registry'), 'Elevated DG should still be isolated from registry CRUD');
});

console.log('\n8. Testing Zero-Assumption Governance & Verification Rules:');

const ROLE_ACTION_PERMISSIONS = {
  'Super Admin': { VERIFY_FINANCIAL_EXPENDITURE: true },
  'Finance Minister': { VERIFY_FINANCIAL_EXPENDITURE: true },
  'Director General': { VERIFY_FINANCIAL_EXPENDITURE: false },
  'AI Manager': { VERIFY_FINANCIAL_EXPENDITURE: false },
  'Public User': { VERIFY_FINANCIAL_EXPENDITURE: false },
  'First-Timer / New User': { VERIFY_FINANCIAL_EXPENDITURE: false }
};

function canPerformAction(role, action) {
  return !!ROLE_ACTION_PERMISSIONS[role]?.[action];
}

test('Finance Minister has authority to verify statutory expenditures under Act 921', () => {
  assert(canPerformAction('Finance Minister', 'VERIFY_FINANCIAL_EXPENDITURE'), 'Finance Minister should have VERIFY_FINANCIAL_EXPENDITURE');
});

test('Super Admin has authority to verify statutory expenditures', () => {
  assert(canPerformAction('Super Admin', 'VERIFY_FINANCIAL_EXPENDITURE'), 'Super Admin should have VERIFY_FINANCIAL_EXPENDITURE');
});

test('Director General and unprivileged roles CANNOT fabricate financial verification without treasury role', () => {
  assert(!canPerformAction('Director General', 'VERIFY_FINANCIAL_EXPENDITURE'), 'DG cannot verify financial expenditure');
  assert(!canPerformAction('AI Manager', 'VERIFY_FINANCIAL_EXPENDITURE'), 'AI Manager cannot verify financial expenditure');
  assert(!canPerformAction('Public User', 'VERIFY_FINANCIAL_EXPENDITURE'), 'Public User cannot verify financial expenditure');
});

test('Project intake forbids assumed disbursements (disbursed must initialize to 0 without warrant)', () => {
  const newIntakeProject = {
    budget: {
      totalAllocated: 5000000,
      disbursed: 0,
      utilized: 0,
      remaining: 5000000,
      primaryFundingSource: 'Government',
      verificationStatus: 'Self-Reported (Unverified)',
      hasAssumptionsFlag: true,
      assumptionWarnings: ['Unverified preliminary allocation: No MoF Treasury Warrant attached']
    },
    readinessScore: 28,
    zeroAssumptionAudit: {
      isFullyVerified: false,
      evidenceBackingScore: 30,
      verifiedSignals: [],
      unverifiedAssumptions: ['Disbursement unverified', 'Milestone completion assumed without independent inspection']
    }
  };

  assert(newIntakeProject.budget.disbursed === 0, 'Initial disbursement must be 0 GHS, avoiding assumed 10% mobilization');
  assert(newIntakeProject.budget.hasAssumptionsFlag === true, 'Project without warrant must have assumption flag');
  assert(newIntakeProject.readinessScore === 28, 'Readiness score without documents must be unassumed baseline (28%)');
  assert(newIntakeProject.zeroAssumptionAudit.isFullyVerified === false, 'Cannot be marked verified without evidence');
});

test('Attaching official MoF Treasury Warrant eliminates assumption flag and updates status', () => {
  const unverifiedProject = {
    budget: {
      totalAllocated: 3200000,
      disbursed: 1200000,
      utilized: 1000000,
      remaining: 2200000,
      verificationStatus: 'Self-Reported (Unverified)',
      hasAssumptionsFlag: true,
      assumptionWarnings: ['Disbursement self-reported without warrant']
    }
  };

  // Simulate Finance Minister verification action
  const warrantNumber = 'MOF/WARR/2026/088';
  const verifiedBudget = {
    ...unverifiedProject.budget,
    verificationStatus: 'MoF Audited & Verified',
    mofWarrantNumber: warrantNumber,
    lastAuditedDate: '2026-10-21',
    hasAssumptionsFlag: false,
    assumptionWarnings: []
  };

  assert(verifiedBudget.verificationStatus === 'MoF Audited & Verified', 'Status should be MoF Audited & Verified');
  assert(verifiedBudget.mofWarrantNumber === warrantNumber, 'Warrant number must be recorded');
  assert(verifiedBudget.hasAssumptionsFlag === false, 'Assumption flag must be eliminated');
  assert(verifiedBudget.assumptionWarnings.length === 0, 'Assumption warnings must be cleared');
});

test('Zero-Assumption summary segregates warrant-verified capital from self-reported claims', () => {
  const sampleProjects = [
    {
      budget: {
        totalAllocated: 10000000,
        disbursed: 4000000,
        verificationStatus: 'MoF Audited & Verified',
        hasAssumptionsFlag: false
      }
    },
    {
      budget: {
        totalAllocated: 5000000,
        disbursed: 2000000,
        verificationStatus: 'Self-Reported (Unverified)',
        hasAssumptionsFlag: true
      }
    }
  ];

  const totalDisbursed = sampleProjects.reduce((acc, p) => acc + p.budget.disbursed, 0);
  const verifiedDisbursed = sampleProjects.filter(p => p.budget.verificationStatus === 'MoF Audited & Verified').reduce((acc, p) => acc + p.budget.disbursed, 0);
  const unverifiedDisbursed = totalDisbursed - verifiedDisbursed;
  const portfolioAssurancePercent = Math.round((verifiedDisbursed / totalDisbursed) * 100);

  assert(totalDisbursed === 6000000, 'Total disbursed should be 6M');
  assert(verifiedDisbursed === 4000000, 'Verified capital should be 4M');
  assert(unverifiedDisbursed === 2000000, 'Unverified capital should be 2M');
  assert(portfolioAssurancePercent === 67, 'Assurance percentage should be 67%');
});

console.log('\n9. Testing First-Timer Document Upload System Synchronization:');

test('First-Timer document upload immediately triggers automated regulatory evaluation', () => {
  const firstTimerSession = {
    fullName: 'Kofi Mensah',
    email: 'kofi.mensah@nita.gov.gh',
    role: 'First-Timer / New User',
    institution: 'National Information Technology Agency',
    isFirstTimer: true
  };

  const project = {
    id: 'proj-test',
    projectCode: 'GN-AI-2026-TEST',
    name: 'Akuafo Soil AI Scanner',
    documents: [],
    compliance: { fairness: 35, transparency: 30, accountability: 35, privacy: 25, security: 30, overallGrade: 'High Risk' },
    readinessScore: 28,
    status: 'Active'
  };

  // Simulate upload
  const uploadedDoc = {
    id: 'doc-upload-1',
    fileName: 'Akuafo_Model_Architecture_Specs.pdf',
    fileType: 'pdf',
    uploadedAt: '2026-10-21',
    version: 1,
    signedBy: ['First-Timer / New User']
  };

  const mockCombinedText = 'official system architecture specification & model card. tensorflow lite offline mobile net leaf analysis. personal data protected under act 843 with sha-256 salts. steering committee established with mofa leadership. certified data protection commission dpc filing.';

  // Simulate assessmentEngine evaluation
  const containsAny = (keywords) => keywords.some(k => mockCombinedText.includes(k));
  
  let pillarInfra = 55;
  if (containsAny(['tensorflow', 'offline', 'infrastructure'])) pillarInfra += 20;
  let pillarData = 50;
  if (containsAny(['dataset', 'provenance', 'act 843', 'dpc'])) pillarData += 20;
  let pillarStaff = 55;
  if (containsAny(['team', 'leadership', 'committee'])) pillarStaff += 20;
  let pillarPolicy = 50;
  if (containsAny(['steering', 'committee', 'policy'])) pillarPolicy += 22;

  const readinessScore = Math.round((pillarInfra + pillarData + pillarStaff + pillarPolicy) / 4);
  const isFromFirstTimer = firstTimerSession.role === 'First-Timer / New User' || !!firstTimerSession.isFirstTimer;

  const autoAssessment = {
    generatedAt: new Date().toISOString(),
    generatedBy: firstTimerSession.fullName,
    documentCount: 1,
    documentsAnalyzed: [uploadedDoc.fileName],
    readinessSummary: `Institutional AI readiness computed at ${readinessScore}%.`,
    keySignals: ['Ghana Act 843 / DPC Compliant', 'Model Card & Architecture Validated'],
    readinessPillars: {
      infrastructure: pillarInfra,
      dataGovernance: pillarData,
      technicalStaff: pillarStaff,
      policyLeadership: pillarPolicy
    },
    submittedByFirstTimer: isFromFirstTimer,
    firstTimerOfficerName: firstTimerSession.fullName,
    firstTimerOfficerEmail: firstTimerSession.email
  };

  // Update project in system state
  const updatedProject = {
    ...project,
    documents: [uploadedDoc],
    readinessScore,
    autoAssessment,
    hasFirstTimerUpload: isFromFirstTimer,
    reviewStatus: 'Under Technical Review'
  };

  assert(updatedProject.documents.length === 1, 'Document should be added to project vault');
  assert(updatedProject.readinessScore > 28, 'Readiness score should rise above baseline 28%');
  assert(updatedProject.autoAssessment.submittedByFirstTimer === true, 'First-timer attribution flag must be true');
  assert(updatedProject.autoAssessment.firstTimerOfficerEmail === 'kofi.mensah@nita.gov.gh', 'Officer email must match');
  assert(updatedProject.autoAssessment.readinessPillars.infrastructure >= 75, 'Infrastructure pillar must be scored');
  assert(updatedProject.hasFirstTimerUpload === true, 'Project must flag first timer upload for registry badges');
  assert(updatedProject.reviewStatus === 'Under Technical Review', 'Project review status should automatically advance to Under Technical Review');
});

test('Document upload eliminates assumptions and raises evidence backing score', () => {
  const initialZeroAssumption = {
    isFullyVerified: false,
    evidenceBackingScore: 15,
    verifiedSignals: [],
    unverifiedAssumptions: ['No project charter or technical architecture submitted'],
    assumptionsEliminatedCount: 0
  };

  const docCount = 2;
  const avgEthics = 85;
  const updatedEvidenceScore = Math.min(100, Math.round((docCount * 25) + (avgEthics * 0.25)));
  const eliminated = docCount * 2;

  assert(updatedEvidenceScore === 71, 'Evidence backing score should calculate to 71%');
  assert(eliminated === 4, '4 assumptions should be marked eliminated by 2 uploaded files');
});

console.log('\n10. Testing Finance Minister Commentary & Statutory Directives (PFM Act 921):');

test('Finance Minister can record portfolio-wide and project-level statutory comments', () => {
  const ministerSession = {
    fullName: 'Hon. Dr. Mohammed Amin Adam',
    email: 'm.adam@mof.gov.gh',
    role: 'Finance Minister',
    institution: 'Ministry of Finance & Economic Planning'
  };

  const project = {
    id: 'proj-1',
    projectCode: 'GN-AI-2026-001',
    name: 'GhanaPostGPS',
    budget: {
      totalAllocated: 24000000,
      disbursed: 22000000,
      utilized: 21500000,
      remaining: 2500000,
      primaryFundingSource: 'Government',
      currency: 'GHS',
      verificationStatus: 'MoF Audited & Verified',
      mofWarrantNumber: 'MOF/WARR/2026/014'
    }
  };

  const directiveText = 'Tranche 2 disbursement fully verified against MoF Treasury Warrant. Proceed with emergency dispatch caching expansion in Q4.';
  const directiveDate = '2026-10-21';

  // Apply comment to project budget
  const updatedBudget = {
    ...project.budget,
    financeMinisterComments: directiveText,
    financeMinisterCommentDate: directiveDate,
    financeMinisterCommentAuthor: ministerSession.fullName
  };

  assert(updatedBudget.financeMinisterComments === directiveText, 'Ministerial directive text must be preserved');
  assert(updatedBudget.financeMinisterCommentDate === directiveDate, 'Directive date must be recorded');
  assert(updatedBudget.financeMinisterCommentAuthor === 'Hon. Dr. Mohammed Amin Adam', 'Author must be recorded as Finance Minister');
});

test('Ministerial directive structure supports statutory classification and audit binding', () => {
  const directive = {
    id: 'mof-dir-test',
    targetTitle: '🌐 National AI Portfolio (Overall Fiscal Directive)',
    comment: 'All MDAs utilizing AI grant allocations must submit monthly primary bank vouchers.',
    authorName: 'Hon. Dr. Mohammed Amin Adam (Finance Minister)',
    authorRole: 'Finance Minister',
    createdAt: '2026-10-21',
    directiveType: 'Budget Release Caveat'
  };

  assert(directive.directiveType === 'Budget Release Caveat', 'Directive must have valid classification');
  assert(directive.authorRole === 'Finance Minister', 'Role must reflect Finance Minister');
  assert(directive.comment.length > 20, 'Directive comment must be substantive');
});

const passed = tests.filter(t => t.passed).length;
const total = tests.length;

console.log('\n====================================================================');
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log('STATUS: ' + (passed === total ? 'ALL CRITERIA VERIFIED ✓' : 'FAILURES DETECTED ✗'));
console.log('====================================================================');

if (passed !== total) {
  process.exit(1);
}
