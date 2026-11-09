import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDb, isDbConfigured } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BACKUP_DIR = path.resolve(__dirname, 'backups');
const MAX_BACKUP_RETENTION = 30;

export async function createDatabaseBackup(triggeredBy = 'Automated System Scheduler') {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const sql = getDb();
  if (!sql || !isDbConfigured()) {
    throw new Error('Neon PostgreSQL is not configured. Backup aborted.');
  }

  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `bkp-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;

  console.log(`[Backup] Initiating full Neon PostgreSQL database snapshot (${backupId})...`);

  // 1. Extract data across all 8 core tables
  const [
    institutions,
    projects,
    documents,
    dgVerdicts,
    auditLogs,
    internalReports,
    userSessions,
    appVersions
  ] = await Promise.all([
    sql`SELECT * FROM institutions ORDER BY id ASC;`,
    sql`SELECT * FROM projects ORDER BY id ASC;`,
    sql`SELECT * FROM documents ORDER BY id ASC;`,
    sql`SELECT * FROM dg_verdicts ORDER BY id ASC;`,
    sql`SELECT * FROM audit_logs ORDER BY timestamp ASC;`,
    sql`SELECT * FROM internal_reports ORDER BY id ASC;`,
    sql`SELECT * FROM user_sessions ORDER BY authenticated_at ASC;`,
    sql`SELECT * FROM app_versions ORDER BY release_date ASC;`
  ]);

  const recordCounts = {
    institutions: institutions.length,
    projects: projects.length,
    documents: documents.length,
    dg_verdicts: dgVerdicts.length,
    audit_logs: auditLogs.length,
    internal_reports: internalReports.length,
    user_sessions: userSessions.length,
    app_versions: appVersions.length
  };

  const payloadData = {
    institutions,
    projects,
    documents,
    dg_verdicts: dgVerdicts,
    audit_logs: auditLogs,
    internal_reports: internalReports,
    user_sessions: userSessions,
    app_versions: appVersions
  };

  const serializedData = JSON.stringify(payloadData, null, 2);
  const checksum = crypto.createHash('sha256').update(serializedData).digest('hex');

  const snapshot = {
    metadata: {
      backupId,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      databaseEngine: 'Neon Serverless PostgreSQL (Postgres 16 / 17)',
      application: 'Ghana National AI Projects Registry & Monitoring System (GNAPRMS)',
      systemVersion: '1.2.0',
      triggeredBy,
      totalRecords: Object.values(recordCounts).reduce((a, b) => a + b, 0),
      recordCounts,
      checksumSha256: checksum
    },
    data: payloadData
  };

  const filename = `gnaprms_backup_${timestamp}.json`;
  const filePath = path.join(BACKUP_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');

  const stats = fs.statSync(filePath);
  const sizeKb = (stats.size / 1024).toFixed(2);

  console.log(`[Backup] Completed successfully: ${filename} (${sizeKb} KB, ${snapshot.metadata.totalRecords} records)`);

  // Retention cleanup: retain only recent MAX_BACKUP_RETENTION backups
  pruneOldBackups();

  return {
    success: true,
    backupId,
    filename,
    filePath,
    sizeKb: parseFloat(sizeKb),
    checksum,
    metadata: snapshot.metadata
  };
}

function pruneOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('gnaprms_backup_') && f.endsWith('.json'))
      .map(f => ({ name: f, path: path.join(BACKUP_DIR, f), time: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_BACKUP_RETENTION) {
      const toDelete = files.slice(MAX_BACKUP_RETENTION);
      for (const item of toDelete) {
        fs.unlinkSync(item.path);
        console.log(`[Backup Retention] Pruned old backup file: ${item.name}`);
      }
    }
  } catch (err) {
    console.warn('[Backup Retention] Warning while pruning backups:', err.message);
  }
}

export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('gnaprms_backup_') && f.endsWith('.json'))
    .map(f => {
      const fullPath = path.join(BACKUP_DIR, f);
      const stat = fs.statSync(fullPath);
      let metadata = {};
      try {
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        metadata = content.metadata || {};
      } catch (e) {
        // file unreadable or corrupt
      }
      return {
        filename: f,
        filePath: fullPath,
        sizeKb: (stat.size / 1024).toFixed(2),
        createdAt: stat.birthtime,
        modifiedAt: stat.mtime,
        metadata
      };
    })
    .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));

  return files;
}

// Direct CLI invocation check
if (process.argv[1] && process.argv[1].endsWith('backup.js')) {
  createDatabaseBackup('Manual CLI Operator')
    .then(res => {
      console.log('Backup summary:', JSON.stringify(res.metadata, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('Backup failed:', err.message);
      process.exit(1);
    });
}
