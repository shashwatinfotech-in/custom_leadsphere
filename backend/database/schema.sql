-- ============================================================
-- LeadSphere CRM — Company-wise Multi-tenant Schema
-- Run this entire script in pgAdmin Query Tool
-- Database: leadsphere
-- ============================================================

-- Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- CLEAN RESET — Drop all tables in reverse dependency order
-- ============================================================
DROP TABLE IF EXISTS lead_template_fields  CASCADE;
DROP TABLE IF EXISTS lead_templates         CASCADE;
DROP TABLE IF EXISTS imports                CASCADE;
DROP TABLE IF EXISTS lead_status_history    CASCADE;
DROP TABLE IF EXISTS lead_activity_logs     CASCADE;
DROP TABLE IF EXISTS emails                 CASCADE;
DROP TABLE IF EXISTS email_templates        CASCADE;
DROP TABLE IF EXISTS audience_leads         CASCADE;
DROP TABLE IF EXISTS audiences              CASCADE;
DROP TABLE IF EXISTS lead_custom_values     CASCADE;
DROP TABLE IF EXISTS lead_custom_fields     CASCADE;
DROP TABLE IF EXISTS leads                  CASCADE;
DROP TABLE IF EXISTS users                  CASCADE;
DROP TABLE IF EXISTS companies              CASCADE;


-- ============================================================
-- TABLE 1: COMPANIES  (the tenant / owner of each CRM site)
-- ============================================================
CREATE TABLE companies (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(150),
    phone       VARCHAR(20),
    address     TEXT,
    logo_url    TEXT,
    plan        VARCHAR(50)  DEFAULT 'free',      -- free | pro | enterprise
    settings    JSONB        DEFAULT '{}',
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 2: USERS
-- Roles:  admin   → company owner, full control
--         manager → full lead access within company
--         user    → can only see own leads
-- ============================================================
CREATE TABLE users (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    phone       VARCHAR(20),
    role        VARCHAR(50)  NOT NULL DEFAULT 'user',
    password    TEXT         NOT NULL,
    status      BOOLEAN      DEFAULT TRUE,
    last_login  TIMESTAMP,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 3: LEADS
-- ============================================================
CREATE TABLE leads (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name        VARCHAR(150),
    email       VARCHAR(150),
    phone       VARCHAR(20),
    company     VARCHAR(150),
    source      VARCHAR(100),
    status      VARCHAR(50)  DEFAULT 'New',
    assigned_to UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
    notes       TEXT,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 4: CUSTOM FIELD DEFINITIONS
-- ============================================================
CREATE TABLE lead_custom_fields (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    field_name  VARCHAR(100) NOT NULL,
    field_type  VARCHAR(50)  NOT NULL,   -- text | number | dropdown | date | boolean
    options     TEXT,                    -- JSON array string for dropdown choices
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 5: CUSTOM FIELD VALUES (per lead)
-- ============================================================
CREATE TABLE lead_custom_values (
    id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id     UUID  NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    field_id    UUID  NOT NULL REFERENCES lead_custom_fields(id) ON DELETE CASCADE,
    value       TEXT,
    UNIQUE (lead_id, field_id)   -- one value per field per lead
);


-- ============================================================
-- TABLE 6: AUDIENCE GROUPS
-- ============================================================
CREATE TABLE audiences (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    created_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 7: AUDIENCE ↔ LEAD (many-to-many)
-- ============================================================
CREATE TABLE audience_leads (
    id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    audience_id UUID  NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
    lead_id     UUID  NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    UNIQUE (audience_id, lead_id)
);


-- ============================================================
-- TABLE 8: EMAIL TEMPLATES
-- ============================================================
CREATE TABLE email_templates (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id    UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_name VARCHAR(150) NOT NULL,
    subject       TEXT,
    body          TEXT,
    created_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 9: EMAIL SEND HISTORY
-- ============================================================
CREATE TABLE emails (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    lead_id     UUID         REFERENCES leads(id) ON DELETE SET NULL,
    template_id UUID         REFERENCES email_templates(id) ON DELETE SET NULL,
    subject     TEXT,
    message     TEXT,
    status      VARCHAR(50)  DEFAULT 'sent',
    sent_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
    sent_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 10: LEAD ACTIVITY LOG
-- ============================================================
CREATE TABLE lead_activity_logs (
    id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id     UUID  NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    activity    TEXT  NOT NULL,
    created_by  UUID   REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 11: LEAD STATUS HISTORY
-- ============================================================
CREATE TABLE lead_status_history (
    id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id     UUID  NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    old_status  VARCHAR(50),
    new_status  VARCHAR(50),
    changed_by  UUID   REFERENCES users(id) ON DELETE SET NULL,
    changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 12: IMPORT HISTORY
-- ============================================================
CREATE TABLE imports (
    id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id    UUID  NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    file_name     TEXT,
    imported_by   UUID   REFERENCES users(id) ON DELETE SET NULL,
    total_records INT    DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 13: LEAD FORM TEMPLATES
-- ============================================================
CREATE TABLE lead_templates (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 14: LEAD TEMPLATE FIELDS
-- ============================================================
CREATE TABLE lead_template_fields (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id   UUID        NOT NULL REFERENCES lead_templates(id) ON DELETE CASCADE,
    label         VARCHAR(150) NOT NULL,
    field_type    VARCHAR(50)  NOT NULL,
    required      BOOLEAN      DEFAULT FALSE,
    default_value TEXT,
    options       TEXT,        -- JSON array for dropdown choices
    display_order INT          DEFAULT 0,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- INDEXES — for query performance
-- ============================================================
CREATE INDEX idx_users_company         ON users(company_id);
CREATE INDEX idx_users_email           ON users(email);

CREATE INDEX idx_leads_company         ON leads(company_id);
CREATE INDEX idx_leads_status          ON leads(status);
CREATE INDEX idx_leads_assigned        ON leads(assigned_to);
CREATE INDEX idx_leads_created_by      ON leads(created_by);
CREATE INDEX idx_leads_created_at      ON leads(created_at DESC);

CREATE INDEX idx_custom_fields_company ON lead_custom_fields(company_id);
CREATE INDEX idx_custom_values_lead    ON lead_custom_values(lead_id);

CREATE INDEX idx_audiences_company     ON audiences(company_id);
CREATE INDEX idx_audience_leads_aud    ON audience_leads(audience_id);
CREATE INDEX idx_audience_leads_lead   ON audience_leads(lead_id);

CREATE INDEX idx_email_templates_comp  ON email_templates(company_id);
CREATE INDEX idx_emails_company        ON emails(company_id);
CREATE INDEX idx_emails_lead           ON emails(lead_id);

CREATE INDEX idx_activity_lead         ON lead_activity_logs(lead_id);
CREATE INDEX idx_status_history_lead   ON lead_status_history(lead_id);

CREATE INDEX idx_imports_company       ON imports(company_id);
CREATE INDEX idx_lead_templates_comp   ON lead_templates(company_id);


-- ============================================================
-- VERIFY — check all tables were created
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
