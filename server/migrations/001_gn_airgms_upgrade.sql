-- ============================================================================
-- REPUBLIC OF GHANA — GN-AIRGMS DATABASE UPGRADE MIGRATION (001)
-- Ghana National AI Registry, Governance, Regulatory & Monitoring System
-- Statutory Mandate: NITA Act (Act 771), Data Protection Act (Act 843), Act 1038
-- ============================================================================

-- 1. Extend Core Projects Table (Non-Destructive)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tcs_reference_number VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS referral_date TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tcs_referral_id VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ai_classification JSONB DEFAULT '{}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS risk_assessment JSONB DEFAULT '{}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS governance_compliance JSONB DEFAULT '{}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_assessment JSONB DEFAULT '{}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS monitoring_telemetry JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_projects_tcs_ref ON projects(tcs_reference_number);

-- 2. TCS Inbound Project Referrals Table (Module 1)
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
CREATE INDEX IF NOT EXISTS idx_tcs_referrals_inst_code ON tcs_referrals(institution_code);

-- 3. AI Models Specification Table (Module 6)
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
CREATE INDEX IF NOT EXISTS idx_ai_models_type ON ai_models(model_type);

-- 4. Datasets Provenance & Privacy Table (Module 6 - Act 843)
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
CREATE INDEX IF NOT EXISTS idx_datasets_classification ON datasets(data_classification);

-- 5. Standardized 12-Domain AI Assessments Table (Modules 4 & 5)
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
CREATE INDEX IF NOT EXISTS idx_assessment_domains_num ON assessment_domains(domain_number);

-- 6. Regulatory Decisions & TCS Outbound Reports Table (Modules 8 & 9)
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
CREATE INDEX IF NOT EXISTS idx_regulatory_decisions_tcs_ref ON regulatory_decisions(tcs_reference_number);

-- 7. AI Incident Reporting & Investigation Table (Module 11)
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
CREATE INDEX IF NOT EXISTS idx_ai_incidents_severity ON ai_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_ai_incidents_status ON ai_incidents(status);

-- 8. AI Audits & Statutory Inspections Table (Module 12)
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
CREATE INDEX IF NOT EXISTS idx_ai_audits_status ON ai_audits(status);

-- 9. AI Vendors & Procurement Oversight Table (Module 13)
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

CREATE INDEX IF NOT EXISTS idx_ai_vendors_name ON ai_vendors(name);

-- 10. Centralized System Notifications Table (Section 10)
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

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_email ON notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- 11. Enable Row-Level Security (RLS) on all new tables
ALTER TABLE tcs_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 12. Create Permissive Application RLS Policies
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

