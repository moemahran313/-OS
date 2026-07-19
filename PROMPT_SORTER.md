# Mudarij OS: Feature Sorting Prompt & Operational Blueprint

This document contains (1) the **Strategic Analysis** of Mudarij OS as a comprehensive business operating system (BizOS), (2) the **Structured Categorization Matrix** dividing Core vs. Value-Added components, and (3) a highly calibrated **System-Level Prompt** designed to guide future modifications safely without causing architectural or state regressions.

---

## 1. The Mudarij OS Philosophy
Mudarij OS is not a generic ledger or a basic accounting SaaS. It is a **Business Operating System (BizOS)** designed for Saudi enterprises. In Saudi Arabia, business survival and operations rely on meeting strict, multi-agency regulatory guidelines. Therefore, "Core Infrastructure" encompasses not only standard accounting, but everything necessary to maintain a legal, operational presence and execute formal corporate actions.

---

## 2. Structured Categorization Matrix

| Module | Classification | Rationale | Saudi Regulatory/Business Context |
| :--- | :--- | :--- | :--- |
| **Financial Ledger & Invoicing** | **Core Infrastructure** | Invoicing must be integrated directly with ZATCA Phase 2 compliance. Hashing (SHA-256) and ECC digital signatures are legal requirements. | ZATCA Phase 2 integration |
| **Workforce & Payroll** | **Core Infrastructure** | SIF (Salary Information File) generation is mandated by the Saudi Ministry of HR & Social Development via WPS (Wage Protection System). | WPS Ministry Compliance |
| **CRM & Address Verification** | **Core Infrastructure** | Official Saudi addresses require valid Saudi Post (SPL) formats. CRM operations must enforce real-time SPL lookups for tax compliance. | SPL National Address Matching |
| **Contracts & E-Signatures** | **Core Infrastructure** | High-DPI contract verification and digital signing surfaces are required for legally binding commercial agreements. | Saudi Electronic Transactions Law |
| **B2B Lead Generation** | **Value-Added Services** | High-level marketing and sales pipeline growth. Important for business expansion but not a regulatory operational gatekeeper. | Secondary Growth Tool |
| **Smart Negotiations** | **Value-Added Services** | AI-assisted contract refinement and margin simulation. Exceptional productivity boost, but sits downstream from core contract signing. | Downstream Optimization |
| **Marketing Campaigns** | **Value-Added Services** | Automated email and SMS campaigns. Sits fully within growth and brand-awareness rather than day-to-day regulatory operations. | Downstream Optimization |

---

## 3. High-Calibrating Prompt for Future Agents
*Copy, paste, or reference the following prompt in future workspace tasks to safely sort and maintain features without causing code breakages.*

```markdown
# SYSTEM DIRECTIVE: MUDARIJ BIZ-OS ARCHITECTURE & VALUE-ADDED ISOLATION

You are tasked with maintaining, modifying, or extending features within Mudarij OS (a Saudi-focused Business Operating System). This application is a comprehensive business hub, not just accounting software.

You must strictly adhere to the following taxonomy and structural rules to avoid over-engineering or breaking the app:

## 1. Feature Sorting Taxonomy
Maintain a strict visual and logical distinction between these two layers:

### A. Core Business Infrastructure (Top-Level & Mandatory)
These modules are critical for enterprise compliance, payroll, CRM, and legal agreements. They must remain pinned in top-level navigation and be fully configured during the mandatory Onboarding Wizard:
1. **Financial Ledger & Invoices** (ZATCA Phase 2 compliance, cryptographic SHA-256 hashing, UBL 2.1 compliance).
2. **Workforce & Payroll** (Wage Protection System compliance, Ministry-standard SIF file generation).
3. **CRM & National Address Verification** (Real-time SPL lookup API verification; blocks onboarding if invalid).
4. **Contracts & Signatures** (High-DPI resolution rendering, 44px touch targets, local canvas undo states).

### B. Value-Added Services (Auxiliary & Productivity Drawer)
These are high-utility productivity or growth tools. They must reside in the secondary expandable/collapsible 'Tools & Settings' drawer to minimize cognitive clutter:
1. **Marketing Campaigns** (Automated outreach, SMS integrations).
2. **Smart Negotiations** (AI-assisted margin simulation, contract analysis).
3. **B2B Lead Gen** (Company directories, growth funnels).

---

## 2. Architectural Preservation Rules (How to avoid breaking the App)

### RULE 1: Protect RBAC Authority
- The central authority for roles is `src/contexts/UserContext.tsx` using `hasPermission`.
- Do not bypass this check. When loading a module on the Dashboard or Sidebar, query `hasPermission(module)` to render components conditionally.
- High-frequency roles include:
  - `CFO` (Access: Invoices, Payroll, ZatcaAi)
  - `Sales Lead` (Access: CRM, Contracts, LeadGen)
  - `HR Manager` (Access: Payroll, Compliance)
  - `Super Admin` (Access: All modules)

### RULE 2: Keep the Compact Sidebar Clean
- Top-level sidebar navigation items must be compact (icon + text, responsive).
- The "Tools & Settings" drawer must toggle a secondary panel without changing the core layout structure or unmounting active states.

### RULE 3: Strict Onboarding Verification
- Onboarding Step 2 must validate Company Details (CR Number, City) and SPL National Address fields using the backend lookup proxy (`/api/leads/validate-address`).
- Users must successfully click "Verify via SPL" and obtain verification before the onboarding step can advance.

### RULE 4: No Dynamic Import Breakages
- When introducing or refactoring page directories (e.g., `src/pages`), do not introduce unreferenced relative paths.
- Ensure all route components in `src/App.tsx` or `src/pages/Dashboard.tsx` are correctly imported using absolute workspace relative imports or stable named imports. Never allow broken dynamic file loading.

### RULE 5: Preserve Regulatory Cryptography & Calculations
- Do not alter ECC digital signing algorithms or SHA-256 invoice hashing modules in `server/routes/zatca.ts`.
- Do not modify tab-delimited SIF file structure generators in `server/routes/payroll.ts`.
- Do not change High-DPI scale mapping parameters on signature canvas surfaces.
```

---

## 4. Summary of Architecture Checkpoints
- **State Integrity**: All user state configurations (onboarding complete, active modules, company profile) are persisted in the Firestore database.
- **Route Integrity**: Checked and compiling cleanly under production-grade standards.
- **Access Control**: Active role permissions successfully filter dashboard widgets and navigation panels.
