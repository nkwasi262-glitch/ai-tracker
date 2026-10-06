/**
 * Ghana National AI Projects Registry & Monitoring System (GNAPRMS)
 * Statutory RBAC & Entry Gate Verification Test Suite
 */

import { 
  canAccessModule, 
  canPerformAction, 
  isApprovedInstitutionalEmail,
  AppModuleId
} from '../services/rbacPolicy';
import { ActiveRole } from '../data/authTypes';

interface TestResult {
  role: string;
  testName: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, role: string, testName: string, details: string) {
  results.push({
    role,
    testName,
    passed: condition,
    details: condition ? `PASSED: ${details}` : `FAILED: ${details}`
  });
}

console.log('====================================================================');
console.log('GNAPRMS ROLE-BASED ACCESS CONTROL (RBAC) & VERIFICATION TEST SUITE');
console.log('====================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Institutional Email Domain Validation
// -----------------------------------------------------------------------------
console.log('--- 1. INSTITUTIONAL EMAIL DOMAIN ENFORCEMENT ---');
assert(isApprovedInstitutionalEmail('officer@nita.gov.gh'), 'Security Gate', 'NITA Domain Approval', 'Accepts official @nita.gov.gh domain');
assert(isApprovedInstitutionalEmail('director@mocd.gov.gh'), 'Security Gate', 'MoCD Domain Approval', 'Accepts official @mocd.gov.gh domain');
assert(isApprovedInstitutionalEmail('analyst@mof.gov.gh'), 'Security Gate', 'MoF Domain Approval', 'Accepts official @mof.gov.gh domain');
assert(isApprovedInstitutionalEmail('inspector@gov.gh'), 'Security Gate', 'General Gov.gh Domain', 'Accepts root @gov.gh domain');
assert(!isApprovedInstitutionalEmail('intruder@gmail.com'), 'Security Gate', 'Commercial Domain Block', 'Rejects public commercial email @gmail.com for privileged roles');
assert(!isApprovedInstitutionalEmail('unauthorized@yahoo.com'), 'Security Gate', 'Commercial Domain Block', 'Rejects public commercial email @yahoo.com for privileged roles');

// -----------------------------------------------------------------------------
// TEST 2: Super Admin Clearance Matrix (Full System Access)
// -----------------------------------------------------------------------------
console.log('--- 2. SUPER ADMIN CLEARANCE TEST ---');
const allModules: AppModuleId[] = [
  'dashboard', 'registry', 'gis', 'governance', 'readiness', 
  'risk', 'documents', 'dg_queue', 'finance', 'reports', 'audit', 'chat'
];
const superAdminRole: ActiveRole = 'Super Admin';

allModules.forEach(mod => {
  assert(
    canAccessModule(superAdminRole, mod), 
    'Super Admin', 
    `Access Module: ${mod}`, 
    `Super Admin has statutory permission to view module: ${mod}`
  );
});

assert(canPerformAction(superAdminRole, 'VIEW'), 'Super Admin', 'Action: VIEW', 'Can view dossiers');
assert(canPerformAction(superAdminRole, 'CREATE'), 'Super Admin', 'Action: CREATE', 'Can create project entries');
assert(canPerformAction(superAdminRole, 'EDIT'), 'Super Admin', 'Action: EDIT', 'Can edit project parameters');
assert(canPerformAction(superAdminRole, 'DELETE'), 'Super Admin', 'Action: DELETE', 'Can delete registry records');
assert(canPerformAction(superAdminRole, 'VIEW_AUDIT_LOG'), 'Super Admin', 'Action: VIEW_AUDIT_LOG', 'Can inspect immutable audit logs');
assert(!canPerformAction(superAdminRole, 'PURGE_AUDIT_LOG'), 'Super Admin', 'Action: PURGE_AUDIT_LOG', 'Tamper-evident: Super Admin CANNOT purge immutable audit logs');

// -----------------------------------------------------------------------------
// TEST 3: Director General (DG) Clearance Matrix (Executive Decision Isolation)
// -----------------------------------------------------------------------------
console.log('--- 3. DIRECTOR GENERAL CLEARANCE TEST ---');
const dgRole: ActiveRole = 'Director General';

// Permitted modules for DG
assert(canAccessModule(dgRole, 'dashboard'), 'Director General', 'Access: dashboard', 'Can access Executive Overview Dashboard');
assert(canAccessModule(dgRole, 'dg_queue'), 'Director General', 'Access: dg_queue', 'Can access Recommended for Final Decision Queue');
assert(canAccessModule(dgRole, 'gis'), 'Director General', 'Access: gis', 'Can access National GIS Map');
assert(canAccessModule(dgRole, 'finance'), 'Director General', 'Access: finance', 'Can view Fiscal Suite Overview');
assert(canAccessModule(dgRole, 'reports'), 'Director General', 'Access: reports', 'Can read Classified Internal Reports');
assert(canAccessModule(dgRole, 'audit'), 'Director General', 'Access: audit', 'Can inspect Executive Audit Records');

// FORBIDDEN modules for DG (Strictly blocked)
assert(!canAccessModule(dgRole, 'registry'), 'Director General', 'Block: registry', 'STRICTLY BLOCKED from editing Project Registry');
assert(!canAccessModule(dgRole, 'governance'), 'Director General', 'Block: governance', 'STRICTLY BLOCKED from modifying Governance audit scores');
assert(!canAccessModule(dgRole, 'readiness'), 'Director General', 'Block: readiness', 'STRICTLY BLOCKED from modifying Readiness assessments');
assert(!canAccessModule(dgRole, 'risk'), 'Director General', 'Block: risk', 'STRICTLY BLOCKED from editing Risk Matrix');
assert(!canAccessModule(dgRole, 'documents'), 'Director General', 'Block: documents', 'STRICTLY BLOCKED from Technical Document Manager (uses DG Queue)');

// Actions for DG
assert(canPerformAction(dgRole, 'PASS_DG_VERDICT'), 'Director General', 'Action: PASS_DG_VERDICT', 'Statutory authority to issue final verdicts (Approve, Reject, Return)');
assert(!canPerformAction(dgRole, 'DELETE'), 'Director General', 'Action: DELETE', 'Cannot delete system records');

// -----------------------------------------------------------------------------
// TEST 4: Technical Director Clearance Matrix
// -----------------------------------------------------------------------------
console.log('--- 4. TECHNICAL DIRECTOR CLEARANCE TEST ---');
const techDirRole: ActiveRole = 'Technical Director';

assert(canAccessModule(techDirRole, 'dashboard'), 'Technical Director', 'Access: dashboard', 'Access permitted');
assert(canAccessModule(techDirRole, 'registry'), 'Technical Director', 'Access: registry', 'Access permitted');
assert(canAccessModule(techDirRole, 'governance'), 'Technical Director', 'Access: governance', 'Access permitted');
assert(canAccessModule(techDirRole, 'readiness'), 'Technical Director', 'Access: readiness', 'Access permitted');
assert(canAccessModule(techDirRole, 'risk'), 'Technical Director', 'Access: risk', 'Access permitted');
assert(canAccessModule(techDirRole, 'documents'), 'Technical Director', 'Access: documents', 'Access permitted');
assert(canAccessModule(techDirRole, 'reports'), 'Technical Director', 'Access: reports', 'Access permitted');
assert(canPerformAction(techDirRole, 'RECOMMEND_TO_DG'), 'Technical Director', 'Action: RECOMMEND_TO_DG', 'Can recommend dossiers for DG approval');
assert(!canPerformAction(techDirRole, 'PASS_DG_VERDICT'), 'Technical Director', 'Action: PASS_DG_VERDICT', 'CANNOT pass final DG verdict');

// -----------------------------------------------------------------------------
// TEST 5: Technical Clearance Team Clearance Matrix
// -----------------------------------------------------------------------------
console.log('--- 5. TECHNICAL CLEARANCE TEAM CLEARANCE TEST ---');
const techClearanceRole: ActiveRole = 'Technical Clearance Team';

assert(canAccessModule(techClearanceRole, 'documents'), 'Technical Clearance Team', 'Access: documents', 'Can inspect documents');
assert(canAccessModule(techClearanceRole, 'governance'), 'Technical Clearance Team', 'Access: governance', 'Can audit governance');
assert(canAccessModule(techClearanceRole, 'risk'), 'Technical Clearance Team', 'Access: risk', 'Can update risk matrix');
assert(canAccessModule(techClearanceRole, 'reports'), 'Technical Clearance Team', 'Access: reports', 'Can post internal reports');
assert(!canAccessModule(techClearanceRole, 'dg_queue'), 'Technical Clearance Team', 'Block: dg_queue', 'Cannot access DG Decision Queue');
assert(canPerformAction(techClearanceRole, 'RECOMMEND_TO_DG'), 'Technical Clearance Team', 'Action: RECOMMEND_TO_DG', 'Can elevate recommended project');
assert(!canPerformAction(techClearanceRole, 'PASS_DG_VERDICT'), 'Technical Clearance Team', 'Action: PASS_DG_VERDICT', 'CANNOT pass final verdict');

// -----------------------------------------------------------------------------
// TEST 6: AI Manager Clearance Matrix
// -----------------------------------------------------------------------------
console.log('--- 6. AI MANAGER CLEARANCE TEST ---');
const aiManagerRole: ActiveRole = 'AI Manager';

assert(canAccessModule(aiManagerRole, 'registry'), 'AI Manager', 'Access: registry', 'Can manage project registrations');
assert(canAccessModule(aiManagerRole, 'documents'), 'AI Manager', 'Access: documents', 'Can upload and view compliance docs');
assert(canAccessModule(aiManagerRole, 'reports'), 'AI Manager', 'Access: reports', 'Can participate in reports thread');
assert(!canAccessModule(aiManagerRole, 'dg_queue'), 'AI Manager', 'Block: dg_queue', 'Cannot access DG decision queue');
assert(!canAccessModule(aiManagerRole, 'audit'), 'AI Manager', 'Block: audit', 'Cannot access system audit log');

// -----------------------------------------------------------------------------
// TEST 7: Finance Minister Clearance Matrix (Strict Financial Isolation)
// -----------------------------------------------------------------------------
console.log('--- 7. FINANCE MINISTER CLEARANCE TEST ---');
const financeMinisterRole: ActiveRole = 'Finance Minister';

// Allowed:
assert(canAccessModule(financeMinisterRole, 'dashboard'), 'Finance Minister', 'Access: dashboard', 'Can access M&E Dashboard');
assert(canAccessModule(financeMinisterRole, 'finance'), 'Finance Minister', 'Access: finance', 'Can access Fiscal Suite & Analytics');
assert(canAccessModule(financeMinisterRole, 'chat'), 'Finance Minister', 'Access: chat', 'Can access AI Assistant');

// STRICTLY FORBIDDEN:
const forbiddenForFinance: AppModuleId[] = [
  'registry', 'gis', 'governance', 'readiness', 'risk', 'documents', 'dg_queue', 'reports', 'audit'
];
forbiddenForFinance.forEach(mod => {
  assert(
    !canAccessModule(financeMinisterRole, mod),
    'Finance Minister',
    `Block: ${mod}`,
    `STRICTLY FORBIDDEN from accessing module: ${mod}`
  );
});

assert(canPerformAction(financeMinisterRole, 'EXPORT_FINANCIALS'), 'Finance Minister', 'Action: EXPORT_FINANCIALS', 'Authorized to export fiscal CSV and JSON');
assert(!canPerformAction(financeMinisterRole, 'CREATE'), 'Finance Minister', 'Action: CREATE', 'CANNOT create new project registrations');
assert(!canPerformAction(financeMinisterRole, 'PASS_DG_VERDICT'), 'Finance Minister', 'Action: PASS_DG_VERDICT', 'CANNOT pass verdicts');

// -----------------------------------------------------------------------------
// TEST 8: Public User Clearance Matrix (Citizen Privacy Mode)
// -----------------------------------------------------------------------------
console.log('--- 8. PUBLIC USER CLEARANCE TEST ---');
const publicUserRole: ActiveRole = 'Public User';

// Allowed:
assert(canAccessModule(publicUserRole, 'dashboard'), 'Public User', 'Access: dashboard', 'Can access Public M&E Dashboard');
assert(canAccessModule(publicUserRole, 'gis'), 'Public User', 'Access: gis', 'Can access National GIS Map');
assert(canAccessModule(publicUserRole, 'chat'), 'Public User', 'Access: chat', 'Can access AI Assistant');

// STRICTLY FORBIDDEN (All 9 internal/privileged modules):
const forbiddenForPublic: AppModuleId[] = [
  'registry', 'governance', 'readiness', 'risk', 'documents', 'dg_queue', 'finance', 'reports', 'audit'
];
forbiddenForPublic.forEach(mod => {
  assert(
    !canAccessModule(publicUserRole, mod),
    'Public User',
    `Block: ${mod}`,
    `STRICTLY FORBIDDEN from accessing privileged module: ${mod}`
  );
});

// Summary Report
console.log('\n====================================================================');
console.log(`TEST EXECUTION SUMMARY: ${results.filter(r => r.passed).length} / ${results.length} PASSED`);
console.log('====================================================================\n');

results.forEach((r, idx) => {
  const status = r.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${idx + 1}] [${r.role}] ${status} - ${r.testName}: ${r.details}`);
});

export { results };
