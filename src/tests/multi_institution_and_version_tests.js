import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDb, isDbConfigured } from '../../server/db.js';
import { createDatabaseBackup } from '../../server/backup.js';
import { runDisasterRecoveryDrill } from '../../server/restoreTest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runTestSuite() {
  console.log(`====================================================================`);
  console.log(`  GNAPRMS INTEGRATION & AUDIT VERIFICATION TEST SUITE (ACT 771 / 843)`);
  console.log(`====================================================================`);

  const sql = getDb();
  assert(sql && isDbConfigured(), 'Neon PostgreSQL database must be configured in .env');

  // Test 1: Neon DB Connectivity & Version Check
  console.log('✓ Test 1: Neon PostgreSQL Database Connection...');
  const dbVer = await sql`SELECT version();`;
  assert(dbVer.length > 0, 'Should return PostgreSQL version');
  console.log(`   Connected: ${dbVer[0].version.split(' on ')[0]}`);

  // Test 2: Institutions Directory Federation
  console.log('✓ Test 2: Institutions Directory (MDAs, MMDAs, SOEs)...');
  const institutions = await sql`SELECT * FROM institutions ORDER BY category, name;`;
  assert(institutions.length >= 20, `Expected at least 20 seeded institutions, found ${institutions.length}`);
  
  const mdas = institutions.filter(i => i.category === 'MDA');
  const mmdas = institutions.filter(i => i.category === 'MMDA');
  const soes = institutions.filter(i => i.category === 'SOE' || i.category === 'Regulatory');
  
  assert(mdas.length >= 8, `Expected >= 8 MDAs, found ${mdas.length}`);
  assert(mmdas.length >= 4, `Expected >= 4 MMDAs, found ${mmdas.length}`);
  assert(soes.length >= 4, `Expected >= 4 SOEs/Regulators, found ${soes.length}`);
  console.log(`   Verified: ${institutions.length} institutions (${mdas.length} MDAs, ${mmdas.length} MMDAs, ${soes.length} SOEs)`);

  // Test 3: Application Version History
  console.log('✓ Test 3: Application Version Lifecycle Tracking...');
  const versions = await sql`SELECT * FROM app_versions ORDER BY release_date DESC;`;
  assert(versions.length >= 3, `Expected at least 3 release versions, found ${versions.length}`);
  const latest = versions[0];
  const verString = latest.version || latest.version_number;
  assert.strictEqual(verString, '1.2.0', 'Latest version should be 1.2.0');
  assert.strictEqual(latest.deployment_status, 'Deployed');
  console.log(`   Verified: Latest version is ${verString} (${latest.release_number}) in ${latest.deployment_status}`);

  // Test 4: Row-Level Security Policies
  console.log('✓ Test 4: PostgreSQL Row-Level Security (RLS) Verification...');
  const rlsCheck = await sql`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('projects', 'institutions', 'app_versions', 'audit_logs');
  `;
  for (const row of rlsCheck) {
    assert(row.rowsecurity === true, `RLS must be enabled on table ${row.tablename}`);
  }
  console.log(`   Verified: RLS enabled on all 4 core tables: ${rlsCheck.map(r => r.tablename).join(', ')}`);

  // Test 5: Forensic Audit Diff Columns
  console.log('✓ Test 5: Forensic Audit Diff Columns (Act 843)...');
  const auditColumns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'audit_logs' 
      AND column_name IN ('previous_values', 'new_values', 'correlation_id');
  `;
  const foundColNames = auditColumns.map(c => c.column_name);
  assert(foundColNames.includes('previous_values'), 'audit_logs must have previous_values column');
  assert(foundColNames.includes('new_values'), 'audit_logs must have new_values column');
  assert(foundColNames.includes('correlation_id'), 'audit_logs must have correlation_id column');
  console.log(`   Verified: Forensic columns present: ${foundColNames.join(', ')}`);

  // Test 6: Automated Backup Snapshot Generation
  console.log('✓ Test 6: Automated Backup Snapshot Generation...');
  const bkpResult = await createDatabaseBackup('Automated Integration Test Runner');
  assert(bkpResult.success, 'Backup creation must succeed');
  assert(bkpResult.metadata.totalRecords > 0, 'Backup snapshot must contain records');
  assert(bkpResult.checksum.length === 64, 'Backup must have valid SHA-256 checksum');
  console.log(`   Verified: Snapshot ${bkpResult.filename} generated (${bkpResult.sizeKb} KB, ${bkpResult.metadata.totalRecords} records)`);

  // Test 7: Disaster Recovery Integrity Drill
  console.log('✓ Test 7: Disaster Recovery & Integrity Drill...');
  const drReport = await runDisasterRecoveryDrill(bkpResult.filename);
  assert.strictEqual(drReport.checksumStatus, 'PASS', 'Checksum verification must pass');
  assert.strictEqual(drReport.referentialIntegrity.status, 'PASS', 'Referential integrity check must pass');
  console.log(`   Verified: DR drill PASSED with RTO SLA: ${drReport.recoveryMetrics.estimatedRtoSeconds}s`);

  console.log(`====================================================================`);
  console.log(`  ALL 7 AUDIT & INTEGRATION VERIFICATION TESTS PASSED SUCCESSFULLY!  `);
  console.log(`====================================================================`);
}

runTestSuite()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Integration Test Failure:', err.message);
    process.exit(1);
  });
