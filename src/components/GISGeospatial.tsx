import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Layers, 
  Terminal, 
  Download, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Check, 
  Copy, 
  Activity, 
  Database, 
  Crosshair,
  Satellite,
  Compass,
  Radio,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { AIProject, ghanaRegions, formatNumberToWords } from '../data/sampleProjects';
import { 
  getProjectsGeoJSON,
  querySpatialRadius,
  getRegionalDensityAnalytics,
  getLiveTelemetryFeed,
  auditSovereignBorderCompliance,
  exportSpatialData,
  generateCurlSnippet,
  GHANA_TERRITORIAL_POLYGON,
  EdgeTelemetryNode,
  GisApiResponse,
  initialEdgeTelemetryNodes,
  calculateHaversineDistanceKm
} from '../api/gisSpatialApi';

interface GISGeospatialProps {
  projects: AIProject[];
}

type TileLayerType = 'dark' | 'satellite' | 'streets';
type PanelTab = 'telemetry' | 'apiConsole' | 'inspector';

export const GISGeospatial: React.FC<GISGeospatialProps> = ({ projects }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const overlaysGroupRef = useRef<any>(null);

  // 1. Navigation, Search & Spatial Filter States
  const [activeRegion, setActiveRegion] = useState<string>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePanelTab, setActivePanelTab] = useState<PanelTab>('telemetry');

  // 2. Map Layer & Visualization States
  const [tileLayerType, setTileLayerType] = useState<TileLayerType>('dark');
  const [showProjectNodes, setShowProjectNodes] = useState<boolean>(true);
  const [showDensityCircles, setShowDensityCircles] = useState<boolean>(true);
  const [showEdgeSensors, setShowEdgeSensors] = useState<boolean>(true);
  const [showSovereignBorder, setShowSovereignBorder] = useState<boolean>(true);

  // 3. Proximity Radius Tool States
  const [radiusFilterActive, setRadiusFilterActive] = useState<boolean>(false);
  const [radiusCenter, setRadiusCenter] = useState<[number, number]>([5.6037, -0.1870]); // default Accra
  const [radiusKm, setRadiusKm] = useState<number>(75);

  // 4. Live Telemetry Stream States
  const [liveStreamEnabled, setLiveStreamEnabled] = useState<boolean>(true);
  const [telemetryNodes, setTelemetryNodes] = useState<EdgeTelemetryNode[]>(initialEdgeTelemetryNodes);
  const [lastStreamTime, setLastStreamTime] = useState<string>('Live');

  // 5. Selected Spatial Node / Inspector State
  const [selectedProject, setSelectedProject] = useState<AIProject | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<EdgeTelemetryNode | null>(null);

  // 6. Interactive GIS Spatial API Console States
  const [apiEndpoint, setApiEndpoint] = useState<string>('/api/v1/gis/geojson/projects');
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<GisApiResponse<any> | null>(null);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filtered projects calculation
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Region filter
      if (activeRegion !== 'All' && p.region.toLowerCase() !== activeRegion.toLowerCase()) return false;
      // Sector filter
      if (selectedSector !== 'All' && p.sector !== selectedSector) return false;
      // Stage filter
      if (selectedStage !== 'All' && p.stage !== selectedStage) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCode = p.projectCode.toLowerCase().includes(query);
        const matchesDistrict = p.district.toLowerCase().includes(query);
        const matchesMda = p.mda.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesDistrict && !matchesMda) return false;
      }
      // Radius Proximity filter
      if (radiusFilterActive) {
        const distance = calculateHaversineDistanceKm(
          radiusCenter[0],
          radiusCenter[1],
          p.latitude,
          p.longitude
        );
        if (distance > radiusKm) return false;
      }
      return true;
    });
  }, [projects, activeRegion, selectedSector, selectedStage, searchQuery, radiusFilterActive, radiusCenter, radiusKm]);

  // Aggregate M&E statistics for current view
  const totalProjectsCount = filteredProjects.length;
  const activeProjectsCount = filteredProjects.filter(p => p.status === 'Active').length;
  const delayedProjectsCount = filteredProjects.filter(p => p.status === 'Delayed').length;
  const totalBudget = filteredProjects.reduce((acc, p) => acc + p.budget.totalAllocated, 0);
  const totalUtilized = filteredProjects.reduce((acc, p) => acc + p.budget.utilized, 0);
  const avgReadiness = totalProjectsCount > 0 
    ? Math.round(filteredProjects.reduce((acc, p) => acc + p.readinessScore, 0) / totalProjectsCount) 
    : 0;

  // Regional dynamic project counts across all 16 regions
  const regionProjectCounts = useMemo(() => {
    return projects.reduce((acc, p) => {
      acc[p.region] = (acc[p.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [projects]);

  // --------------------------------------------------------------------------
  // Map Initialization & Updates (Leaflet Engine)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    // Destroy existing instance to prevent duplicate mounting errors
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Centered on geographical heart of Ghana
    const map = L.map(mapContainerRef.current, {
      center: [7.9465, -1.0232],
      zoom: 7,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: true
    });

    mapInstanceRef.current = map;

    // Create an overlay layer group for all dynamic geometries
    const overlaysGroup = L.layerGroup().addTo(map);
    overlaysGroupRef.current = overlaysGroup;

    // Apply selected tile layer
    updateTileLayer(map, tileLayerType);

    // Initial render of overlays
    renderMapOverlays(L, map, overlaysGroup);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer helper
  const updateTileLayer = (map: any, type: TileLayerType) => {
    const L = (window as any).L;
    if (!L || !map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

    if (type === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (type === 'streets') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap &copy; CARTO';
    }

    const newLayer = L.tileLayer(url, {
      attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = newLayer;
  };

  // Re-render map overlays whenever filters, projects, or visual toggles change
  const renderMapOverlays = (L: any, _map: any, group: any) => {
    if (!L || !group) return;
    group.clearLayers();

    // 1. Sovereign Territorial Boundary Polygon
    if (showSovereignBorder) {
      const sovereignPolygon = L.polygon(GHANA_TERRITORIAL_POLYGON, {
        color: '#10b981',
        weight: 2,
        dashArray: '4, 8',
        fillColor: '#10b981',
        fillOpacity: 0.03
      });

      sovereignPolygon.bindTooltip(
        `<strong>Republic of Ghana Sovereign Territorial Bounds</strong><br/>
         <span style="font-size: 0.72rem; color: #10b981;">Act 843 Data Protection Sovereign Border Verified</span>`,
        { direction: 'top', sticky: true }
      );
      group.addLayer(sovereignPolygon);
    }

    // 2. Proximity Radius Circle
    if (radiusFilterActive) {
      const radiusCircle = L.circle(radiusCenter, {
        radius: radiusKm * 1000,
        color: '#38bdf8',
        weight: 1.5,
        dashArray: '6, 6',
        fillColor: '#38bdf8',
        fillOpacity: 0.08
      });

      radiusCircle.bindTooltip(
        `<strong>Spatial Radius Filter: ${radiusKm} km</strong><br/>
         <span>Center: [${radiusCenter[0].toFixed(4)}, ${radiusCenter[1].toFixed(4)}]</span>`,
        { direction: 'top' }
      );
      group.addLayer(radiusCircle);

      // Center crosshair marker
      const centerMarker = L.circleMarker(radiusCenter, {
        radius: 6,
        color: '#38bdf8',
        fillColor: '#0284c7',
        fillOpacity: 1
      });
      group.addLayer(centerMarker);
    }

    // 3. Regional Density Heat Circles
    if (showDensityCircles) {
      ghanaRegions.forEach(reg => {
        const dynamicCount = regionProjectCounts[reg.name] || 0;
        if (dynamicCount === 0) return;

        const circleColor = dynamicCount >= 3 ? '#10b981' : dynamicCount >= 2 ? '#3b82f6' : '#fbbf24';
        const circle = L.circle(reg.center, {
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.12,
          radius: 35000 + (dynamicCount * 14000)
        });

        circle.bindTooltip(
          `<div style="font-family: 'Inter', sans-serif;">
            <strong style="color: #f8fafc;">${reg.name} Region</strong><br/>
            <span style="color: #94a3b8; font-size: 0.72rem;">Density: <strong>${dynamicCount} AI Projects</strong></span><br/>
            <span style="color: #64748b; font-size: 0.68rem;">Click region in list to center</span>
          </div>`,
          { permanent: false, direction: 'top' }
        );
        group.addLayer(circle);
      });
    }

    // 4. Live IoT Edge Telemetry Sensor Nodes
    if (showEdgeSensors) {
      telemetryNodes.forEach(sensor => {
        const sensorColor = sensor.status === 'ONLINE' ? '#38bdf8' : sensor.status === 'ACTIVE_POLLING' ? '#34d399' : '#fbbf24';
        
        const sensorIcon = L.divIcon({
          className: 'iot-sensor-marker',
          html: `
            <div style="position: relative; width: 22px; height: 22px;">
              <div class="iot-radar-ring" style="border-color: ${sensorColor};"></div>
              <div style="
                position: absolute; 
                top: 4px; 
                left: 4px; 
                width: 14px; 
                height: 14px; 
                border-radius: 50%; 
                background: ${sensorColor}; 
                border: 2px solid #0b0f19;
                box-shadow: 0 0 10px ${sensorColor};
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              ">
                <div style="width: 4px; height: 4px; background: #fff; border-radius: 50%;"></div>
              </div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const sensorMarker = L.marker(sensor.coordinates, { icon: sensorIcon });
        
        sensorMarker.on('click', () => {
          setSelectedSensor(sensor);
          setSelectedProject(null);
          setActivePanelTab('inspector');
        });

        sensorMarker.bindTooltip(
          `<strong>🛰️ Edge IoT Node: ${sensor.nodeCode}</strong><br/>
           <span style="font-size: 0.72rem; color: #38bdf8;">${sensor.sensorType} (${sensor.status})</span><br/>
           <span style="font-size: 0.7rem; color: #94a3b8;">Protocol: ${sensor.dataProtocol} • Uptime: ${sensor.uptimePercent}%</span>`,
          { direction: 'top' }
        );

        group.addLayer(sensorMarker);
      });
    }

    // 5. Individual AI Project Deployment Nodes
    if (showProjectNodes) {
      filteredProjects.forEach(p => {
        const markerColor = p.status === 'Delayed' ? '#ef4444' : p.stage === 'Deployment' || p.stage === 'Operational' ? '#10b981' : '#fbbf24';
        
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="
            width: 16px; 
            height: 16px; 
            border-radius: 50%; 
            background: ${markerColor}; 
            border: 2px solid #0b0f19;
            box-shadow: 0 0 12px ${markerColor};
            cursor: pointer;
            transition: transform 0.2s ease;
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const marker = L.marker([p.latitude, p.longitude], { icon: customIcon });

        marker.on('click', () => {
          setSelectedProject(p);
          setSelectedSensor(null);
          setActivePanelTab('inspector');
        });

        const popupHtml = `
          <div style="padding: 4px; font-family: 'Inter', sans-serif;">
            <div class="map-tooltip-title">${p.name}</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">
              Code: ${p.projectCode} • Owner: ${p.mdaCode}
            </div>
            <div class="map-tooltip-row">
              <span>Sector:</span> <strong>${p.sector}</strong>
            </div>
            <div class="map-tooltip-row">
              <span>Lifecycle:</span> <strong style="color: #10b981">${p.stage} (${p.status})</strong>
            </div>
            <div class="map-tooltip-row">
              <span>Allocated Budget:</span> <strong>GHS ${p.budget.totalAllocated.toLocaleString('en-US')}</strong>
            </div>
            <div class="map-tooltip-row">
              <span>Compliance:</span> <strong style="color: ${p.compliance.overallGrade === 'Excellent' ? '#10b981' : '#fbbf24'}">${p.compliance.overallGrade}</strong>
            </div>
            <div style="margin-top: 8px; font-size: 0.7rem; color: #64748b; font-style: italic;">
              District: ${p.district}, ${p.region} Region
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, { maxWidth: 290 });
        group.addLayer(marker);
      });
    }
  };

  // Trigger overlay re-render when dependencies change
  useEffect(() => {
    const L = (window as any).L;
    if (mapInstanceRef.current && overlaysGroupRef.current && L) {
      renderMapOverlays(L, mapInstanceRef.current, overlaysGroupRef.current);
    }
  }, [
    filteredProjects, 
    showProjectNodes, 
    showDensityCircles, 
    showEdgeSensors, 
    showSovereignBorder, 
    radiusFilterActive, 
    radiusCenter, 
    radiusKm, 
    telemetryNodes
  ]);

  // Handle Tile Layer Switch
  const handleTileChange = (newType: TileLayerType) => {
    setTileLayerType(newType);
    if (mapInstanceRef.current) {
      updateTileLayer(mapInstanceRef.current, newType);
    }
  };

  // Center Map on a specific region
  const handleRegionCenter = (regionName: string, coords: number[]) => {
    setActiveRegion(regionName);
    const L = (window as any).L;
    if (mapInstanceRef.current && L) {
      mapInstanceRef.current.setView(coords, regionName === 'All' ? 7 : 9, {
        animate: true,
        duration: 1
      });
    }
  };

  // Focus directly on a node
  const handleFocusNode = (lat: number, lng: number) => {
    const L = (window as any).L;
    if (mapInstanceRef.current && L) {
      mapInstanceRef.current.setView([lat, lng], 13, {
        animate: true,
        duration: 1
      });
    }
  };

  // --------------------------------------------------------------------------
  // Real-Time Telemetry Polling Effect
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!liveStreamEnabled) return;

    const interval = setInterval(async () => {
      try {
        const streamResponse = await getLiveTelemetryFeed();
        setTelemetryNodes(streamResponse.data);
        setLastStreamTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Telemetry stream ping error', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [liveStreamEnabled]);

  // --------------------------------------------------------------------------
  // Interactive GIS Spatial API Execution Handlers
  // --------------------------------------------------------------------------
  const executeApiEndpoint = async (endpoint: string) => {
    setApiLoading(true);
    setApiEndpoint(endpoint);
    try {
      let res: GisApiResponse<any>;
      if (endpoint === '/api/v1/gis/geojson/projects') {
        res = await getProjectsGeoJSON(projects);
      } else if (endpoint.startsWith('/api/v1/gis/spatial-query')) {
        res = await querySpatialRadius(projects, radiusCenter[0], radiusCenter[1], radiusKm, selectedSector, selectedStage);
      } else if (endpoint === '/api/v1/gis/regions/density') {
        res = await getRegionalDensityAnalytics(projects, ghanaRegions);
      } else if (endpoint === '/api/v1/gis/telemetry/live') {
        res = await getLiveTelemetryFeed();
      } else if (endpoint === '/api/v1/gis/compliance/sovereign-boundary') {
        res = await auditSovereignBorderCompliance(projects);
      } else {
        res = await getProjectsGeoJSON(projects);
      }
      setApiResponse(res);
    } catch (err) {
      console.error('GIS API call failed', err);
    } finally {
      setApiLoading(false);
    }
  };

  // Load default API response on mount or tab switch
  useEffect(() => {
    if (activePanelTab === 'apiConsole' && !apiResponse) {
      executeApiEndpoint('/api/v1/gis/geojson/projects');
    }
  }, [activePanelTab]);

  // Copy cURL command to clipboard
  const handleCopyCurl = () => {
    const curl = generateCurlSnippet(apiEndpoint);
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  // Copy JSON response to clipboard
  const handleCopyJson = () => {
    if (!apiResponse) return;
    navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Export spatial dataset file download
  const handleExport = (format: 'geojson' | 'csv' | 'kml') => {
    const { data, mimeType, filename } = exportSpatialData(filteredProjects, format);
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportNotice(`Exported ${filteredProjects.length} nodes to ${filename}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div>
      {/* Top Banner / API Status Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        background: 'rgba(255,255,255,0.02)',
        padding: '16px 24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>GIS Spatial Monitoring & Telemetry Map</h2>
            <span className="gis-header-badge gis-badge-api">
              <Database className="w-3 h-3" />
              <span>PostGIS API v1.4</span>
            </span>
            <span className="gis-header-badge gis-badge-live">
              <ShieldCheck className="w-3 h-3" />
              <span>Act 843 Sovereign Verified</span>
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            National geospatial intelligence, PostGIS spatial queries, and real-time edge telemetry across Ghana
          </p>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Panel mode switcher */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setActivePanelTab('telemetry')}
              className={`gis-layer-btn ${activePanelTab === 'telemetry' ? 'active' : ''}`}
              style={{ border: 'none', padding: '6px 12px' }}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetry Registry</span>
            </button>
            <button
              onClick={() => setActivePanelTab('apiConsole')}
              className={`gis-layer-btn ${activePanelTab === 'apiConsole' ? 'active' : ''}`}
              style={{ border: 'none', padding: '6px 12px' }}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Spatial API Console</span>
            </button>
            {selectedProject || selectedSensor ? (
              <button
                onClick={() => setActivePanelTab('inspector')}
                className={`gis-layer-btn ${activePanelTab === 'inspector' ? 'active' : ''}`}
                style={{ border: 'none', padding: '6px 12px' }}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Node Inspector</span>
              </button>
            ) : null}
          </div>

          {/* Export Dropdown Buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => handleExport('geojson')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Export as RFC 7946 GeoJSON FeatureCollection"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>GeoJSON</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Export coordinates to CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport('kml')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Export KML for Google Earth / GIS"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>KML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export notification toast */}
      {exportNotice && (
        <div style={{
          marginBottom: '16px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check className="w-4 h-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Interactive Controls & Spatial Filters Toolbar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Row 1: Search, Sector, Lifecycle Stage, and Live Stream Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 200px' }}>
            <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search code, name, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', height: '36px', fontSize: '0.8rem' }}
            />
          </div>

          {/* Sector Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="form-input"
              style={{ height: '36px', fontSize: '0.78rem', minWidth: '130px' }}
            >
              <option value="All">All Sectors</option>
              <option value="Health">Health</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Transport">Transport</option>
              <option value="Energy">Energy</option>
              <option value="Security">Security</option>
              <option value="Environment">Environment</option>
              <option value="Local Government">Local Government</option>
              <option value="Justice">Justice</option>
            </select>
          </div>

          {/* Lifecycle Stage Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Stage:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="form-input"
              style={{ height: '36px', fontSize: '0.78rem', minWidth: '130px' }}
            >
              <option value="All">All Stages</option>
              <option value="Operational">Operational</option>
              <option value="Deployment">Deployment</option>
              <option value="Pilot">Pilot</option>
              <option value="Development">Development</option>
            </select>
          </div>

          {/* Live Telemetry Auto-stream Switch */}
          <button
            onClick={() => setLiveStreamEnabled(!liveStreamEnabled)}
            className={`gis-layer-btn ${liveStreamEnabled ? 'active' : ''}`}
            style={{ height: '36px' }}
          >
            <Radio className={`w-3.5 h-3.5 ${liveStreamEnabled ? 'animate-pulse text-emerald-400' : 'text-slate-400'}`} />
            <span>Telemetry Stream: {liveStreamEnabled ? 'ON' : 'OFF'}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>({lastStreamTime})</span>
          </button>
        </div>

        {/* Row 2: Basemap Switcher, Overlay Layer Toggles, and Proximity Radius Tool */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '12px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '10px'
        }}>
          
          {/* Basemap Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Basemap:</span>
            <button
              onClick={() => handleTileChange('dark')}
              className={`gis-layer-btn ${tileLayerType === 'dark' ? 'active' : ''}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>CartoDB Dark</span>
            </button>
            <button
              onClick={() => handleTileChange('satellite')}
              className={`gis-layer-btn ${tileLayerType === 'satellite' ? 'active' : ''}`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>ESRI Satellite</span>
            </button>
            <button
              onClick={() => handleTileChange('streets')}
              className={`gis-layer-btn ${tileLayerType === 'streets' ? 'active' : ''}`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Voyager Streets</span>
            </button>
          </div>

          {/* Overlays Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showProjectNodes} 
                onChange={(e) => setShowProjectNodes(e.target.checked)} 
              />
              <span style={{ color: '#10b981' }}>● Projects</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showDensityCircles} 
                onChange={(e) => setShowDensityCircles(e.target.checked)} 
              />
              <span style={{ color: '#fbbf24' }}>◎ Regional Heat</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showEdgeSensors} 
                onChange={(e) => setShowEdgeSensors(e.target.checked)} 
              />
              <span style={{ color: '#38bdf8' }}>🛰️ Edge IoT</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showSovereignBorder} 
                onChange={(e) => setShowSovereignBorder(e.target.checked)} 
              />
              <span style={{ color: '#34d399' }}>🇬🇭 Border Buffer</span>
            </label>
          </div>

          {/* Proximity Radius Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setRadiusFilterActive(!radiusFilterActive)}
              className={`gis-layer-btn ${radiusFilterActive ? 'active' : ''}`}
            >
              <Crosshair className="w-3.5 h-3.5 text-sky-400" />
              <span>Spatial Radius Filter</span>
            </button>

            {radiusFilterActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>{radiusKm} km</span>
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="5"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  style={{ width: '80px', accentColor: '#38bdf8' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Quick Region Jump Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            Focus:
          </span>
          <button 
            onClick={() => handleRegionCenter('All', [7.9465, -1.0232])}
            className={`btn ${activeRegion === 'All' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
          >
            National View
          </button>
          <button 
            onClick={() => handleRegionCenter('Greater Accra', [5.6037, -0.1870])}
            className={`btn ${activeRegion === 'Greater Accra' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
          >
            Greater Accra
          </button>
          <button 
            onClick={() => handleRegionCenter('Ashanti', [6.6922, -1.6163])}
            className={`btn ${activeRegion === 'Ashanti' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
          >
            Ashanti (Kumasi)
          </button>
          <button 
            onClick={() => handleRegionCenter('Eastern', [6.3000, 0.0500])}
            className={`btn ${activeRegion === 'Eastern' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
          >
            Eastern (Akosombo)
          </button>
          <button 
            onClick={() => handleRegionCenter('Northern', [9.4075, -0.8533])}
            className={`btn ${activeRegion === 'Northern' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
          >
            Northern (Tamale)
          </button>
          <button 
            onClick={() => handleRegionCenter('Western', [4.9340, -1.7580])}
            className={`btn ${activeRegion === 'Western' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
          >
            Western (Takoradi)
          </button>
          <button 
            onClick={() => handleRegionCenter('Western North', [6.2041, -1.7583])}
            className={`btn ${activeRegion === 'Western North' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
          >
            Western North (COCOBOD)
          </button>
          <button 
            onClick={() => handleRegionCenter('Upper East', [10.7856, -0.8514])}
            className={`btn ${activeRegion === 'Upper East' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
          >
            Upper East (Bolga)
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Right-Hand Multi-Function Side Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.8fr 1.4fr', gap: '20px', alignItems: 'stretch' }}>
        
        {/* Left: Leaflet Map Container */}
        <div className="glass-card map-card" style={{ padding: '12px', minHeight: '580px', display: 'flex', flexDirection: 'column' }}>
          <div ref={mapContainerRef} id="leaflet-map-wrapper" style={{ width: '100%', height: '560px', borderRadius: '8px', zIndex: 1 }}></div>

          {/* Under-map status bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>Filtered Nodes: <strong style={{ color: '#10b981' }}>{filteredProjects.length}</strong></span>
              <span>Active IoT Sensors: <strong style={{ color: '#38bdf8' }}>{telemetryNodes.length}</strong></span>
              <span>Regional Coverage: <strong style={{ color: '#fbbf24' }}>16 Administrative Regions</strong></span>
            </div>
            <div>
              <span>SRS: <strong>WGS 84 (EPSG:4326)</strong> • Tile Engine: <strong>Leaflet 1.9</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Multi-Mode Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '580px', maxHeight: '620px', overflowY: 'auto' }}>
          
          {/* TAB 1: Telemetry & Regional Registry */}
          {activePanelTab === 'telemetry' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>National Spatial Telemetry</span>
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  M&E alignment, regional project density & sensor status
                </p>
              </div>

              {/* M&E Dashboard KPI Card */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: 'rgba(16,185,129,0.03)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(16,185,129,0.2)',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ghana-emerald)' }}>
                  Active Spatial KPI Overview
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '2px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>Average Readiness</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{avgReadiness}%</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>Active / Delayed</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{activeProjectsCount} / {delayedProjectsCount}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '2px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Approved Portfolio: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formatNumberToWords(totalBudget)} GHS</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Utilized Funds: </span>
                    <strong style={{ color: 'var(--ghana-emerald)' }}>{formatNumberToWords(totalUtilized)} GHS</strong>
                  </div>
                </div>
              </div>

              {/* Node Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                  Map Legend
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.74rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                    <span>Operational Node</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }} />
                    <span>Pilot / Dev Stage</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
                    <span>Critical Delayed</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }} />
                    <span>Live IoT Edge Sensor</span>
                  </div>
                </div>
              </div>

              {/* Regional Registry Breakdown (All 16 Regions) */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Regional Density Registry</span>
                  <span style={{ color: 'var(--text-muted)' }}>16 Regions</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {ghanaRegions.map((reg) => {
                    const count = regionProjectCounts[reg.name] || 0;
                    const isFocused = activeRegion === reg.name;

                    return (
                      <div 
                        key={reg.name}
                        onClick={() => handleRegionCenter(reg.name, reg.center)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: isFocused ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.015)',
                          border: '1px solid',
                          borderColor: isFocused ? 'rgba(16,185,129,0.4)' : 'var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{reg.name}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {count > 0 ? `${count} Active Project${count > 1 ? 's' : ''}` : 'Baseline Region'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`badge ${count >= 2 ? 'badge-success' : count === 1 ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                            {count}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Interactive GIS Spatial API Console */}
          {activePanelTab === 'apiConsole' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>Sovereign GIS Spatial API Console</span>
                </h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Live REST & GeoJSON RFC 7946 query executor
                </p>
              </div>

              {/* Endpoint Selector Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Select API Endpoint:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    onClick={() => executeApiEndpoint('/api/v1/gis/geojson/projects')}
                    className={`gis-layer-btn ${apiEndpoint === '/api/v1/gis/geojson/projects' ? 'active' : ''}`}
                    style={{ justifyContent: 'space-between', padding: '6px 10px' }}
                  >
                    <span><strong style={{ color: '#10b981' }}>GET</strong> /api/v1/gis/geojson/projects</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>GeoJSON</span>
                  </button>

                  <button
                    onClick={() => executeApiEndpoint(`/api/v1/gis/spatial-query?lat=${radiusCenter[0]}&lng=${radiusCenter[1]}&radiusKm=${radiusKm}`)}
                    className={`gis-layer-btn ${apiEndpoint.startsWith('/api/v1/gis/spatial-query') ? 'active' : ''}`}
                    style={{ justifyContent: 'space-between', padding: '6px 10px' }}
                  >
                    <span><strong style={{ color: '#38bdf8' }}>GET</strong> /api/v1/gis/spatial-query</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Radius: {radiusKm}km</span>
                  </button>

                  <button
                    onClick={() => executeApiEndpoint('/api/v1/gis/regions/density')}
                    className={`gis-layer-btn ${apiEndpoint === '/api/v1/gis/regions/density' ? 'active' : ''}`}
                    style={{ justifyContent: 'space-between', padding: '6px 10px' }}
                  >
                    <span><strong style={{ color: '#fbbf24' }}>GET</strong> /api/v1/gis/regions/density</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>16 Regions</span>
                  </button>

                  <button
                    onClick={() => executeApiEndpoint('/api/v1/gis/telemetry/live')}
                    className={`gis-layer-btn ${apiEndpoint === '/api/v1/gis/telemetry/live' ? 'active' : ''}`}
                    style={{ justifyContent: 'space-between', padding: '6px 10px' }}
                  >
                    <span><strong style={{ color: '#38bdf8' }}>GET</strong> /api/v1/gis/telemetry/live</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>IoT Telemetry</span>
                  </button>

                  <button
                    onClick={() => executeApiEndpoint('/api/v1/gis/compliance/sovereign-boundary')}
                    className={`gis-layer-btn ${apiEndpoint === '/api/v1/gis/compliance/sovereign-boundary' ? 'active' : ''}`}
                    style={{ justifyContent: 'space-between', padding: '6px 10px' }}
                  >
                    <span><strong style={{ color: '#34d399' }}>GET</strong> /api/v1/gis/compliance/sovereign-boundary</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Act 843</span>
                  </button>
                </div>
              </div>

              {/* cURL Snippet Box */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    cURL Command:
                  </span>
                  <button
                    onClick={handleCopyCurl}
                    style={{ background: 'none', border: 'none', color: '#fbbf24', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <div className="api-curl-box">
                  <code>{generateCurlSnippet(apiEndpoint)}</code>
                </div>
              </div>

              {/* Response Status Bar */}
              {apiResponse && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '10px',
                  fontSize: '0.72rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>HTTP {apiResponse.status} OK</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Latency: <strong style={{ color: '#10b981' }}>{apiResponse.latencyMs}ms</strong></span>
                  </div>
                  <button
                    onClick={handleCopyJson}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
              )}

              {/* JSON Terminal Output */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {apiLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', gap: '8px', color: 'var(--text-muted)' }}>
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                    <span>Executing GIS query...</span>
                  </div>
                ) : (
                  <pre className="api-terminal-view">
                    {apiResponse ? JSON.stringify(apiResponse, null, 2) : '// Click an endpoint above to execute query'}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Node / Sensor Inspector */}
          {activePanelTab === 'inspector' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crosshair className="w-4 h-4 text-emerald-400" />
                  <span>Spatial Node Inspector</span>
                </h3>
                <button
                  onClick={() => { setSelectedProject(null); setSelectedSensor(null); setActivePanelTab('telemetry'); }}
                  className="btn btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                >
                  Close
                </button>
              </div>

              {selectedProject && (
                <div className="inspector-card animated-fade-in" style={{ flex: 1, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{selectedProject.projectCode}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '6px' }}>{selectedProject.name}</h4>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {selectedProject.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>Latitude / Longitude</span>
                      <strong style={{ fontSize: '0.8rem', color: '#38bdf8' }}>{selectedProject.latitude}, {selectedProject.longitude}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>Digital Address (PostGPS)</span>
                      <strong style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                        {selectedProject.region.slice(0, 2).toUpperCase()}-{(selectedProject.latitude * 100).toFixed(0).slice(0, 3)}-{(Math.abs(selectedProject.longitude) * 100).toFixed(0).slice(0, 4)}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(16,185,129,0.05)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Managing Ministry:</span>
                      <strong>{selectedProject.mda}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Sector / Category:</span>
                      <strong>{selectedProject.sector} ({selectedProject.category})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Lifecycle Status:</span>
                      <strong style={{ color: '#10b981' }}>{selectedProject.stage} ({selectedProject.status})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Allocated:</span>
                      <strong>GHS {selectedProject.budget.totalAllocated.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Act 843 Sovereignty:</span>
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Ghana Territory
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleFocusNode(selectedProject.latitude, selectedProject.longitude)}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '8px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Focus on Map</span>
                    </button>
                    <button
                      onClick={() => {
                        setRadiusCenter([selectedProject.latitude, selectedProject.longitude]);
                        setRadiusFilterActive(true);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '8px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Set as center for radius search"
                    >
                      <Sliders className="w-3.5 h-3.5 text-sky-400" />
                      <span>Set as Hub</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedSensor && (
                <div className="inspector-card animated-fade-in" style={{ flex: 1, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{selectedSensor.nodeCode}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '6px', color: '#38bdf8' }}>{selectedSensor.name}</h4>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(56,189,248,0.06)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Project Link:</span>
                      <strong>{selectedSensor.projectName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Sensor Array:</span>
                      <strong style={{ color: '#38bdf8' }}>{selectedSensor.sensorType}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Telemetry Status:</span>
                      <span className="badge badge-success" style={{ fontSize: '0.62rem' }}>{selectedSensor.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Data Protocol:</span>
                      <strong>{selectedSensor.dataProtocol}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Uptime Reliability:</span>
                      <strong style={{ color: '#10b981' }}>{selectedSensor.uptimePercent}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Battery Status:</span>
                      <strong style={{ color: selectedSensor.batteryLevelPercent > 80 ? '#10b981' : '#fbbf24' }}>
                        {selectedSensor.batteryLevelPercent}% (Solar Backup)
                      </strong>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Live Telemetry Reading:</span>
                    <code style={{ fontSize: '0.74rem', color: '#a5f3fc' }}>{selectedSensor.telemetryReading}</code>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => handleFocusNode(selectedSensor.coordinates[0], selectedSensor.coordinates[1])}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '8px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Focus on Map</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
