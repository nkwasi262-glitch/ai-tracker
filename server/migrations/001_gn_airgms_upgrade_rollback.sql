-- ============================================================================
-- REPUBLIC OF GHANA — GN-AIRGMS DATABASE ROLLBACK SCRIPT (001)
-- Rollback for Migration 001
-- ============================================================================

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ai_vendors CASCADE;
DROP TABLE IF EXISTS ai_audits CASCADE;
DROP TABLE IF EXISTS ai_incidents CASCADE;
DROP TABLE IF EXISTS regulatory_decisions CASCADE;
DROP TABLE IF EXISTS assessment_domains CASCADE;
DROP TABLE IF EXISTS datasets CASCADE;
DROP TABLE IF EXISTS ai_models CASCADE;
DROP TABLE IF EXISTS tcs_referrals CASCADE;

ALTER TABLE projects DROP COLUMN IF EXISTS tcs_reference_number;
ALTER TABLE projects DROP COLUMN IF EXISTS referral_date;
ALTER TABLE projects DROP COLUMN IF EXISTS tcs_referral_id;
ALTER TABLE projects DROP COLUMN IF EXISTS ai_classification;
ALTER TABLE projects DROP COLUMN IF EXISTS risk_assessment;
ALTER TABLE projects DROP COLUMN IF EXISTS governance_compliance;
ALTER TABLE projects DROP COLUMN IF EXISTS impact_assessment;
ALTER TABLE projects DROP COLUMN IF EXISTS monitoring_telemetry;

