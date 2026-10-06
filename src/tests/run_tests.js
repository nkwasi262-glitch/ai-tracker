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

const passed = tests.filter(t => t.passed).length;
const total = tests.length;

console.log('\n====================================================================');
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log('STATUS: ' + (passed === total ? 'ALL CRITERIA VERIFIED ✓' : 'FAILURES DETECTED ✗'));
console.log('====================================================================');

if (passed !== total) {
  process.exit(1);
}
