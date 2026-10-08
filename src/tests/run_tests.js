/**
 * Standalone RBAC & Verification Test Runner for GNAPRMS
 * Includes User Management, Role Auto-Detection, and Suspension Gate Testing
 */

// Permitted modules by role definition matching rbacPolicy.ts
const ROLE_MODULE_PERMISSIONS = {
  'Super Admin': [
    'dashboard', 'registry', 'gis', 'governance', 'readiness', 
    'risk', 'documents', 'dg_queue', 'finance', 'reports', 'audit', 'users', 'chat'
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

// Seed directory mimicking userService.ts
const PLATFORM_USERS = [
  {
    id: 'usr-1',
    fullName: 'Dr. Kwaku Mensah',
    email: 'k.mensah@nita.gov.gh',
    role: 'Super Admin',
    institution: 'National Information Technology Agency (NITA)',
    status: 'Active'
  },
  {
    id: 'usr-2',
    fullName: 'Hon. Director General',
    email: 'dg@nita.gov.gh',
    role: 'Director General',
    institution: 'National Information Technology Agency (NITA)',
    status: 'Active'
  },
  {
    id: 'usr-3',
    fullName: 'Ing. Emmanuel Darko',
    email: 'e.darko@mocd.gov.gh',
    role: 'Technical Director',
    institution: 'Ministry of Communications and Digitalisation',
    status: 'Active'
  },
  {
    id: 'usr-4',
    fullName: 'Ama Osei-Bonsu',
    email: 'a.osei@nita.gov.gh',
    role: 'Technical Clearance Team',
    institution: 'National Information Technology Agency (NITA)',
    status: 'Active'
  },
  {
    id: 'usr-6',
    fullName: 'Kwame Boateng',
    email: 'k.boateng@cocobod.gh',
    role: 'AI Manager',
    institution: 'Ghana Cocoa Board (COCOBOD)',
    status: 'Active'
  },
  {
    id: 'usr-7',
    fullName: 'Hon. Finance Minister',
    email: 'minister@mof.gov.gh',
    role: 'Finance Minister',
    institution: 'Ministry of Finance',
    status: 'Active'
  },
  {
    id: 'usr-8',
    fullName: 'Yaw Frimpong',
    email: 'y.frimpong@gra.gov.gh',
    role: 'AI Manager',
    institution: 'Ghana Revenue Authority',
    status: 'Suspended'
  },
  {
    id: 'usr-9',
    fullName: 'Kofi Citizen',
    email: 'citizen@public.gh',
    role: 'Public User',
    institution: 'Public Citizen',
    status: 'Active'
  }
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

function findUserByEmail(email, userList = PLATFORM_USERS) {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  return userList.find(u => u.email.toLowerCase() === clean) || null;
}

function autoDetectRole(email, userList = PLATFORM_USERS) {
  const user = findUserByEmail(email, userList);
  if (user) return user.role;
  if (isApprovedInstitutionalEmail(email)) return 'AI Manager';
  return 'Public User';
}

function simulateGateLogin(email, userList = PLATFORM_USERS) {
  const clean = email.trim().toLowerCase();
  const user = findUserByEmail(clean, userList);
  if (user && user.status === 'Suspended') {
    return {
      allowed: false,
      reason: 'ACCOUNT_SUSPENDED',
      message: 'Access Denied: This account has been suspended by the System Administrator.'
    };
  }
  const role = autoDetectRole(clean, userList);
  return {
    allowed: true,
    role,
    user: user || null
  };
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

console.log('\n2. Testing Super Admin Permissions (Full Access + User Management):');
const allModules = ['dashboard', 'registry', 'gis', 'governance', 'readiness', 'risk', 'documents', 'dg_queue', 'finance', 'reports', 'audit', 'users', 'chat'];
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
const blockedForFinance = ['registry', 'gis', 'governance', 'readiness', 'risk', 'documents', 'dg_queue', 'reports', 'audit', 'users'];
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
const blockedForPublic = ['registry', 'governance', 'readiness', 'risk', 'documents', 'dg_queue', 'finance', 'reports', 'audit', 'users'];
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

console.log('\n7. Testing User Management RBAC Isolation (Super Admin Exclusive):');
test('Super Admin can access User Management module ("users")', () => {
  assert(canAccessModule('Super Admin', 'users'), 'Super Admin must have access to users module');
});
const rolesBlockedFromUserManagement = [
  'Director General',
  'Technical Director',
  'Technical Clearance Team',
  'AI Manager',
  'Finance Minister',
  'Public User'
];
rolesBlockedFromUserManagement.forEach(role => {
  test(`${role} is STRICTLY BLOCKED from User Management ("users")`, () => {
    assert(!canAccessModule(role, 'users'), `${role} must NOT have access to user management`);
  });
});

console.log('\n8. Testing Account Role Auto-Detection from Credentials:');
test('Auto-detects Super Admin role for Dr. Kwaku Mensah (k.mensah@nita.gov.gh)', () => {
  const role = autoDetectRole('k.mensah@nita.gov.gh');
  assert(role === 'Super Admin', `Expected Super Admin, got ${role}`);
});
test('Auto-detects Director General role for dg@nita.gov.gh', () => {
  const role = autoDetectRole('dg@nita.gov.gh');
  assert(role === 'Director General', `Expected Director General, got ${role}`);
});
test('Auto-detects Technical Director role for Ing. Emmanuel Darko (e.darko@mocd.gov.gh)', () => {
  const role = autoDetectRole('e.darko@mocd.gov.gh');
  assert(role === 'Technical Director', `Expected Technical Director, got ${role}`);
});
test('Auto-detects Finance Minister role for minister@mof.gov.gh', () => {
  const role = autoDetectRole('minister@mof.gov.gh');
  assert(role === 'Finance Minister', `Expected Finance Minister, got ${role}`);
});
test('Auto-detects AI Manager role for unlisted government official (officer@moh.gov.gh)', () => {
  const role = autoDetectRole('officer@moh.gov.gh');
  assert(role === 'AI Manager', `Expected AI Manager, got ${role}`);
});
test('Auto-detects Public User role for citizen external email (citizen@gmail.com)', () => {
  const role = autoDetectRole('citizen@gmail.com');
  assert(role === 'Public User', `Expected Public User, got ${role}`);
});

console.log('\n9. Testing Statutory Suspension Gatekeeper:');
test('Active account (k.mensah@nita.gov.gh) passes entry gate successfully', () => {
  const login = simulateGateLogin('k.mensah@nita.gov.gh');
  assert(login.allowed === true, 'Active user should be allowed');
  assert(login.role === 'Super Admin', 'Role should match Super Admin');
});
test('Suspended account (y.frimpong@gra.gov.gh) is BLOCKED at entry gate', () => {
  const login = simulateGateLogin('y.frimpong@gra.gov.gh');
  assert(login.allowed === false, 'Suspended user must be blocked');
  assert(login.reason === 'ACCOUNT_SUSPENDED', 'Reason must be ACCOUNT_SUSPENDED');
});

console.log('\n10. Testing User Directory Lifecycle Operations (Onboard, Reassign, Suspend, Delete):');
test('Super Admin can onboard a new user with assigned role', () => {
  const directory = [...PLATFORM_USERS];
  const newUser = {
    id: `usr-${Date.now()}`,
    fullName: 'Dr. Jane Mensah',
    email: 'j.mensah@nita.gov.gh',
    role: 'Technical Clearance Team',
    institution: 'National Information Technology Agency (NITA)',
    status: 'Active'
  };
  directory.push(newUser);
  assert(findUserByEmail('j.mensah@nita.gov.gh', directory) !== null, 'User should be found in directory');
  assert(autoDetectRole('j.mensah@nita.gov.gh', directory) === 'Technical Clearance Team', 'Role should be detected as Technical Clearance Team');
});

test('Super Admin can reassign a user\'s role', () => {
  const directory = [...PLATFORM_USERS.map(u => ({ ...u }))];
  const target = findUserByEmail('a.osei@nita.gov.gh', directory);
  assert(target !== null, 'Target user must exist');
  target.role = 'Technical Director';
  assert(autoDetectRole('a.osei@nita.gov.gh', directory) === 'Technical Director', 'Reassigned role should be detected');
});

test('Super Admin can suspend an active user, immediately blocking login', () => {
  const directory = [...PLATFORM_USERS.map(u => ({ ...u }))];
  const target = findUserByEmail('k.boateng@cocobod.gh', directory);
  assert(target !== null, 'Target user must exist');
  // Before suspension
  assert(simulateGateLogin('k.boateng@cocobod.gh', directory).allowed === true, 'Should be allowed before suspension');
  // Suspend
  target.status = 'Suspended';
  // After suspension
  const postLogin = simulateGateLogin('k.boateng@cocobod.gh', directory);
  assert(postLogin.allowed === false, 'Must be blocked after suspension');
  assert(postLogin.reason === 'ACCOUNT_SUSPENDED', 'Reason must indicate suspension');
});

test('Super Admin can reactivate a suspended user', () => {
  const directory = [...PLATFORM_USERS.map(u => ({ ...u }))];
  const target = findUserByEmail('y.frimpong@gra.gov.gh', directory);
  assert(target !== null, 'Target user must exist');
  target.status = 'Active';
  const postLogin = simulateGateLogin('y.frimpong@gra.gov.gh', directory);
  assert(postLogin.allowed === true, 'Reactivated user should be allowed to log in');
});

test('Super Admin can remove/delete a user from directory', () => {
  let directory = [...PLATFORM_USERS.map(u => ({ ...u }))];
  directory = directory.filter(u => u.email !== 'k.boateng@cocobod.gh');
  assert(findUserByEmail('k.boateng@cocobod.gh', directory) === null, 'Deleted user should not be found');
  // Fallback to domain role
  assert(autoDetectRole('k.boateng@cocobod.gh', directory) === 'AI Manager', 'Domain fallback applies after removal');
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
