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

