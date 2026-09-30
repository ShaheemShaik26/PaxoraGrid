import React, { useState, useMemo, useRef, useEffect } from 'react';
import L from 'leaflet';
import { PHCFacility, TransferRecommendation, Drug } from '../types';
import { ForecastResult } from '../services/forecastingEngine';
import { 
  Navigation, 
  Building2, 
  Truck, 
  Layers, 
  Compass,
  AlertTriangle,
  CheckCircle2,
  Search,
  X,
  MapPin,
  Globe2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { ALL_INDIA_STATES } from '../data/indiaStates';

interface MapViewProps {
  facilities: PHCFacility[];
  transfers: TransferRecommendation[];
  forecasts: Map<string, ForecastResult>;
  drugs: Drug[];
  selectedFacilityId: string | null;
  onSelectFacility: (facilityId: string) => void;
  selectedState: string;
}

export const MapView: React.FC<MapViewProps> = ({
  facilities,
  transfers,
  forecasts,
  drugs,
  selectedFacilityId,
  onSelectFacility,
  selectedState
}) => {
  // Map Engine: Google Maps, Real India GIS Map, Vector Subcontinent Grid
  const [mapEngine, setMapEngine] = useState<'GOOGLE_MAPS' | 'REAL_GIS_MAP' | 'VECTOR_MAP'>('GOOGLE_MAPS');
  const [googleMapType, setGoogleMapType] = useState<'m' | 'k' | 'p'>('m'); // m = roadmap, k = satellite, p = terrain
  const [viewMode, setViewMode] = useState<'GIS_MAP' | 'CONDUITS' | 'RESOURCE_LEDGER'>('GIS_MAP');
  const [hoveredFacility, setHoveredFacility] = useState<PHCFacility | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<any | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Refs for Leaflet
  const leafletContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnlyCritical, setShowOnlyCritical] = useState<boolean>(false);
  const [showOnlyWarehouses, setShowOnlyWarehouses] = useState<boolean>(false);
  const [showTransferConduits, setShowTransferConduits] = useState<boolean>(true);

  // Status calculator
  const getFacilityWorstStatus = (facilityId: string): 'CRITICAL' | 'WARNING' | 'HEALTHY' => {
    let worst: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 'HEALTHY';
    for (const drug of drugs) {
      const fc = forecasts.get(`${facilityId}-${drug.id}`);
      if (fc) {
        if (fc.status === 'CRITICAL') return 'CRITICAL';
        if (fc.status === 'WARNING') worst = 'WARNING';
      }
    }
    return worst;
  };

  // Filter facilities by state, search, and user toggle filters
  const displayFacilities = useMemo(() => {
    return facilities.filter(f => {
      if (selectedState !== 'ALL' && f.state !== selectedState) return false;
      if (showOnlyWarehouses && f.type !== 'DISTRICT_WAREHOUSE') return false;

      const status = getFacilityWorstStatus(f.id);
      if (showOnlyCritical && status !== 'CRITICAL') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = f.name.toLowerCase().includes(q);
        const matchDistrict = f.district.toLowerCase().includes(q);
        const matchState = f.state.toLowerCase().includes(q);
        if (!matchName && !matchDistrict && !matchState) return false;
      }

      return true;
    });
  }, [facilities, selectedState, showOnlyWarehouses, showOnlyCritical, searchQuery, drugs, forecasts]);

  const activeTransfers = transfers.filter(t => t.status === 'PROPOSED' || t.status === 'APPROVED');
  const selectedFacilityObj = facilities.find(f => f.id === selectedFacilityId);
  const mapQuery = selectedFacilityObj
    ? `${selectedFacilityObj.name}, ${selectedFacilityObj.district}, ${selectedFacilityObj.state}, India`
    : selectedState !== 'ALL'
      ? `${selectedState}, India Primary Health Centre`
      : 'India Primary Health Centres and Government Hospitals';
  const mapZoom = selectedFacilityObj ? 14 : selectedState !== 'ALL' ? 7 : 5;
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  // Maps Embed API supports roadmap and satellite; keep the existing terrain fallback.
  const googleMapsEmbedUrl = mapsApiKey && googleMapType !== 'p'
    ? `https://www.google.com/maps/embed/v1/search?${new URLSearchParams({
      key: mapsApiKey,
      q: mapQuery,
      maptype: googleMapType === 'k' ? 'satellite' : 'roadmap',
      zoom: String(mapZoom)
    })}`
    : `https://maps.google.com/maps?${new URLSearchParams({
      q: mapQuery,
      t: googleMapType,
      z: String(mapZoom),
      ie: 'UTF8',
      iwloc: '',
      output: 'embed'
    })}`;

  // Key metrics
  const criticalCount = displayFacilities.filter(f => getFacilityWorstStatus(f.id) === 'CRITICAL').length;
  const warehouseCount = displayFacilities.filter(f => f.type === 'DISTRICT_WAREHOUSE').length;

  // ==========================================
  // LEAFLET REAL GIS MAP (OpenStreetMap & CartoDB)
  // ==========================================
  useEffect(() => {
    if (mapEngine !== 'REAL_GIS_MAP' || !leafletContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(leafletContainerRef.current, {
        center: [22.3511, 78.6677], // Center of India
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      leafletMapRef.current = map;
      leafletLayerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = leafletMapRef.current;
    const layerGroup = leafletLayerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const bounds: [number, number][] = [];

    // Add Facility Markers
    displayFacilities.forEach(f => {
      const status = getFacilityWorstStatus(f.id);
      const isWarehouse = f.type === 'DISTRICT_WAREHOUSE';
      const isSelected = selectedFacilityId === f.id;
      
      let markerColor = '#10b981'; // Green
      if (isWarehouse) markerColor = '#3b82f6'; // Blue
      else if (status === 'CRITICAL') markerColor = '#ef4444'; // Red
      else if (status === 'WARNING') markerColor = '#f59e0b'; // Amber

      bounds.push([f.lat, f.lng]);

      const size = isWarehouse ? 22 : status === 'CRITICAL' ? 24 : 18;
      const html = `
        <div style="
          width: ${size}px; 
          height: ${size}px; 
          background: ${markerColor}; 
          border: 2px solid ${isSelected ? '#38bdf8' : '#ffffff'}; 
          border-radius: ${isWarehouse ? '4px' : '50%'}; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 9px;
          cursor: pointer;
        ">
          ${isWarehouse ? 'WH' : status === 'CRITICAL' ? '!' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: 'custom-gis-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker([f.lat, f.lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 200px; color: #0f172a;">
          <div style="font-weight: 800; font-size: 13px; margin-bottom: 2px;">${f.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${f.type} • ${f.district}, ${f.state}</div>
          <div style="display: flex; gap: 6px; font-size: 11px; margin-bottom: 6px;">
            <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;"><strong>Beds:</strong> ${f.occupiedBeds}/${f.totalBeds}</span>
            <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;"><strong>Staff:</strong> ${f.presentStaff}/${f.totalStaff}</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: ${markerColor};">
            Stock Status: ${status}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectFacility(f.id);
      });

      marker.addTo(layerGroup);
    });

    // Add Transfer Conduits
    if (showTransferConduits) {
      activeTransfers.forEach(t => {
        const src = facilities.find(f => f.id === t.sourcePhcId);
        const tgt = facilities.find(f => f.id === t.targetPhcId);
        if (src && tgt) {
          const color = t.status === 'APPROVED' ? '#10b981' : '#f59e0b';
          const line = L.polyline([[src.lat, src.lng], [tgt.lat, tgt.lng]], {
            color,
            weight: 2.5,
            opacity: 0.8,
            dashArray: t.status === 'APPROVED' ? undefined : '5, 5'
          });
          line.bindTooltip(`${t.quantity} units in transit (${t.distanceKm} km)`, { sticky: true });
          line.addTo(layerGroup);
        }
      });
    }

    if (selectedState !== 'ALL' && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [mapEngine, displayFacilities, showTransferConduits, activeTransfers, selectedState, selectedFacilityId]);

  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        leafletLayerGroupRef.current = null;
      }
    };
  }, []);

  // ==========================================
  // VECTOR MAP PROJECTION DATA
  // ==========================================
  const width = 1000;
  const height = 540;
  const isAllIndia = selectedState === 'ALL';

  const stateClusters = useMemo(() => {
    if (!isAllIndia) return [];

    const map = new Map<string, any>();
    for (const s of ALL_INDIA_STATES) {
      map.set(s.id, {
        stateId: s.id,
        stateName: s.name,
        lat: s.lat,
        lng: s.lng,
        facilities: [],
        criticalCount: 0,
        warningCount: 0,
        healthyCount: 0,
        totalBeds: 0,
        occupiedBeds: 0,
        totalStaff: 0,
        presentStaff: 0
      });
    }

    for (const f of displayFacilities) {
      const entry = map.get(f.state);
      if (entry) {
        entry.facilities.push(f);
        const status = getFacilityWorstStatus(f.id);
        if (status === 'CRITICAL') entry.criticalCount++;
        else if (status === 'WARNING') entry.warningCount++;
        else entry.healthyCount++;

        entry.totalBeds += f.totalBeds;
        entry.occupiedBeds += f.occupiedBeds;
        entry.totalStaff += f.totalStaff;
        entry.presentStaff += f.presentStaff;
      }
    }

    const minLat = 8.0;
    const maxLat = 35.5;
    const minLng = 68.5;
    const maxLng = 96.5;

    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    const paddingX = 90;
    const paddingY = 70;

    return Array.from(map.values())
      .filter(item => item.facilities.length > 0)
      .map(item => {
        const normX = (item.lng - minLng) / lngRange;
        const normY = (item.lat - minLat) / latRange;

        const x = Math.max(65, Math.min(width - 65, paddingX + normX * (width - paddingX * 2)));
        const y = Math.max(55, Math.min(height - 55, height - paddingY - normY * (height - paddingY * 2)));

        const worstStatus: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 
          item.criticalCount > 0 ? 'CRITICAL' : item.warningCount > 0 ? 'WARNING' : 'HEALTHY';

        return {
          ...item,
          x,
          y,
          worstStatus
        };
      })
      .sort((a, b) => {
        const score = (st: string) => st === 'CRITICAL' ? 3 : st === 'WARNING' ? 2 : 1;
        return score(a.worstStatus) - score(b.worstStatus);
      });
  }, [displayFacilities, isAllIndia, drugs, forecasts]);

  const projectedFacilityNodes = useMemo(() => {
    if (displayFacilities.length === 0) return [];

    let minLat: number;
    let maxLat: number;
    let minLng: number;
    let maxLng: number;

    if (isAllIndia) {
      minLat = 8.0;
      maxLat = 35.5;
      minLng = 68.5;
      maxLng = 96.5;
    } else {
      const lats = displayFacilities.map(f => f.lat);
      const lngs = displayFacilities.map(f => f.lng);
      minLat = Math.min(...lats);
      maxLat = Math.max(...lats);
      minLng = Math.min(...lngs);
      maxLng = Math.max(...lngs);

      const padLat = Math.max(0.3, (maxLat - minLat) * 0.25);
      const padLng = Math.max(0.3, (maxLng - minLng) * 0.25);
      minLat -= padLat;
      maxLat += padLat;
      minLng -= padLng;
      maxLng += padLng;
    }

    const latRange = Math.max(0.2, maxLat - minLat);
    const lngRange = Math.max(0.2, maxLng - minLng);
    const paddingX = 80;
    const paddingY = 60;

    const nodes = displayFacilities.map((facility) => {
      const normX = (facility.lng - minLng) / lngRange;
      const normY = (facility.lat - minLat) / latRange;

      let rawX = paddingX + normX * (width - paddingX * 2);
      let rawY = height - paddingY - normY * (height - paddingY * 2);

      const boundedX = Math.max(50, Math.min(width - 50, rawX));
      const boundedY = Math.max(40, Math.min(height - 40, rawY));

      return {
        facility,
        x: boundedX,
        y: boundedY,
        status: getFacilityWorstStatus(facility.id)
      };
    });

    return nodes.sort((a, b) => {
      const rank = (status: string, type: string) => {
        if (status === 'CRITICAL') return 4;
        if (type === 'DISTRICT_WAREHOUSE') return 3;
        if (status === 'WARNING') return 2;
        return 1;
      };
      return rank(a.status, a.facility.type) - rank(b.status, b.facility.type);
    });
  }, [displayFacilities, isAllIndia, drugs, forecasts]);

  const renderAsClusters = isAllIndia && zoomLevel < 1.4;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-0">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                National Health Resource & Logistics Grid
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {selectedState === 'ALL' ? 'All India National View' : selectedState}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {displayFacilities.length} Facilities Monitored • {criticalCount} Critical Stockouts • {warehouseCount} Regional Depots
            </p>
          </div>
        </div>

        {/* Multi-Engine Selector (Google Maps, Real GIS, Vector Grid) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl p-1 text-xs">
            <button
              onClick={() => setMapEngine('GOOGLE_MAPS')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mapEngine === 'GOOGLE_MAPS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => setMapEngine('REAL_GIS_MAP')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mapEngine === 'REAL_GIS_MAP' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Real India GIS</span>
            </button>
            <button
              onClick={() => setMapEngine('VECTOR_MAP')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mapEngine === 'VECTOR_MAP' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Vector Grid</span>
            </button>
          </div>

          {/* Primary View Switcher */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('GIS_MAP')}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'GIS_MAP' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('CONDUITS')}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'CONDUITS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Redistribution</span>
            </button>
            <button
              onClick={() => setViewMode('RESOURCE_LEDGER')}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'RESOURCE_LEDGER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* UX Controls Bar (Search, Critical Filters, Warehouse Toggle) */}
      <div className="p-3.5 px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search city, district, or facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowOnlyCritical(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showOnlyCritical
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${showOnlyCritical ? 'text-white' : 'text-rose-600'}`} />
            <span>Show Only Critical ({criticalCount})</span>
          </button>

          <button
            onClick={() => setShowOnlyWarehouses(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showOnlyWarehouses
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${showOnlyWarehouses ? 'text-white' : 'text-blue-600'}`} />
            <span>Depots Only</span>
          </button>

          <button
            onClick={() => setShowTransferConduits(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showTransferConduits
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Truck className={`w-3.5 h-3.5 ${showTransferConduits ? 'text-white' : 'text-amber-600'}`} />
            <span>Transfer Routes</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: Interactive Clean GIS Map */}
      {viewMode === 'GIS_MAP' && (
        <div className="relative w-full bg-slate-950 select-none overflow-hidden min-h-[500px]">
          {/* ENGINE 1: Official Google Maps */}
          {mapEngine === 'GOOGLE_MAPS' && (
            <div className="relative w-full h-[540px] bg-slate-950 flex flex-col">
              {/* Google Maps Controls Overlay */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1.5 backdrop-blur-md shadow-xl text-xs">
                <div className="flex items-center gap-1 px-2 text-slate-300 font-bold border-r border-slate-700">
                  <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Maps</span>
                </div>
                <button
                  onClick={() => setGoogleMapType('m')}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    googleMapType === 'm' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Roadmap
                </button>
                <button
                  onClick={() => setGoogleMapType('k')}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    googleMapType === 'k' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setGoogleMapType('p')}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    googleMapType === 'p' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Terrain
                </button>

                {selectedFacilityObj && (
                  <span className="text-[11px] text-emerald-400 font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 truncate max-w-[200px]">
                    📍 {selectedFacilityObj.name}
                  </span>
                )}
              </div>

              {/* Official Google Maps Live Embed */}
              <iframe
                title="Official Google Maps India"
                src={googleMapsEmbedUrl}
                className="w-full h-full border-0 select-auto"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />

              {/* Facility Quick Jump Drawer */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2 overflow-x-auto p-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl backdrop-blur-md shadow-xl no-scrollbar">
                <span className="text-[11px] font-bold text-slate-400 shrink-0 pl-1">Jump to PHC:</span>
                {displayFacilities.slice(0, 12).map(f => {
                  const isSelected = selectedFacilityId === f.id;
                  const status = getFacilityWorstStatus(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => onSelectFacility(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        status === 'CRITICAL' ? 'bg-rose-500' : status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <span className="truncate max-w-[130px]">{f.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ENGINE 2: Real India GIS Map (Powered by OpenStreetMap & CartoDB) */}
          {mapEngine === 'REAL_GIS_MAP' && (
            <div className="relative w-full h-[520px]">
              <div ref={leafletContainerRef} className="w-full h-full z-10" />

              {/* Legend Overlay */}
              <div className="absolute bottom-5 right-5 z-20 flex items-center gap-3 bg-white/95 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="font-bold text-rose-700">Critical (&lt;7d)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-amber-800">Warning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-emerald-800">Healthy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                  <span className="text-blue-800">Warehouse</span>
                </div>
              </div>
            </div>
          )}

          {/* ENGINE 3: India Subcontinent Vector Map */}
          {mapEngine === 'VECTOR_MAP' && (
            <div 
              className="relative w-full h-full"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPos({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-25 pointer-events-none"></div>

              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto min-h-[480px] max-h-[540px]"
                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
              >
                <defs>
                  <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
                  </filter>
                  <linearGradient id="indiaFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* ACCURATE INDIA GEOGRAPHIC OUTLINE VECTOR PATH */}
                {selectedState === 'ALL' && (
                  <g className="pointer-events-none select-none">
                    <path
                      d="M 330 65 
                         C 350 40, 390 40, 420 55 
                         C 445 70, 460 95, 450 115 
                         C 435 130, 470 145, 510 150 
                         C 560 160, 620 165, 680 170 
                         C 740 175, 780 180, 810 165 
                         C 840 155, 870 170, 875 195 
                         C 880 220, 860 250, 835 255 
                         C 805 260, 770 240, 740 250 
                         C 710 260, 680 280, 650 285 
                         C 630 300, 625 330, 615 365 
                         C 600 410, 560 460, 530 495 
                         C 525 502, 515 505, 510 495 
                         C 480 440, 450 380, 435 340 
                         C 420 300, 380 290, 345 285 
                         C 310 280, 275 270, 245 250 
                         C 225 235, 230 205, 255 195 
                         C 280 185, 305 180, 315 155 
                         C 325 125, 310 90, 330 65 Z"
                      fill="url(#indiaFill)"
                      stroke="#334155"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      opacity="0.85"
                    />

                    <text
                      x="500"
                      y="290"
                      textAnchor="middle"
                      fontSize="52"
                      fontWeight="900"
                      fill="#334155"
                      opacity="0.35"
                      letterSpacing="0.3em"
                    >
                      INDIA
                    </text>
                  </g>
                )}

                {/* Inter-District Redistribution Conduits */}
                {showTransferConduits && activeTransfers.map(t => {
                  const srcNode = projectedFacilityNodes.find(n => n.facility.id === t.sourcePhcId);
                  const tgtNode = projectedFacilityNodes.find(n => n.facility.id === t.targetPhcId);
                  if (!srcNode || !tgtNode) return null;

                  const midX = (srcNode.x + tgtNode.x) / 2;
                  const midY = (srcNode.y + tgtNode.y) / 2 - 20;

                  return (
                    <g key={t.id} className="opacity-80 pointer-events-none">
                      <path
                        d={`M ${srcNode.x} ${srcNode.y} Q ${midX} ${midY} ${tgtNode.x} ${tgtNode.y}`}
                        fill="none"
                        stroke={t.status === 'APPROVED' ? '#10b981' : '#f59e0b'}
                        strokeWidth="2"
                        strokeDasharray={t.status === 'APPROVED' ? 'none' : '5 4'}
                      />
                      <circle cx={midX} cy={midY} r="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                    </g>
                  );
                })}

                {/* State Clusters */}
                {renderAsClusters && stateClusters.map((cluster) => {
                  const isCritical = cluster.criticalCount > 0;
                  const isWarning = cluster.warningCount > 0;

                  const r = isCritical ? 14 : isWarning ? 12 : 9;
                  const color = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#64748b';
                  const opacity = isCritical ? 1.0 : isWarning ? 0.9 : 0.6;
                  const isHovered = hoveredCluster?.stateId === cluster.stateId;

                  return (
                    <g
                      key={cluster.stateId}
                      className="cursor-pointer"
                      onClick={() => onSelectFacility(cluster.facilities[0]?.id || '')}
                      onMouseEnter={() => {
                        setHoveredCluster(cluster);
                        setHoveredFacility(null);
                      }}
                      onMouseLeave={() => setHoveredCluster(null)}
                    >
                      {isCritical && (
                        <circle
                          cx={cluster.x}
                          cy={cluster.y}
                          r={r + 8}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          className="animate-ping opacity-60 pointer-events-none"
                        />
                      )}

                      <circle
                        cx={cluster.x}
                        cy={cluster.y}
                        r={r}
                        fill="#0f172a"
                        stroke={isHovered ? '#ffffff' : color}
                        strokeWidth={isHovered ? 3.5 : 2.5}
                        opacity={opacity}
                        filter="url(#nodeGlow)"
                      />

                      <text
                        x={cluster.x}
                        y={cluster.y + 3.5}
                        textAnchor="middle"
                        fontSize={isCritical ? "9" : "8"}
                        fontWeight="800"
                        fill={isCritical ? "#ffffff" : color}
                        className="pointer-events-none select-none font-mono"
                      >
                        {cluster.stateId.slice(0, 2)}
                      </text>
                    </g>
                  );
                })}

                {/* Individual Nodes */}
                {!renderAsClusters && projectedFacilityNodes.map(({ facility, x, y, status }) => {
                  const isSelected = selectedFacilityId === facility.id;
                  const isWarehouse = facility.type === 'DISTRICT_WAREHOUSE';
                  const isCritical = status === 'CRITICAL';
                  const isWarning = status === 'WARNING';
                  const isHealthy = status === 'HEALTHY';
                  const isHovered = hoveredFacility?.id === facility.id;

                  let pinColor = '#ef4444';
                  let pinRadius = 8;
                  let pinOpacity = 1.0;

                  if (isWarehouse) {
                    pinColor = '#3b82f6';
                    pinRadius = 7;
                    pinOpacity = 0.95;
                  } else if (isWarning) {
                    pinColor = '#f59e0b';
                    pinRadius = 6;
                    pinOpacity = 0.85;
                  } else if (isHealthy) {
                    pinColor = '#64748b';
                    pinRadius = 4;
                    pinOpacity = 0.45;
                  }

                  return (
                    <g
                      key={facility.id}
                      className="cursor-pointer"
                      onClick={() => onSelectFacility(facility.id)}
                      onMouseEnter={() => {
                        setHoveredFacility(facility);
                        setHoveredCluster(null);
                      }}
                      onMouseLeave={() => setHoveredFacility(null)}
                    >
                      {isCritical && (
                        <circle
                          cx={x}
                          cy={y}
                          r={pinRadius + 6}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          className="animate-ping opacity-70 pointer-events-none"
                        />
                      )}

                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r={pinRadius + 5}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          className="pointer-events-none"
                        />
                      )}

                      {isWarehouse ? (
                        <rect
                          x={x - pinRadius}
                          y={y - pinRadius}
                          width={pinRadius * 2}
                          height={pinRadius * 2}
                          rx="3"
                          fill="#0f172a"
                          stroke={isHovered ? '#ffffff' : pinColor}
                          strokeWidth={isHovered ? 3 : 2}
                          opacity={pinOpacity}
                        />
                      ) : (
                        <circle
                          cx={x}
                          cy={y}
                          r={pinRadius}
                          fill="#0f172a"
                          stroke={isHovered ? '#ffffff' : pinColor}
                          strokeWidth={isHovered ? 3 : 2}
                          opacity={pinOpacity}
                        />
                      )}

                      {(isCritical || isWarehouse) && (
                        <circle cx={x} cy={y} r="2" fill={pinColor} className="pointer-events-none" />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip */}
              {(hoveredCluster || hoveredFacility) && tooltipPos && (
                <div 
                  className="absolute z-30 pointer-events-none transition-transform duration-75 ease-out shadow-2xl"
                  style={{
                    left: `${Math.min(width - 320, Math.max(20, tooltipPos.x + 15))}px`,
                    top: `${Math.min(height - 180, Math.max(20, tooltipPos.y - 40))}px`
                  }}
                >
                  {hoveredCluster && (
                    <div className="w-72 bg-slate-900/95 border border-slate-700 rounded-2xl p-3.5 text-slate-100 backdrop-blur-md space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-white">{hoveredCluster.stateName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          hoveredCluster.worstStatus === 'CRITICAL' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' :
                          hoveredCluster.worstStatus === 'WARNING' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {hoveredCluster.worstStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-xs py-1 border-t border-b border-slate-800">
                        <div className="bg-slate-950 p-1.5 rounded-lg">
                          <span className="text-[9px] text-slate-400 block">Critical</span>
                          <span className="font-bold text-xs text-rose-400">{hoveredCluster.criticalCount}</span>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded-lg">
                          <span className="text-[9px] text-slate-400 block">Beds</span>
                          <span className="font-bold text-xs text-slate-200">
                            {hoveredCluster.totalBeds > 0 ? Math.round((hoveredCluster.occupiedBeds / hoveredCluster.totalBeds) * 100) : 0}%
                          </span>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded-lg">
                          <span className="text-[9px] text-slate-400 block">Staff</span>
                          <span className="font-bold text-xs text-slate-200">
                            {hoveredCluster.totalStaff > 0 ? Math.round((hoveredCluster.presentStaff / hoveredCluster.totalStaff) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {hoveredFacility && !hoveredCluster && (
                    <div className="w-76 bg-slate-900/95 border border-slate-700 rounded-2xl p-3.5 text-slate-100 backdrop-blur-md space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-white truncate">{hoveredFacility.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          getFacilityWorstStatus(hoveredFacility.id) === 'CRITICAL' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' :
                          getFacilityWorstStatus(hoveredFacility.id) === 'WARNING' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {getFacilityWorstStatus(hoveredFacility.id)}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs font-medium">
                        {hoveredFacility.type} • {hoveredFacility.district}, {hoveredFacility.state}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800 text-xs">
                        <div className="bg-slate-950 p-1.5 rounded-lg">
                          <span className="text-[9px] text-slate-400 block uppercase">Beds</span>
                          <span className="font-bold text-slate-200">
                            {hoveredFacility.occupiedBeds} / {hoveredFacility.totalBeds}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded-lg">
                          <span className="text-[9px] text-slate-400 block uppercase">Staff</span>
                          <span className="font-bold text-slate-200">
                            {hoveredFacility.presentStaff} / {hoveredFacility.totalStaff}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="absolute top-5 right-5 z-10 flex flex-col items-end gap-2.5">
                <div className="flex items-center bg-slate-900/90 border border-slate-700 rounded-xl p-1 text-slate-200 shadow-md">
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(2.2, prev + 0.25))}
                    className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.25))}
                    className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
                    title="Reset View"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 backdrop-blur-md shadow-md">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse pointer-events-none"></span>
                    <span className="font-bold text-rose-300">Critical (&lt;7d)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Warning</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500 opacity-60"></span>
                    <span className="text-slate-400">Healthy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                    <span>Warehouse</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: Automated Cross-District Redistribution Routes */}
      {viewMode === 'CONDUITS' && (
        <div className="p-6 sm:p-8 bg-slate-50/60 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Automated Cross-District Redistribution Conduits
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                FEFO-optimized routes transferring surplus batches to avert imminent clinic stockouts
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {activeTransfers.length} Active Transfer Routes
            </span>
          </div>

          {activeTransfers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-900">Stock Redistribution Balanced</p>
              <p className="text-xs text-slate-500 mt-1">No emergency inter-district transfers currently required.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {activeTransfers.map(t => {
                const source = facilities.find(f => f.id === t.sourcePhcId);
                const target = facilities.find(f => f.id === t.targetPhcId);
                const drug = drugs.find(d => d.id === t.drugId);

                return (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        t.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status === 'APPROVED' ? 'Dispatched' : 'Pending Authorization'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono font-bold">
                        {t.distanceKm} km • ~{t.estimatedHours} hrs transit
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-left max-w-[140px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Donor Hub</span>
                        <div className="font-bold text-slate-900 text-sm truncate">{source?.name}</div>
                        <div className="text-[11px] text-slate-500">{source?.district}</div>
                      </div>

                      <div className="flex flex-col items-center px-2">
                        <div className="text-xs font-extrabold text-emerald-700 font-mono">
                          {(t.modifiedQuantity || t.quantity).toLocaleString()} {drug?.unit}
                        </div>
                        <span className="text-slate-400 font-bold">➔</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{drug?.name.split(' ')[0]}</span>
                      </div>

                      <div className="text-right max-w-[140px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Recipient Deficit</span>
                        <div className="font-bold text-slate-900 text-sm truncate">{target?.name}</div>
                        <div className="text-[11px] text-slate-500">{target?.district}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                      <span>Reason: {t.reason.length > 55 ? t.reason.slice(0, 52) + '...' : t.reason}</span>
                      <button
                        onClick={() => onSelectFacility(t.targetPhcId)}
                        className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                      >
                        Inspect Recipient ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 3: Comprehensive Facility Resource Ledger */}
      {viewMode === 'RESOURCE_LEDGER' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Facility Health Resources & Personnel Attendance Ledger
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Audited visibility into medicine inventory buffers, bed occupancy, and medical staff presence
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-5">Facility & Jurisdiction</th>
                  <th className="py-4 px-5">Facility Type</th>
                  <th className="py-4 px-5">Bed Availability</th>
                  <th className="py-4 px-5">Personnel Attendance</th>
                  <th className="py-4 px-5 text-center">Stock Buffer Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayFacilities.map(f => {
                  const status = getFacilityWorstStatus(f.id);
                  const bedRate = f.totalBeds > 0 ? Math.round((f.occupiedBeds / f.totalBeds) * 100) : 0;
                  const staffRate = f.totalStaff > 0 ? Math.round((f.presentStaff / f.totalStaff) * 100) : 0;

                  return (
                    <tr
                      key={f.id}
                      onClick={() => onSelectFacility(f.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{f.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{f.district}, {f.state}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs">
                          {f.type}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900 text-xs">
                          {f.occupiedBeds} / {f.totalBeds} Beds ({bedRate}%)
                        </div>
                        <div className="w-32 bg-slate-200 rounded-full h-1.5 mt-1.5">
                          <div
                            className={`h-1.5 rounded-full ${bedRate > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, bedRate)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900 text-xs">
                          {f.presentStaff} / {f.totalStaff} on duty ({staffRate}%)
                        </div>
                        <div className="text-[11px] text-slate-500">Verified Attendance</div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          status === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFacility(f.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Inspect Stocks
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
