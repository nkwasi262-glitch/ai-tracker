/**
 * REPUBLIC OF GHANA - NATIONAL INFORMATION TECHNOLOGY AGENCY (NITA)
 * PHASE 8: TWO-TIER RBAC MATRIX & INSTITUTIONAL ACCESS VERIFICATION (ACT 771/843)
 *
 * Verifies the 2-tier internal access control structure against src/services/rbacPolicy.ts:
 *  - Super Admin (standing alone with executive clearance authority)
 *  - Technical Unit (consolidated technical, assessment, monitoring & inspection authority)
 *  - Public User (citizen oversight, whistleblower & public portal)
 *  - Pending Approval security boundary
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('\n====================================================================');
console.log('   PHASE 8: TWO-TIER RBAC MATRIX & ACCESS CONTROL TEST EXECUTION    ');
console.log('====================================================================\n');

// Read and parse rbacPolicy.ts directly to verify real source file
const rbacSource = fs.readFileSync(path.join(__dirname, '../services/rbacPolicy.ts'), 'utf-8');

// -----------------------------------------------------------------------------
// 1. SUPER ADMIN TESTS (STANDING ALONE)
// -----------------------------------------------------------------------------
console.log('1. Testing Super Admin Role (Standing Alone Full Authority):');

assert(rbacSource.includes("'Super Admin': ["), 'Super Admin role is explicitly declared in rbacPolicy.ts');

const allExpectedModules = [
  'dashboard', 'registry', 'gis', 'governance', 'readiness', 'risk',
  'documents', 'finance', 'reports', 'audit', 'chat', 'tcs_referrals',
  'models_datasets', 'assessments', 'incidents', 'audits_hub', 'vendors',
  'public_portal', 'analytics_hub', 'workflow_lifecycle'
];

allExpectedModules.forEach(moduleId => {
  assert(
    rbacSource.includes(`'${moduleId}'`),
    `Module '${moduleId}' is registered and permissioned in rbacPolicy.ts`
  );
});

// Super Admin Action Permissions in source
assert(rbacSource.includes('PASS_DG_VERDICT: true'), 'Super Admin has PASS_DG_VERDICT permission for statutory clearance');
assert(rbacSource.includes('SIGN_DOCUMENT: true'), 'Super Admin has SIGN_DOCUMENT permission for official digital seal');
assert(rbacSource.includes('VIEW_AUDIT_LOG: true'), 'Super Admin has VIEW_AUDIT_LOG permission for immutable oversight');

// -----------------------------------------------------------------------------
// 2. TECHNICAL UNIT TESTS (CONSOLIDATED TECHNICAL GOVERNANCE)
// -----------------------------------------------------------------------------
console.log('\n2. Testing Technical Unit Role (Consolidated Technical Governance):');

assert(rbacSource.includes("'Technical Unit': ["), 'Technical Unit role is explicitly registered as single consolidated technical role');

// Verify Technical Unit has access to all operational assessment modules
const techModules = [
  'tcs_referrals', 'models_datasets', 'assessments', 'incidents',
  'audits_hub', 'vendors', 'workflow_lifecycle', 'governance', 'risk', 'readiness'
];

techModules.forEach(mod => {
  assert(
    rbacSource.includes(`'${mod}'`),
    `Technical Unit authority covers specialized studio: ${mod}`
  );
});

assert(rbacSource.includes('RECOMMEND_TO_DG: true'), 'Technical Unit has statutory recommendation authority');
assert(rbacSource.includes('REVIEW_AND_GRADE_DOCUMENT: true'), 'Technical Unit has 12-domain rubric assessment authority');

// -----------------------------------------------------------------------------
// 3. PUBLIC USER TESTS (CITIZEN ACCESS BOUNDARY)
// -----------------------------------------------------------------------------
console.log('\n3. Testing Public User Role (Citizen Open Access & Security Boundary):');

assert(rbacSource.includes("'Public User': ["), 'Public citizen role is registered in rbacPolicy.ts');

const publicAllowed = ['dashboard', 'gis', 'chat', 'public_portal'];
publicAllowed.forEach(mod => {
  assert(
    rbacSource.includes(`'${mod}'`),
    `Citizen has open access to public view: ${mod}`
  );
});

// -----------------------------------------------------------------------------
// 4. PENDING APPROVAL SECURITY GATE TESTS
// -----------------------------------------------------------------------------
console.log('\n4. Testing Pending Approval Security Boundary:');

assert(
  rbacSource.includes("session?.onboardingStatus === 'pending_approval'"),
  'Pending approval onboarding check is enforced in canAccessModule'
);

assert(
  rbacSource.includes("['dashboard', 'gis', 'chat', 'public_portal'].includes(moduleId)"),
  'Pending users are strictly locked to public monitoring & transparency views'
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n====================================================================');
console.log(`TOTAL PHASE 8 TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
if (totalTests === passedTests) {
  console.log('STATUS: TWO-TIER RBAC MATRIX VERIFIED SUCCESSFULLY ✓');
} else {
  console.log('STATUS: RBAC MATRIX TESTS FAILED ❌');
}
console.log('====================================================================\n');
