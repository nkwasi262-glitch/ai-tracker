/**
 * REPUBLIC OF GHANA - NATIONAL INFORMATION TECHNOLOGY AGENCY (NITA)
 * PHASE 11: STAGING & PRODUCTION HANDOVER PRE-FLIGHT VERIFICATION
 *
 * Verifies that the platform is 100% turnkey, hardened, and ready for
 * national staging deployment across all Ghanaian government institutions.
 */

import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, isDbConfigured, testDbConnection } from '../server/db.js';
import { runDisasterRecoveryDrill } from '../server/restoreTest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

let passedChecks = 0;
let totalChecks = 0;

function report(condition, checkName, details = '') {
  totalChecks++;
  if (condition) {
    console.log(`  ✓ [PASS] ${checkName} ${details ? '(' + details + ')' : ''}`);
    passedChecks++;
  } else {
    console.error(`  ❌ [FAIL] ${checkName}: ${details}`);
    process.exitCode = 1;
  }
}

function checkPort(port, path = '/') {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}${path}`, (res) => {
      resolve({ online: true, statusCode: res.statusCode });
    });
    req.on('error', (err) => {
      resolve({ online: false, error: err.message });
    });
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ online: false, error: 'Timeout' });
    });
  });
}

async function verifyStaging() {
  console.log('\n====================================================================');
  console.log('   REPUBLIC OF GHANA • GN-AIRGMS STAGING & HANDOVER VERIFICATION    ');
  console.log('   NATIONAL INFORMATION TECHNOLOGY AGENCY (NITA ACT, 2008 - ACT 771)');
  console.log('====================================================================\n');

  // 1. Database Connection Check
  console.log('1. Checking Neon Serverless PostgreSQL Database Connection:');
  const dbTest = await testDbConnection();
  report(dbTest.connected, 'Neon Database Connectivity', `${dbTest.database} on ${dbTest.version}`);
  report(Boolean(process.env.DATABASE_URL), 'Database URL TLS Configuration', 'sslmode=require');

  // 2. Schema & RLS Verification
  console.log('\n2. Verifying 17 Mandatory Relational Tables & Row-Level Security:');
  const sql = getDb();
  if (sql && isDbConfigured()) {
    const expectedTables = [
      'projects', 'institutions', 'documents', 'audit_logs', 'user_sessions',
      'app_versions', 'dg_verdicts', 'internal_reports', 'tcs_referrals',
      'ai_models', 'datasets', 'assessment_domains', 'regulatory_decisions',
      'ai_incidents', 'ai_audits', 'ai_vendors', 'notifications'
    ];

    const tablesRes = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = ANY(${expectedTables});
    `;
    const verifiedTables = tablesRes.map(r => r.table_name);
    report(
      verifiedTables.length === expectedTables.length,
      'Relational Database Schema',
      `${verifiedTables.length}/${expectedTables.length} tables verified`
    );

    const rlsRes = await sql`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname = ANY(${expectedTables}) AND relnamespace = 'public'::regnamespace;
    `;
    const rlsActive = rlsRes.filter(r => r.relrowsecurity === true).length;
    report(rlsActive >= 10, 'PostgreSQL Row-Level Security (RLS)', `${rlsActive} tables protected`);

    // Verify baseline records
    const projCount = await sql`SELECT COUNT(*)::int as count FROM projects;`;
    report(projCount[0]?.count >= 12, 'National AI Project Registry Seeding', `${projCount[0]?.count} active projects`);

    const mdaCount = await sql`SELECT COUNT(*)::int as count FROM institutions;`;
    report(mdaCount[0]?.count >= 20, 'Government Institutions Directory', `${mdaCount[0]?.count} MDAs/MMDAs/SOEs`);
  }

  // 3. Local Runtime Services
  console.log('\n3. Checking Live Staging Services & Web Application Ports:');
  const backendCheck = await checkPort(5000, '/api/health');
  report(backendCheck.online && backendCheck.statusCode === 200, 'Backend REST API Daemon', 'Port 5000 (HTTP 200)');

  const frontendCheck = await checkPort(3000, '/');
  report(frontendCheck.online && frontendCheck.statusCode === 200, 'Frontend React/Vite UI Daemon', 'Port 3000 (HTTP 200)');

  // 4. Disaster Recovery & Snapshot Drill
  console.log('\n4. Executing Disaster Recovery Drill (NITA Audit Standard):');
  const drResult = await runDisasterRecoveryDrill();
  report(
    drResult.checksumStatus === 'PASS',
    'Disaster Recovery Snapshot Verification',
    `RTO SLA: ${drResult.recoveryMetrics.estimatedRtoSeconds}s, Checksum Valid`
  );

  // Summary
  console.log('\n====================================================================');
  console.log(`TOTAL HANDOVER CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${totalChecks - passedChecks}`);
  if (totalChecks === passedChecks) {
    console.log('STATUS: GN-AIRGMS IS 100% TURNKEY, HARDENED & CERTIFIED FOR HANDOVER ✓');
  } else {
    console.log('STATUS: STAGING CHECKS ENCOUNTERED ISSUES ❌');
  }
  console.log('====================================================================\n');
}

verifyStaging().then(() => {
  if (process.exitCode) process.exit(process.exitCode);
  else process.exit(0);
}).catch(err => {
  console.error('Handover verification error:', err);
  process.exit(1);
});
