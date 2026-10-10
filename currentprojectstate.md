# EcoTrace ESG Portal

> Automated Statutory ESG Reporting, Evidence Assurance & SEBI BRSR Annexure-I Platform

For the complete, in-depth architectural and operational manual, see:
📖 **[SYSTEM_DESIGN_AND_PROCESS.md](file:///home/gyaneswar/Desktop/CodeFiles/Projects/ESG%20report%20auto/SYSTEM_DESIGN_AND_PROCESS.md)**

---

## Quick Overview

EcoTrace is an enterprise sustainability telemetry platform built for multi-tier industrial and infrastructure conglomerates (such as MEIL Corporate Group). It automates the collection, validation, normalization, and statutory reporting of ESG (Environmental, Social, Governance) data across hundreds of operational sites.

### Key Capabilities
- **Hierarchical Scoping**: 3-level tree structure (`Group → Subsidiary → Site`). Field telemetry is captured exclusively at leaf sites.
- **Role Governance**: 4 distinct roles (**CSO / Super Admin**, **Subsidiary Head**, **Site Engineer**, and **Independent Auditor**) with multi-tier access approval gates.
- **Math Normalization Engine**: Automatically converts raw site units (e.g. diesel liters into $\text{MT CO}_2\text{e}$, MWh into kWh, water liters into kL) using statutory emission factors.
- **IIM-A Guardrail System**: Validates logical boundaries (e.g., recycled waste $\le$ total waste; lost-time injuries require non-zero working hours).
- **Cryptographic Evidence Vault**: Every data entry requires PDF/image evidence, verified using SHA-256 digests and dual-stored (Cloudinary + local immutable mirror).
- **Statutory SEBI BRSR Annexure-I Engine**: Automatically compiles live approved records into a full statutory SEBI disclosure dossier with one-click multi-page PDF and JSON taxonomy export.

---

## Repository Structure

```
├── SYSTEM_DESIGN_AND_PROCESS.md   # Master Architectural & Operational Guide
├── common/                        # Shared TypeScript schemas, dynamic Zod validators, and types
├── server/                        # Express.js REST API with Prisma ORM v8
├── client/                        # React 18 SPA + Vite + Material-UI + Redux Toolkit
└── api/                           # OpenCollection / HTTP API collection
```

---

## Quickstart

```bash
# 1. Install dependencies across workspaces
npm install

# 2. Build common types and schemas
npm run build --workspace=@my-app/common

# 3. Initialize Prisma ORM database contracts
cd server
npm run db:init
npm run contract:emit

# 4. Start the server (Express API on port 5000)
npm run dev

# 5. In a separate terminal, start the frontend (Vite on port 5173)
cd ../client
npm run dev
```

For full system diagrams, data contracts, and role workflows, refer to [SYSTEM_DESIGN_AND_PROCESS.md](file:///home/gyaneswar/Desktop/CodeFiles/Projects/ESG%20report%20auto/SYSTEM_DESIGN_AND_PROCESS.md).