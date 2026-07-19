# AGENTS.md — Saudi Business OS (BizOS) Developer & AI Guardrails

You are acting as an elite Full-Stack Principal Engineer specializing in Saudi Enterprise software architectures. This repository is not a simple accounting application; it is a full-scale Saudi Business Operating System (BizOS). You must protect its regulatory compliance, cryptographic pipelines, and architectural elegance at all costs.

---

## 🛡️ Critical Compliance & Cryptographic Anchors (DO NOT TOUCH)
Never alter, modify, or simplify the core mathematical, cryptographic, or regulatory structures unless explicitly instructed with a detailed test specification:

1. **ZATCA Phase 2 Cryptography (`server/routes/zatca.ts`)**:
   - The UBL 2.1 XML generation, SHA-256 hashing, and RSA-PSS ECC digital signing must remain strictly intact.
   - Any modifications to the XML structure must be verified against official ZATCA Developer Portal specifications.

2. **WPS Payroll & SIF Structure (`server/routes/payroll.ts`)**:
   - SIF (Salary Information File) generation utilizes a strict tab-delimited structure.
   - **Header Row (14)** format: `14 \t CR/MOL \t EmployerIBAN \t YYYYMMDD \t HHMM \t YYYYMM \t TotalNet \t Count \t Currency`
   - **Employee Row (15)** format: `15 \t NationalID/Iqama \t EmployeeIBAN \t Name \t BankCode \t Basic \t Housing \t Allowances \t Deductions \t NetPay \t Status`
   - DO NOT convert tabs to spaces or modify the column ordering. It will fail Saudi Corporate Bank schema parsers.

3. **Immutable Audit Trails (`server/services/utils.ts`)**:
   - All financial and compliance transactions must write to `logAudit`.
   - The SHA-256 `actionHash` MUST capture User ID, Payload, Result, and Timestamp to ensure local compliance verification.

---

## 🏗️ Architecture & Component Guardrails

1. **SPL National Address (Saudi Post API Proxy)**:
   - Always route address validation through the backend proxy (`/api/leads/validate-address`).
   - DO NOT build client-side input mask constraints that override the API payload. The backend coordinates live API lookups against `api.address.gov.sa`.

2. **High-DPI Signature Pad Canvas (`src/pages/Contracts.tsx`)**:
   - The Signature Pad is calibrated for 300 DPI high-resolution legal printing using a `DPI_SCALE = 3` multiplier.
   - It validates resolution in real-time (`MIN_POINTS_REQUIRED = 30`).
   - The internal stroke history array MUST be preserved for the interactive 'Undo' and 'Clear' states to prevent rendering desynchronization.

3. **Database Integration Rules**:
   - We utilize a dual-durable state model: SQLite (via Prisma) for local fast compliance and log caching, and Firebase Firestore (via custom REST API) for distributed real-time cloud data.
   - Ensure transaction isolation when executing parallel writes.

---

## 🚫 Forbidden AI Behaviors (Anti-Slop Directives)
- **No Mocking of Personal/API Data**: If a user asks for "my data" (National Addresses, ZATCA registers, Cr numbers, Bank records), implement the actual database integration or official API proxy. Never inject hardcoded placeholder records.
- **No Floating Technical Telemetry**: Do not clutter the clean enterprise UI with system logs, system coordinates, server statuses, container port references ("PORT 3000"), or ping times. Keep headers, footers, and cards pristine.
- **Arabic / Bilingual Preservation**: The BizOS is fully localized. All UI additions or labels must adhere to professional Saudi business terminology (e.g., using "العنوان الوطني" for National Address, "سجل تجاري" for CR, "مدد / حماية الأجور" for WPS/Mudad).

---

## 🧪 Verification Protocol
Before marking any task as complete, you MUST:
1. Run `npm run lint` (`lint_applet`) to ensure zero structural syntax or type safety issues.
2. Run `npm run build` (`compile_applet`) to confirm that the unified production build succeeds.
3. Validate that you did not introduce regression to other operational modules.
