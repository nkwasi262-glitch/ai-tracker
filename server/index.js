import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDb, isDbConfigured, testDbConnection } from './db.js';
import { initializeDatabase } from './initDb.js';
import { createDatabaseBackup, listBackups } from './backup.js';
import { runDisasterRecoveryDrill } from './restoreTest.js';
import { transmitReportToTcs, signTcsPayload, verifyTcsSignature } from './adapters/tcsAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 5000;

// Security Headers & Request Correlation ID Middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('X-Request-ID', correlationId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// In-Memory Rate Limiter for /api to protect database and endpoints
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 300; // 300 requests per minute per IP

app.use('/api', (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    clientData.count++;
  }

  rateLimitMap.set(ip, clientData);
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - clientData.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));

  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Government National AI Registry rate limit exceeded. Please retry in a few moments.',
      correlationId: req.correlationId
    });
  }
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to load local fallback seed data
function getLocalSeedData() {
  try {
    const seedPath = path.resolve(__dirname, 'seedData.json');
    if (fs.existsSync(seedPath)) {
      return JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    }
  } catch (e) {
    console.error('[API] Error reading seedData.json:', e);
  }
  return { projects: [], verdicts: [], auditLogs: [], reports: [] };
}

// ============================================================================
// 1. HEALTH & NEON DATABASE STATUS ENDPOINT
// ============================================================================
app.get('/api/health', async (req, res) => {
  const dbStatus = await testDbConnection();
  res.json({
    status: 'ok',
    service: 'Ghana National AI Projects Registry & Monitoring System API',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    database: {
      provider: 'Neon Serverless PostgreSQL',
      ...dbStatus
    }
  });
});

// ============================================================================
// 2. PROJECTS ENDPOINTS
// ============================================================================

// GET /api/projects — Retrieve all projects
app.get('/api/projects', async (req, res) => {
  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const rows = await sql`SELECT * FROM projects ORDER BY created_at DESC;`;
      const formatted = rows.map(r => ({
        id: r.id,
        projectCode: r.project_code,
        name: r.name,
        description: r.description,
        category: r.category,
        sector: r.sector,
        stage: r.stage,
        status: r.status,
        startDate: r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '2026-01-01',
        endDate: r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : '2028-12-31',
        expectedCompletionDate: r.expected_completion_date ? new Date(r.expected_completion_date).toISOString().split('T')[0] : '2028-12-31',
        latitude: r.latitude,
        longitude: r.longitude,
        mda: r.mda,
        mdaCode: r.mda_code,
        region: r.region,
        district: r.district,
        budget: typeof r.budget === 'string' ? JSON.parse(r.budget) : r.budget,
        compliance: typeof r.compliance === 'string' ? JSON.parse(r.compliance) : r.compliance,
        readinessScore: r.readiness_score,
        riskLevel: r.risk_level,
        lifecycle: typeof r.lifecycle === 'string' ? JSON.parse(r.lifecycle) : r.lifecycle,
        technicalStack: typeof r.technical_stack === 'string' ? JSON.parse(r.technical_stack) : r.technical_stack,
        vendor: typeof r.vendor === 'string' ? JSON.parse(r.vendor) : r.vendor,
        reviewStatus: r.review_status,
        hasFirstTimerUpload: r.has_first_timer_upload,
        autoAssessment: r.auto_assessment ? (typeof r.auto_assessment === 'string' ? JSON.parse(r.auto_assessment) : r.auto_assessment) : undefined,
        zeroAssumptionAudit: r.zero_assumption_audit ? (typeof r.zero_assumption_audit === 'string' ? JSON.parse(r.zero_assumption_audit) : r.zero_assumption_audit) : undefined,
        dgFinalVerdict: r.dg_final_verdict ? (typeof r.dg_final_verdict === 'string' ? JSON.parse(r.dg_final_verdict) : r.dg_final_verdict) : undefined,
        technicalReviewDetails: r.technical_review_details ? (typeof r.technical_review_details === 'string' ? JSON.parse(r.technical_review_details) : r.technical_review_details) : undefined,
        documents: typeof r.documents === 'string' ? JSON.parse(r.documents) : (r.documents || [])
      }));
      return res.json({ source: 'neon_postgres', projects: formatted });
    } catch (error) {
      console.error('[API] Error fetching projects from Neon DB:', error.message);
    }
  }

  // Fallback to local catalog
  const seed = getLocalSeedData();
  return res.json({ source: 'seed_fallback', projects: seed.projects });
});

// POST /api/projects — Upsert or register a project
app.post('/api/projects', async (req, res) => {
  const p = req.body;
  if (!p || !p.id || !p.projectCode) {
    return res.status(400).json({ error: 'Missing required project attributes (id, projectCode)' });
  }

  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      await sql`
        INSERT INTO projects (
          id, project_code, name, description, category, sector, stage, status,
          start_date, end_date, expected_completion_date, latitude, longitude,
          mda, mda_code, region, district, budget, compliance, readiness_score,
          lifecycle, technical_stack, vendor, review_status, has_first_timer_upload,
          auto_assessment, zero_assumption_audit, dg_final_verdict,
          technical_review_details, documents, updated_at
        ) VALUES (
          ${p.id}, ${p.projectCode}, ${p.name}, ${p.description || ''}, ${p.category || 'Machine Learning'},
          ${p.sector || 'Health'}, ${p.stage || 'Planning'}, ${p.status || 'Active'},
          ${p.startDate || '2026-01-01'}, ${p.endDate || '2028-12-31'}, ${p.expectedCompletionDate || '2028-12-31'},
          ${p.latitude || 5.6037}, ${p.longitude || -0.1870},
          ${p.mda}, ${p.mdaCode}, ${p.region || 'Greater Accra'}, ${p.district || 'Accra Metropolitan'},
          ${JSON.stringify(p.budget || {})}, ${JSON.stringify(p.compliance || {})}, ${p.readinessScore || 0},
          ${JSON.stringify(p.lifecycle || {})}, ${JSON.stringify(p.technicalStack || {})}, ${JSON.stringify(p.vendor || {})},
          ${p.reviewStatus || 'Pending Review'}, ${p.hasFirstTimerUpload || false},
          ${p.autoAssessment ? JSON.stringify(p.autoAssessment) : null},
          ${p.zeroAssumptionAudit ? JSON.stringify(p.zeroAssumptionAudit) : null},
          ${p.dgFinalVerdict ? JSON.stringify(p.dgFinalVerdict) : null},
          ${p.technicalReviewDetails ? JSON.stringify(p.technicalReviewDetails) : null},
          ${JSON.stringify(p.documents || [])}, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          stage = EXCLUDED.stage,
          status = EXCLUDED.status,
          budget = EXCLUDED.budget,
          compliance = EXCLUDED.compliance,
          readiness_score = EXCLUDED.readiness_score,
          review_status = EXCLUDED.review_status,
          has_first_timer_upload = EXCLUDED.has_first_timer_upload,
          auto_assessment = EXCLUDED.auto_assessment,
          zero_assumption_audit = EXCLUDED.zero_assumption_audit,
          dg_final_verdict = EXCLUDED.dg_final_verdict,
          technical_review_details = EXCLUDED.technical_review_details,
          documents = EXCLUDED.documents,
          updated_at = NOW();
      `;
      return res.status(200).json({ success: true, message: 'Project saved to Neon DB', project: p });
    } catch (error) {
      console.error('[API] Error saving project to Neon DB:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.json({ success: true, message: 'Project saved in memory fallback', project: p });
});

// PUT /api/projects/:id — Partial update for budget, status, or clearance
app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const sql = getDb();

  if (sql && isDbConfigured()) {
    try {
      const existing = await sql`SELECT * FROM projects WHERE id = ${id};`;
      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: 'Project not found in Neon DB' });
      }

      const prevRow = existing[0];

      await sql`
        UPDATE projects SET
          status = COALESCE(${updates.status}, status),
          review_status = COALESCE(${updates.reviewStatus}, review_status),
          readiness_score = COALESCE(${updates.readinessScore}, readiness_score),
          budget = CASE WHEN ${updates.budget ? true : false} THEN ${JSON.stringify(updates.budget || {})}::jsonb ELSE budget END,
          compliance = CASE WHEN ${updates.compliance ? true : false} THEN ${JSON.stringify(updates.compliance || {})}::jsonb ELSE compliance END,
          auto_assessment = CASE WHEN ${updates.autoAssessment ? true : false} THEN ${JSON.stringify(updates.autoAssessment || {})}::jsonb ELSE auto_assessment END,
          zero_assumption_audit = CASE WHEN ${updates.zeroAssumptionAudit ? true : false} THEN ${JSON.stringify(updates.zeroAssumptionAudit || {})}::jsonb ELSE zero_assumption_audit END,
          dg_final_verdict = CASE WHEN ${updates.dgFinalVerdict ? true : false} THEN ${JSON.stringify(updates.dgFinalVerdict || {})}::jsonb ELSE dg_final_verdict END,
          technical_review_details = CASE WHEN ${updates.technicalReviewDetails ? true : false} THEN ${JSON.stringify(updates.technicalReviewDetails || {})}::jsonb ELSE technical_review_details END,
          documents = CASE WHEN ${updates.documents ? true : false} THEN ${JSON.stringify(updates.documents || [])}::jsonb ELSE documents END,
          updated_at = NOW()
        WHERE id = ${id};
      `;

      // Forensic Audit Logging: Record previous values, new values, and correlation ID
      try {
        const auditId = `audit-upd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const actorName = req.headers['x-actor-name'] || updates.updatedByName || 'Authorized Technical Officer';
        const actorEmail = req.headers['x-actor-email'] || updates.updatedByEmail || 'evaluator@nita.gov.gh';
        const actorRole = req.headers['x-actor-role'] || updates.updatedByRole || 'Technical Director';
        const actorInstitution = req.headers['x-actor-institution'] || prevRow.mda || 'NITA';
        const integrityHash = crypto.createHash('sha256')
          .update(`${auditId}:${id}:${JSON.stringify(updates)}:${req.correlationId || ''}`)
          .digest('hex');

        const prevValues = {
          status: prevRow.status,
          reviewStatus: prevRow.review_status,
          readinessScore: prevRow.readiness_score,
          riskLevel: prevRow.risk_level
        };

        await sql`
          INSERT INTO audit_logs (
            id, timestamp, event_type, actor_name, actor_email, actor_role, actor_institution,
            target_module, target_entity_id, action_details, integrity_hash, retention_until,
            previous_values, new_values, correlation_id
          ) VALUES (
            ${auditId}, NOW(), 'PROJECT_FIELD_UPDATE', ${actorName}, ${actorEmail}, ${actorRole}, ${actorInstitution},
            'Projects Registry', ${id},
            ${`Statutory record updated for project ${prevRow.project_code || id}: modified [${Object.keys(updates).join(', ')}]`},
            ${integrityHash}, NOW() + INTERVAL '7 years',
            ${JSON.stringify(prevValues)}::jsonb,
            ${JSON.stringify(updates)}::jsonb,
            ${req.correlationId || null}
          );
        `;
      } catch (auditErr) {
        console.warn('[API] Automatic forensic audit logging warning:', auditErr.message);
      }

      return res.json({ success: true, message: `Project ${id} updated in Neon DB` });
    } catch (error) {
      console.error('[API] Error updating project:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.json({ success: true, message: `Project ${id} updated in memory` });
});

// POST /api/projects/:id/documents — Add document to project
app.post('/api/projects/:id/documents', async (req, res) => {
  const { id } = req.params;
  const newDoc = req.body;

  if (!newDoc || !newDoc.id || !newDoc.fileName) {
    return res.status(400).json({ error: 'Invalid document payload' });
  }

  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      // 1. Insert into dedicated documents table
      await sql`
        INSERT INTO documents (
          id, project_id, file_name, file_type, uploaded_at, version, signed_by,
          uploaded_by_role, uploaded_by_name, uploaded_by_email, uploaded_by_mda,
          is_first_timer_upload, review_status, file_size, page_count,
          document_category, full_document_text, file_data_url, reviewer_comments
        ) VALUES (
          ${newDoc.id}, ${id}, ${newDoc.fileName}, ${newDoc.fileType}, ${newDoc.uploadedAt || new Date().toISOString().split('T')[0]},
          ${newDoc.version || 1}, ${JSON.stringify(newDoc.signedBy || [])}, ${newDoc.uploadedByRole || null},
          ${newDoc.uploadedByName || null}, ${newDoc.uploadedByEmail || null}, ${newDoc.uploadedByMda || null},
          ${newDoc.isFirstTimerUpload || false}, ${newDoc.reviewStatus || 'Pending Review'}, ${newDoc.fileSize || 'Standard'},
          ${newDoc.pageCount || 1}, ${newDoc.documentCategory || 'Technical Specs'}, ${newDoc.fullDocumentText || null},
          ${newDoc.fileDataUrl || null}, ${JSON.stringify(newDoc.reviewerComments || [])}
        )
        ON CONFLICT (id) DO UPDATE SET
          review_status = EXCLUDED.review_status,
          reviewer_comments = EXCLUDED.reviewer_comments,
          signed_by = EXCLUDED.signed_by;
      `;

      // 2. Also append/replace in project's JSON documents column
      const proj = await sql`SELECT documents FROM projects WHERE id = ${id};`;
      if (proj.length > 0) {
        const curDocs = proj[0].documents || [];
        const filtered = curDocs.filter(d => d.id !== newDoc.id);
        const updatedDocs = [newDoc, ...filtered];
        await sql`UPDATE projects SET documents = ${JSON.stringify(updatedDocs)}::jsonb, updated_at = NOW() WHERE id = ${id};`;
      }

      return res.status(200).json({ success: true, message: 'Document registered in Neon DB', document: newDoc });
    } catch (error) {
      console.error('[API] Error saving document to Neon DB:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.json({ success: true, message: 'Document registered in memory', document: newDoc });
});

// ============================================================================
// 3. DIRECTOR GENERAL FINAL STATUTORY VERDICTS ENDPOINTS
// ============================================================================
app.get('/api/verdicts', async (req, res) => {
  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const rows = await sql`SELECT * FROM dg_verdicts ORDER BY timestamp DESC;`;
      const formatted = rows.map(r => ({
        id: r.id,
        projectId: r.project_id,
        projectCode: r.project_code,
        projectName: r.project_name,
        mda: r.mda,
        verdict: r.verdict,
        finalStatusLabel: r.final_status_label,
        mandatoryComments: r.mandatory_comments,
        reviewedByName: r.reviewed_by_name,
        reviewedByRole: r.reviewed_by_role,
        reviewedByEmail: r.reviewed_by_email,
        timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
        technicalRecommendationSummary: r.technical_recommendation_summary,
        complianceGradeAtReview: r.compliance_grade_at_review,
        clearanceOfficer: r.clearance_officer,
        signatureSeal: r.signature_seal
      }));
      return res.json({ source: 'neon_postgres', verdicts: formatted });
    } catch (e) {
      console.error('[API] Error getting verdicts:', e.message);
    }
  }

  const seed = getLocalSeedData();
  return res.json({ source: 'seed_fallback', verdicts: seed.verdicts });
});

app.post('/api/verdicts', async (req, res) => {
  const v = req.body;
  if (!v || !v.id || !v.projectId) {
    return res.status(400).json({ error: 'Missing required verdict attributes' });
  }

  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
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
        )
        ON CONFLICT (id) DO UPDATE SET
          verdict = EXCLUDED.verdict,
          final_status_label = EXCLUDED.final_status_label,
          mandatory_comments = EXCLUDED.mandatory_comments,
          signature_seal = EXCLUDED.signature_seal;
      `;
      return res.json({ success: true, message: 'DG verdict saved to Neon DB', verdict: v });
    } catch (e) {
      console.error('[API] Error saving DG verdict:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.json({ success: true, message: 'DG verdict saved in memory', verdict: v });
});

// ============================================================================
// 4. STATUTORY IMMUTABLE AUDIT LOGS ENDPOINTS (ACT 843)
// ============================================================================
app.get('/api/audit-logs', async (req, res) => {
  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const rows = await sql`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 500;`;
      const formatted = rows.map(r => ({
        id: r.id,
        timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
        eventType: r.event_type,
        actorName: r.actor_name,
        actorEmail: r.actor_email,
        actorRole: r.actor_role,
        actorInstitution: r.actor_institution,
        targetModule: r.target_module,
        targetEntityId: r.target_entity_id,
        actionDetails: r.action_details,
        integrityHash: r.integrity_hash,
        retentionUntil: r.retention_until ? new Date(r.retention_until).toISOString() : '2031-12-31T00:00:00Z',
        previousValues: typeof r.previous_values === 'string' ? JSON.parse(r.previous_values) : (r.previous_values || null),
        newValues: typeof r.new_values === 'string' ? JSON.parse(r.new_values) : (r.new_values || null),
        correlationId: r.correlation_id || null
      }));
      return res.json({ source: 'neon_postgres', auditLogs: formatted });
    } catch (e) {
      console.error('[API] Error fetching audit logs from Neon DB:', e.message);
    }
  }

  const seed = getLocalSeedData();
  return res.json({ source: 'seed_fallback', auditLogs: seed.auditLogs });
});

app.post('/api/audit-logs', async (req, res) => {
  const a = req.body;
  if (!a || !a.id || !a.eventType) {
    return res.status(400).json({ error: 'Missing required audit log parameters' });
  }

  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const correlationId = a.correlationId || req.correlationId || null;
      const prevVals = a.previousValues ? JSON.stringify(a.previousValues) : null;
      const newVals = a.newValues ? JSON.stringify(a.newValues) : null;

      await sql`
        INSERT INTO audit_logs (
          id, timestamp, event_type, actor_name, actor_email, actor_role, actor_institution,
          target_module, target_entity_id, action_details, integrity_hash, retention_until,
          previous_values, new_values, correlation_id
        ) VALUES (
          ${a.id}, ${a.timestamp || new Date().toISOString()}, ${a.eventType},
          ${a.actorName}, ${a.actorEmail}, ${a.actorRole}, ${a.actorInstitution},
          ${a.targetModule}, ${a.targetEntityId || null}, ${a.actionDetails},
          ${a.integrityHash}, ${a.retentionUntil || '2031-12-31T00:00:00Z'},
          ${prevVals ? prevVals : null}::jsonb,
          ${newVals ? newVals : null}::jsonb,
          ${correlationId}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
      return res.status(201).json({ success: true, message: 'Audit log appended in Neon DB', entry: a });
    } catch (e) {
      console.error('[API] Error appending audit log:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(201).json({ success: true, message: 'Audit log recorded in memory', entry: a });
});

// ============================================================================
// 5. CLASSIFIED INTERNAL REPORTS ENDPOINTS
// ============================================================================
app.get('/api/reports', async (req, res) => {
  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const rows = await sql`SELECT * FROM internal_reports ORDER BY updated_at DESC;`;
      const formatted = rows.map(r => ({
        id: r.id,
        reportCode: r.report_code,
        title: r.title,
        summary: r.summary,
        projectId: r.project_id,
        projectCode: r.project_code,
        documentId: r.document_id,
        severity: r.severity,
        status: r.status,
        createdByName: r.created_by_name,
        createdByRole: r.created_by_role,
        createdByEmail: r.created_by_email,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        assignedRole: r.assigned_role,
        readBy: typeof r.read_by === 'string' ? JSON.parse(r.read_by) : (r.read_by || []),
        comments: typeof r.comments === 'string' ? JSON.parse(r.comments) : (r.comments || [])
      }));
      return res.json({ source: 'neon_postgres', reports: formatted });
    } catch (e) {
      console.error('[API] Error fetching reports:', e.message);
    }
  }

  const seed = getLocalSeedData();
  return res.json({ source: 'seed_fallback', reports: seed.reports });
});

app.post('/api/reports', async (req, res) => {
  const r = req.body;
  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
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
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW(),
          comments = EXCLUDED.comments;
      `;
      return res.json({ success: true, message: 'Report saved to Neon DB', report: r });
    } catch (e) {
      console.error('[API] Error saving report:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.json({ success: true, message: 'Report saved in memory', report: r });
});

// ============================================================================
// 6. USER SESSIONS & AUTHENTICATION ENDPOINTS (NEON POSTGRESQL)
// ============================================================================

// Look up existing user type / profile from Neon PostgreSQL by email or full name
app.get('/api/auth/user/:identifier', async (req, res) => {
  const query = decodeURIComponent(req.params.identifier || '').trim().toLowerCase();
  if (!query) {
    return res.status(400).json({ error: 'Missing identifier' });
  }

  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const rows = await sql`
        SELECT * FROM user_sessions 
        WHERE LOWER(email) = ${query}
           OR LOWER(full_name) = ${query}
           OR LOWER(full_name) LIKE ${'%' + query + '%'}
        ORDER BY last_active_at DESC
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        const u = rows[0];
        const userObj = {
          sessionId: u.id,
          email: u.email,
          fullName: u.full_name,
          institution: u.institution,
          institutionCategory: u.institution_category || 'MDA',
          role: u.role,
          memberType: u.member_type || 'in_member',
          onboardingStatus: u.onboarding_status || 'approved',
          isFirstTimer: u.is_first_timer || false,
          authenticatedAt: u.authenticated_at,
          lastActiveAt: u.last_active_at,
          ...(u.session_data || {})
        };
        return res.json({ success: true, exists: true, user: userObj });
      }
    } catch (e) {
      console.error('[API] Error fetching user by identifier:', e.message);
    }
  }

  // Fallback check against seed test accounts
  const seed = getLocalSeedData();
  if (Array.isArray(seed.users)) {
    const matched = seed.users.find(u => 
      u.email.toLowerCase() === query || 
      u.fullName.toLowerCase().includes(query)
    );
    if (matched) {
      return res.json({
        success: true,
        exists: true,
        user: {
          sessionId: matched.id,
          email: matched.email,
          fullName: matched.fullName,
          institution: matched.institution,
          institutionCategory: matched.institutionCategory || 'MDA',
          role: matched.role,
          memberType: matched.memberType || 'in_member',
          onboardingStatus: matched.onboardingStatus || 'approved',
          isFirstTimer: false
        }
      });
    }
  }

  return res.json({ success: true, exists: false, user: null });
});

// GET /api/auth/test-accounts — Return configured statutory test accounts
app.get('/api/auth/test-accounts', (req, res) => {
  const seed = getLocalSeedData();
  res.json({
    success: true,
    testAccounts: seed.users || []
  });
});

// Save or keep user type / session in Neon PostgreSQL
app.post('/api/auth/session', async (req, res) => {
  const s = req.body;
  if (!s || !s.email) {
    return res.status(400).json({ error: 'Missing session email' });
  }

  const cleanEmail = s.email.trim().toLowerCase();
  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const sessionId = s.sessionId || s.id || `sess-${Date.now()}`;
      await sql`
        INSERT INTO user_sessions (
          id, email, full_name, institution, institution_category,
          role, member_type, onboarding_status, is_first_timer,
          authenticated_at, last_active_at, session_data
        ) VALUES (
          ${sessionId}, ${cleanEmail}, ${s.fullName || 'Authorized Officer'}, ${s.institution || 'Government of Ghana'},
          ${s.institutionCategory || 'MDA'}, ${s.role || 'Public User'}, ${s.memberType || 'in_member'},
          ${s.onboardingStatus || 'approved'}, ${s.isFirstTimer || false},
          NOW(), NOW(), ${JSON.stringify(s)}
        )
        ON CONFLICT (email) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          institution = EXCLUDED.institution,
          institution_category = EXCLUDED.institution_category,
          role = EXCLUDED.role,
          member_type = EXCLUDED.member_type,
          onboarding_status = EXCLUDED.onboarding_status,
          is_first_timer = EXCLUDED.is_first_timer,
          last_active_at = NOW(),
          session_data = EXCLUDED.session_data;
      `;
      return res.json({ 
        success: true, 
        message: 'Session and user type saved to Neon PostgreSQL',
        user: { ...s, email: cleanEmail }
      });
    } catch (e) {
      console.error('[API] Error updating user session in Postgres:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.json({ success: true, message: 'Session saved in memory', user: s });
});

// ============================================================================
// 6. TECHNICAL CLEARANCE SYSTEM ALWAYS-READY INTAKE PATH & AUTO-SCANNER
// ============================================================================

// Automated Standards Scoring Logic for Governance & Ethics and AI Readiness
function evaluateDossierStandards(fullText = '', category = 'Technical Specs') {
  const text = (fullText + ' ' + category).toLowerCase();

  // Governance & Ethics Standard Indicators
  const fairnessSignals = ['bias', 'fairness', 'demographic', 'gender', 'inclusiv', 'ussd', 'local language', 'twi', 'ga', 'ewe', 'accessibility'];
  const transSignals = ['model card', 'transparency', 'explainab', 'audit trail', 'architecture', 'documentation', 'specification'];
  const privacySignals = ['act 843', 'data protection commission', 'dpc', 'pii', 'anonymiz', 'encrypt', 'sha-256', 'tls 1.3', 'consent'];
  const secSignals = ['owasp', 'security', 'vulnerability', 'hsm', 'rbac', 'firewall', 'national data centre', 'penetration'];
  const accountSignals = ['steering committee', 'oversight', 'accountab', 'statutory', 'audit', 'director general', 'nita'];

  const countSignals = (signals) => signals.reduce((acc, sig) => acc + (text.includes(sig) ? 1 : 0), 0);

  const fCount = countSignals(fairnessSignals);
  const tCount = countSignals(transSignals);
  const pCount = countSignals(privacySignals);
  const sCount = countSignals(secSignals);
  const aCount = countSignals(accountSignals);

  const fairness = Math.min(98, Math.max(70, 70 + fCount * 6));
  const transparency = Math.min(98, Math.max(72, 72 + tCount * 6));
  const privacy = Math.min(98, Math.max(75, 75 + pCount * 6));
  const security = Math.min(98, Math.max(74, 74 + sCount * 6));
  const accountability = Math.min(98, Math.max(72, 72 + aCount * 6));

  const ethicsAverage = Math.round((fairness + transparency + privacy + security + accountability) / 5);
  const overallGrade = ethicsAverage >= 85 ? 'Low Risk' : ethicsAverage >= 70 ? 'Moderate Risk' : 'High Risk';

  // AI Readiness Standard Indicators
  const infraSignals = ['compute', 'cloud', 'edge', 'tensorflow', 'gpu', 'data centre', 'low-bandwidth', 'offline'];
  const dataSignals = ['data governance', 'lineage', 'catalogue', 'curation', 'provenance', 'validation', 'dataset'];
  const staffSignals = ['ai engineer', 'data scientist', 'competency', 'technical staff', 'training', 'capacity'];
  const policySignals = ['institutional charter', 'policy', 'strategy', 'leadership', 'compliance', 'framework'];

  const infraScore = Math.min(96, Math.max(68, 68 + countSignals(infraSignals) * 7));
  const dataGovScore = Math.min(96, Math.max(70, 70 + countSignals(dataSignals) * 7));
  const staffScore = Math.min(96, Math.max(72, 72 + countSignals(staffSignals) * 7));
  const policyScore = Math.min(96, Math.max(70, 70 + countSignals(policySignals) * 7));

  const readinessScore = Math.round((infraScore + dataGovScore + staffScore + policyScore) / 4);

  return {
    compliance: {
      fairness,
      transparency,
      accountability,
      privacy,
      security,
      overallGrade
    },
    readinessScore,
    readinessPillars: {
      infrastructure: infraScore,
      dataGovernance: dataGovScore,
      technicalStaff: staffScore,
      policyLeadership: policyScore
    },
    scannedAt: new Date().toISOString()
  };
}

// GET /api/technical-clearance/status — Always-ready health check
app.get('/api/technical-clearance/status', (req, res) => {
  res.json({
    status: 'ACTIVE_LISTENING',
    ready: true,
    intakePath: '/api/technical-clearance/documents',
    protocol: 'Ghana National Technical Clearance Statutory Interconnect v2.0',
    statutoryStandards: [
      'Ghana AI Governance & Ethics (Act 843, Inclusivity & Transparency)',
      'Ghana AI Readiness (Infrastructure, Data Governance, Staffing, Policy)'
    ],
    timestamp: new Date().toISOString()
  });
});

// POST /api/technical-clearance/documents (or /api/technical-clearance/receive)
// Intake endpoint: receives incoming documents, automatically scans & grades them, marks project Recommended, and keeps document Pending Review.
const handleIncomingClearanceDocument = async (req, res) => {
  const payload = req.body;
  if (!payload || !payload.document) {
    return res.status(400).json({ error: 'Missing document payload from Technical Clearance System' });
  }

  const doc = payload.document;
  const docId = doc.id || `doc-tc-${Date.now()}`;
  const projectId = payload.projectId || payload.projectCode || 'proj-1';
  const mda = payload.mda || doc.uploadedByMda || 'Government of Ghana';

  // 1. Automatically scan and grade according to Governance & Ethics and AI Readiness standards
  const evaluation = evaluateDossierStandards(
    (doc.fullDocumentText || doc.text || '') + ' ' + (doc.extractedOcrText || ''),
    doc.documentCategory || 'Technical Clearance Submission'
  );

  const documentRecord = {
    id: docId,
    projectId: projectId,
    fileName: doc.fileName || 'Statutory-Technical-Clearance-Dossier.pdf',
    fileType: doc.fileType || 'PDF',
    fileSize: doc.fileSize || '3.8 MB',
    pageCount: doc.pageCount || 8,
    uploadedAt: new Date().toISOString().split('T')[0],
    uploadedByRole: 'Technical Clearance System',
    uploadedByName: payload.submittedByName || 'National Technical Clearance Ingestion Service',
    uploadedByEmail: payload.submittedByEmail || 'clearance@nita.gov.gh',
    uploadedByMda: mda,
    documentCategory: doc.documentCategory || 'Technical Specs',
    fullDocumentText: doc.fullDocumentText || doc.text || 'Comprehensive Technical Clearance Submission Dossier received via statutory gateway.',
    fileDataUrl: doc.fileDataUrl || null,
    // Document remains reviewable by statutory reviewers:
    reviewStatus: 'Pending Review',
    signedBy: ['Technical Clearance Gateway'],
    isFirstTimerUpload: false,
    autoGraded: true,
    standardsEvaluation: evaluation,
    reviewerComments: []
  };

  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      // Register document in documents table
      await sql`
        INSERT INTO documents (
          id, project_id, file_name, file_type, uploaded_at, version, signed_by,
          uploaded_by_role, uploaded_by_name, uploaded_by_email, uploaded_by_mda,
          is_first_timer_upload, review_status, file_size, page_count,
          document_category, full_document_text, file_data_url, reviewer_comments
        ) VALUES (
          ${documentRecord.id}, ${projectId}, ${documentRecord.fileName}, ${documentRecord.fileType},
          ${documentRecord.uploadedAt}, 1, ${JSON.stringify(documentRecord.signedBy)},
          ${documentRecord.uploadedByRole}, ${documentRecord.uploadedByName}, ${documentRecord.uploadedByEmail},
          ${documentRecord.uploadedByMda}, false, 'Pending Review', ${documentRecord.fileSize},
          ${documentRecord.pageCount}, ${documentRecord.documentCategory}, ${documentRecord.fullDocumentText},
          ${documentRecord.fileDataUrl}, '[]'::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          full_document_text = EXCLUDED.full_document_text,
          updated_at = NOW();
      `;

      // Update project: mark status Recommended, update compliance & readiness score, append document
      const proj = await sql`SELECT * FROM projects WHERE id = ${projectId} OR project_code = ${projectId};`;
      if (proj.length > 0) {
        const curProj = proj[0];
        const existingDocs = curProj.documents || [];
        const updatedDocs = [documentRecord, ...existingDocs.filter(d => d.id !== documentRecord.id)];

        await sql`
          UPDATE projects SET
            review_status = 'Cleared & Registered',
            compliance = ${JSON.stringify(evaluation.compliance)}::jsonb,
            readiness_score = ${evaluation.readinessScore},
            auto_assessment = ${JSON.stringify({
              generatedAt: evaluation.scannedAt,
              generatedBy: 'National Technical Clearance Ingestion Engine',
              documentCount: updatedDocs.length,
              documentsAnalyzed: [documentRecord.fileName],
              readinessPillars: evaluation.readinessPillars,
              ethicsSummary: `Auto-graded via Technical Clearance intake. Overall Ethics Grade: ${evaluation.compliance.overallGrade}.`,
              readinessSummary: `Auto-graded via Technical Clearance intake. Institutional Readiness: ${evaluation.readinessScore}%.`
            })}::jsonb,
            documents = ${JSON.stringify(updatedDocs)}::jsonb,
            updated_at = NOW()
          WHERE id = ${curProj.id};
        `;
      }

      return res.status(200).json({
        success: true,
        message: 'Technical clearance document received, scanned & graded successfully. Project set to Recommended, document ready for review.',
        document: documentRecord,
        evaluation
      });
    } catch (err) {
      console.error('[API] Error ingesting technical clearance document:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // Memory fallback response
  return res.json({
    success: true,
    message: 'Technical clearance document received in memory fallback. Auto-scanned & graded.',
    document: documentRecord,
    evaluation
  });
};

app.post('/api/technical-clearance/documents', handleIncomingClearanceDocument);
app.post('/api/technical-clearance/receive', handleIncomingClearanceDocument);

// POST /api/technical-clearance/simulate-incoming — Interactive trigger to simulate receipt of an inbound clearance dossier
app.post('/api/technical-clearance/simulate-incoming', async (req, res) => {
  const simulatedDossiers = [
    {
      projectId: 'proj-1',
      projectCode: 'GN-AI-2026-001',
      mda: 'Ministry of Communications and Digitalisation (MoCD)',
      submittedByName: 'Dr. Joseph Kwakye (Technical Clearance Secretariat)',
      submittedByEmail: 'clearance.eval@nita.gov.gh',
      document: {
        id: `doc-tc-mocd-${Date.now()}`,
        fileName: 'GhanaPostGPS_AI_Clearance_Statutory_Dossier_2026.pdf',
        fileType: 'PDF',
        fileSize: '4.2 MB',
        pageCount: 12,
        documentCategory: 'Technical Specs',
        fullDocumentText: `REPUBLIC OF GHANA • TECHNICAL CLEARANCE SECRETARIAT (NITA ACT 771)
PROJECT: GhanaPostGPS National Addressing AI System (GN-AI-2026-001)
MDA: Ministry of Communications and Digitalisation (MoCD)

1. STATUTORY GOVERNANCE & ETHICS COMPLIANCE:
- Ghana Data Protection Act, 2012 (Act 843): Data Protection Commission (DPC) Registration active. Certified Data Protection Officer appointed. Personal Identifiable Information (PII) encrypted at ingestion via SHA-256 and stored exclusively within the National Data Centre in Accra.
- Fairness & Inclusivity Standards: Model calibrated across all 16 administrative regions (Greater Accra, Ashanti, Northern, Western North, Bono East, Upper West, Volta, etc.). Offline fallback channels implemented via USSD (*920#) and multilingual voice routing in English, Twi, Ga, and Ewe to prevent socio-economic exclusion.
- Security & Resilience: Zero external cross-border data transfer. Hardware Security Modules (HSM) deployed. Penetration testing completed and OWASP Top 10 vulnerabilities cleared.

2. AI READINESS & INFRASTRUCTURE EVALUATION:
- Infrastructure: Hybrid cloud topology linked to Accra Tier-3 Datacenter with edge TPU acceleration.
- Data Governance: Formal data catalog, lineage tracking, and automated validation rules active.
- Human Capital: Steering Committee chaired by Chief Director, supported by 6 AI Engineers and 4 Data Stewards.
- Policy Alignment: 100% aligned with Ghana National Artificial Intelligence Strategy 2026-2030.

STATUS: Recommended to National AI Projects Monitoring System for statutory review and final Director General clearance.`
      }
    },
    {
      projectId: 'proj-2',
      projectCode: 'GN-AI-2026-002',
      mda: 'National Identification Authority (NIA)',
      submittedByName: 'Eng. Elizabeth Ansah (NIA AI Systems Director)',
      submittedByEmail: 'e.ansah@nia.gov.gh',
      document: {
        id: `doc-tc-nia-${Date.now()}`,
        fileName: 'NIA_AFIS_Technical_Clearance_Audit_Charter.pdf',
        fileType: 'PDF',
        fileSize: '5.1 MB',
        pageCount: 15,
        documentCategory: 'Technical Specs',
        fullDocumentText: `REPUBLIC OF GHANA • NATIONAL IDENTIFICATION AUTHORITY (NIA)
TECHNICAL CLEARANCE SUBMISSION: National AFIS Biometric Identity Verification (GN-AI-2026-002)

1. GOVERNANCE & ETHICAL AUDIT:
- Biometric neural network accuracy validated at 99.85% demographic parity across age and gender brackets.
- Zero commercial third-party data broker monetization. Full Act 843 statutory adherence.
- End-to-end TLS 1.3 cryptographic transport and HSM ephemeral hash verification.

2. AI READINESS:
- High performance compute clusters situated inside primary data facilities.
- Multi-tier backup and disaster recovery protocols in place.
- Dedicated technical review panel monitoring false rejection and acceptance rates.

RECOMMENDATION: Transmitted to GNAPRMS as Recommended for statutory technical review.`
      }
    }
  ];

  const chosen = simulatedDossiers[Math.floor(Math.random() * simulatedDossiers.length)];
  req.body = chosen;
  return handleIncomingClearanceDocument(req, res);
});

// ============================================================================
// 7. INSTITUTIONS DIRECTORY ENDPOINTS (MDAs / MMDAs / SOEs)
// ============================================================================
app.get('/api/institutions', async (req, res) => {
  const { category, region, status, search } = req.query;
  const sql = getDb();

  if (sql && isDbConfigured()) {
    try {
      let rows = await sql`SELECT * FROM institutions ORDER BY category ASC, name ASC;`;

      if (category) {
        rows = rows.filter(r => r.category.toLowerCase() === category.toLowerCase());
      }
      if (region) {
        rows = rows.filter(r => r.region.toLowerCase() === region.toLowerCase());
      }
      if (status) {
        rows = rows.filter(r => r.status.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        const s = search.toLowerCase();
        rows = rows.filter(r =>
          r.name.toLowerCase().includes(s) ||
          r.code.toLowerCase().includes(s) ||
          (r.head_of_institution && r.head_of_institution.toLowerCase().includes(s))
        );
      }

      const formatted = rows.map(r => ({
        id: r.id,
        code: r.code,
        name: r.name,
        category: r.category,
        region: r.region,
        status: r.status,
        contactEmail: r.contact_email,
        contactPhone: r.contact_phone,
        headOfInstitution: r.head_of_institution,
        totalProjects: r.total_projects || 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      return res.json({ source: 'neon_postgres', institutions: formatted, total: formatted.length });
    } catch (error) {
      console.error('[API] Error fetching institutions from Neon DB:', error.message);
    }
  }

  const seed = getLocalSeedData();
  let fallback = seed.institutions || [];
  if (category) fallback = fallback.filter(i => i.category.toLowerCase() === category.toLowerCase());
  return res.json({ source: 'seed_fallback', institutions: fallback, total: fallback.length });
});

app.post('/api/institutions', async (req, res) => {
  const inst = req.body;
  if (!inst || !inst.name || !inst.code || !inst.category) {
    return res.status(400).json({ error: 'Missing required institution fields (name, code, category)' });
  }

  const id = inst.id || `inst-${Date.now()}`;
  const sql = getDb();

  if (sql && isDbConfigured()) {
    try {
      await sql`
        INSERT INTO institutions (
          id, code, name, category, region, status, contact_email, contact_phone, head_of_institution, total_projects
        ) VALUES (
          ${id}, ${inst.code.trim().toUpperCase()}, ${inst.name.trim()}, ${inst.category},
          ${inst.region || 'Greater Accra'}, ${inst.status || 'Active'}, ${inst.contactEmail || null},
          ${inst.contactPhone || null}, ${inst.headOfInstitution || null}, ${inst.totalProjects || 0}
        )
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          region = EXCLUDED.region,
          status = EXCLUDED.status,
          contact_email = EXCLUDED.contact_email,
          contact_phone = EXCLUDED.contact_phone,
          head_of_institution = EXCLUDED.head_of_institution,
          updated_at = NOW();
      `;

      try {
        const auditId = `audit-inst-${Date.now()}`;
        const integrityHash = crypto.createHash('sha256').update(`${auditId}:${id}:${inst.code}`).digest('hex');
        await sql`
          INSERT INTO audit_logs (
            id, timestamp, event_type, actor_name, actor_email, actor_role, actor_institution,
            target_module, target_entity_id, action_details, integrity_hash, retention_until,
            correlation_id
          ) VALUES (
            ${auditId}, NOW(), 'INSTITUTION_REGISTERED', 'Super Admin', 'admin@nita.gov.gh',
            'Super Admin', 'NITA', 'Institutions Directory', ${id},
            ${`Statutory Institution registered or updated: ${inst.name} (${inst.code})`},
            ${integrityHash}, NOW() + INTERVAL '7 years',
            ${req.correlationId || null}
          );
        `;
      } catch (auditErr) {
        console.warn('[API] Audit log error for institution creation:', auditErr.message);
      }

      return res.status(201).json({ success: true, message: 'Institution saved to Neon DB', institution: { ...inst, id } });
    } catch (error) {
      console.error('[API] Error saving institution:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(201).json({ success: true, message: 'Institution saved in fallback', institution: { ...inst, id } });
});

// ============================================================================
// 8. APPLICATION VERSION MANAGEMENT & RELEASE TRACKING
// ============================================================================
app.get('/api/system/versions', async (req, res) => {
  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const rows = await sql`SELECT * FROM app_versions ORDER BY release_date DESC;`;
      const formatted = rows.map(r => ({
        id: r.id,
        versionNumber: r.version || r.version_number,
        releaseNumber: r.release_number,
        releaseDate: r.release_date,
        title: r.title || `Release v${r.version}`,
        deploymentStatus: r.deployment_status,
        developerResponsible: r.deployed_by || r.developer_responsible || 'NITA Engineering Directorate',
        featuresAdded: typeof r.new_features === 'string' ? JSON.parse(r.new_features) : (r.new_features || r.features_added || []),
        bugFixes: typeof r.bug_fixes === 'string' ? JSON.parse(r.bug_fixes) : (r.bug_fixes || []),
        securityImprovements: typeof r.security_improvements === 'string' ? JSON.parse(r.security_improvements) : (r.security_improvements || []),
        releaseNotes: r.release_notes,
        createdAt: r.created_at
      }));
      return res.json({ source: 'neon_postgres', versions: formatted, currentVersion: formatted[0] || null });
    } catch (error) {
      console.error('[API] Error fetching app versions:', error.message);
    }
  }

  const seed = getLocalSeedData();
  const versions = (seed.appVersions || []).map(v => ({
    id: v.id,
    versionNumber: v.version,
    releaseNumber: v.releaseNumber,
    releaseDate: v.releaseDate,
    title: v.title,
    deploymentStatus: v.deploymentStatus,
    developerResponsible: v.deployedBy,
    featuresAdded: v.newFeatures,
    bugFixes: v.bugFixes,
    securityImprovements: v.securityImprovements,
    releaseNotes: v.releaseNotes
  }));
  return res.json({ source: 'seed_fallback', versions, currentVersion: versions[0] || null });
});

app.post('/api/system/versions', async (req, res) => {
  const v = req.body;
  const verNum = v.versionNumber || v.version;
  const relNum = v.releaseNumber;
  if (!v || !verNum || !relNum) {
    return res.status(400).json({ error: 'Missing required version fields (versionNumber, releaseNumber)' });
  }

  const id = v.id || `ver-${Date.now()}`;
  const sql = getDb();

  if (sql && isDbConfigured()) {
    try {
      await sql`
        INSERT INTO app_versions (
          id, version, release_number, release_date, title,
          release_notes, new_features, bug_fixes, security_improvements,
          deployed_by, deployment_status
        ) VALUES (
          ${id}, ${verNum}, ${typeof relNum === 'number' ? relNum : parseInt(relNum) || 1},
          ${v.releaseDate ? v.releaseDate.split('T')[0] : new Date().toISOString().split('T')[0]},
          ${v.title || `Release v${verNum}`},
          ${v.releaseNotes || ''},
          ${JSON.stringify(v.featuresAdded || v.newFeatures || [])}::jsonb,
          ${JSON.stringify(v.bugFixes || [])}::jsonb,
          ${JSON.stringify(v.securityImprovements || [])}::jsonb,
          ${v.developerResponsible || v.deployedBy || 'NITA Engineering Directorate'},
          ${v.deploymentStatus || 'Deployed'}
        )
        ON CONFLICT (version) DO UPDATE SET
          deployment_status = EXCLUDED.deployment_status,
          release_notes = EXCLUDED.release_notes;
      `;

      return res.status(201).json({ success: true, message: 'Application version registered', version: { ...v, id } });
    } catch (error) {
      console.error('[API] Error registering version:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(201).json({ success: true, message: 'Version registered in fallback', version: { ...v, id } });
});

// ============================================================================
// 9. AUTOMATED BACKUP & DISASTER RECOVERY ENDPOINTS
// ============================================================================
app.get('/api/system/backups', (req, res) => {
  try {
    const backups = listBackups();
    return res.json({ success: true, backups, total: backups.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/system/backup', async (req, res) => {
  try {
    const actor = req.headers['x-actor-name'] || req.body?.triggeredBy || 'Super Admin Console';
    const result = await createDatabaseBackup(actor);

    // Record in audit log
    const sql = getDb();
    if (sql && isDbConfigured()) {
      try {
        const auditId = `audit-bkp-${Date.now()}`;
        await sql`
          INSERT INTO audit_logs (
            id, timestamp, event_type, actor_name, actor_email, actor_role, actor_institution,
            target_module, target_entity_id, action_details, integrity_hash, retention_until,
            correlation_id
          ) VALUES (
            ${auditId}, NOW(), 'SYSTEM_BACKUP_EXECUTED', 'Super Admin', 'admin@nita.gov.gh',
            'Super Admin', 'NITA', 'Disaster Recovery', ${result.backupId},
            ${`Full system backup created: ${result.filename} (${result.sizeKb} KB, checksum: ${result.checksum})`},
            ${result.checksum}, NOW() + INTERVAL '7 years',
            ${req.correlationId || null}
          );
        `;
      } catch (e) {
        console.warn('[API] Warning logging backup event:', e.message);
      }
    }

    return res.json({ success: true, message: 'Backup successfully generated', backup: result });
  } catch (err) {
    console.error('[API] Backup failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/system/dr-drill', async (req, res) => {
  try {
    const { backupFilename } = req.body || {};
    const report = await runDisasterRecoveryDrill(backupFilename);
    return res.json({ success: true, message: 'Disaster recovery drill completed successfully', report });
  } catch (err) {
    console.error('[API] Disaster recovery drill failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 11. STATUTORY 8-STEP OPERATIONAL WORKFLOW ENDPOINTS (ACT 771 / ACT 843)
// ============================================================================

// POST /api/projects/validate-registry — STEP 2 National Registry Validation
app.post('/api/projects/validate-registry', async (req, res) => {
  try {
    const { name, mda, category, sector, budget, description } = req.body || {};
    
    // 1. Completeness score calculation
    const fields = [
      { key: 'name', value: name, weight: 20 },
      { key: 'mda', value: mda, weight: 20 },
      { key: 'sector', value: sector, weight: 15 },
      { key: 'category', value: category, weight: 15 },
      { key: 'budget', value: budget, weight: 15 },
      { key: 'description', value: description, weight: 15 }
    ];

    let completenessScore = 0;
    const missingFields = [];
    for (const f of fields) {
      if (f.value !== undefined && f.value !== null && String(f.value).trim() !== '') {
        completenessScore += f.weight;
      } else {
        missingFields.push(f.key);
      }
    }

    // 2. Scan for duplicate projects across DB or seed
    const sql = getDb();
    let existingProjects = [];
    if (sql && isDbConfigured()) {
      try {
        const rows = await sql`SELECT project_code, name, mda, category, sector FROM projects;`;
        existingProjects = rows.map(r => ({
          projectCode: r.project_code,
          name: r.name,
          mda: r.mda,
          category: r.category,
          sector: r.sector
        }));
      } catch (e) {
        console.warn('[API] Warning fetching projects for duplicate scan:', e.message);
      }
    }
    if (existingProjects.length === 0) {
      const seed = getLocalSeedData();
      existingProjects = seed.projects || [];
    }

    const cleanName = (name || '').trim().toLowerCase();
    const cleanMda = (mda || '').trim().toLowerCase();
    const duplicateMatches = [];

    for (const p of existingProjects) {
      const pName = (p.name || '').trim().toLowerCase();
      const pMda = (p.mda || '').trim().toLowerCase();
      
      // Exact or high similarity match
      if (cleanName && pName === cleanName) {
        duplicateMatches.push({
          projectCode: p.projectCode,
          name: p.name,
          reason: 'Identical project name already registered'
        });
      } else if (cleanName && cleanMda && pName.includes(cleanName) && pMda === cleanMda) {
        duplicateMatches.push({
          projectCode: p.projectCode,
          name: p.name,
          reason: 'High name similarity within the same managing institution'
        });
      }
    }

    const isDuplicate = duplicateMatches.length > 0;
    const nextCodeNumber = String(existingProjects.length + 1).padStart(3, '0');
    const generatedRegistryId = `GN-AI-2026-${nextCodeNumber}`;

    const validationStatus = isDuplicate
      ? 'Flagged Duplicate'
      : (completenessScore < 80 ? 'Incomplete Parameters' : 'Validated & Unique');

    return res.json({
      success: true,
      uniqueRegistryId: generatedRegistryId,
      completenessScore,
      isComplete: completenessScore >= 80,
      missingFields,
      isDuplicate,
      duplicateMatches,
      validationStatus,
      validatedAt: new Date().toISOString(),
      scanSummary: isDuplicate
        ? `Found ${duplicateMatches.length} possible duplicate collision(s) in registry.`
        : `Zero collisions detected. Unique statutory ID ${generatedRegistryId} allocated under NITA Act 771.`
    });
  } catch (err) {
    console.error('[API] Error in registry validation:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/operational-workflow/step — Updates active step & payload
app.post('/api/projects/:id/operational-workflow/step', async (req, res) => {
  const { id } = req.params;
  const { stepNumber, stepData, actorName, actorEmail, actorRole, notes } = req.body || {};

  if (!stepNumber || stepNumber < 1 || stepNumber > 8) {
    return res.status(400).json({ error: 'Valid stepNumber (1 to 8) is required.' });
  }

  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const rows = await sql`SELECT * FROM projects WHERE id = ${id};`;
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const proj = rows[0];
      const lifecycle = typeof proj.lifecycle === 'string' ? JSON.parse(proj.lifecycle) : (proj.lifecycle || {});
      const currentWf = lifecycle.operationalWorkflow || {};

      const stepKey = `step${stepNumber}_${
        stepNumber === 1 ? 'DataExchange' :
        stepNumber === 2 ? 'RegistryValidation' :
        stepNumber === 3 ? 'RiskClassification' :
        stepNumber === 4 ? 'RegulatoryAssessment' :
        stepNumber === 5 ? 'Implementation' :
        stepNumber === 6 ? 'ContinuousMonitoring' :
        stepNumber === 7 ? 'AuditImpactEvaluation' :
        'ClosureOrOversight'
      }`;

      const updatedWorkflow = {
        ...currentWf,
        currentStep: stepNumber,
        overallProgressPercent: Math.round((stepNumber / 8) * 100),
        [stepKey]: {
          ...(currentWf[stepKey] || {}),
          ...(stepData || {}),
          updatedAt: new Date().toISOString()
        }
      };

      lifecycle.operationalWorkflow = updatedWorkflow;

      await sql`
        UPDATE projects SET
          lifecycle = ${JSON.stringify(lifecycle)}::jsonb,
          updated_at = NOW()
        WHERE id = ${id};
      `;

      // Log forensic audit
      try {
        const auditId = `audit-step-${Date.now()}`;
        const auditHash = crypto.createHash('sha256').update(`${auditId}:${id}:${stepNumber}`).digest('hex');
        await sql`
          INSERT INTO audit_logs (
            id, timestamp, event_type, actor_name, actor_email, actor_role, actor_institution,
            target_module, target_entity_id, action_details, integrity_hash, retention_until
          ) VALUES (
            ${auditId}, NOW(), 'OPERATIONAL_WORKFLOW_STEP_UPDATE',
            ${actorName || 'Authorized Officer'}, ${actorEmail || 'evaluator@nita.gov.gh'},
            ${actorRole || 'Technical Director'}, ${proj.mda || 'NITA'},
            'registry', ${id},
            ${`Project ${proj.project_code} advanced/updated to Step ${stepNumber}: ${notes || 'Step parameters verified under statutory operational workflow.'}`},
            ${auditHash}, '2031-12-31T00:00:00Z'
          );
        `;
      } catch (e) {
        console.warn('[API] Warning logging workflow step audit:', e.message);
      }

      return res.json({ success: true, message: `Operational workflow Step ${stepNumber} updated`, workflow: updatedWorkflow });
    } catch (err) {
      console.error('[API] Error updating workflow step:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.json({ success: true, message: `Step ${stepNumber} updated in memory fallback` });
});

// POST /api/projects/:id/operational-workflow/incident — Logs Step 6 Incident
app.post('/api/projects/:id/operational-workflow/incident', async (req, res) => {
  const { id } = req.params;
  const { title, severity, description, status } = req.body || {};

  if (!title) {
    return res.status(400).json({ error: 'Incident title is required.' });
  }

  const incident = {
    id: `inc-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    title: title.trim(),
    severity: severity || 'Medium',
    status: status || 'Reported',
    description: description || 'Continuous monitoring discrepancy logged for regulatory investigation.'
  };

  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const rows = await sql`SELECT * FROM projects WHERE id = ${id};`;
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Project not found' });

      const proj = rows[0];
      const lifecycle = typeof proj.lifecycle === 'string' ? JSON.parse(proj.lifecycle) : (proj.lifecycle || {});
      const wf = lifecycle.operationalWorkflow || {};
      const step6 = wf.step6_ContinuousMonitoring || { incidents: [] };

      step6.incidents = [incident, ...(step6.incidents || [])];
      step6.reportedIncidentsCount = (step6.incidents || []).length;
      step6.monitoringStatus = severity === 'Critical' || severity === 'High' ? 'Needs Attention' : 'Active Monitoring';
      wf.step6_ContinuousMonitoring = step6;
      lifecycle.operationalWorkflow = wf;

      await sql`
        UPDATE projects SET
          lifecycle = ${JSON.stringify(lifecycle)}::jsonb,
          updated_at = NOW()
        WHERE id = ${id};
      `;

      return res.json({ success: true, message: 'Continuous monitoring incident recorded', incident });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.json({ success: true, message: 'Incident recorded in memory', incident });
});

// POST /api/projects/:id/operational-workflow/inspection — Logs Step 7 Inspection & Impact Evaluation
app.post('/api/projects/:id/operational-workflow/inspection', async (req, res) => {
  const { id } = req.params;
  const { inspectorName, inspectorRole, findings, verdict, citizenReach, economicImpact, nextInspectionDate } = req.body || {};

  const inspection = {
    lastInspectionDate: new Date().toISOString().split('T')[0],
    leadRegulatoryInspector: inspectorName || 'Regulatory Inspection Team',
    inspectorRole: inspectorRole || 'Super Admin',
    inspectionFindings: findings || 'Regulatory on-site inspection passed statutory criteria.',
    inspectionVerdict: verdict || 'Satisfactory',
    impactEvaluation: {
      citizenReachEstimate: citizenReach ? Number(citizenReach) : 100000,
      economicProductivityImpact: economicImpact || 'Positive public sector productivity enhancement.',
      socialBenefitRating: 'High Positive',
      outcomeEvaluationSummary: 'Project outcomes confirmed compliant with public mandate.'
    },
    scheduledNextInspectionDate: nextInspectionDate || '2027-06-30'
  };

  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const rows = await sql`SELECT * FROM projects WHERE id = ${id};`;
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Project not found' });

      const proj = rows[0];
      const lifecycle = typeof proj.lifecycle === 'string' ? JSON.parse(proj.lifecycle) : (proj.lifecycle || {});
      const wf = lifecycle.operationalWorkflow || {};
      wf.step7_AuditImpactEvaluation = inspection;
      lifecycle.operationalWorkflow = wf;

      await sql`
        UPDATE projects SET
          lifecycle = ${JSON.stringify(lifecycle)}::jsonb,
          updated_at = NOW()
        WHERE id = ${id};
      `;

      return res.json({ success: true, message: 'Statutory inspection and impact evaluation logged', inspection });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.json({ success: true, message: 'Inspection logged in memory', inspection });
});

// POST /api/projects/:id/operational-workflow/lifecycle-decision — Step 8 Closure or Continued Oversight
app.post('/api/projects/:id/operational-workflow/lifecycle-decision', async (req, res) => {
  const { id } = req.params;
  const { decision, justification, signedByName, retentionUntil } = req.body || {};

  if (!decision) {
    return res.status(400).json({ error: 'Lifecycle decision is required.' });
  }

  const step8Data = {
    currentOversightStatus: decision,
    lifecycleDecisionDate: new Date().toISOString().split('T')[0],
    decisionSignedBy: signedByName || 'Director General & NITA Oversight Board',
    decisionJustification: justification || 'Statutory review ratified by the oversight committee.',
    statutoryRetentionUntil: retentionUntil || '2036-12-31T23:59:59Z',
    historicalRecordsArchived: true,
    archiveStorageHash: crypto.createHash('sha256').update(`${id}:${decision}:${Date.now()}`).digest('hex')
  };

  const sql = getDb();
  if (sql && isDbConfigured()) {
    try {
      const rows = await sql`SELECT * FROM projects WHERE id = ${id};`;
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Project not found' });

      const proj = rows[0];
      const lifecycle = typeof proj.lifecycle === 'string' ? JSON.parse(proj.lifecycle) : (proj.lifecycle || {});
      const wf = lifecycle.operationalWorkflow || {};
      wf.currentStep = 8;
      wf.step8_ClosureOrOversight = step8Data;
      lifecycle.operationalWorkflow = wf;

      const newStatus = decision === 'Completed' ? 'Completed' : (decision === 'Suspended' ? 'Suspended' : 'Active');

      await sql`
        UPDATE projects SET
          status = ${newStatus},
          lifecycle = ${JSON.stringify(lifecycle)}::jsonb,
          updated_at = NOW()
        WHERE id = ${id};
      `;

      return res.json({ success: true, message: `Project transitioned to ${decision}`, step8: step8Data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.json({ success: true, message: `Project lifecycle decision recorded`, step8: step8Data });
});

// GET /api/projects/operational-workflow/overview — Operational Workflow Metrics across all 8 steps
app.get('/api/projects/operational-workflow/overview', async (req, res) => {
  try {
    const sql = getDb();
    let projects = [];
    if (sql && isDbConfigured()) {
      try {
        const rows = await sql`SELECT id, project_code, name, mda, stage, status, lifecycle FROM projects;`;
        projects = rows.map(r => ({
          id: r.id,
          projectCode: r.project_code,
          name: r.name,
          mda: r.mda,
          stage: r.stage,
          status: r.status,
          lifecycle: typeof r.lifecycle === 'string' ? JSON.parse(r.lifecycle) : (r.lifecycle || {})
        }));
      } catch (e) {
        console.warn('[API] Warning fetching projects for workflow overview:', e.message);
      }
    }
    if (projects.length === 0) {
      const seed = getLocalSeedData();
      projects = seed.projects || [];
    }

    const stepCounts = {
      step1_dataExchange: 0,
      step2_registryValidation: 0,
      step3_riskClassification: 0,
      step4_regulatoryAssessment: 0,
      step5_implementation: 0,
      step6_continuousMonitoring: 0,
      step7_auditImpactEvaluation: 0,
      step8_closureOrOversight: 0
    };

    let totalHealthy = 0;
    let totalAttention = 0;

    for (const p of projects) {
      const wf = p.lifecycle?.operationalWorkflow;
      const step = wf?.currentStep || (p.status === 'Completed' ? 8 : (p.stage === 'Development' ? 5 : 6));
      if (step === 1) stepCounts.step1_dataExchange++;
      else if (step === 2) stepCounts.step2_registryValidation++;
      else if (step === 3) stepCounts.step3_riskClassification++;
      else if (step === 4) stepCounts.step4_regulatoryAssessment++;
      else if (step === 5) stepCounts.step5_implementation++;
      else if (step === 6) stepCounts.step6_continuousMonitoring++;
      else if (step === 7) stepCounts.step7_auditImpactEvaluation++;
      else if (step === 8) stepCounts.step8_closureOrOversight++;

      if (p.status === 'Delayed' || wf?.workflowHealth === 'Attention Required') {
        totalAttention++;
      } else {
        totalHealthy++;
      }
    }

    return res.json({
      success: true,
      totalProjects: projects.length,
      stepCounts,
      health: {
        healthy: totalHealthy,
        attentionRequired: totalAttention
      },
      statutorySteps: [
        { step: 1, name: 'Secure API / Data Exchange', description: 'Transfers approved project record, clearance reference, decision and supporting documents to GNAPRMS.' },
        { step: 2, name: 'National Registry Validation', description: 'System generates a unique project ID and checks completeness and possible duplicates.' },
        { step: 3, name: 'Risk Classification', description: 'Project undergoes preliminary risk screening and is assigned a risk category.' },
        { step: 4, name: 'Regulatory Assessment', description: 'Relevant officers examine technical, legal, privacy, ethical and governance requirements of AI projects.' },
        { step: 5, name: 'Project Implementation', description: 'Institution updates development, pilot, deployment and project milestones.' },
        { step: 6, name: 'Continuous Regulatory Monitoring', description: 'Monitor risks, compliance, incidents, performance and project expenditure.' },
        { step: 7, name: 'Audit & Impact Evaluation', description: 'Regulatory officers conduct inspections and evaluate project outcomes.' },
        { step: 8, name: 'Project Closure or Continued Oversight', description: 'Project is completed, renewed, suspended or retired, with its historical records retained.' }
      ]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 12. GN-AIRGMS SPECIALIZED ENTERPRISE APIS (PHASE 4)
// Modules 1-13: TCS Bidirectional Exchange, Models, Datasets, 12 Domains,
// Incidents, Audits, Vendors, Notifications & 2-Tier Role Authorization
// ============================================================================

// Role Authorization Middleware Helper
function requireRole(allowedRoles = ['Super Admin', 'Technical Unit']) {
  return (req, res, next) => {
    const role = req.headers['x-user-role'] || req.body?.actorRole || 'Technical Unit';
    const normalizedRole = role === 'Technical Director' ? 'Technical Unit' : role;
    if (allowedRoles.includes(role) || allowedRoles.includes(normalizedRole)) {
      return next();
    }
    return res.status(403).json({ error: `Access restricted. Authorized roles: ${allowedRoles.join(', ')}` });
  };
}

// ----------------------------------------------------------------------------
// 12.1 TCS INBOUND & OUTBOUND INTEGRATION (MODULE 1 & 9)
// ----------------------------------------------------------------------------

// POST /api/tcs/referrals/inbound — Inbound referral intake from TCS
app.post('/api/tcs/referrals/inbound', async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-tcs-signature'];

    // Verify signature if configured
    if (process.env.NODE_ENV === 'production' && signature && !verifyTcsSignature(payload, signature)) {
      return res.status(401).json({ error: 'Invalid HMAC-SHA256 signature from TCS gateway' });
    }

    const {
      tcsReferenceNumber,
      institution,
      project,
      aiDeclaration,
      supportingDocuments
    } = payload || {};

    if (!tcsReferenceNumber || !project?.title) {
      return res.status(400).json({ error: 'Missing mandatory referral parameters (tcsReferenceNumber, project.title)' });
    }

    const sql = getDb();
    const instCode = institution?.code || 'GOV';
    const instName = institution?.name || 'Managing Government Institution';

    // Generate unique GN-AIRGMS sovereign project ID
    let projectCount = 12;
    if (sql && isDbConfigured()) {
      try {
        const countRes = await sql`SELECT COUNT(*)::int as count FROM projects;`;
        projectCount = countRes[0]?.count || 12;
      } catch (e) {
        console.warn('[API] Warning counting projects:', e.message);
      }
    }
    const nextCode = String(projectCount + 1).padStart(3, '0');
    const gnAirgmsId = `proj-tcs-${Date.now()}`;
    const projectCode = `GN-AI-2026-${nextCode}`;

    // 1. Insert into tcs_referrals
    const referralId = `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    if (sql && isDbConfigured()) {
      await sql`
        INSERT INTO tcs_referrals (
          id, tcs_reference_number, institution_name, institution_code,
          project_title, project_description, ai_technologies, intended_use,
          is_citizen_affecting, is_critical_infrastructure, screening_score,
          referral_status, referred_at, gn_airgms_project_id, raw_tcs_payload
        ) VALUES (
          ${referralId}, ${tcsReferenceNumber}, ${instName}, ${instCode},
          ${project.title}, ${project.description || ''},
          ${JSON.stringify(aiDeclaration?.technologyTypes || ['Machine Learning'])}::jsonb,
          ${aiDeclaration?.intendedUse || ''},
          ${Boolean(aiDeclaration?.isCitizenAffecting)},
          ${Boolean(aiDeclaration?.isCriticalInfrastructure)},
          85, 'Accepted & Registered', NOW(), ${gnAirgmsId},
          ${JSON.stringify(payload)}::jsonb
        ) ON CONFLICT (tcs_reference_number) DO UPDATE SET
          referral_status = 'Updated Inbound',
          updated_at = NOW();
      `;

      // 2. Insert into projects
      await sql`
        INSERT INTO projects (
          id, project_code, tcs_reference_number, name, description,
          category, sector, stage, status, start_date, end_date, expected_completion_date,
          latitude, longitude, mda, mda_code, region, district, budget, compliance,
          readiness_score, risk_level, review_status, technical_stack, vendor, documents
        ) VALUES (
          ${gnAirgmsId}, ${projectCode}, ${tcsReferenceNumber}, ${project.title},
          ${project.description || ''}, ${aiDeclaration?.technologyTypes?.[0] || 'Machine Learning'},
          ${project.sector || 'Cross-Sector'}, 'Planning', 'Active',
          ${project.implementationStartDate || '2026-01-01'},
          ${project.expectedCompletionDate || '2028-12-31'},
          ${project.expectedCompletionDate || '2028-12-31'},
          ${project.projectLocation?.latitude || 5.6037},
          ${project.projectLocation?.longitude || -0.1870},
          ${instName}, ${instCode},
          ${project.projectLocation?.region || 'Greater Accra'},
          ${project.projectLocation?.district || 'Accra Metropolitan'},
          ${JSON.stringify({ totalAllocated: project.allocatedBudgetGHS || 1000000, disbursed: 0, utilized: 0, primaryFundingSource: project.fundingSource || 'Government', currency: 'GHS' })}::jsonb,
          ${JSON.stringify({ fairness: 80, transparency: 80, accountability: 80, privacy: 80, security: 80, overallGrade: 'Good' })}::jsonb,
          75, 'Moderate Risk', 'Pending Review',
          ${JSON.stringify({ foundationModel: aiDeclaration?.foundationModel || 'Custom' })}::jsonb,
          ${JSON.stringify({ name: aiDeclaration?.primaryVendor || 'Sovereign ICT Team' })}::jsonb,
          ${JSON.stringify(supportingDocuments || [])}::jsonb
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }

    return res.status(202).json({
      status: 'ACCEPTED',
      statusCode: 202,
      gnAirgmsProjectId: gnAirgmsId,
      projectCode,
      tcsReferenceNumber,
      referralStatus: 'Referred & Registered',
      acknowledgementToken: `ACK-GNAIRGMS-${Date.now()}`,
      assignedAssessmentTeam: 'National AI Technical Unit',
      estimatedReviewDays: 14,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[API] Inbound TCS Referral Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/tcs/referrals — List all inbound referrals
app.get('/api/tcs/referrals', async (req, res) => {
  try {
    const sql = getDb();
    if (sql && isDbConfigured()) {
      const rows = await sql`
        SELECT * FROM tcs_referrals ORDER BY referred_at DESC;
      `;
      return res.json({ success: true, count: rows.length, referrals: rows });
    }
    return res.json({ success: true, count: 0, referrals: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/tcs/reports/return — Outbound assessment report transmission to TCS
app.post('/api/tcs/reports/return', async (req, res) => {
  try {
    const reportData = req.body;
    if (!reportData?.tcsReferenceNumber || !reportData?.decision) {
      return res.status(400).json({ error: 'Missing mandatory report fields (tcsReferenceNumber, decision)' });
    }

    const transmissionResult = await transmitReportToTcs(reportData);

    // Save decision and update regulatory_decisions table if DB configured
    const sql = getDb();
    if (sql && isDbConfigured()) {
      const decisionId = `dec-${Date.now()}`;
      await sql`
        INSERT INTO regulatory_decisions (
          id, project_id, tcs_reference_number, decision, justification,
          risk_tier_assigned, conditions, decided_by_name, decided_by_role,
          decided_by_email, decided_at, signature_seal, tcs_transmission_status,
          tcs_transmitted_at, tcs_acknowledgement_receipt
        ) VALUES (
          ${decisionId}, ${reportData.projectId || reportData.gnAirgmsProjectId || 'unknown'},
          ${reportData.tcsReferenceNumber}, ${reportData.decision},
          ${reportData.justification || 'Statutory review ratified by the National Technical Unit.'},
          ${reportData.riskClassification || 'Moderate Risk'},
          ${JSON.stringify(reportData.bindingConditions || [])}::jsonb,
          ${reportData.decidedByName || 'Super Administrator'},
          ${reportData.decidedByRole || 'Super Admin'},
          ${reportData.decidedByEmail || 'superadmin@nita.gov.gh'},
          NOW(), ${crypto.createHash('sha256').update(`${reportData.tcsReferenceNumber}:${reportData.decision}`).digest('hex')},
          ${transmissionResult.success ? 'Acknowledged' : 'Queued'},
          NOW(), ${transmissionResult.acknowledgementToken || null}
        );
      `;
    }

    return res.json({
      success: true,
      message: 'AI Assessment report successfully processed for TCS delivery',
      transmission: transmissionResult
    });
  } catch (err) {
    console.error('[API] Error transmitting report to TCS:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/tcs/status — Health check & integration diagnostics
app.get('/api/tcs/status', async (req, res) => {
  return res.json({
    status: 'ACTIVE_ONLINE',
    tcsInterconnectProtocol: 'TLS 1.3 / HMAC-SHA256',
    mockAdapterEnabled: true,
    lastHeartbeat: new Date().toISOString()
  });
});

// ----------------------------------------------------------------------------
// 12.2 AI MODELS & DATASETS APIS (MODULE 6)
// ----------------------------------------------------------------------------

// GET /api/projects/:id/models
app.get('/api/projects/:id/models', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      const rows = await sql`SELECT * FROM ai_models WHERE project_id = ${id} ORDER BY created_at DESC;`;
      return res.json({ success: true, count: rows.length, models: rows });
    }
    return res.json({ success: true, count: 0, models: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/models
app.post('/api/projects/:id/models', async (req, res) => {
  try {
    const { id } = req.params;
    const m = req.body;
    if (!m?.modelName || !m?.provider) {
      return res.status(400).json({ error: 'Missing required model fields (modelName, provider)' });
    }

    const modelId = `model-${Date.now()}`;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      await sql`
        INSERT INTO ai_models (
          id, project_id, model_name, provider, model_type, version,
          intended_purpose, hosting_location, model_ownership, accuracy_score,
          validation_metrics, known_limitations, explainability_method,
          bias_testing_status, is_generative_ai, genai_safeguards
        ) VALUES (
          ${modelId}, ${id}, ${m.modelName}, ${m.provider},
          ${m.modelType || 'Foundation Model'}, ${m.version || '1.0.0'},
          ${m.intendedPurpose || ''}, ${m.hostingLocation || 'Sovereign National Data Centre'},
          ${m.modelOwnership || 'State-Owned / MDA'}, ${parseFloat(m.accuracyScore) || 0.92},
          ${JSON.stringify(m.validationMetrics || {})}::jsonb,
          ${m.knownLimitations || ''}, ${m.explainabilityMethod || 'SHAP / Attention Maps'},
          ${m.biasTestingStatus || 'Passed'}, ${Boolean(m.isGenerativeAi)},
          ${JSON.stringify(m.genaiSafeguards || {})}::jsonb
        );
      `;
      return res.status(201).json({ success: true, message: 'AI model registered successfully', modelId });
    }
    return res.status(201).json({ success: true, message: 'AI model registered (memory fallback)', modelId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id/datasets
app.get('/api/projects/:id/datasets', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      const rows = await sql`SELECT * FROM datasets WHERE project_id = ${id} ORDER BY created_at DESC;`;
      return res.json({ success: true, count: rows.length, datasets: rows });
    }
    return res.json({ success: true, count: 0, datasets: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/datasets
app.post('/api/projects/:id/datasets', async (req, res) => {
  try {
    const { id } = req.params;
    const d = req.body;
    if (!d?.datasetName || !d?.dataSource) {
      return res.status(400).json({ error: 'Missing required dataset fields (datasetName, dataSource)' });
    }

    const datasetId = `ds-${Date.now()}`;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      await sql`
        INSERT INTO datasets (
          id, project_id, dataset_name, data_source, data_owner,
          data_classification, contains_personal_data, act_843_lawful_basis,
          consent_documentation_ref, cross_border_transfer, cross_border_justification,
          data_retention_period, quality_score
        ) VALUES (
          ${datasetId}, ${id}, ${d.datasetName}, ${d.dataSource},
          ${d.dataOwner || 'Managing MDA'}, ${d.dataClassification || 'Restricted Public Sector'},
          ${Boolean(d.containsPersonalData)}, ${d.act843LawfulBasis || 'Public Interest (Act 843)'},
          ${d.consentDocumentationRef || 'DPC-REG-2026-VAL'},
          ${Boolean(d.crossBorderTransfer)}, ${d.crossBorderJustification || 'None'},
          ${d.dataRetentionPeriod || '5 Years Statutory'}, ${parseInt(d.qualityScore) || 85}
        );
      `;
      return res.status(201).json({ success: true, message: 'Dataset registered successfully', datasetId });
    }
    return res.status(201).json({ success: true, message: 'Dataset registered (memory fallback)', datasetId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 12.3 12-DOMAIN AI ASSESSMENT ENGINE APIS (MODULES 4 & 5)
// ----------------------------------------------------------------------------

// GET /api/projects/:id/assessments
app.get('/api/projects/:id/assessments', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      const rows = await sql`SELECT * FROM assessment_domains WHERE project_id = ${id} ORDER BY domain_number ASC;`;
      return res.json({ success: true, count: rows.length, assessments: rows });
    }
    return res.json({ success: true, count: 0, assessments: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/assessments — Record domain scores (1-5) and gate status
app.post('/api/projects/:id/assessments', async (req, res) => {
  try {
    const { id } = req.params;
    const { domainNumber, domainName, score, scoreLabel, findings, evidenceRecords, evaluatorName, evaluatorRole, evaluatorEmail, mandatoryGatePassed } = req.body || {};

    if (!domainNumber || !score || score < 1 || score > 5) {
      return res.status(400).json({ error: 'Valid domainNumber (1-12) and score (1-5) are required.' });
    }

    const assessmentId = `asm-${id}-d${domainNumber}`;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      await sql`
        INSERT INTO assessment_domains (
          id, project_id, domain_number, domain_name, score, score_label,
          findings, evidence_records, evaluator_name, evaluator_role,
          evaluator_email, mandatory_gate_passed
        ) VALUES (
          ${assessmentId}, ${id}, ${parseInt(domainNumber)}, ${domainName || `Domain ${domainNumber}`},
          ${parseInt(score)}, ${scoreLabel || (score >= 4 ? 'Good' : 'Satisfactory')},
          ${findings || ''}, ${JSON.stringify(evidenceRecords || [])}::jsonb,
          ${evaluatorName || 'Technical Unit Evaluator'}, ${evaluatorRole || 'Technical Unit'},
          ${evaluatorEmail || 'techdirector@mocd.gov.gh'}, ${mandatoryGatePassed !== false}
        ) ON CONFLICT (id) DO UPDATE SET
          score = EXCLUDED.score,
          findings = EXCLUDED.findings,
          mandatory_gate_passed = EXCLUDED.mandatory_gate_passed;
      `;
      return res.json({ success: true, message: `Domain ${domainNumber} scored successfully`, score });
    }
    return res.json({ success: true, message: `Domain ${domainNumber} scored (memory)`, score });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 12.4 REGULATORY DECISIONS & CONDITIONS APIS (MODULE 8)
// ----------------------------------------------------------------------------

// GET /api/projects/:id/decisions
app.get('/api/projects/:id/decisions', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      const rows = await sql`SELECT * FROM regulatory_decisions WHERE project_id = ${id} ORDER BY decided_at DESC;`;
      return res.json({ success: true, count: rows.length, decisions: rows });
    }
    return res.json({ success: true, count: 0, decisions: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 12.5 AI INCIDENTS APIS (MODULE 11)
// ----------------------------------------------------------------------------

// GET /api/incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const sql = getDb();
    if (sql && isDbConfigured()) {
      const rows = await sql`SELECT * FROM ai_incidents ORDER BY incident_date DESC;`;
      return res.json({ success: true, count: rows.length, incidents: rows });
    }
    return res.json({ success: true, count: 0, incidents: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/incidents
app.post('/api/incidents', async (req, res) => {
  try {
    const inc = req.body;
    if (!inc?.title || !inc?.severity) {
      return res.status(400).json({ error: 'Missing required incident fields (title, severity)' });
    }

    const incidentId = `inc-${Date.now()}`;
    const incidentCode = `INC-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      await sql`
        INSERT INTO ai_incidents (
          id, incident_code, project_id, institution_id, incident_date,
          category, severity, title, description, affected_systems,
          assigned_investigator, root_cause, corrective_action, status
        ) VALUES (
          ${incidentId}, ${incidentCode}, ${inc.projectId || null},
          ${inc.institutionId || null}, NOW(),
          ${inc.category || 'System Drift'}, ${inc.severity || 'Medium'},
          ${inc.title}, ${inc.description || ''}, ${inc.affectedSystems || 'All Users'},
          ${inc.assignedInvestigator || 'Technical Unit Incident Lead'},
          ${inc.rootCause || ''}, ${inc.correctiveAction || ''},
          ${inc.status || 'Reported'}
        );
      `;
      return res.status(201).json({ success: true, message: 'Incident logged', incidentCode, incidentId });
    }
    return res.status(201).json({ success: true, message: 'Incident logged (memory)', incidentCode, incidentId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/incidents/:id
app.put('/api/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rootCause, correctiveAction, assignedInvestigator } = req.body || {};
    const sql = getDb();
    if (sql && isDbConfigured()) {
      await sql`
        UPDATE ai_incidents SET
          status = COALESCE(${status}, status),
          root_cause = COALESCE(${rootCause}, root_cause),
          corrective_action = COALESCE(${correctiveAction}, corrective_action),
          assigned_investigator = COALESCE(${assignedInvestigator}, assigned_investigator),
          resolved_at = CASE WHEN ${status} = 'Resolved' THEN NOW() ELSE resolved_at END,
          updated_at = NOW()
        WHERE id = ${id} OR incident_code = ${id};
      `;
      return res.json({ success: true, message: 'Incident updated' });
    }
    return res.json({ success: true, message: 'Incident updated (memory)' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 12.6 AI AUDITS & STATUTORY INSPECTIONS APIS (MODULE 12)
// ----------------------------------------------------------------------------

// GET /api/audits
app.get('/api/audits', async (req, res) => {
  try {
    const sql = getDb();
    if (sql && isDbConfigured()) {
      const rows = await sql`SELECT * FROM ai_audits ORDER BY scheduled_date ASC;`;
      return res.json({ success: true, count: rows.length, audits: rows });
    }
    return res.json({ success: true, count: 0, audits: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/audits
app.post('/api/audits', async (req, res) => {
  try {
    const a = req.body;
    if (!a?.leadAuditor || !a?.scheduledDate) {
      return res.status(400).json({ error: 'Missing required audit fields (leadAuditor, scheduledDate)' });
    }

    const auditId = `aud-${Date.now()}`;
    const auditCode = `AUD-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      await sql`
        INSERT INTO ai_audits (
          id, audit_code, project_id, audit_type, scheduled_date,
          lead_auditor, audit_team, checklist_findings, non_compliance_records,
          corrective_action_plan, verdict, status
        ) VALUES (
          ${auditId}, ${auditCode}, ${a.projectId || null},
          ${a.auditType || 'Statutory Inspection'}, ${a.scheduledDate},
          ${a.leadAuditor}, ${JSON.stringify(a.auditTeam || ['Technical Unit Inspector'])}::jsonb,
          ${JSON.stringify(a.checklistFindings || {})}::jsonb,
          ${JSON.stringify(a.nonComplianceRecords || [])}::jsonb,
          ${a.correctiveActionPlan || ''}, ${a.verdict || 'Scheduled'},
          ${a.status || 'Scheduled'}
        );
      `;
      return res.status(201).json({ success: true, message: 'Audit scheduled', auditCode, auditId });
    }
    return res.status(201).json({ success: true, message: 'Audit scheduled (memory)', auditCode, auditId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 12.7 AI VENDORS & PROCUREMENT OVERSIGHT APIS (MODULE 13)
// ----------------------------------------------------------------------------

// GET /api/vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const sql = getDb();
    if (sql && isDbConfigured()) {
      const rows = await sql`SELECT * FROM ai_vendors ORDER BY name ASC;`;
      return res.json({ success: true, count: rows.length, vendors: rows });
    }
    return res.json({ success: true, count: 0, vendors: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/vendors
app.post('/api/vendors', async (req, res) => {
  try {
    const v = req.body;
    if (!v?.name || !v?.country) {
      return res.status(400).json({ error: 'Missing required vendor fields (name, country)' });
    }

    const vendorId = `vnd-${Date.now()}`;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      await sql`
        INSERT INTO ai_vendors (
          id, name, country, contract_reference, licensing_type,
          data_ownership_clause, hosting_location, security_certifications,
          sla_guarantees, vendor_lockin_risk, exit_strategy_documented
        ) VALUES (
          ${vendorId}, ${v.name}, ${v.country}, ${v.contractReference || 'CON-2026-VAL'},
          ${v.licensingType || 'Custom Government Build'},
          ${v.dataOwnershipClause || 'All State data belongs exclusively to the Republic of Ghana under Act 843.'},
          ${v.hostingLocation || 'Sovereign National Data Centre'},
          ${JSON.stringify(v.securityCertifications || ['ISO 27001'])}::jsonb,
          ${JSON.stringify(v.slaGuarantees || { uptime: '99.9%' })}::jsonb,
          ${v.vendorLockinRisk || 'Low'}, ${Boolean(v.exitStrategyDocumented)}
        );
      `;
      return res.status(201).json({ success: true, message: 'Vendor registered successfully', vendorId });
    }
    return res.status(201).json({ success: true, message: 'Vendor registered (memory)', vendorId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 12.8 SYSTEM NOTIFICATIONS APIS (SECTION 10)
// ----------------------------------------------------------------------------

// GET /api/notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const email = req.headers['x-user-email'] || req.query.email;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      const rows = email 
        ? await sql`SELECT * FROM notifications WHERE recipient_email = ${email} ORDER BY delivered_at DESC;`
        : await sql`SELECT * FROM notifications ORDER BY delivered_at DESC LIMIT 50;`;
      return res.json({ success: true, count: rows.length, notifications: rows });
    }
    return res.json({ success: true, count: 0, notifications: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications
app.post('/api/notifications', async (req, res) => {
  try {
    const { recipientEmail, recipientRole, type, title, message, projectId } = req.body || {};
    if (!recipientEmail || !title || !message) {
      return res.status(400).json({ error: 'Missing mandatory notification parameters (recipientEmail, title, message)' });
    }

    const notifId = `notif-${Date.now()}`;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      await sql`
        INSERT INTO notifications (
          id, recipient_email, recipient_role, type, title, message, project_id, is_read, delivered_at
        ) VALUES (
          ${notifId}, ${recipientEmail}, ${recipientRole || 'Technical Unit'},
          ${type || 'SYSTEM_ALERT'}, ${title}, ${message}, ${projectId || null}, FALSE, NOW()
        );
      `;
      return res.status(201).json({ success: true, notificationId: notifId });
    }
    return res.status(201).json({ success: true, notificationId: notifId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/:id/read
app.post('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getDb();
    if (sql && isDbConfigured()) {
      await sql`UPDATE notifications SET is_read = TRUE WHERE id = ${id};`;
      return res.json({ success: true });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================
app.listen(PORT, async () => {
  console.log(`====================================================================`);
  console.log(`  GNAPRMS NEON POSTGRESQL API SERVER RUNNING ON PORT ${PORT}`);
  console.log(`====================================================================`);
  if (isDbConfigured()) {
    console.log('[API] Initializing Neon PostgreSQL Database tables & verifying schema...');
    try {
      await initializeDatabase();
    } catch (err) {
      console.warn('[API] Neon auto-initialization error:', err.message);
    }
  } else {
    console.log('[API] DATABASE_URL not detected in environment. Running with local storage fallback.');
    console.log('[API] Configure DATABASE_URL in .env to connect to Neon Postgres.');
  }
});

