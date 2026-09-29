# National AI Project Tracking and Clearance System (NAPTCS)
# Sovereign GIS Spatial & Core Telemetry API Reference

> **Document Version**: 2.5.0  
> **Status**: Verified against Codebase Commit `8e31aca`  
> **Primary Source File**: `src/api/gisSpatialApi.ts`  
> **Standards Compliance**: OGC RFC 7946 (GeoJSON), WGS 84 (EPSG:4326), Act 843 Statutory Compliance

---

## 1. Architectural Overview & API Design

The NAPTCS API engine currently operates as an **in-memory simulated asynchronous REST engine** located in [`src/api/gisSpatialApi.ts`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/api/gisSpatialApi.ts). It encapsulates business logic, spatial transformations, Haversine trigonometric distance queries, and telemetry tracking, returning strictly typed asynchronous responses structured like real HTTP responses.

Every API response follows the generic `GisApiResponse<T>` envelope:

```typescript
export interface GisApiResponse<T> {
  status: 200 | 400 | 404 | 500;
  ok: boolean;
  endpoint: string;
  method: 'GET' | 'POST';
  timestamp: string;          // ISO-8601 UTC
  latencyMs: number;          // Simulated network roundtrip (20ms - 80ms)
  headers: {
    'content-type': 'application/geo+json' | 'application/json';
    'x-sovereign-jurisdiction': 'Republic of Ghana (Act 843 / Act 1038)';
    'x-rate-limit-remaining': string;
    'x-cache': 'HIT' | 'MISS';
  };
  data: T;
}
```

---

## 2. API Endpoint Matrix

| Method | Emulated Endpoint | Function Name | Input Parameters | Return Data Type | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/spatial/projects.geojson` | `getProjectsGeoJSON` | `filterOptions?: SpatialFilterOptions` | `GeoJSONFeatureCollection` | Returns RFC 7946 GeoJSON FeatureCollection of all or filtered AI projects. |
| `POST` | `/api/v1/spatial/query-radius` | `querySpatialRadius` | `centerLat: number, centerLng: number, radiusKm: number, sectorFilter?: string` | `RadiusQueryResult` | Performs Haversine distance search from a central point within a radial boundary. |
| `GET` | `/api/v1/spatial/regional-density` | `getRegionalDensityAnalytics` | None | `RegionalDensityStats[]` | Aggregates project count, budget, and readiness across Ghana's 16 administrative regions. |
| `GET` | `/api/v1/telemetry/nodes/live` | `getLiveTelemetryFeed` | None | `EdgeTelemetryNode[]` | Returns live operational status, battery, ping, and latency for deployed IoT nodes. |
| `GET` | `/api/v1/spatial/sovereign-border-audit` | `auditSovereignBorderCompliance` | `projectList?: AIProject[]` | `SovereignBoundaryAudit` | Audits whether all registered deployments fall strictly within Ghana's borders. |
| `POST` | `/api/v1/spatial/export` | `exportSpatialData` | `data: any, format: 'geojson' \| 'csv', filename: string` | `void` (triggers browser download) | Serializes project and telemetry records to downloadable GeoJSON or CSV files. |

---

## 3. Detailed Endpoint Specifications

### 3.1 Get Projects GeoJSON (`/api/v1/spatial/projects.geojson`)

* **Function Signature**: `getProjectsGeoJSON(filterOptions?: SpatialFilterOptions): Promise<GisApiResponse<GeoJSONFeatureCollection>>`
* **HTTP Method**: `GET`
* **Content-Type**: `application/geo+json`
* **Description**: Translates internal `AIProject[]` models into an OGC RFC 7946 compliant GeoJSON FeatureCollection.

#### Request Filter Parameters (`SpatialFilterOptions`)

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sector` | `string` | No | `'All'` | Filters by economic sector (e.g., `'Health'`, `'Agriculture'`, `'Finance'`). |
| `clearanceStatus` | `string` | No | `'All'` | Filters by clearance status (`'Cleared'`, `'Conditional'`, `'Pending Review'`). |
| `riskTier` | `string` | No | `'All'` | Filters by statutory risk tier (`'Minimal Risk'`, `'High Risk'`, `'Prohibited'`). |
| `region` | `string` | No | `'All'` | Filters by administrative region name (e.g., `'Greater Accra'`, `'Ashanti'`). |
| `searchQuery` | `string` | No | `''` | Substring match against name, code, description, and MDA. |
| `onlyPublished` | `boolean` | No | `false` | If `true`, applies the sovereign gating rule: only includes cleared projects from cleared orgs. |

#### Sample Response Payload

```json
{
  "status": 200,
  "ok": true,
  "endpoint": "/api/v1/spatial/projects.geojson",
  "method": "GET",
  "timestamp": "2026-09-24T16:00:00.000Z",
  "latencyMs": 42,
  "headers": {
    "content-type": "application/geo+json",
    "x-sovereign-jurisdiction": "Republic of Ghana (Act 843 / Act 1038)",
    "x-rate-limit-remaining": "994",
    "x-cache": "MISS"
  },
  "data": {
    "type": "FeatureCollection",
    "crs": {
      "type": "name",
      "properties": {
        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
      }
    },
    "metadata": {
      "title": "Ghana Sovereign AI Projects GeoJSON Registry",
      "generatedAt": "2026-09-24T16:00:00.000Z",
      "jurisdiction": "Republic of Ghana",
      "count": 18,
      "spatialReference": "WGS 84 (EPSG:4326)"
    },
    "features": [
      {
        "type": "Feature",
        "id": "proj-001",
        "geometry": {
          "type": "Point",
          "coordinates": [-0.1870, 5.6037]
        },
        "properties": {
          "id": "proj-001",
          "projectCode": "GN-AI-2026-001",
          "name": "GhanaPostGPS National Addressing & Routing AI",
          "category": "Computer Vision & Geospatial NLP",
          "sector": "Transport",
          "stage": "Production",
          "status": "Active",
          "mda": "Ministry of Communications and Digitalisation (MCD)",
          "mdaCode": "MCD-01",
          "organizationId": "org-001",
          "organizationName": "Ministry of Communications and Digitalisation",
          "entitySectorType": "Government (MDA/MMDA/SOE)",
          "riskTier": "Minimal Risk",
          "clearanceStatus": "Cleared",
          "clearanceCertificateId": "CERT-2026-NAPTCS-0001",
          "isOrganizationCleared": true,
          "isPublished": true,
          "region": "Greater Accra",
          "district": "Accra Metropolitan",
          "latitude": 5.6037,
          "longitude": -0.1870,
          "totalAllocatedBudget": 4200000,
          "utilizedBudget": 3800000,
          "currency": "GHS",
          "complianceGrade": "Excellent",
          "readinessScore": 94,
          "sovereignBorderVerified": true,
          "activeSensorsCount": 8
        }
      }
    ]
  }
}
```

---

### 3.2 Query Spatial Radius (`/api/v1/spatial/query-radius`)

* **Function Signature**: `querySpatialRadius(centerLat: number, centerLng: number, radiusKm: number, sectorFilter?: string): Promise<GisApiResponse<RadiusQueryResult>>`
* **HTTP Method**: `POST`
* **Content-Type**: `application/json`
* **Description**: Calculates Haversine spherical distance from the provided coordinate to all project coordinates and returns projects residing within the specified radius.

#### Request Body Schema

```json
{
  "centerLat": 5.6037,
  "centerLng": -0.1870,
  "radiusKm": 50,
  "sectorFilter": "Health"
}
```

#### Validation Rules

* `centerLat` must be between $4.50$ and $11.50$.
* `centerLng` must be between $-3.50$ and $1.50$.
* `radiusKm` must be a positive number $> 0$ and $\le 1000$.

#### Sample Response Payload

```json
{
  "status": 200,
  "ok": true,
  "endpoint": "/api/v1/spatial/query-radius",
  "method": "POST",
  "timestamp": "2026-09-24T16:01:12.000Z",
  "latencyMs": 35,
  "data": {
    "queryParameters": {
      "centerCoordinates": [5.6037, -0.1870],
      "radiusKm": 50,
      "sectorFilter": "Health"
    },
    "matchesCount": 3,
    "totalBudgetInRadiusGHS": 8700000,
    "projects": [
      {
        "projectCode": "GN-AI-2026-004",
        "name": "Korle Bu AI Diagnostic Imaging & Radiomics",
        "distanceKm": 4.12,
        "region": "Greater Accra",
        "clearanceStatus": "Cleared",
        "coordinates": [5.5342, -0.2289]
      }
    ]
  }
}
```

---

### 3.3 Regional Density Analytics (`/api/v1/spatial/regional-density`)

* **Function Signature**: `getRegionalDensityAnalytics(): Promise<GisApiResponse<RegionalDensityStats[]>>`
* **HTTP Method**: `GET`
* **Description**: Returns aggregated metrics across Ghana's 16 official administrative regions.

#### Output Data Fields (`RegionalDensityStats`)

```typescript
export interface RegionalDensityStats {
  regionName: string;
  capital: string;
  center: [number, number];       // [latitude, longitude]
  totalProjects: number;
  activeProjects: number;
  delayedProjects: number;
  totalBudgetGHS: number;
  utilizedBudgetGHS: number;
  avgReadinessScore: number;
  densityClassification: 'High Hub' | 'Emerging Corridor' | 'Expansion Node' | 'Baseline';
}
```

---

### 3.4 Live Telemetry Feed (`/api/v1/telemetry/nodes/live`)

* **Function Signature**: `getLiveTelemetryFeed(): Promise<GisApiResponse<EdgeTelemetryNode[]>>`
* **HTTP Method**: `GET`
* **Description**: Fetches live health, uptime, and edge sensor readings from nationwide IoT deployments.

#### Data Schema (`EdgeTelemetryNode`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique telemetry node UUID. |
| `nodeCode` | `string` | Standardized identifier (e.g. `TEL-ACC-GPS-01`). |
| `name` | `string` | Descriptive gateway or edge station name. |
| `coordinates` | `[number, number]` | Location as `[lat, lng]`. |
| `sensorType` | `string` | `'Hydrological Radar' \| 'Biometric AFIS Edge' \| 'Soil Moisture Array' \| ...` |
| `status` | `string` | `'ONLINE' \| 'ACTIVE_POLLING' \| 'STANDBY' \| 'DEGRADED'` |
| `uptimePercent` | `number` | Uptime percentage (e.g., `99.98`). |
| `batteryLevelPercent`| `number` | Edge battery reserve percentage. |
| `dataProtocol` | `string` | Protocol (`'MQTT / TLS' \| 'CoAP' \| 'HTTPS / REST' \| 'LoRaWAN'`). |
| `ipAddressMasked` | `string` | Masked IP for privacy compliance (`10.14.88.***`). |

---

### 3.5 Sovereign Border Compliance Audit (`/api/v1/spatial/sovereign-border-audit`)

* **Function Signature**: `auditSovereignBorderCompliance(projectList?: AIProject[]): Promise<GisApiResponse<SovereignBoundaryAudit>>`
* **HTTP Method**: `GET`
* **Description**: Validates that all project coordinates reside inside sovereign boundaries under Act 843 Section 45.

#### Output Schema (`SovereignBoundaryAudit`)

```typescript
export interface SovereignBoundaryAudit {
  auditStatus: 'COMPLIANT' | 'FLAGGED';
  totalChecked: number;
  compliantCount: number;
  flaggedCount: number;
  sovereignBoundingBox: {
    minLat: 4.70;
    maxLat: 11.20;
    minLng: -3.30;
    maxLng: 1.30;
    description: string;
  };
  verifiedTerritory: 'Republic of Ghana (Land & Territorial Waters)';
  legislativeAct: 'Ghana Data Protection Act 2012 (Act 843) Sec 45';
  timestamp: string;
}
```

---

## 4. Helper & Mathematical Functions

### Haversine Distance Calculation

```typescript
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number
```
* **Algorithm**: Standard spherical Haversine formula assuming Earth radius $R = 6371\text{ km}$.
* **Accuracy**: Within $\pm 0.3\%$ across the latitude range of Ghana ($4^\circ - 11^\circ\text{ N}$).

### Border Verification

```typescript
export function isCoordinateWithinGhana(lat: number, lng: number): boolean
```
* Evaluates coordinate against `GHANA_SOVEREIGN_BOUNDS`:
  - $4.70 \le \text{lat} \le 11.20$
  - $-3.30 \le \text{lng} \le 1.30$

---

## 5. Target OpenAPI / Swagger Backend Specification

When migrating from the client simulation to the backend microservice, the following REST endpoints must be implemented:

```yaml
openapi: 3.0.3
info:
  title: Ghana National AI Projects Registry & Monitoring System API
  version: 2.5.0
  description: Statutory Sovereign AI Management API
servers:
  - url: https://api.ai-tracker.gov.gh/v1
    description: Sovereign National Data Centre Gateway
paths:
  /auth/login:
    post:
      summary: Authenticate user and issue JWT
  /organizations:
    get:
      summary: List registered organizations
    post:
      summary: Register a new MDA or private sector enterprise
  /organizations/{id}/clearance:
    put:
      summary: Statutory accreditation committee clearance decision
  /projects:
    get:
      summary: List AI projects (Filtered by publication gate)
    post:
      summary: Submit a new AI deployment registration
  /spatial/projects.geojson:
    get:
      summary: OGC GeoJSON FeatureCollection of AI deployments
  /spatial/query-radius:
    post:
      summary: PostGIS ST_DWithin radial query
  /telemetry/nodes:
    get:
      summary: List edge telemetry nodes
```
