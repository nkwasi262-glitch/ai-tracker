import React, { useEffect, useRef, useState } from 'react';
import { Layers } from 'lucide-react';
import { AIProject, ghanaRegions, formatNumberToWords } from '../data/sampleProjects';

interface GISGeospatialProps {
  projects: AIProject[];
}

export const GISGeospatial: React.FC<GISGeospatialProps> = ({ projects }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeRegion, setActiveRegion] = useState<string>('All');

  // Calculate live M&E registry portfolio stats
  const totalProjectsCount = projects.length;
  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
  const delayedProjectsCount = projects.filter(p => p.status === 'Delayed').length;
  const totalBudget = projects.reduce((acc, p) => acc + p.budget.totalAllocated, 0);
  const totalUtilized = projects.reduce((acc, p) => acc + p.budget.utilized, 0);
  const avgReadiness = totalProjectsCount > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.readinessScore, 0) / totalProjectsCount) 
    : 0;

  useEffect(() => {
    // 1. Check if global Leaflet instance L exists
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    // 2. Destroys existing instance to prevent duplicate mounting errors
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // 3. Mount Leaflet centered on central coordinates of Ghana
    const map = L.map(mapContainerRef.current, {
      center: [7.9465, -1.0232], // Central point of Ghana
      zoom: 7,
      zoomControl: true
    });

    mapInstanceRef.current = map;

    // 4. Add CartoDB Dark Matter tile layer for an elegant, premium dark-mode aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 20
    }).addTo(map);

    // 5. Draw dynamic Region Density/Heat Circle markers
    ghanaRegions.forEach(reg => {
      const circleColor = reg.projectCount > 1 ? '#10b981' : '#fbbf24';
      const circle = L.circle(reg.center, {
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.12,
        radius: 40000 + (reg.projectCount * 12000) // dynamic radius based on project count
      }).addTo(map);

      circle.bindTooltip(`<strong>${reg.name} Region</strong><br/>Density: ${reg.projectCount} Active Projects`, {
        permanent: false,
        direction: 'top'
      });
    });

    // 6. Draw individual Project Node markers
    projects.forEach(p => {
      // Choose marker icon color based on project compliance and stage
      const markerColor = p.status === 'Delayed' ? '#ef4444' : p.stage === 'Deployment' ? '#10b981' : '#fbbf24';

      // Create a gorgeous custom HTML node marker to represent the project
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
          width: 14px; 
          height: 14px; 
          border-radius: 50%; 
          background: ${markerColor}; 
          border: 2px solid #0b0f19;
          box-shadow: 0 0 10px ${markerColor};
          animation: pulseBorder 1.8s infinite;
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: customIcon }).addTo(map);

      // Create stunning, rich custom HTML tooltips matching the dashboard
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
            <span>Lifecycle:</span> <strong style="color: #10b981">${p.stage}</strong>
          </div>
          <div class="map-tooltip-row">
            <span>Allocated Budget:</span> <strong>${formatNumberToWords(p.budget.totalAllocated)} GHS (GHS ${p.budget.totalAllocated.toLocaleString('en-US')})</strong>
          </div>
          <div class="map-tooltip-row">
            <span>Utilized Funds:</span> <strong>${formatNumberToWords(p.budget.utilized)} GHS (GHS ${p.budget.utilized.toLocaleString('en-US')})</strong>
          </div>
          <div class="map-tooltip-row">
            <span>Compliance:</span> <strong style="color: ${p.compliance.overallGrade === 'Excellent' ? '#10b981' : '#fbbf24'}">${p.compliance.overallGrade}</strong>
          </div>
          <div style="margin-top: 8px; font-size: 0.7rem; color: #64748b; font-style: italic;">
            District: ${p.district}, ${p.region}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });
    });

    return () => {
      // Cleanups on unmount to avoid leakage
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [projects]);

  // Allows centering map on a specific region
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

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        background: 'rgba(255,255,255,0.02)',
        padding: '16px 24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>GIS Spatial Monitoring Map</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Geospatial density and deployment node coordinates across Ghana
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleRegionCenter('All', [7.9465, -1.0232])}
            className={`btn ${activeRegion === 'All' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          >
            National View
          </button>
          <button 
            onClick={() => handleRegionCenter('Greater Accra', [5.6037, -0.1870])}
            className={`btn ${activeRegion === 'Greater Accra' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          >
            Greater Accra
          </button>
          <button 
            onClick={() => handleRegionCenter('Ashanti', [6.6922, -1.6163])}
            className={`btn ${activeRegion === 'Ashanti' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          >
            Ashanti
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3.5fr 1.2fr', gap: '20px', alignItems: 'stretch' }}>
        
        {/* Leaflet map Container wrapper */}
        <div className="glass-card map-card" style={{ padding: '16px', minHeight: '520px' }}>
          <div ref={mapContainerRef} id="leaflet-map-wrapper" style={{ width: '100%', height: '100%', borderRadius: '8px' }}></div>
        </div>

        {/* Legend and Regional project breakdown panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '520px', maxHeight: '560px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Spatial Telemetry</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Regional density weights and coordinate statistics.
            </p>
          </div>

          {/* M&E Dashboard Alignment telemetry */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(16,185,129,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ghana-emerald)' }}>
              Registry M&E KPI Linkage
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>NARI Score</span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{avgReadiness}%</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>Active/Delayed</span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{activeProjectsCount}/{delayedProjectsCount}</strong>
              </div>
            </div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '4px' }}>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontWeight: 600 }}>Total Approved Portfolio:</span>
                <span style={{ wordBreak: 'break-word', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatNumberToWords(totalBudget)} GHS (GHS {totalBudget.toLocaleString('en-US')})
                </span>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontWeight: 600 }}>Total Utilized Portfolio:</span>
                <span style={{ wordBreak: 'break-word', fontWeight: 700, color: 'var(--ghana-emerald)' }}>
                  {formatNumberToWords(totalUtilized)} GHS (GHS {totalUtilized.toLocaleString('en-US')})
                </span>
              </div>
            </div>
          </div>

          {/* Map legend items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Node Legend
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span>Operational / Deployment Node</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }} />
              <span>Pilot / Development Stage</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
              <span>Critical Delayed Node</span>
            </div>
          </div>

          {/* Regional projects counts */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Regional Density Registry
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ghanaRegions.map((reg) => (
                <div 
                  key={reg.name}
                  onClick={() => handleRegionCenter(reg.name, reg.center)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: activeRegion === reg.name ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.015)',
                    border: '1px solid',
                    borderColor: activeRegion === reg.name ? 'rgba(16,185,129,0.3)' : 'var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{reg.name}</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Click to focal center</div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                    {reg.projectCount} {reg.projectCount > 1 ? 'Projects' : 'Project'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
