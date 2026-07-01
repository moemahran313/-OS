# Madarij OS — Authentication & Authorization Architecture

## Version 1.0.0 — Production Specification

---

## 1. Executive Summary

This document specifies the **Authentication and Authorization Architecture** for **Madarij OS**, an enterprise cloud ERP designed for SMEs and enterprises.

The architecture is built on the principles of **Zero Trust**, **Least Privilege Access**, and **Multi-Tenant Data Isolation**. It implements secure identity management, stateful session auditing, fine-grained Role-Based Access Control (RBAC), and immutable audit logs.

---

## 2. High-Level Architecture Diagram

```
                       ┌─────────────────────────┐
                       │   Client Web / Mobile   │
                       └────────────┬────────────┘
                                    │ (HTTPS / Secure Cookie)
                                    ▼
                       ┌─────────────────────────┐
                       │       API Gateway       │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │  Authentication Router  │
                       └────────────┬────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Auth Middleware │       │ Session Service  │       │  Tenant Context  │
│  (Token Verifier)│       │ (Device Tracking)│       │  (Org Separation)│
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    ▼
                       ┌─────────────────────────┐
                       │   Firestore Database    │
                       └─────────────────────────┘
```

---

## 3. Core Principles & Security Policies

1. **Zero Trust Integration:** Every request must be authenticated, authorized, and validated. No corporate networks or clients are inherently trusted.
2. **Strict Multi-Tenancy Isolation:** Organizations are logically isolated in the database. Users cannot read, write, or query data outside their assigned `activeOrganizationId`.
3. **Stateless JWT with Stateful Auditing:** Authenticated requests carry standard cryptographically-signed Firebase ID Tokens. However, active devices are statefully tracked in a `user_sessions` collection, allowing immediate global revocation.
4. **Least Privilege Role-Based Access Control (RBAC):** Users are assigned precise roles (`Administrator`, `Manager`, `Employee`) that limit their access to specific modules (Dashboard, CRM, Invoicing, Payroll, Inventory, Accounting, Settings).
5. **Immutable Audit Trails:** Any identity-changing operation (registration, logins, lockouts, password resets, session terminations) is logged to the `audit_logs` and `security_events` collections as permanent, unalterable ledger entries.

---

## 4. Sequence Diagrams

### 4.1 Login Flow

```
User                Client (Vite)          Auth Service (Express)      Firestore DB
 │                       │                         │                        │
 ├─► Enters Creds ──────►│                         │                        │
 │                       ├─► Validate input        │                        │
 │                       │   (Length/Strength)     │                        │
 │                       │                         │                        │
 │                       ├─► Firebase Auth Login ──────────────────────────►│
 │                       │   (Client SDK)          │                        │
 │                       ◄─ Accept/Token ◄──────────────────────────────────┤
 │                       │                         │                        │
 │                       ├─► Set Cookie (mudarij_token)                     │
 │                       │                         │                        │
 │                       ├─► Create Session Record ────────────────────────►│
 │                       │   (Agent/Device/IP)     │                        │
 │                       │                         │                        │
 │                       ├─► POST /api/auth/me ───►│                        │
 │                       │                         ├─► Verify JWT           │
 │                       │                         ├─► Load Context         │
 │                       │                         ◄─ Return Profile ───────┤
 │                       ◄─ Go to App ◄────────────┤                        │
```

### 4.2 API Authorization Policy Check

```
Client (Vite)           Auth Middleware           Tenant Guard         Business Controller
 │                            │                        │                       │
 ├─► GET /api/payroll ───────►│                        │                       │
 │   (With Cookie/JWT)        ├─► Verify Token         │                       │
 │                            ├─► extract UID, roles   │                       │
 │                            │                        │                       │
 │                            ├─► Check Tenant ───────►│                       │
 │                            │   Context              ├─► Confirm user belongs│
 │                            │                        │   to Organization     │
 │                            │                        │                       │
 │                            │                        ├─► Check Permissions   │
 │                            │                        │   (User role has      │
 │                            │                        │    access to Payroll) │
 │                            │                        │                       │
 │                            ◄─ DENY (403) ◄──────────┼─ Unauthorized         │
 │                            │                        │                       │
 │                            │                        └─► Allow (Next) ──────►│
 │                            │                                                ├─► Perform Operation
 ◄─ Return Data (200) ◄───────┴────────────────────────────────────────────────┴─┘
```

---

## 5. Database Schema (Entities)

### 5.1 Users Collection (`/users/{userId}`)

Primary metadata mapping user profile credentials and tenant state.

```json
{
  "id": "UUID",
  "name": "String (Full Name)",
  "email": "String",
  "role": "Administrator | Manager | Employee",
  "avatar": "String (URL/Base64)",
  "organizations": ["String (Org ID)"],
  "activeOrganizationId": "String",
  "activeCompanyId": "String",
  "activeBranchId": "String",
  "status": "PendingVerification | Active | Suspended | Disabled | Deleted",
  "preferredLanguage": "ar | en",
  "timezone": "Asia/Riyadh",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### 5.2 Organizations Collection (`/organizations/{orgId}`)

ERP container separating independent clients.

```json
{
  "id": "UUID",
  "name": "String",
  "legalName": "String",
  "slug": "String",
  "country": "String (SA, UAE, etc.)",
  "baseCurrency": "String (SAR, AED)",
  "timezone": "String",
  "members": ["String (User UID)"],
  "subscriptionPlan": "Free | Starter | Growth | Professional | Enterprise",
  "billingStatus": "Active | Suspended | Delinquent",
  "status": "Active | Inactive",
  "createdAt": "Timestamp"
}
```

### 5.3 Sessions Collection (`/user_sessions/{sessionId}`)

Stateful active device ledger with security revocation options.

```json
{
  "id": "UUID",
  "userId": "String",
  "deviceName": "String (e.g. MacBook Pro)",
  "browser": "String (e.g. Chrome)",
  "os": "String (e.g. macOS)",
  "ipAddress": "String",
  "loginTime": "Timestamp",
  "lastActivity": "Timestamp",
  "status": "Active | Revoked",
  "trusted": "Boolean"
}
```

### 5.4 Security Events (Audit Log) (`/audit_logs/{eventId}`)

Immutable ledger tracking administrative and authentication anomalies.

```json
{
  "id": "UUID",
  "userId": "String",
  "module": "AUTHENTICATION | SECURITY | RBAC",
  "action": "UserRegistered | UserLoggedIn | UserLoggedOut | SessionRevoked",
  "payload": "Map/String (Anonymized metadata)",
  "result": "Success | Failed",
  "ipAddress": "String",
  "userAgent": "String",
  "timestamp": "Timestamp"
}
```

---

## 6. API Specifications (Versioned REST API)

### Authentication Endpoint Base: `/api/auth`

| Method     | Route              | Description                                 | Payload Schema  | Response Schema (200)                              |
| :--------- | :----------------- | :------------------------------------------ | :-------------- | :------------------------------------------------- |
| **GET**    | `/me`              | Returns active user and tenant profile      | None            | `{ id, email, role, activeOrganizationId, ... }`   |
| **POST**   | `/logout`          | Clears local cookies and cookie sessions    | None            | `{ success: true }`                                |
| **GET**    | `/sessions`        | Fetches user's active login sessions        | None            | `[{ id, deviceName, browser, loginTime, status }]` |
| **DELETE** | `/sessions/:id`    | Terminate and revoke a target login session | None            | `{ success: true, message: "Session revoked" }`    |
| **POST**   | `/logout-all`      | Revoke all active sessions except current   | None            | `{ success: true, revokedCount: Int }`             |
| **POST**   | `/security-events` | Logs security alert / suspicious attempt    | `{ type, msg }` | `{ logged: true }`                                 |

---

## 7. Middleware Architecture & Access Policies

All API controllers under `/api/*` (except public endpoints) must load:

1. **`authenticate` middleware:** Verifies the cryptographic correctness and expiration of the JWT ID token.
2. **Multi-tenant check:** Verifies the user profile belongs to the organization they are querying or updating.
3. **RBAC policy checker:** Verifies the user's role can access the specific controller module.

### RBAC Permission Grid

| Module         | Administrator | Manager | Employee |
| :------------- | :-----------: | :-----: | :------: |
| **Dashboard**  |    ✅ Yes     | ✅ Yes  |  ✅ Yes  |
| **CRM**        |    ✅ Yes     | ✅ Yes  |  ✅ Yes  |
| **Inventory**  |    ✅ Yes     | ✅ Yes  |  ✅ Yes  |
| **Invoices**   |    ✅ Yes     | ✅ Yes  |  ❌ No   |
| **Payroll**    |    ✅ Yes     | ✅ Yes  |  ❌ No   |
| **Accounting** |    ✅ Yes     |  ❌ No  |  ❌ No   |
| **Settings**   |    ✅ Yes     |  ❌ No  |  ❌ No   |

---

## 8. Development & Implementation Roadmap

The system is implemented as a modular monolith running Express + React 18 + Vite.

- **Frontend Auth Engine:** Powered by Firebase client SDK with reactive listeners in `UserContext`.
- **Stateful Session Tracker:** Writes active metadata on sign-in, monitors session status reactively, and enforces global logout if revoked.
- **Onboarding Wizard:** Automates the complete provisioning of tenant Organizations, Companies, and Branches upon new registration.
- **Security Audit logs:** Direct Firestore audit-trail writing ensuring full compliance.
