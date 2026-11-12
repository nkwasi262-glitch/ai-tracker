-- ============================================================================
-- REPUBLIC OF GHANA — NATIONAL AI PROJECTS REGISTRY & MONITORING SYSTEM (GNAPRMS)
-- NEON POSTGRESQL DATABASE SCHEMA
-- Statutory Authority: National Information Technology Agency (NITA Act 771)
-- Data Protection & Integrity: Data Protection Act, 2012 (Act 843)
-- ============================================================================

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(100) PRIMARY KEY,
    project_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    sector VARCHAR(100),
    stage VARCHAR(50),
    status VARCHAR(50),
    start_date DATE,
    end_date DATE,
    expected_completion_date DATE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    mda VARCHAR(255) NOT NULL,
    mda_code VARCHAR(50) NOT NULL,
    region VARCHAR(100),
    district VARCHAR(100),
    budget JSONB NOT NULL DEFAULT '{}'::jsonb,
    compliance JSONB NOT NULL DEFAULT '{}'::jsonb,
    readiness_score INTEGER DEFAULT 0,
    risk_level VARCHAR(50),
    lifecycle JSONB NOT NULL DEFAULT '{}'::jsonb,
    technical_stack JSONB NOT NULL DEFAULT '{}'::jsonb,
    vendor JSONB NOT NULL DEFAULT '{}'::jsonb,
    review_status VARCHAR(100) DEFAULT 'Pending Review',
    has_first_timer_upload BOOLEAN DEFAULT FALSE,
    auto_assessment JSONB,
    zero_assumption_audit JSONB,
    dg_final_verdict JSONB,
    technical_review_details JSONB,
    documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_mda ON projects(mda);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_review_status ON projects(review_status);

-- 2. Documents Table (detailed metadata & Act 843 integrity)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_at VARCHAR(50),
    version INTEGER DEFAULT 1,
    signed_by JSONB DEFAULT '[]'::jsonb,
    uploaded_by_role VARCHAR(100),
    uploaded_by_name VARCHAR(255),
    uploaded_by_email VARCHAR(255),
    uploaded_by_mda VARCHAR(255),
    is_first_timer_upload BOOLEAN DEFAULT FALSE,
    review_status VARCHAR(100) DEFAULT 'Pending Review',
    file_size VARCHAR(50),
    page_count INTEGER DEFAULT 1,
    document_category VARCHAR(255),
    full_document_text TEXT,
    file_data_url TEXT,
    reviewer_comments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by_mda ON documents(uploaded_by_mda);

-- 3. Director General Final Statutory Verdicts Table
CREATE TABLE IF NOT EXISTS dg_verdicts (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    project_code VARCHAR(100) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    mda VARCHAR(255) NOT NULL,
    verdict VARCHAR(100) NOT NULL,
    final_status_label VARCHAR(100) NOT NULL,
    mandatory_comments TEXT NOT NULL,
    reviewed_by_name VARCHAR(255) NOT NULL,
    reviewed_by_role VARCHAR(100) NOT NULL,
    reviewed_by_email VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    technical_recommendation_summary TEXT,
    compliance_grade_at_review VARCHAR(50),
    clearance_officer VARCHAR(255),
    signature_seal VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dg_verdicts_project_id ON dg_verdicts(project_id);
CREATE INDEX IF NOT EXISTS idx_dg_verdicts_verdict ON dg_verdicts(verdict);

-- 4. Immutable Statutory Audit Trail (5-Year Mandatory Retention under Act 843)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(100) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_email VARCHAR(255) NOT NULL,
    actor_role VARCHAR(100) NOT NULL,
    actor_institution VARCHAR(255) NOT NULL,
    target_module VARCHAR(100) NOT NULL,
    target_entity_id VARCHAR(100),
    action_details TEXT NOT NULL,
    integrity_hash VARCHAR(255) NOT NULL,
    retention_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_email ON audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);

-- 5. Classified Internal Reports Table
CREATE TABLE IF NOT EXISTS internal_reports (
    id VARCHAR(100) PRIMARY KEY,
    report_code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    project_id VARCHAR(100),
    project_code VARCHAR(100),
    document_id VARCHAR(100),
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_by_name VARCHAR(255) NOT NULL,
    created_by_role VARCHAR(100) NOT NULL,
    created_by_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_role VARCHAR(100),
    read_by JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_internal_reports_project_id ON internal_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_internal_reports_status ON internal_reports(status);

-- 6. User Sessions & Authentication Cache Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    institution_category VARCHAR(50) NOT NULL,
    role VARCHAR(100) NOT NULL,
    member_type VARCHAR(50),
    onboarding_status VARCHAR(50),
    is_first_timer BOOLEAN DEFAULT FALSE,
    authenticated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    session_data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_email ON user_sessions(email);

-- 7. Institutions Table (MDAs, MMDAs, SOEs across Ghana)
CREATE TABLE IF NOT EXISTS institutions (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'MDA', -- MDA, MMDA, SOE, Other
    sector VARCHAR(100) DEFAULT 'Cross-Sector',
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- Active, Inactive, Pending
    contact_email VARCHAR(255),
    region VARCHAR(100) DEFAULT 'Greater Accra',
    district VARCHAR(100),
    active_projects_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institutions_code ON institutions(code);
CREATE INDEX IF NOT EXISTS idx_institutions_category ON institutions(category);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON institutions(status);

-- 8. Application Versions & Release Tracking Table
CREATE TABLE IF NOT EXISTS app_versions (
    id VARCHAR(100) PRIMARY KEY,
    version VARCHAR(50) UNIQUE NOT NULL,
    release_number INTEGER NOT NULL,
    release_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    release_notes TEXT NOT NULL,
    new_features JSONB DEFAULT '[]'::jsonb,
    bug_fixes JSONB DEFAULT '[]'::jsonb,
    security_improvements JSONB DEFAULT '[]'::jsonb,
    deployed_by VARCHAR(255) NOT NULL,
    deployment_status VARCHAR(50) DEFAULT 'Deployed', -- Deployed, Rollback, Staged
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_versions_version ON app_versions(version);
CREATE INDEX IF NOT EXISTS idx_app_versions_release_date ON app_versions(release_date);

-- 9. Audit Log Forensic Extension Columns
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS previous_values JSONB DEFAULT '{}'::jsonb;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_values JSONB DEFAULT '{}'::jsonb;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(100);

-- 10. PostgreSQL Row-Level Security (RLS) Foundations
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_all_projects_policy ON projects;
CREATE POLICY app_all_projects_policy ON projects FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_all_institutions_policy ON institutions;
CREATE POLICY app_all_institutions_policy ON institutions FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_all_versions_policy ON app_versions;
CREATE POLICY app_all_versions_policy ON app_versions FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_all_audit_logs_policy ON audit_logs;
CREATE POLICY app_all_audit_logs_policy ON audit_logs FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- ============================================================================
-- 11. GN-AIRGMS Specialized Tables (Modules 1 - 13)
-- ============================================================================

-- A. Extend projects with GN-AIRGMS metadata
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tcs_reference_number VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS referral_date TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tcs_referral_id VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ai_classification JSONB DEFAULT '{}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS risk_assessment JSONB DEFAULT '{}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS governance_compliance JSONB DEFAULT '{}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_assessment JSONB DEFAULT '{}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS monitoring_telemetry JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_projects_tcs_ref ON projects(tcs_reference_number);

-- B. TCS Inbound Project Referrals Table (Module 1)
CREATE TABLE IF NOT EXISTS tcs_referrals (
    id VARCHAR(100) PRIMARY KEY,
    tcs_reference_number VARCHAR(100) UNIQUE NOT NULL,
    institution_id VARCHAR(100) REFERENCES institutions(id),
    institution_name VARCHAR(255) NOT NULL,
    institution_code VARCHAR(50) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT,
    ai_technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
    intended_use TEXT,
    is_citizen_affecting BOOLEAN DEFAULT FALSE,
    is_critical_infrastructure BOOLEAN DEFAULT FALSE,
    screening_score INTEGER DEFAULT 0,
    referral_status VARCHAR(50) DEFAULT 'Pending Review',
    referred_at TIMESTAMPTZ DEFAULT NOW(),
    gn_airgms_project_id VARCHAR(100) REFERENCES projects(id),
    raw_tcs_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tcs_referrals_ref_num ON tcs_referrals(tcs_reference_number);
CREATE INDEX IF NOT EXISTS idx_tcs_referrals_status ON tcs_referrals(referral_status);

-- C. AI Models Specification Table (Module 6)
CREATE TABLE IF NOT EXISTS ai_models (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
    model_name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    intended_purpose TEXT,
    hosting_location VARCHAR(100) DEFAULT 'Sovereign National Data Centre',
    model_ownership VARCHAR(100) DEFAULT 'State-Owned / MDA',
    accuracy_score DOUBLE PRECISION,
    validation_metrics JSONB DEFAULT '{}'::jsonb,
    known_limitations TEXT,
    explainability_method VARCHAR(100),
    bias_testing_status VARCHAR(50) DEFAULT 'Pending Testing',
    is_generative_ai BOOLEAN DEFAULT FALSE,
    genai_safeguards JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_models_project_id ON ai_models(project_id);

-- D. Datasets Provenance & Privacy Table (Module 6 - Act 843)
CREATE TABLE IF NOT EXISTS datasets (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
    dataset_name VARCHAR(255) NOT NULL,
    data_source VARCHAR(255) NOT NULL,
    data_owner VARCHAR(255) NOT NULL,
    data_classification VARCHAR(50) DEFAULT 'Restricted Public Sector',
    contains_personal_data BOOLEAN DEFAULT FALSE,
    act_843_lawful_basis VARCHAR(100),
    consent_documentation_ref VARCHAR(255),
    cross_border_transfer BOOLEAN DEFAULT FALSE,
    cross_border_justification TEXT,
    data_retention_period VARCHAR(100),
    quality_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_datasets_project_id ON datasets(project_id);

-- E. Standardized 12-Domain AI Assessments Table (Modules 4 & 5)
CREATE TABLE IF NOT EXISTS assessment_domains (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
    domain_number INTEGER NOT NULL CHECK (domain_number BETWEEN 1 AND 12),
    domain_name VARCHAR(255) NOT NULL,
    score INTEGER CHECK (score BETWEEN 1 AND 5),
    score_label VARCHAR(50),
    findings TEXT,
    evidence_records JSONB DEFAULT '[]'::jsonb,
    evaluator_name VARCHAR(255) NOT NULL,
    evaluator_role VARCHAR(100) NOT NULL,
    evaluator_email VARCHAR(255) NOT NULL,
    evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    mandatory_gate_passed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_domains_project_id ON assessment_domains(project_id);

-- F. Regulatory Decisions & TCS Outbound Reports Table (Modules 8 & 9)
CREATE TABLE IF NOT EXISTS regulatory_decisions (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
    tcs_reference_number VARCHAR(100) NOT NULL,
    decision VARCHAR(100) NOT NULL,
    justification TEXT NOT NULL,
    risk_tier_assigned VARCHAR(50) NOT NULL,
    conditions JSONB DEFAULT '[]'::jsonb,
    decided_by_name VARCHAR(255) NOT NULL,
    decided_by_role VARCHAR(100) NOT NULL,
    decided_by_email VARCHAR(255) NOT NULL,
    decided_at TIMESTAMPTZ DEFAULT NOW(),
    signature_seal VARCHAR(255) NOT NULL,
    tcs_transmission_status VARCHAR(50) DEFAULT 'Pending Transmission',
    tcs_transmitted_at TIMESTAMPTZ,
    tcs_acknowledgement_receipt VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regulatory_decisions_proj_id ON regulatory_decisions(project_id);

-- G. AI Incident Reporting & Investigation Table (Module 11)
CREATE TABLE IF NOT EXISTS ai_incidents (
    id VARCHAR(100) PRIMARY KEY,
    incident_code VARCHAR(100) UNIQUE NOT NULL,
    project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
    institution_id VARCHAR(100),
    incident_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    affected_systems TEXT,
    assigned_investigator VARCHAR(255),
    root_cause TEXT,
    corrective_action TEXT,
    status VARCHAR(50) DEFAULT 'Reported',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_incidents_project_id ON ai_incidents(project_id);

-- H. AI Audits & Statutory Inspections Table (Module 12)
CREATE TABLE IF NOT EXISTS ai_audits (
    id VARCHAR(100) PRIMARY KEY,
    audit_code VARCHAR(100) UNIQUE NOT NULL,
    project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
    audit_type VARCHAR(50) NOT NULL,
    scheduled_date DATE NOT NULL,
    lead_auditor VARCHAR(255) NOT NULL,
    audit_team JSONB DEFAULT '[]'::jsonb,
    checklist_findings JSONB DEFAULT '{}'::jsonb,
    non_compliance_records JSONB DEFAULT '[]'::jsonb,
    corrective_action_plan TEXT,
    verdict VARCHAR(50) DEFAULT 'Scheduled',
    status VARCHAR(50) DEFAULT 'Scheduled',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_audits_project_id ON ai_audits(project_id);

-- I. AI Vendors & Procurement Oversight Table (Module 13)
CREATE TABLE IF NOT EXISTS ai_vendors (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    contract_reference VARCHAR(100),
    licensing_type VARCHAR(100),
    data_ownership_clause TEXT,
    hosting_location VARCHAR(100) DEFAULT 'Sovereign National Data Centre',
    security_certifications JSONB DEFAULT '[]'::jsonb,
    sla_guarantees JSONB DEFAULT '{}'::jsonb,
    vendor_lockin_risk VARCHAR(50) DEFAULT 'Medium',
    exit_strategy_documented BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- J. Centralized System Notifications Table (Section 10)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_role VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    project_id VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- K. Enable Row-Level Security (RLS) on all new tables
ALTER TABLE tcs_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- L. Application RLS Policies for New Tables
DROP POLICY IF EXISTS app_all_tcs_referrals_policy ON tcs_referrals;
CREATE POLICY app_all_tcs_referrals_policy ON tcs_referrals FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_all_ai_models_policy ON ai_models;
CREATE POLICY app_all_ai_models_policy ON ai_models FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_all_datasets_policy ON datasets;
CREATE POLICY app_all_datasets_policy ON datasets FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_all_assessment_domains_policy ON assessment_domains;
CREATE POLICY app_all_assessment_domains_policy ON assessment_domains FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_all_regulatory_decisions_policy ON regulatory_decisions;
CREATE POLICY app_all_regulatory_decisions_policy ON regulatory_decisions FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_all_ai_incidents_policy ON ai_incidents;
CREATE POLICY app_all_ai_incidents_policy ON ai_incidents FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_all_ai_audits_policy ON ai_audits;
CREATE POLICY app_all_ai_audits_policy ON ai_audits FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_all_ai_vendors_policy ON ai_vendors;
CREATE POLICY app_all_ai_vendors_policy ON ai_vendors FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_all_notifications_policy ON notifications;
CREATE POLICY app_all_notifications_policy ON notifications FOR ALL TO PUBLIC USING (true) WITH CHECK (true);


