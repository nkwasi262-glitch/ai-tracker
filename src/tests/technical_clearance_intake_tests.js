// ============================================================================
// GHANA NATIONAL AI PROJECTS REGISTRY & MONITORING SYSTEM (GNAPRMS)
// TEST SUITE: TECHNICAL CLEARANCE INTAKE PATH, AUTO-GRADING & ROLE LIMITATION
// ============================================================================

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
    failed++;
  }
}

console.log('====================================================================');
console.log('   TECHNICAL CLEARANCE INTAKE & ACTIVE ROLE LIMITATION TESTS');
console.log('====================================================================');

// -----------------------------------------------------------------------------
// 1. ACTIVE ROLE PROFILE LIMITATION
// -----------------------------------------------------------------------------
console.log('\n1. Testing Active Role Profile Limitation to Strictly 3 Profiles:');

test('authTypes.ts defines ActiveRole strictly as Super Admin, Technical Director, and Public User', () => {
  const authTypesContent = fs.readFileSync(path.resolve(__dirname, '../data/authTypes.ts'), 'utf8');
  assert(authTypesContent.includes("export type ActiveRole ="), 'Must define ActiveRole');
  assert(authTypesContent.includes("'Super Admin'"), 'Must include Super Admin');
  assert(authTypesContent.includes("'Technical Director'"), 'Must include Technical Director');
  assert(authTypesContent.includes("'Public User'"), 'Must include Public User');
  
  // Verify ACTIVE_ROLES array has exactly the 3 roles
  const activeRolesMatch = authTypesContent.match(/export const ACTIVE_ROLES: ActiveRole\[\] = \[([\s\S]*?)\];/);
  assert(activeRolesMatch, 'Must export ACTIVE_ROLES array');
  const rolesText = activeRolesMatch[1];
  assert(rolesText.includes("'Super Admin'"), 'ACTIVE_ROLES must include Super Admin');
  assert(rolesText.includes("'Technical Director'"), 'ACTIVE_ROLES must include Technical Director');
  assert(rolesText.includes("'Public User'"), 'ACTIVE_ROLES must include Public User');
  assert(!rolesText.includes('First-Timer'), 'ACTIVE_ROLES must NOT include First-Timer');
  assert(!rolesText.includes('Director General'), 'ACTIVE_ROLES must NOT include Director General');
  assert(!rolesText.includes('AI Manager'), 'ACTIVE_ROLES must NOT include AI Manager');
});

test('HeaderProfile.tsx displays strictly the 3 active role profiles in dropdown', () => {
  const headerContent = fs.readFileSync(path.resolve(__dirname, '../components/HeaderProfile.tsx'), 'utf8');
  const match = headerContent.match(/const ALL_ACTIVE_ROLES: RoleDropdownOption\[\] = \[([\s\S]*?)\];/);
  assert(match, 'Must define ALL_ACTIVE_ROLES');
  const rolesList = match[1];
  assert(rolesList.includes("role: 'Super Admin'"), 'Must include Super Admin');
  assert(rolesList.includes("role: 'Technical Director'"), 'Must include Technical Director');
  assert(rolesList.includes("role: 'Public User'"), 'Must include Public User');
  assert(!rolesList.includes('First-Timer'), 'HeaderProfile must NOT include First-Timer');
  assert(!rolesList.includes("role: 'Director General'"), 'HeaderProfile must NOT include Director General');
  assert(!rolesList.includes("role: 'Technical Clearance Team'"), 'HeaderProfile must NOT include Technical Clearance Team');
});

test('ActiveRoleSelectorModal.tsx displays strictly the 3 active role profiles', () => {
  const modalContent = fs.readFileSync(path.resolve(__dirname, '../components/ActiveRoleSelectorModal.tsx'), 'utf8');
  const match = modalContent.match(/const roles: RoleOption\[\] = \[([\s\S]*?)\];/);
  assert(match, 'Must define roles array');
  const rolesList = match[1];
  assert(rolesList.includes("role: 'Super Admin'"), 'Must include Super Admin');
  assert(rolesList.includes("role: 'Technical Director'"), 'Must include Technical Director');
  assert(rolesList.includes("role: 'Public User'"), 'Must include Public User');
  assert(!rolesList.includes('First-Timer'), 'ActiveRoleSelectorModal must NOT include First-Timer');
});

// -----------------------------------------------------------------------------
// 2. TECHNICAL CLEARANCE SYSTEM INTAKE PATH & AUTONOMOUS STANDARDS EVALUATION
// -----------------------------------------------------------------------------
console.log('\n2. Testing Technical Clearance Intake Path & Standards Scanner:');

test('Server index.js exposes always-ready intake endpoints (/api/technical-clearance/documents, /api/technical-clearance/status, /api/technical-clearance/simulate-incoming)', () => {
  const serverContent = fs.readFileSync(path.resolve(__dirname, '../../server/index.js'), 'utf8');
  assert(serverContent.includes("app.get('/api/technical-clearance/status'"), 'Server must implement status endpoint');
  assert(serverContent.includes("app.post('/api/technical-clearance/documents'"), 'Server must implement intake endpoint');
  assert(serverContent.includes("app.post('/api/technical-clearance/simulate-incoming'"), 'Server must implement simulate intake endpoint');
  assert(serverContent.includes("review_status = 'Cleared & Registered'"), 'Intake must set project status to Cleared & Registered');
  assert(serverContent.includes("'Pending Review'"), 'Intake must keep document as Pending Review');
});

test('technicalClearanceService.ts implements always-ready intake and standards auto-grading', () => {
  const serviceContent = fs.readFileSync(path.resolve(__dirname, '../services/technicalClearanceService.ts'), 'utf8');
  assert(serviceContent.includes('receiveTechnicalClearanceDocument'), 'Must export receiveTechnicalClearanceDocument');
  assert(serviceContent.includes('simulateIncomingClearanceDossier'), 'Must export simulateIncomingClearanceDossier');
  assert(serviceContent.includes("reviewStatus: 'Cleared & Registered'"), 'Must set project status to Cleared & Registered');
  assert(serviceContent.includes("reviewStatus: 'Pending Review'"), 'Must keep document reviewable with Pending Review');
  assert(serviceContent.includes('generateAssessmentFromDocuments'), 'Must automatically grade against Governance & Ethics and AI Readiness standards');
});

test('DocumentManager.tsx features the always-ready Technical Clearance intake path banner & action', () => {
  const docManagerContent = fs.readFileSync(path.resolve(__dirname, '../components/DocumentManager.tsx'), 'utf8');
  assert(docManagerContent.includes('TECHNICAL CLEARANCE INTAKE PATH: ALWAYS READY'), 'Must display intake path banner');
  assert(docManagerContent.includes('/api/technical-clearance/documents'), 'Must display intake endpoint path');
  assert(docManagerContent.includes('handleSimulateClearanceIntake'), 'Must implement intake simulation handler');
  assert(docManagerContent.includes('Technical Clearance Inbound Dossiers'), 'Must provide dedicated review studio for clearance dossiers');
});

test('Dashboard.tsx links to Technical Clearance System and highlights always-ready intake path', () => {
  const dashboardContent = fs.readFileSync(path.resolve(__dirname, '../components/Dashboard.tsx'), 'utf8');
  assert(dashboardContent.includes('INTAKE PATH ALWAYS READY'), 'Must highlight always-ready intake path on Dashboard');
  assert(dashboardContent.includes('technicalClearanceProjects'), 'Must list recommended projects from Technical Clearance System');
});

console.log('\n====================================================================');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log(`STATUS: ${failed === 0 ? 'ALL CRITERIA VERIFIED ✓' : 'FAILURES DETECTED ✗'}`);
console.log('====================================================================');

if (failed > 0) process.exit(1);
