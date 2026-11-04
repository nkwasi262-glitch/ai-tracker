import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, isDbConfigured, testDbConnection } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  const check = await testDbConnection();
  if (!check.connected) {
    console.warn('[Neon DB Init] Cannot initialize database:', check.error || check.message);
    return { success: false, reason: check.error || check.message };
  }

  const sql = getDb();
  console.log(`[Neon DB Init] Connected to Neon PostgreSQL database "${check.database}" at ${check.serverTime}`);

  // 1. Run Schema Migrations
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Strip comments and split by semicolon into clean executable statements
  const cleanSql = schemaSql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  const statements = cleanSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      if (typeof sql.query === 'function') {
        await sql.query(statement);
      } else {
        await sql(statement);
      }
    } catch (err) {
      console.error('[Neon DB Init] Error executing statement:', statement.slice(0, 60), '...', err.message);
    }
  }
  console.log('[Neon DB Init] Schema tables and statutory indexes verified.');

  // 2. Check if seeding is required
  const seedPath = path.resolve(__dirname, 'seedData.json');
  if (!fs.existsSync(seedPath)) {
    console.log('[Neon DB Init] No seedData.json found, skipping seeding.');
    return { success: true };
  }

  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  // Seed projects
  const projectCount = await sql`SELECT COUNT(*)::int as count FROM projects;`;
  if (projectCount[0]?.count === 0 && Array.isArray(seedData.projects)) {
    console.log(`[Neon DB Init] Seeding ${seedData.projects.length} initial projects into Neon DB...`);
    for (const p of seedData.projects) {
      await sql`
        INSERT INTO projects (
          id, project_code, name, description, category, sector, stage, status,
          start_date, end_date, expected_completion_date, latitude, longitude,
          mda, mda_code, region, district, budget, compliance, readiness_score,
          lifecycle, technical_stack, vendor, review_status, has_first_timer_upload,
          documents
        ) VALUES (
          ${p.id}, ${p.projectCode}, ${p.name}, ${p.description || ''}, ${p.category || 'Machine Learning'},
          ${p.sector || 'Health'}, ${p.stage || 'Planning'}, ${p.status || 'Active'},
          ${p.startDate || '2026-01-01'}, ${p.endDate || '2028-12-31'}, ${p.expectedCompletionDate || '2028-12-31'},
          ${p.latitude || 5.6037}, ${p.longitude || -0.1870},
          ${p.mda}, ${p.mdaCode}, ${p.region || 'Greater Accra'}, ${p.district || 'Accra Metropolitan'},
          ${JSON.stringify(p.budget || {})}, ${JSON.stringify(p.compliance || {})}, ${p.readinessScore || 0},
          ${JSON.stringify(p.lifecycle || {})}, ${JSON.stringify(p.technicalStack || {})}, ${JSON.stringify(p.vendor || {})},
          ${p.reviewStatus || 'Pending Review'}, ${p.hasFirstTimerUpload || false},
          ${JSON.stringify(p.documents || [])}
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }
    console.log('[Neon DB Init] Projects seeded successfully.');
  }

  // Seed DG verdicts
  const verdictCount = await sql`SELECT COUNT(*)::int as count FROM dg_verdicts;`;
  if (verdictCount[0]?.count === 0 && Array.isArray(seedData.verdicts)) {
    console.log(`[Neon DB Init] Seeding ${seedData.verdicts.length} initial DG verdicts...`);
    for (const v of seedData.verdicts) {
      await sql`
        INSERT INTO dg_verdicts (
          id, project_id, project_code, project_name, mda, verdict, final_status_label,
          mandatory_comments, reviewed_by_name, reviewed_by_role, reviewed_by_email,
          timestamp, technical_recommendation_summary, compliance_grade_at_review,
          clearance_officer, signature_seal
        ) VALUES (
          ${v.id}, ${v.projectId}, ${v.projectCode}, ${v.projectName}, ${v.mda},
          ${v.verdict}, ${v.finalStatusLabel}, ${v.mandatoryComments},
          ${v.reviewedByName}, ${v.reviewedByRole}, ${v.reviewedByEmail},
          ${v.timestamp || new Date().toISOString()}, ${v.technicalRecommendationSummary || ''},
          ${v.complianceGradeAtReview || 'Good'}, ${v.clearanceOfficer || ''}, ${v.signatureSeal || ''}
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }
    console.log('[Neon DB Init] DG verdicts seeded successfully.');
  }

  // Seed Audit Logs
  const auditCount = await sql`SELECT COUNT(*)::int as count FROM audit_logs;`;
  if (auditCount[0]?.count === 0 && Array.isArray(seedData.auditLogs)) {
    console.log(`[Neon DB Init] Seeding ${seedData.auditLogs.length} statutory audit logs...`);
    for (const a of seedData.auditLogs) {
      await sql`
        INSERT INTO audit_logs (
          id, timestamp, event_type, actor_name, actor_email, actor_role, actor_institution,
          target_module, target_entity_id, action_details, integrity_hash, retention_until
        ) VALUES (
          ${a.id}, ${a.timestamp || new Date().toISOString()}, ${a.eventType},
          ${a.actorName}, ${a.actorEmail}, ${a.actorRole}, ${a.actorInstitution},
          ${a.targetModule}, ${a.targetEntityId || null}, ${a.actionDetails},
          ${a.integrityHash}, ${a.retentionUntil || '2031-12-31T00:00:00Z'}
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }
    console.log('[Neon DB Init] Audit logs seeded successfully.');
  }

  // Seed Internal Reports
  const reportCount = await sql`SELECT COUNT(*)::int as count FROM internal_reports;`;
  if (reportCount[0]?.count === 0 && Array.isArray(seedData.reports)) {
    console.log(`[Neon DB Init] Seeding ${seedData.reports.length} classified reports...`);
    for (const r of seedData.reports) {
      await sql`
        INSERT INTO internal_reports (
          id, report_code, title, summary, project_id, project_code, document_id,
          severity, status, created_by_name, created_by_role, created_by_email,
          created_at, updated_at, assigned_role, read_by, comments
        ) VALUES (
          ${r.id}, ${r.reportCode}, ${r.title}, ${r.summary}, ${r.projectId || null},
          ${r.projectCode || null}, ${r.documentId || null}, ${r.severity}, ${r.status},
          ${r.createdByName}, ${r.createdByRole}, ${r.createdByEmail},
          ${r.createdAt || new Date().toISOString()}, ${r.updatedAt || new Date().toISOString()},
          ${r.assignedRole || 'Technical Clearance Team'}, ${JSON.stringify(r.readBy || [])},
          ${JSON.stringify(r.comments || [])}
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }
    console.log('[Neon DB Init] Internal reports seeded successfully.');
  }

  // Seed Statutory Test Users
  const userCount = await sql`SELECT COUNT(*)::int as count FROM user_sessions;`;
  if (userCount[0]?.count === 0 && Array.isArray(seedData.users)) {
    console.log(`[Neon DB Init] Seeding ${seedData.users.length} statutory test users into Neon DB...`);
    for (const u of seedData.users) {
      await sql`
        INSERT INTO user_sessions (
          id, email, full_name, institution, institution_category,
          role, member_type, onboarding_status, is_first_timer,
          authenticated_at, last_active_at, session_data
        ) VALUES (
          ${u.id}, ${u.email.toLowerCase()}, ${u.fullName}, ${u.institution},
          ${u.institutionCategory || 'MDA'}, ${u.role}, ${u.memberType || 'in_member'},
          ${u.onboardingStatus || 'approved'}, ${u.isFirstTimer || false},
          NOW(), NOW(), ${JSON.stringify(u)}
        ) ON CONFLICT (email) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          institution = EXCLUDED.institution,
          institution_category = EXCLUDED.institution_category,
          role = EXCLUDED.role,
          last_active_at = NOW(),
          session_data = EXCLUDED.session_data;
      `;
    }
    console.log('[Neon DB Init] Statutory test users seeded successfully.');
  }

  console.log('[Neon DB Init] Database initialization complete.');
  return { success: true };
}

// Direct execution from CLI
if (process.argv[1] && process.argv[1].endsWith('initDb.js')) {
  initializeDatabase()
    .then(res => {
      console.log('[Neon DB Init] Result:', res);
      process.exit(res.success ? 0 : 1);
    })
    .catch(err => {
      console.error('[Neon DB Init] Fatal error:', err);
      process.exit(1);
    });
}

