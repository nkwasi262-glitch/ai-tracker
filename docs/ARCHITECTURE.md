# National AI Project Tracking and Clearance System (NAPTCS)
# Comprehensive System Architecture Specification

> **Document Version**: 2.5.0  
> **Status**: Verified against Codebase Commit `8e31aca`  
> **Classification**: Statutory Sovereign Technical Documentation  
> **Repository Root**: `c:\Users\N1TA\Ghana-AI-Project-Tracker-1`  
> **Governing Standards**: OGC RFC 7946 (GeoJSON), Ghana Data Protection Act 2012 (Act 843), Cybersecurity Act 2020 (Act 1038)

---

## 1. Architectural Overview & Executive Reality

The **National AI Project Tracking and Clearance System (NAPTCS / GNAPRMS)** is Ghana's statutory sovereign tracking, clearance, and spatial telemetry platform for Artificial Intelligence deployments across both public (MDAs/MMDAs/SOEs) and private sectors.

### Current Implementation Reality vs. Planned Architecture

A critical architectural distinction must be understood by any incoming engineer:

* **Currently Implemented Reality**: A high-performance, responsive **Single-Page Application (SPA)** written in **TypeScript 5.2.2** and **React 18.2.0**, bundled with **Vite 5.1.4**. Business logic, statutory organization clearance rules, spatial radius calculations (Haversine formula), and GeoJSON FeatureCollection generations are executed **client-side in memory** via typed reactive state and an asynchronous simulated API layer (`src/api/gisSpatialApi.ts`).
* **Target / Planned Architecture**: Documented in the `/architecture` directory, the target production state is a distributed polyglot microservices ecosystem with a NestJS / ASP.NET Core API Gateway, PostgreSQL + PostGIS spatial database, MongoDB unstructured document store, RabbitMQ event bus, and MinIO S3-compatible document storage.

```
+-----------------------------------------------------------------------------------+
|                           CURRENT PRODUCTION RUNTIME REALITY                      |
|                                                                                   |
|    Browser Client (React 18.2.0 + TypeScript 5.2.2 SPA)                           |
|    +-------------------------------------------------------------------------+    |
|    | App.tsx (Root State: viewMode, userRole, projects[], organizations[])   |    |
|    +-------------------------------------------------------------------------+    |
|         |                     |                          |                        |
|         v                     v                          v                        |
|    +-------------+   +-------------------+   +-------------------------+          |
|    | Portal View |   | Clearance Engine  |   | Spatial GIS Engine      |          |
|    | (Public UI) |   | (Reg & Audit UI)  |   | (Leaflet 1.9.4 CDN)     |          |
|    +-------------+   +-------------------+   +-------------------------+          |
|                               |                          |                        |
|                               +------------+-------------+                        |
|                                            |                                      |
|                                            v                                      |
|                     +----------------------------------------------+              |
|                     | Simulated Spatial API & Telemetry Engine     |              |
|                     | (src/api/gisSpatialApi.ts - Async Sim)       |              |
|                     +----------------------------------------------+              |
|                                            |                                      |
|                                            v                                      |
|                     +----------------------------------------------+              |
|                     | In-Memory Data Store & Seed State            |              |
|                     | (src/data/sampleProjects.ts)                 |              |
|                     | 18 Orgs • 18 Projects • 16 Regional Nodes    |              |
|                     +----------------------------------------------+              |
|                                                                                   |
|    Containerized Deployment: Dockerfile (Node 20 Alpine Build -> Nginx 1.25 Serve)|
+-----------------------------------------------------------------------------------+
```

---

## 2. High-Level System Architecture Diagram

```
                                  +------------------------------------+
                                  |            ACTORS / USERS          |
                                  | Public, MDAs, Private Firms, Admins|
                                  +-----------------+------------------+
                                                    |
                                                    | HTTPS (Port 443 / 80)
                                                    v
                                  +------------------------------------+
                                  |     NGINX 1.25 REVERSE PROXY       |
                                  |    SPA Fallback: try_files $uri    |
                                  +-----------------+------------------+
                                                    |
                                                    v
+-----------------------------------------------------------------------------------------------------+
|                                 REACT 18 SINGLE PAGE APPLICATION (VITE)                             |
|                                                                                                     |
|  +-----------------------------------------------------------------------------------------------+  |
|  | Navigation Bar & Sovereign Header (User Role Switcher, View Switcher, Breadcrumbs)             |  |
|  +-----------------------------------------------------------------------------------------------+  |
|                                                   |                                                 |
|          +----------------------------------------+------------------------------------+            |
|          |                                        |                                    |            |
|          v                                        v                                    v            |
|  +--------------------+               +-----------------------+            +---------------------+  |
|  |  Interactive Portal|               | Dual-Sector Clearance |            |  Spatial GIS Map    |  |
|  |  - Public Search   |               | - Org Registration    |            |  - Leaflet Map CDN  |  |
|  |  - Verified Filter |               | - Statutory Vetting   |            |  - Heatmap Clusters |  |
|  |  - Sovereign Badge |               | - Certificate Issuer  |            |  - Radius Queries   |  |
|  |  - Risk Profiling  |               | - Gatekeeper Enforcer |            |  - Telemetry Ping   |  |
|  +--------------------+               +-----------------------+            +---------------------+  |
|          |                                        |                                    |            |
|          | Filtered by Publication                | State Mutations (Add Org/Proj)     | API Calls  |
|          +----------------------------------------+------------------------------------+            |
|                                                   |                                                 |
|                                                   v                                                 |
|  +-----------------------------------------------------------------------------------------------+  |
|  |                           App.tsx Root State & Gating Invariant Engine                        |  |
|  |                                                                                               |  |
|  |   CRITICAL STATUTORY INVARIANT:                                                               |  |
|  |   isPublished = isOrganizationCleared && (clearanceStatus === 'Cleared' || 'Conditional')     |  |
|  +-----------------------------------------------------------------------------------------------+  |
|                                                   |                                                 |
|                                                   v                                                 |
|  +-----------------------------------------------------------------------------------------------+  |
|  |                       gisSpatialApi.ts (Client PostGIS Emulation Engine)                      |  |
|  |   - getProjectsGeoJSON() [RFC 7946 FeatureCollection]                                         |  |
|  |   - querySpatialRadius(lat, lng, radiusKm) [Haversine Formulation]                            |  |
|  |   - getRegionalDensityAnalytics() [16 Administrative Regions Aggregation]                     |  |
|  |   - auditSovereignBorderCompliance() [Act 843 Statutory Geo-Fence Check]                      |  |
|  |   - getLiveTelemetryFeed() [Simulated Edge IoT Health & Latency]                              |  |
|  +-----------------------------------------------------------------------------------------------+  |
|                                                   |                                                 |
|                                                   v                                                 |
|  +-----------------------------------------------------------------------------------------------+  |
|  |                        In-Memory Data Layer (src/data/sampleProjects.ts)                       |  |
|  |   - organizations: Organization[] (18 entities across Public, Private, Academic sectors)      |  |
|  |   - projects: AIProject[] (18 sovereign AI initiatives across Health, Agritech, FinTech)     |  |
|  |   - edgeTelemetryNodes: EdgeTelemetryNode[] (Live IoT tracking nodes across Ghana)            |  |
|  +-----------------------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------------------+
```

---

## 3. Component Architecture & State Orchestration

The application utilizes an **unidirectional data flow** with central state coordination inside `src/App.tsx`.

### Component Tree & Layout

```
src/main.tsx
  └── src/App.tsx (Root Controller)
        ├── Navigation & Top Bar (Role Selector: Public, Officer, MDA, Admin)
        ├── System Alerts & Statistics Ribbon
        │
        ├── VIEW 1: [Interactive Portal] (viewMode === 'projects')
        │     ├── Search & Sector Filter Bar
        │     ├── Gating Enforcement Banner (Quarantined Notice)
        │     ├── Project Card Grid (Rendered only if isPublished === true)
        │     │     ├── Project Title, Sector, Risk Badge
        │     │     ├── Clearance Status & Certificate Link
        │     │     └── Budget Utilization Progress Bar
        │     └── Project Detail Modal (Full DPIA, Milestones, Ethics Scores)
        │
        ├── VIEW 2: [Clearance & Accreditation Engine] (viewMode === 'clearance')
        │     ├── Statutory Verification KPI Ribbon (Cleared, Conditional, Quarantined)
        │     ├── Sector Breakdown (MDA/MMDA vs Private Enterprise)
        │     ├── Organization Directory Table
        │     │     ├── Status Pill (Cleared, Pending Review, Conditional, Suspended)
        │     │     ├── TIN / GRA Verification Indicator
        │     │     ├── DPC Registration Status (Act 843)
        │     │     └── Administrative Action Triggers (Approve, Condition, Suspend)
        │     ├── Organization Registration Form Modal
        │     └── Project Submission & DPIA Clearance Form Modal
        │
        ├── VIEW 3: [Spatial GIS & Telemetry Map] (viewMode === 'map')
        │     ├── Leaflet Map Container (`<div id="gis-spatial-map" />`)
        │     │     ├── TileLayer (OpenStreetMap CartoDB Positron / Standard)
        │     │     ├── Project Marker Layer (Custom SVG / DivIcons colored by Sector)
        │     │     ├── Sovereign Border Polygon Overlay (Ghana Boundary EPSG:4326)
        │     │     ├── Regional Density Clustered Circles
        │     │     └── Edge IoT Telemetry Node Markers
        │     ├── Spatial Query Sidebar
        │     │     ├── Radius Distance Filter (10km - 200km)
        │     │     ├── Sector Multi-select
        │     │     ├── Clearance Status Filter
        │     │     └── Sovereign Geo-Fence Compliance Auditor Trigger
        │     └── Telemetry & Telemetry Feed Drawer (Live Node Ping, Latency, Protocol)
        │
        └── Global Modals
              ├── Project Detail Modal (`selectedProject`)
              ├── Organization Registration Modal (`isRegisterOrgOpen`)
              ├── Project Submission Modal (`isSubmitProjectOpen`)
              └── Export GeoJSON / CSV Modal (`exportSpatialData`)
```

### State Management Matrix in `src/App.tsx`

| State Variable | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `projects` | `AIProject[]` | Initial 18 sample projects | Primary project state; supports in-memory additions. |
| `organizations` | `Organization[]` | Initial 18 sample orgs | Master organization registry. Determines publication gating. |
| `viewMode` | `'projects' \| 'map' \| 'clearance'` | `'projects'` | Controls which primary viewport is active. |
| `userRole` | `'public' \| 'officer' \| 'mda' \| 'admin'` | `'officer'` | Simulates RBAC authorization context for UI controls. |
| `selectedProject` | `AIProject \| null` | `null` | Controls the Project Detail drill-down modal. |
| `searchQuery` | `string` | `''` | Filters projects by title, code, description, and MDA. |
| `selectedSector` | `string` | `'All'` | Sector filter (Health, Agriculture, Finance, Security, etc.). |
| `selectedStatus` | `string` | `'All'` | Lifecycle stage filter (Production, Pilot, In Development). |
| `selectedClearance` | `string` | `'All'` | Clearance status filter (Cleared, Conditional, Not Cleared). |
| `selectedRiskTier` | `string` | `'All'` | Risk tier filter (Minimal, Limited, High Risk, Prohibited). |

---

## 4. Sovereign Clearance Gating Engine

A foundational architectural requirement implemented in this codebase is the **Dual-Sector Gatekeeper Invariant**. Under Ghanaian law, an AI deployment cannot be visible to the public or operational without explicit institutional clearance.

### Gating Invariant Formula

$$\text{isPublished} = \text{isOrganizationCleared} \land (\text{projectClearanceStatus} \in \{\text{'Cleared'}, \text{'Conditional'}\})$$

Where:
* $\text{isOrganizationCleared} = (\text{organization.clearanceStatus} \in \{\text{'Cleared'}, \text{'Conditional'}\})$
* If an organization is marked `Not Cleared`, `Pending Review`, or `Suspended`, all projects owned by that entity have their publication revoked immediately:

```typescript
// Architectural Rule enforced in src/App.tsx
const effectiveIsPublished = Boolean(
  parentOrg && 
  (parentOrg.clearanceStatus === 'Cleared' || parentOrg.clearanceStatus === 'Conditional') &&
  (proj.clearanceStatus === 'Cleared' || proj.clearanceStatus === 'Conditional')
);
```

### Clearance State Machine

```
              +------------------------------------------+
              | Organization / Project Registration Form |
              +--------------------+---------------------+
                                   |
                                   v
                      +--------------------------+
                      |      Pending Review      |
                      |  (Quarantined from Map   |
                      |   and Public Portal)     |
                      +------------+-------------+
                                   |
        +--------------------------+--------------------------+
        | Audit Passes             | Minor Deficiencies       | Severe Non-Compliance /
        | Complete DPIA            | SLA / Bias Conditions    | Data Sovereignty Breach
        v                          v                          v
+---------------+          +---------------+          +---------------+
|    Cleared    |          |  Conditional  |          |  Not Cleared  |
|  Cert Issued  |          | 60-Day Remedy |          |  (Forbidden)  |
+-------+-------+          +-------+-------+          +-------+-------+
        |                          |                          |
        +--------------------------+                          |
                    |                                         |
                    v                                         v
       +-------------------------+               +-------------------------+
       |   Published & Visible   |               |       Quarantined       |
       |  (Public GIS & Portal)  |               |  (Auditor Eyes Only)    |
       +-------------------------+               +-------------------------+
```

---

## 5. Spatial GIS & Telemetry Architecture

The spatial mapping engine operates via Leaflet 1.9.4 loaded asynchronously from CDN, integrated with a TypeScript simulation engine (`src/api/gisSpatialApi.ts`).

### Mathematical GIS Calculations

1. **Haversine Distance Formulation**:
   Determines spherical distance between any coordinates without requiring external PostGIS server round-trips:

$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

Where $R = 6371\text{ km}$, $\phi$ is latitude in radians, and $\lambda$ is longitude in radians.

2. **Statutory Geo-Fence Verification**:
   Validates compliance with sovereign borders:
   - Latitude: $[4.70^\circ \text{ N}, 11.20^\circ \text{ N}]$
   - Longitude: $[-3.30^\circ \text{ W}, 1.30^\circ \text{ E}]$

```typescript
export function isCoordinateWithinGhana(lat: number, lng: number): boolean {
  return (
    lat >= GHANA_SOVEREIGN_BOUNDS.minLat &&
    lat <= GHANA_SOVEREIGN_BOUNDS.maxLat &&
    lng >= GHANA_SOVEREIGN_BOUNDS.minLng &&
    lng <= GHANA_SOVEREIGN_BOUNDS.maxLng
  );
}
```

3. **GeoJSON Feature Collection Serialization**:
   All entities are dynamically compiled into RFC 7946-compliant GeoJSON:
   - CRS: `urn:ogc:def:crs:OGC:1.3:CRS84` (WGS 84 / EPSG:4326)
   - Coordinates: `[longitude, latitude]` format (strict GeoJSON RFC 7946 ordering).

---

## 6. Target Microservices Production Architecture

When deploying to a dedicated sovereign data center (e.g., National Data Centre in Accra), the system is designed to transition into the following decoupled microservices architecture:

```
                                  +------------------------------------+
                                  |    KONG / NGINX API GATEWAY        |
                                  |   SSL Termination, Rate Limiting   |
                                  +-----------------+------------------+
                                                    |
             +--------------------+-----------------+--------------------+
             |                    |                 |                    |
             v                    v                 v                    v
+-----------------------+ +----------------+ +----------------+ +----------------+
|  Identity & RBAC      | | AI Registry    | | Clearance &    | | Spatial GIS &  |
|  Service (NestJS)     | | Service (Go)   | | Audit (ASP.NET)| | Telemetry (Py) |
+-----------+-----------+ +-------+--------+ +-------+--------+ +-------+--------+
            |                     |                  |                  |
            +---------------------+---------+--------+------------------+
                                            |
                                            v
                                  +--------------------+
                                  | RABBITMQ EVENT BUS |
                                  | Async Telemetry    |
                                  +---------+----------+
                                            |
                 +--------------------------+--------------------------+
                 |                                                     |
                 v                                                     v
+----------------------------------+                 +----------------------------------+
|      POSTGRESQL 16 + POSTGIS     |                 |      MONGODB DOCUMENT STORE      |
|  - organizations, projects       |                 |  - DPIA Assessments, Raw Logs    |
|  - spatial_ref_sys, geography    |                 |  - Telemetry Time-Series Buffers |
+----------------------------------+                 +----------------------------------+
```

---

## 7. Containerization & Production Deployment

### Docker Multi-Stage Build

The system includes a verified, lightweight multi-stage Docker build:

1. **Stage 1 (Builder)**: `node:20-alpine` runs `npm ci` and `npm run build`, producing an optimized production bundle in `/dist`.
2. **Stage 2 (Runtime)**: `nginx:alpine` copies `/dist` to `/usr/share/nginx/html` and mounts `nginx.conf`. Total image size is under 25MB.

### Nginx Routing Configuration (`nginx.conf`)

Because Vite outputs an SPA, Nginx must rewrite all non-file route requests back to `index.html`:

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

## 8. Architectural Risk Analysis & Constraints

| Area | Current Constraint | Architectural Risk | Target Mitigation |
| :--- | :--- | :--- | :--- |
| **Data Persistence** | In-Memory JavaScript Objects | Any browser refresh reverts registered organizations or edited clearance statuses. | Deploy PostgreSQL + PostGIS with persistent volume claims. |
| **Authentication** | Client-side dropdown state switch | No cryptographic tokens; any user can manipulate frontend role to `'admin'`. | Integrate Keycloak / OAuth2 / OIDC with JWT cookies. |
| **Spatial Engine** | Haversine in browser memory | Calculation scale limited to ~1,000 nodes before UI stuttering occurs. | Offload spatial queries to PostGIS `ST_DWithin` spatial indexes (`GIST`). |
| **File Storage** | Mock document uploads | DPIA documents, VAPT scans, and SLA contracts are not persisted on physical disks. | Integrate MinIO S3-compliant sovereign bucket storage. |
