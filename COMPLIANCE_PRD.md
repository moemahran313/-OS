# COMPLIANCE HUB: PRODUCT REQUIREMENTS DOCUMENT (PRD) & TECHNICAL SPECIFICATIONS

**Flagship B2B SaaS Enterprise Governance, Risk, and Compliance (GRC) Ecosystem**

---

## 1. EXECUTIVE SUMMARY & MISSION

The Compliance Hub is a unified, hyper-automated, and predictive GRC ecosystem designed for modern enterprises. It eliminates manual spreadsheets, fragmented tracking, and reactive risk management. The Compliance Hub replaces them with an "always audit-ready" posture that acts as a secure, immutable ledger, automates compliance evidence harvesting, and uses artificial intelligence to ingest global regulatory changes, scoring their impact and drafting responsive internal policies.

This document serves as the technical blueprint and compliance master specification.

---

## 2. ROLE-BASED SYSTEM PERMISSIONS (RBAC)

- **Chief Compliance Officer (CCO):** Full administrative controls over frameworks, policies, workflows, incident cases, and audit configurations.
- **Internal/External Auditor:** Read-only access to compiled evidence, immutable audit trails, and policy historical diffs. Temporary Just-In-Time (JIT) access grants temporal, down-to-the-second access.
- **Control/Asset Owner:** Assigned to specific controls and evidence lockers; responsible for uploading evidence and conducting vendor assessments.
- **General Employee:** Access to the training portal, active policy acknowledgments (attestations), whistleblower channel, and mandatory quizzes.

---

## 3. CORE DESIGN PHILOSOPHY & UX SYSTEM

- **Universal Color-Coded Risk Tracking:**
  - **Critical Failure / Non-Compliant:** Crimson Red (`#D32F2F` / `bg-rose-500` / `text-rose-500`)
  - **Warning / Approaching Deadline / Medium Risk:** Amber Orange (`#F57C00` / `bg-amber-500` / `text-amber-500`)
  - **Compliant / Approved / Active:** Emerald Green (`#388E3C` / `bg-emerald-500` / `text-emerald-500`)
  - **Draft / In Review / Informational:** Slate Blue (`#455A64` / `bg-zinc-500` / `text-zinc-500`)
- **Data Density Controls:**
  - _Executive Snapshot:_ High-level animated health score gauges, 5x5 interactive Risk Matrix, and progress charts.
  - _Operational Task View:_ Personalized, checklist-driven tasks grouped by deadlines.
  - _Auditor Ledger:_ Multi-column tabular grid with search, filter, and SHA-256 verification toggles.

---

# MODULE SPECIFICATIONS

## MODULE 1: THE CORE COMPLIANCE ENGINE & CENTRAL POLICY REPOSITORY

### 1.1 User Stories (Atomic Specifications)

- **User Story 1.1 (Collaborative Revision):** _As a Chief Compliance Officer, I want to edit policies inside a native Markdown editor, trace and compare line-by-line Git-style diffs, and write change rationales so that I can maintain absolute historical accuracy of our governance documentation._
- **User Story 1.2 (Targeted Training):** _As a Human Resources Director, I want to distribute policy attestations to specific groups (e.g., Finance department in KSA) with mandatory 2-minute instructional videos and quizzes, requiring an 80% passing score before they can sign off, so that we can legally guarantee training efficacy._
- **User Story 1.3 (AI Regulatory Ingestion):** _As a Regulatory Risk Analyst, I want the system to scrape global updates (e.g., SEC, GDPR, ZATCA), use AI to analyze business impact, and draft proposed side-by-side amendments to our current internal policies, so that our policies stay up-to-date with minimal lag._
- **User Story 1.4 (Lattice Mapping):** _As an External Auditor, I want a single internal control (e.g., MFA Enforcement) mapped to multiple frameworks (SOC 2, ISO 27001, GDPR) so that when evidence is uploaded, it satisfies all corresponding requirements simultaneously under the "Test Once, Comply Many" model._

### 1.2 UI/UX Layout & Navigation Architecture

- **Visual Structure:** Split-pane interface. Left sidebar lists policies, categories, and localization variants. Main canvas houses the active Markdown text area/rich editor, a side panel showing the Git-style line revisions (additions in green, deletions in red), and a list of sequential approvers (Legal -> CCO -> Board) with signature state stamps.
- **Training Experience:** Overlay modal featuring an embedded video element on the left and a multiple-choice quiz panel on the right. Buttons remain disabled until media playback completes and correct answers are submitted.
- **Regulatory Intelligence Feed:** Split-screen side-by-side view showing the newly scraped official regulatory bulletin (e.g., "SDAIA Personal Data Regulations, June 2026") on the left and the suggested policy modification on the right, highlighting insertion zones.

### 1.3 Database Schema (Relational Entities)

```sql
-- Policies table
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_version VARCHAR(20) NOT NULL,
    language_code VARCHAR(10) DEFAULT 'ar',
    parent_policy_id UUID REFERENCES policies(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, in_review, approved, retired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Policy Versions (Git-Style Revisions)
CREATE TABLE policy_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    editor_id UUID NOT NULL,
    content TEXT NOT NULL,
    diff_data JSONB, -- JSON representation of lines added/deleted
    change_rationale TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Policy Approvals (Sequential Workflows)
CREATE TABLE policy_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    approver_role VARCHAR(100) NOT NULL, -- Legal, CCO, CEO
    assigned_user_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    signature_data TEXT, -- Cryptographic hash signature
    signed_at TIMESTAMP WITH TIME ZONE
);

-- Employee Attestations
CREATE TABLE employee_attestations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    version_signed VARCHAR(20) NOT NULL,
    quiz_score INT,
    passed BOOLEAN DEFAULT FALSE,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Control Lattice (Universal Controls)
CREATE TABLE internal_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., CTRL-MFA
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    owner_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'active'
);

-- Many-to-Many Mapping Grid (Framework Requirements to Controls)
CREATE TABLE framework_control_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_name VARCHAR(100) NOT NULL, -- e.g., SOC2, ISO27001, HIPAA
    requirement_code VARCHAR(100) NOT NULL, -- e.g., CC6.1, A.9.4.2
    control_id UUID REFERENCES internal_controls(id) ON DELETE CASCADE,
    mapped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.4 Edge Cases & Error Handling

- **Legal Scraper Offline:** If the external legal updates API goes down, the system transitions to cache mode, alerts the CCO in the feed ("Feed update delayed, last synced 2 hours ago"), and provides a fallback link to manually upload regulatory bulletins as PDF/TXT.
- **Quiz Failures:** If an employee fails the mandatory quiz 3 times, their account flags a "Training Stalled" alert, and the system opens a custom contact button allowing the employee to chat with their compliance tutor.

---

## MODULE 2: AUDIT-READINESS, CONTINUOUS PROOF & INCIDENT MANAGEMENT

### 2.1 User Stories (Atomic Specifications)

- **User Story 2.1 (Cryptographic Ledger):** _As a CCO, I want every security-relevant event or database record modification to generate a cryptographic SHA-256 hash chained to the previous block so that no log can be deleted or altered invisibly._
- **User Story 2.2 (Continuous Evidence Gathering):** _As an Auditor, I want automated background workers to harvest system logs and place them in a write-once-read-many (WORM) locker with 30-day expiration warnings so that we never let compliance proof lapse._
- **User Story 2.3 (Anonymous Whistleblower Intake):** _As a Corporate Whistleblower, I want to submit a sensitive report through an intake channel that strips out all browser headers, metadata, and IP logs, and issues me a secure token so that I can communicate anonymously with investigators._
- **User Story 2.4 (Mock Audit Simulation):** _As a Compliance Officer, I want to execute a synthetic compliance scan of SOC 2 controls to see our readiness score and generate a direct-link gap checklist of deficient areas before the real auditors arrive._

### 2.2 UI/UX Layout & Navigation Architecture

- **Audit Trail Ledger:** Dense data table representing the cryptographic blocks. Clicking on a row expands a code-viewer style drawer showcasing the raw block metadata, matching SHA-256 hash, preceding block hash, actor IP, and an automatic validator button ("Recalculate Chain") that turns green if the chain integrity checks out, or flashes red with flashing warning banners if any previous blocks were tampered with.
- **Evidence Vault Layout:** Grid of document folders (SaaS logs, HR files, Network logs, Pentests) displaying a visual countdown circle for days until expiration. Documents within 30 days of expiry are bordered in Amber Orange, while expired documents are highlighted in Crimson Red with an active "Request Upload" button.
- **Whistleblower Portal Interface:** Minimalist screen with deep gray aesthetic. A clear text box for details, drag-and-drop secure file upload, and a prominent green card displaying a unique 32-character key ("Your Confidential Token"). A secure live chat console allows communication using only the token for authorization.

### 2.3 Database Schema (Relational Entities)

```sql
-- Cryptographic Ledger
CREATE TABLE audit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_number BIGSERIAL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actor_id VARCHAR(100),
    action_type VARCHAR(100) NOT NULL, -- e.g., POLICY_EDIT, USER_DELETION
    actor_ip VARCHAR(45),
    before_image JSONB,
    after_image JSONB,
    current_hash CHAR(64) NOT NULL, -- SHA-256
    previous_hash CHAR(64) NOT NULL
);

-- Evidence Locker
CREATE TABLE evidence_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id UUID REFERENCES internal_controls(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes INT NOT NULL,
    sha256_checksum CHAR(64) NOT NULL,
    uploader_id UUID NOT NULL,
    expiration_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'valid', -- valid, warning, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Whistleblower Incidents
CREATE TABLE whistleblower_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anonymous_token VARCHAR(100) UNIQUE NOT NULL, -- Confidential Token
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    details TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new', -- new, under_investigation, resolved, archived
    legal_hold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Incident Secure Messages (Relayed anonymized logs)
CREATE TABLE whistleblower_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES whistleblower_incidents(id) ON DELETE CASCADE,
    sender_role VARCHAR(50) NOT NULL, -- whistleblower, compliance_officer
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.4 Edge Cases & Error Handling

- **Hash Mismatch detected:** If the recalculate ledger function detects a SHA-256 mismatch (tampered database record), the system triggers an urgent email alert to the CCO and lockouts the specific affected audit tables from further modifications, storing the anomaly block in an isolated security state.
- **Incompatible File Formats:** When a vendor or user attempts to upload a non-approved file extension (e.g., an executable `.exe` or script file) to the evidence locker or whistleblower portal, the client-side validation instantly flags the file with a crimson modal warning, strips the upload stream, and logs a "Suspicious upload blocked" event in the immutable ledger.

---

## MODULE 3: WORKFLOW AUTOMATION, THIRD-PARTY RISK & SECURITY ARCHITECTURE

### 3.1 User Stories (Atomic Specifications)

- **User Story 3.1 (Workflow Builder):** _As a compliance operations manager, I want to use a node-based, drag-and-drop workflow designer to route reviews based on risk level and enforce automated SLAs, so that tasks are automatically escalated or reassigned upon delay._
- **User Story 3.2 (Vendor Risk Onboarding):** _As a Procurement Officer, I want prospective vendors to fill out custom CAIQ/SIG assessments where form sections expand dynamically if they process customer PII, automatically generating a risk tier, so that we prevent third-party security vulnerabilities._
- **User Story 3.3 (JIT Access Escalation):** _As an External SOC 2 Lead Auditor, I want to request Just-In-Time temporal access to sensitive evidence locks that auto-expires down to the exact second, so that we maintain the principle of least privilege._

### 3.2 UI/UX Layout & Navigation Architecture

- **Workflow Logic Canvas:** Interactive whiteboard layout. Features custom flow cards representing nodes (Input Triggers, Logic Gates, SLA Timers, Actions). Connectors display visual arrows indicating the current direction. A sidebar provides draggable widgets (e.g., "Add CISO Review", "Add SLA timer").
- **Dynamic Vendor Assessment Webform:** Simple clean portal for external partners. Questions are grouped by segments (Governance, Cloud, Data Privacy). If the vendor toggles "No PII processed" -> "Yes", a smooth transition opens a sub-card labeled "PII Privacy Constraints" containing additional input requirements.
- **JIT Escalation Control:** Dashboard showing active temporal sessions. Features a prominent stopwatch timer counting down remaining access hours, minutes, and seconds. Once the timer reaches `00:00:00`, the visual row fades to grey, and a toast message notes the access revoke.

### 3.3 Database Schema (Relational Entities)

```sql
-- Workflow Configurations
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    trigger_type VARCHAR(100) NOT NULL, -- e.g., VENDOR_CREATED, INCIDENT_CRITICAL
    nodes_config JSONB NOT NULL, -- Node layout and conditional logic
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Onboarding Risk Profile (TPRM)
CREATE TABLE vendor_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name VARCHAR(150) NOT NULL,
    vendor_email VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'sent', -- sent, progress, submitted, reviewed, approved
    pii_handled BOOLEAN DEFAULT FALSE,
    raw_responses JSONB, -- Answers matching CAIQ/SIG
    risk_score INT, -- Out of 100
    risk_tier VARCHAR(50), -- Low, Medium, High, Critical
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewer_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Just-In-Time Access Controls
CREATE TABLE jit_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_resource VARCHAR(255) NOT NULL, -- e.g., FOLDER_GDPR_EVIDENCE
    reason TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'approved', -- requested, approved, expired, revoked
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3.4 Edge Cases & Error Handling

- **Workflow Execution Loop:** If a user accidentally configures a loop in custom workflows (Node A triggers Node B, which triggers Node A), the engine's built-in compile validator halts saving with an error toast ("Cyclic loop detected at Node B, please close terminal connections").
- **JIT Clock Skew:** System checks local client times against the server clock. If a clock mismatch exceeding 30 seconds is detected, the JIT validator uses the server timestamp as the master timer, preventing auditors from manipulating client-side clocks to bypass timeouts.

---

## MODULE 4: GOVERNANCE DASHBOARDS, AUDIT EXPORTS & TRUST PORTALS

### 4.1 User Stories (Atomic Specifications)

- **User Story 4.1 (Continuous Score Indicator):** _As a Chief Executive Officer, I want an animated high-fidelity health gauge displaying our compliance health percentage in real-time, accompanied by an interactive 5x5 Likelihood vs. Impact Risk Matrix, so that I can report our overall risk posture instantly._
- **User Story 4.2 (Audit Binder Exports):** _As a Compliance Administrator, I want to compile and export our entire evidence lockers into a beautifully structured ZIP binder containing interactive indices, with selective data masking of customer PII and IP addresses, to save hundreds of manual audit preparation hours._
- **User Story 4.3 (White-Labeled Trust Portal):** _As a Chief Information Officer, I want to host a beautiful public/private security trust portal where prospects can view our compliance badges and click-to-sign an NDA to instantly download our SOC 2, so that we can shorten sales cycles._

### 4.2 UI/UX Layout & Navigation Architecture

- **Global Overview Dashboard:** Modern dashboard grid. The main highlight is a circular gauge reflecting overall compliance score with standard color accents. On the right is a 5x5 Risk Heatmap grid (X-axis: Likelihood 1-5, Y-axis: Impact 1-5) populated with small color dots representing specific identified risks. Hovering over a dot shows risk details, while clicking filters the workspace layout. Below is an active task center displaying immediate compliance checklists.
- **Auditor Export Manager:** Side panel showing checkboxes for frameworks (GDPR, SOC2, HIPAA) and options to "Redact Client Emails", "Mask Internal IPs", and "Anonymize Employee Names". A progress bar counts up as files are parsed and compressed.
- **Customer Trust Portal:** Public landing card aesthetic. Features active corporate security badges (ISO 27001, SOC 2 Type II, HIPAA, PDPL) styled with elegant layout cards. Underneath, sensitive folders (such as "Penetration Test 2026") are marked with locked shields. Clicking one prompts a click-to-sign NDA agreement form.

### 4.3 Database Schema (Relational Entities)

```sql
-- Governance Risk Registers
CREATE TABLE risk_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    likelihood INT CHECK (likelihood >= 1 AND likelihood <= 5),
    impact INT CHECK (impact >= 1 AND impact <= 5),
    mitigation_strategy TEXT,
    control_id UUID REFERENCES internal_controls(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trust Portal Document Downloads & NDAs
CREATE TABLE trust_portal_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_email VARCHAR(150) NOT NULL,
    visitor_company VARCHAR(150) NOT NULL,
    signed_nda_text TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    downloaded_document VARCHAR(255) NOT NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4.4 Edge Cases & Error Handling

- **PII Masking Failure:** If the export parser is unable to redact a document because of corrupt format or heavy scanning noise, the document is flagged with a warning and moved to a review stack ("Manual Redaction Required") instead of letting raw PII escape into the ZIP binder.
- **Trust Portal DDoS:** To prevent competitor script scraping of confidential pentests via automated forms on the public trust portal, we implement strict rate limits (maximum 3 downloads per business email per 24 hours), mandatory business email validation filters (blocking `@gmail`, `@yahoo`), and CAPTCHA.

---

# 5. INTEGRATED COMPLIANCE ENTITY RELATIONSHIP DIAGRAM (ERD)

_Legend: `1` = One, `N` = Many_

```
 +------------------+             1 : N             +------------------------+
 |     POLICIES     |------------------------------>|    POLICY_REVISIONS    |
 +------------------+                               +------------------------+
          |
          | 1 : N
          v
 +------------------+             1 : N             +------------------------+
 | POLICY_APPROVALS |<------------------------------|  EMPLOYEE_ATTESTATIONS |
 +------------------+                               +------------------------+
          |
          | N : N (via framework_control_mappings)
          v
 +-------------------+            1 : N             +------------------------+
 | INTERNAL_CONTROLS |------------------------------>|     EVIDENCE_VAULT     |
 +-------------------+                              +------------------------+
          |
          | 1 : 1
          v
 +-------------------+            1 : N             +------------------------+
 |   RISK_REGISTER   |<------------------------------|      AUDIT_LEDGER      |
 +-------------------+                               +------------------------+
```

---

_End of PRD/Technical Specifications Manual. Ready for full-stack system implementation._
