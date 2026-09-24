/**
 * ============================================================================
 * Ghana National AI Projects Registry & Monitoring System (GNAPRMS)
 * Sovereign GIS Spatial API & Telemetry Engine
 * 
 * Compliant with:
 * - OGC (Open Geospatial Consortium) Standards
 * - GeoJSON Specification (RFC 7946)
 * - Ghana Data Protection Act, 2012 (Act 843) Sovereign Geo-Boundary Limits
 * ============================================================================
 */

import { AIProject } from '../data/sampleProjects';

// ----------------------------------------------------------------------------
// 1. GeoJSON Specification Types (RFC 7946)
// ----------------------------------------------------------------------------

export interface GeoJSONGeometryPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude] as per RFC 7946 standard
}

export interface GeoJSONGeometryPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface GeoJSONProjectProperties {
  id: string;
  projectCode: string;
  name: string;
  category: string;
  sector: string;
  stage: string;
  status: string;
  mda: string;
  mdaCode: string;
  region: string;
  district: string;
  latitude: number;
  longitude: number;
  totalAllocatedBudget: number;
  utilizedBudget: number;
  currency: string;
  complianceGrade: string;
  readinessScore: number;
  sovereignBorderVerified: boolean;
  activeSensorsCount: number;
}

export interface GeoJSONFeature<G = GeoJSONGeometryPoint, P = GeoJSONProjectProperties> {
  type: 'Feature';
  id: string;
  geometry: G;
  properties: P;
}

export interface GeoJSONFeatureCollection<F = GeoJSONFeature> {
  type: 'FeatureCollection';
  crs?: {
    type: 'name';
    properties: {
      name: 'urn:ogc:def:crs:OGC:1.3:CRS84';
    };
  };
  features: F[];
  metadata?: {
    title: string;
    generatedAt: string;
    jurisdiction: 'Republic of Ghana';
    count: number;
    spatialReference: 'WGS 84 (EPSG:4326)';
  };
}

// ----------------------------------------------------------------------------
// 2. Telemetry, Regional & Spatial Types
// ----------------------------------------------------------------------------

export interface EdgeTelemetryNode {
  id: string;
  nodeCode: string;
  name: string;
  projectCode: string;
  projectName: string;
  coordinates: [number, number]; // [lat, lng]
  region: string;
  district: string;
  sensorType: 'Hydrological Radar' | 'Satellite Earth Observation' | 'Biometric AFIS Edge' | 'Traffic Vision Cam' | 'Soil Moisture Array' | 'Drone Dispatch Vertiport';
  status: 'ONLINE' | 'ACTIVE_POLLING' | 'STANDBY' | 'DEGRADED';
  uptimePercent: number;
  lastPing: string;
  batteryLevelPercent: number;
  telemetryReading: string;
  dataProtocol: 'MQTT / TLS' | 'CoAP' | 'HTTPS / REST' | 'LoRaWAN';
  ipAddressMasked: string;
}

export interface RegionalDensityStats {
  regionName: string;
  capital: string;
  center: [number, number];
  totalProjects: number;
  activeProjects: number;
  delayedProjects: number;
  totalBudgetGHS: number;
  utilizedBudgetGHS: number;
  avgReadinessScore: number;
  densityClassification: 'High Hub' | 'Emerging Corridor' | 'Expansion Node' | 'Baseline';
}

export interface SovereignBoundaryAudit {
  auditStatus: 'COMPLIANT' | 'FLAGGED';
  totalChecked: number;
  compliantCount: number;
  flaggedCount: number;
  sovereignBoundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
    description: string;
  };
  verifiedTerritory: 'Republic of Ghana (Land & Territorial Waters)';
  legislativeAct: 'Ghana Data Protection Act 2012 (Act 843) Sec 45';
  timestamp: string;
}

export interface GisApiResponse<T> {
  status: 200 | 400 | 404 | 500;
  ok: boolean;
  endpoint: string;
  method: 'GET' | 'POST';
  timestamp: string;
  latencyMs: number;
  headers: {
    'content-type': string;
    'x-sovereign-jurisdiction': string;
    'x-rate-limit-remaining': string;
    'x-cache': string;
  };
  data: T;
}

// ----------------------------------------------------------------------------
// 3. Constants & Spatial Boundaries
// ----------------------------------------------------------------------------

/**
 * Sovereign geographical bounding box of Ghana:
 * Latitude: 4.70° N (Cape Three Points) to 11.20° N (Upper East / Pulmakom)
 * Longitude: -3.30° W (Western border / Half Assini) to 1.30° E (Volta border / Aflao)
 */
export const GHANA_SOVEREIGN_BOUNDS = {
  minLat: 4.70,
  maxLat: 11.20,
  minLng: -3.30,
  maxLng: 1.30,
};

/**
 * Approximate sovereign territorial polygon outline of the Republic of Ghana
 * for GeoJSON polygon overlay rendering.
 */
export const GHANA_TERRITORIAL_POLYGON: [number, number][] = [
  [4.735, -2.100],  // Cape Three Points
  [4.900, -2.850],  // Half Assini
  [5.500, -3.250],  // Western border southern bend
  [6.600, -3.050],  // Western North border
  [7.300, -2.800],  // Bono border
  [8.100, -2.600],  // Savannah western border
  [9.500, -2.750],  // Upper West border (Wa west)
  [10.900, -2.850], // Hamile border post (Northwest apex)
  [11.150, -1.800], // Tumu / Northern Upper West
  [11.050, -0.900], // Paga border post
  [11.175, 0.050],  // Pulmakom apex (Northeast tip)
  [10.400, 0.250],  // North East eastern border
  [9.300, 0.500],   // Northern eastern border
  [8.400, 0.350],   // Oti eastern border
  [7.200, 0.550],   // Volta eastern border
  [6.120, 1.200],   // Aflao border post
  [5.780, 0.650],   // Keta lagoon coast
  [5.750, 0.050],   // Ada Foah estuary
  [5.600, -0.180],  // Accra coastline
  [5.350, -0.650],  // Winneba coast
  [5.100, -1.250],  // Cape Coast
  [4.900, -1.750],  // Takoradi port
  [4.735, -2.100]   // Back to Cape Three Points
];

// Sample live IoT edge telemetry nodes deployed across Ghana
export const initialEdgeTelemetryNodes: EdgeTelemetryNode[] = [
  {
    id: 'edge-node-001',
    nodeCode: 'TEL-ACC-GPS-01',
    name: 'Accra Central Postal Routing Gateway',
    projectCode: 'GN-AI-2026-001',
    projectName: 'GhanaPostGPS National Addressing',
    coordinates: [5.6037, -0.1870],
    region: 'Greater Accra',
    district: 'Accra Metropolitan',
    sensorType: 'Biometric AFIS Edge',
    status: 'ONLINE',
    uptimePercent: 99.98,
    lastPing: '2 seconds ago',
    batteryLevelPercent: 100,
    telemetryReading: '1,428 address verifications / min • Latency: 12ms',
    dataProtocol: 'HTTPS / REST',
    ipAddressMasked: '10.14.88.***'
  },
  {
    id: 'edge-node-002',
    nodeCode: 'TEL-NIA-AFIS-02',
    name: 'National Biometric ID Gateway Node',
    projectCode: 'GN-AI-2026-002',
    projectName: 'GhanaCard AFIS & Biometric Registry',
    coordinates: [5.5786, -0.1821],
    region: 'Greater Accra',
    district: 'Accra Metropolitan',
    sensorType: 'Biometric AFIS Edge',
    status: 'ONLINE',
    uptimePercent: 99.94,
    lastPing: '1 second ago',
    batteryLevelPercent: 98,
    telemetryReading: 'Fingerprint Match Engine: 420 ms • 100% Hash Ephemeral',
    dataProtocol: 'MQTT / TLS',
    ipAddressMasked: '10.14.92.***'
  },
  {
    id: 'edge-node-003',
    nodeCode: 'TEL-COCOA-SAT-03',
    name: 'Sefwi Wiawso Remote Sensing Station',
    projectCode: 'GN-AI-2026-003',
    projectName: 'Cocoa Management System (CMS)',
    coordinates: [6.2041, -1.7583],
    region: 'Western North',
    district: 'Sefwi Wiawso',
    sensorType: 'Soil Moisture Array',
    status: 'ACTIVE_POLLING',
    uptimePercent: 98.60,
    lastPing: '4 seconds ago',
    batteryLevelPercent: 88,
    telemetryReading: 'Soil Moisture: 34.2% • Canopy NDVI Index: 0.74 • Solar 24V',
    dataProtocol: 'LoRaWAN',
    ipAddressMasked: '172.16.4.***'
  },
  {
    id: 'edge-node-004',
    nodeCode: 'TEL-VRA-HYDRO-04',
    name: 'Akosombo Dam Hydrological AI Monitor',
    projectCode: 'GN-AI-2026-007',
    projectName: 'Akosombo Dam Hydro-AI Smart Grid',
    coordinates: [6.3000, 0.0500],
    region: 'Eastern',
    district: 'Asuogyaman',
    sensorType: 'Hydrological Radar',
    status: 'ONLINE',
    uptimePercent: 100.00,
    lastPing: '3 seconds ago',
    batteryLevelPercent: 100,
    telemetryReading: 'Lake Reservoir Inflow: 1,840 m³/s • Spillway Risk: Low (0.04)',
    dataProtocol: 'MQTT / TLS',
    ipAddressMasked: '10.22.10.***'
  },
  {
    id: 'edge-node-005',
    nodeCode: 'TEL-KUMASI-TRF-05',
    name: 'Kumasi Kejetia Vision AI Node',
    projectCode: 'GN-AI-2026-008',
    projectName: 'Kumasi Urban Mobility Vision AI',
    coordinates: [6.6922, -1.6163],
    region: 'Ashanti',
    district: 'Kumasi Metropolitan',
    sensorType: 'Traffic Vision Cam',
    status: 'ONLINE',
    uptimePercent: 99.20,
    lastPing: '2 seconds ago',
    batteryLevelPercent: 94,
    telemetryReading: 'Traffic Congestion: Moderate • 186 vehicles/min • Optical AI',
    dataProtocol: 'HTTPS / REST',
    ipAddressMasked: '10.33.15.***'
  },
  {
    id: 'edge-node-006',
    nodeCode: 'TEL-BOLGA-MED-06',
    name: 'Bolgatanga Medical Logistics Vertiport',
    projectCode: 'GN-AI-2026-010',
    projectName: 'Upper East Maternal Drone Logistics',
    coordinates: [10.7856, -0.8514],
    region: 'Upper East',
    district: 'Bolgatanga Municipal',
    sensorType: 'Drone Dispatch Vertiport',
    status: 'ACTIVE_POLLING',
    uptimePercent: 99.85,
    lastPing: '5 seconds ago',
    batteryLevelPercent: 92,
    telemetryReading: '4 Autonomous Cold-Chain Flights Active • Wind: 8 knots NNE',
    dataProtocol: 'CoAP',
    ipAddressMasked: '10.88.22.***'
  }
];

// ----------------------------------------------------------------------------
// 4. Utility Functions (Haversine Distance, Border Check)
// ----------------------------------------------------------------------------

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Validates if coordinates strictly fall within sovereign Ghana bounding limits
 */
export function isCoordinateWithinGhana(lat: number, lng: number): boolean {
  return (
    lat >= GHANA_SOVEREIGN_BOUNDS.minLat &&
    lat <= GHANA_SOVEREIGN_BOUNDS.maxLat &&
    lng >= GHANA_SOVEREIGN_BOUNDS.minLng &&
    lng <= GHANA_SOVEREIGN_BOUNDS.maxLng
  );
}

// ----------------------------------------------------------------------------
// 5. GIS Spatial API Service Endpoints
// ----------------------------------------------------------------------------

/**
 * Endpoint: GET /api/v1/gis/geojson/projects
 * Converts registry projects into a standard RFC 7946 GeoJSON FeatureCollection
 */
export async function getProjectsGeoJSON(
  projects: AIProject[]
): Promise<GisApiResponse<GeoJSONFeatureCollection>> {
  const startTime = performance.now();

  const features: GeoJSONFeature[] = projects.map(p => {
    const isSovereign = isCoordinateWithinGhana(p.latitude, p.longitude);
    const relatedSensors = initialEdgeTelemetryNodes.filter(
      n => n.projectCode === p.projectCode
    ).length;

    return {
      type: 'Feature',
      id: p.id,
      geometry: {
        type: 'Point',
        coordinates: [p.longitude, p.latitude] // RFC 7946: [lng, lat]
      },
      properties: {
        id: p.id,
        projectCode: p.projectCode,
        name: p.name,
        category: p.category,
        sector: p.sector,
        stage: p.stage,
        status: p.status,
        mda: p.mda,
        mdaCode: p.mdaCode,
        region: p.region,
        district: p.district,
        latitude: p.latitude,
        longitude: p.longitude,
        totalAllocatedBudget: p.budget.totalAllocated,
        utilizedBudget: p.budget.utilized,
        currency: p.budget.currency,
        complianceGrade: p.compliance.overallGrade,
        readinessScore: p.readinessScore,
        sovereignBorderVerified: isSovereign,
        activeSensorsCount: relatedSensors
      }
    };
  });

  const featureCollection: GeoJSONFeatureCollection = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
      }
    },
    features,
    metadata: {
      title: 'Ghana Sovereign AI Project Deployment Registry',
      generatedAt: new Date().toISOString(),
      jurisdiction: 'Republic of Ghana',
      count: features.length,
      spatialReference: 'WGS 84 (EPSG:4326)'
    }
  };

  const latency = Math.round(performance.now() - startTime) + 18; // simulate realistic fast microservice network latency

  return {
    status: 200,
    ok: true,
    endpoint: '/api/v1/gis/geojson/projects',
    method: 'GET',
    timestamp: new Date().toISOString(),
    latencyMs: latency,
    headers: {
      'content-type': 'application/geo+json; charset=utf-8',
      'x-sovereign-jurisdiction': 'Republic of Ghana (NITA-CERT)',
      'x-rate-limit-remaining': '994',
      'x-cache': 'HIT (Redis-Spatial)'
    },
    data: featureCollection
  };
}

/**
 * Endpoint: GET /api/v1/gis/spatial-query
 * Filters projects within a geographic radius (km) from a central point
 */
export async function querySpatialRadius(
  projects: AIProject[],
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  sectorFilter?: string,
  stageFilter?: string
): Promise<
  GisApiResponse<{
    center: [number, number];
    radiusKm: number;
    matchCount: number;
    totalEvaluated: number;
    features: GeoJSONFeature[];
  }>
> {
  const startTime = performance.now();

  const matchingFeatures: GeoJSONFeature[] = [];

  projects.forEach(p => {
    if (sectorFilter && sectorFilter !== 'All' && p.sector !== sectorFilter) return;
    if (stageFilter && stageFilter !== 'All' && p.stage !== stageFilter) return;

    const distance = calculateHaversineDistanceKm(
      centerLat,
      centerLng,
      p.latitude,
      p.longitude
    );

    if (distance <= radiusKm) {
      matchingFeatures.push({
        type: 'Feature',
        id: p.id,
        geometry: {
          type: 'Point',
          coordinates: [p.longitude, p.latitude]
        },
        properties: {
          id: p.id,
          projectCode: p.projectCode,
          name: p.name,
          category: p.category,
          sector: p.sector,
          stage: p.stage,
          status: p.status,
          mda: p.mda,
          mdaCode: p.mdaCode,
          region: p.region,
          district: p.district,
          latitude: p.latitude,
          longitude: p.longitude,
          totalAllocatedBudget: p.budget.totalAllocated,
          utilizedBudget: p.budget.utilized,
          currency: p.budget.currency,
          complianceGrade: p.compliance.overallGrade,
          readinessScore: p.readinessScore,
          sovereignBorderVerified: isCoordinateWithinGhana(p.latitude, p.longitude),
          activeSensorsCount: initialEdgeTelemetryNodes.filter(n => n.projectCode === p.projectCode).length
        }
      });
    }
  });

  const latency = Math.round(performance.now() - startTime) + 24;

  return {
    status: 200,
    ok: true,
    endpoint: `/api/v1/gis/spatial-query?lat=${centerLat}&lng=${centerLng}&radiusKm=${radiusKm}`,
    method: 'GET',
    timestamp: new Date().toISOString(),
    latencyMs: latency,
    headers: {
      'content-type': 'application/geo+json; charset=utf-8',
      'x-sovereign-jurisdiction': 'Republic of Ghana',
      'x-rate-limit-remaining': '989',
      'x-cache': 'DYNAMIC-QUERY (PostGIS ST_DWithin)'
    },
    data: {
      center: [centerLat, centerLng],
      radiusKm,
      matchCount: matchingFeatures.length,
      totalEvaluated: projects.length,
      features: matchingFeatures
    }
  };
}

/**
 * Endpoint: GET /api/v1/gis/regions/density
 * Computes regional project density, financial allocation, and readiness across Ghana's 16 regions
 */
export async function getRegionalDensityAnalytics(
  projects: AIProject[],
  allRegions: { name: string; center: [number, number]; description: string }[]
): Promise<GisApiResponse<RegionalDensityStats[]>> {
  const startTime = performance.now();

  const densityMap: RegionalDensityStats[] = allRegions.map(reg => {
    const regionalProjects = projects.filter(p => p.region.toLowerCase() === reg.name.toLowerCase());
    const totalProjects = regionalProjects.length;
    const activeProjects = regionalProjects.filter(p => p.status === 'Active').length;
    const delayedProjects = regionalProjects.filter(p => p.status === 'Delayed').length;
    const totalBudget = regionalProjects.reduce((acc, p) => acc + p.budget.totalAllocated, 0);
    const totalUtilized = regionalProjects.reduce((acc, p) => acc + p.budget.utilized, 0);
    const avgReadiness = totalProjects > 0
      ? Math.round(regionalProjects.reduce((acc, p) => acc + p.readinessScore, 0) / totalProjects)
      : 0;

    let densityClassification: 'High Hub' | 'Emerging Corridor' | 'Expansion Node' | 'Baseline' = 'Baseline';
    if (totalProjects >= 3) {
      densityClassification = 'High Hub';
    } else if (totalProjects >= 2) {
      densityClassification = 'Emerging Corridor';
    } else if (totalProjects === 1) {
      densityClassification = 'Expansion Node';
    }

    return {
      regionName: reg.name,
      capital: getRegionalCapital(reg.name),
      center: reg.center,
      totalProjects,
      activeProjects,
      delayedProjects,
      totalBudgetGHS: totalBudget,
      utilizedBudgetGHS: totalUtilized,
      avgReadinessScore: avgReadiness,
      densityClassification
    };
  });

  // Sort descending by total projects, then budget
  densityMap.sort((a, b) => b.totalProjects - a.totalProjects || b.totalBudgetGHS - a.totalBudgetGHS);

  const latency = Math.round(performance.now() - startTime) + 16;

  return {
    status: 200,
    ok: true,
    endpoint: '/api/v1/gis/regions/density',
    method: 'GET',
    timestamp: new Date().toISOString(),
    latencyMs: latency,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-sovereign-jurisdiction': 'Republic of Ghana (MOCD)',
      'x-rate-limit-remaining': '998',
      'x-cache': 'HIT (PostGIS Aggregation)'
    },
    data: densityMap
  };
}

/**
 * Endpoint: GET /api/v1/gis/telemetry/live
 * Fetches real-time IoT and edge telemetry sensor nodes
 */
export async function getLiveTelemetryFeed(): Promise<GisApiResponse<EdgeTelemetryNode[]>> {
  const startTime = performance.now();

  // Simulate subtle real-time fluctuation in telemetry
  const updatedNodes = initialEdgeTelemetryNodes.map(node => {
    const randomJitter = Math.floor(Math.random() * 3) - 1;
    return {
      ...node,
      batteryLevelPercent: Math.max(70, Math.min(100, node.batteryLevelPercent + randomJitter)),
      lastPing: 'Just now'
    };
  });

  const latency = Math.round(performance.now() - startTime) + 12;

  return {
    status: 200,
    ok: true,
    endpoint: '/api/v1/gis/telemetry/live',
    method: 'GET',
    timestamp: new Date().toISOString(),
    latencyMs: latency,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-sovereign-jurisdiction': 'Republic of Ghana (National IoT Mesh)',
      'x-rate-limit-remaining': '995',
      'x-cache': 'REALTIME-STREAM'
    },
    data: updatedNodes
  };
}

/**
 * Endpoint: GET /api/v1/gis/compliance/sovereign-boundary
 * Validates sovereign borders compliance (Act 843 Section 45 cross-border data transfer check)
 */
export async function auditSovereignBorderCompliance(
  projects: AIProject[]
): Promise<GisApiResponse<SovereignBoundaryAudit>> {
  const startTime = performance.now();

  let compliantCount = 0;
  let flaggedCount = 0;

  projects.forEach(p => {
    if (isCoordinateWithinGhana(p.latitude, p.longitude)) {
      compliantCount++;
    } else {
      flaggedCount++;
    }
  });

  const auditData: SovereignBoundaryAudit = {
    auditStatus: flaggedCount === 0 ? 'COMPLIANT' : 'FLAGGED',
    totalChecked: projects.length,
    compliantCount,
    flaggedCount,
    sovereignBoundingBox: {
      minLat: GHANA_SOVEREIGN_BOUNDS.minLat,
      maxLat: GHANA_SOVEREIGN_BOUNDS.maxLat,
      minLng: GHANA_SOVEREIGN_BOUNDS.minLng,
      maxLng: GHANA_SOVEREIGN_BOUNDS.maxLng,
      description: 'Ghana National Sovereign Coordinates (Cape Three Points to Pulmakom, Half Assini to Aflao)'
    },
    verifiedTerritory: 'Republic of Ghana (Land & Territorial Waters)',
    legislativeAct: 'Ghana Data Protection Act 2012 (Act 843) Sec 45',
    timestamp: new Date().toISOString()
  };

  const latency = Math.round(performance.now() - startTime) + 14;

  return {
    status: 200,
    ok: true,
    endpoint: '/api/v1/gis/compliance/sovereign-boundary',
    method: 'GET',
    timestamp: new Date().toISOString(),
    latencyMs: latency,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-sovereign-jurisdiction': 'Republic of Ghana (Data Protection Commission)',
      'x-rate-limit-remaining': '1000',
      'x-cache': 'AUDIT-VERIFIED'
    },
    data: auditData
  };
}

// ----------------------------------------------------------------------------
// 6. Data Export Utilities (GeoJSON, CSV, KML)
// ----------------------------------------------------------------------------

export function exportSpatialData(
  projects: AIProject[],
  format: 'geojson' | 'csv' | 'kml'
): { data: string; mimeType: string; filename: string } {
  const timestamp = new Date().toISOString().slice(0, 10);

  if (format === 'geojson') {
    const geojsonObj = {
      type: 'FeatureCollection',
      name: 'Ghana_National_AI_Projects',
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
      },
      features: projects.map(p => ({
        type: 'Feature',
        id: p.id,
        geometry: {
          type: 'Point',
          coordinates: [p.longitude, p.latitude]
        },
        properties: {
          projectCode: p.projectCode,
          name: p.name,
          category: p.category,
          sector: p.sector,
          stage: p.stage,
          status: p.status,
          mda: p.mda,
          region: p.region,
          district: p.district,
          allocatedGHS: p.budget.totalAllocated,
          utilizedGHS: p.budget.utilized,
          complianceGrade: p.compliance.overallGrade,
          readinessScore: p.readinessScore
        }
      }))
    };

    return {
      data: JSON.stringify(geojsonObj, null, 2),
      mimeType: 'application/geo+json',
      filename: `GNAPRMS_Ghana_AI_Projects_${timestamp}.geojson`
    };
  }

  if (format === 'csv') {
    const headers = [
      'Project Code',
      'Name',
      'Category',
      'Sector',
      'Stage',
      'Status',
      'Latitude',
      'Longitude',
      'Region',
      'District',
      'MDA',
      'Allocated Budget (GHS)',
      'Utilized Budget (GHS)',
      'Compliance Grade',
      'Readiness Score'
    ];

    const rows = projects.map(p => [
      `"${p.projectCode}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.sector}"`,
      `"${p.stage}"`,
      `"${p.status}"`,
      p.latitude,
      p.longitude,
      `"${p.region}"`,
      `"${p.district}"`,
      `"${p.mda}"`,
      p.budget.totalAllocated,
      p.budget.utilized,
      `"${p.compliance.overallGrade}"`,
      p.readinessScore
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return {
      data: csvContent,
      mimeType: 'text/csv',
      filename: `GNAPRMS_Ghana_AI_Coordinates_${timestamp}.csv`
    };
  }

  // Format: KML for Google Earth / GIS
  const kmlPlacemarks = projects
    .map(
      p => `
    <Placemark>
      <name>${p.name} (${p.projectCode})</name>
      <description>
        <![CDATA[
          <strong>Sector:</strong> ${p.sector}<br/>
          <strong>Stage:</strong> ${p.stage} (${p.status})<br/>
          <strong>MDA:</strong> ${p.mda}<br/>
          <strong>Budget:</strong> GHS ${p.budget.totalAllocated.toLocaleString()}<br/>
          <strong>Compliance:</strong> ${p.compliance.overallGrade}
        ]]>
      </description>
      <Point>
        <coordinates>${p.longitude},${p.latitude},0</coordinates>
      </Point>
    </Placemark>`
    )
    .join('');

  const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Ghana National AI Projects Registry</name>
    <description>GNAPRMS Sovereign GIS Spatial Deployment Nodes</description>
    ${kmlPlacemarks}
  </Document>
</kml>`;

  return {
    data: kmlContent,
    mimeType: 'application/vnd.google-earth.kml+xml',
    filename: `GNAPRMS_Ghana_AI_Placemarks_${timestamp}.kml`
  };
}

// ----------------------------------------------------------------------------
// 7. Developer cURL Snippet Generator
// ----------------------------------------------------------------------------

export function generateCurlSnippet(endpoint: string): string {
  const baseUrl = 'https://api.gnaprms.gov.gh';
  return `curl -X GET "${baseUrl}${endpoint}" \\
  -H "Accept: application/geo+json, application/json" \\
  -H "Authorization: Bearer <GOV_API_KEY>" \\
  -H "X-Sovereign-Jurisdiction: GH"`;
}

// ----------------------------------------------------------------------------
// 8. Regional Capitals Helper
// ----------------------------------------------------------------------------

function getRegionalCapital(regionName: string): string {
  const capitals: Record<string, string> = {
    'Greater Accra': 'Accra',
    Ashanti: 'Kumasi',
    Western: 'Sekondi-Takoradi',
    'Western North': 'Sefwi Wiawso',
    Central: 'Cape Coast',
    Eastern: 'Koforidua',
    Volta: 'Ho',
    Oti: 'Dambai',
    Northern: 'Tamale',
    'North East': 'Nalerigu',
    Savannah: 'Damongo',
    'Upper East': 'Bolgatanga',
    'Upper West': 'Wa',
    Bono: 'Sunyani',
    'Bono East': 'Techiman',
    Ahafo: 'Goaso'
  };
  return capitals[regionName] || 'Regional Center';
}
