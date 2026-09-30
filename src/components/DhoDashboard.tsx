import React, { useState } from 'react';
import { PHCFacility, Drug, InventoryItem, TransferRecommendation, OutbreakEvent } from '../types';
import { ForecastResult } from '../services/forecastingEngine';
import { DataQualityAuditResult } from '../services/dataQualityEngine';
import { DistrictHealthResourceTelemetry, OFFICIAL_NLEM_REGISTRY, exportToEAushadhiCSV } from '../services/livePublicDataService';
import { MapView } from './MapView';
import { FacilityDetailDrawer } from './FacilityDetailDrawer';
import { TransferChallanModal } from './TransferChallanModal';
import { GeminiAdvisoryModal } from './GeminiAdvisoryModal';
import { useTranslation } from '../context/TranslationContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  FileText, 
  Search, 
  ArrowRight, 
  Check, 
  Edit2, 
  Sparkles,
  Download,
  Activity,
  RefreshCw,
  Clock,
  Users,
  ShieldCheck,
  ChevronRight,
  Filter,
  BarChart3,
  Layers,
  MapPin,
  BedDouble,
  PackageCheck
} from 'lucide-react';

interface DhoDashboardProps {
  facilities: PHCFacility[];
  drugs: Drug[];
  inventory: InventoryItem[];
  forecasts: Map<string, ForecastResult>;
  transfers: TransferRecommendation[];
  outbreaks: OutbreakEvent[];
  auditFlags: DataQualityAuditResult[];
  selectedState: string;
  onApproveTransfer: (transferId: string) => void;
  onRejectTransfer: (transferId: string) => void;
  onModifyTransferQty: (transferId: string, newQty: number) => void;
  healthTelemetry?: Record<string, DistrictHealthResourceTelemetry>;
  onSyncPublicFeeds?: () => void;
  isSyncingPublicFeeds?: boolean;
  lastSyncTime?: string;
  onOpenDiagnostics?: () => void;
}

export const DhoDashboard: React.FC<DhoDashboardProps> = ({
  facilities,
  drugs,
  inventory,
  forecasts,
  transfers,
  outbreaks,
  auditFlags,
  selectedState,
  onApproveTransfer,
  onRejectTransfer,
  onModifyTransferQty,
  healthTelemetry = {},
  onSyncPublicFeeds,
  isSyncingPublicFeeds = false,
  lastSyncTime,
  onOpenDiagnostics
}) => {
  const { t } = useTranslation();
  
  // Dashboard focus tab to prevent vertical clustering
  const [activeTab, setActiveTab] = useState<'MAP' | 'TRANSFERS' | 'INVENTORY' | 'HEALTH_RESOURCES'>('MAP');

  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [activeModalTransfer, setActiveModalTransfer] = useState<TransferRecommendation | null>(null);
  const [editingTransferId, setEditingTransferId] = useState<string | null>(null);
  const [editQtyValue, setEditQtyValue] = useState<number>(0);
  const [showAdvisoryModal, setShowAdvisoryModal] = useState<boolean>(false);

  // Table filters
  const [drugFilter, setDrugFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const facilityMap = new Map(facilities.map(f => [f.id, f]));
  const drugMap = new Map(drugs.map(d => [d.id, d]));
  const nlemMap = new Map(OFFICIAL_NLEM_REGISTRY.map(n => [n.drugId, n]));

  // Calculate Key Resource KPIs
  const criticalItemsCount = Array.from(forecasts.values()).filter(fc => {
    const fac = facilityMap.get(fc.phcId);
    if (selectedState !== 'ALL' && fac?.state !== selectedState) return false;
    return fc.status === 'CRITICAL';
  }).length;

  const pendingTransfers = transfers.filter(t => {
    const target = facilityMap.get(t.targetPhcId);
    if (selectedState !== 'ALL' && target?.state !== selectedState) return false;
    return t.status === 'PROPOSED';
  });

  const approvedTransfers = transfers.filter(t => {
    const target = facilityMap.get(t.targetPhcId);
    if (selectedState !== 'ALL' && target?.state !== selectedState) return false;
    return t.status === 'APPROVED' || t.status === 'DISPATCHED';
  });

  const totalPatientsProtected = approvedTransfers.reduce(
    (sum, t) => sum + t.stockoutsAvertedPatientCount,
    0
  );

  // Bed & Personnel Metrics
  const filteredFacilities = facilities.filter(f => selectedState === 'ALL' || f.state === selectedState);
  const totalBeds = filteredFacilities.reduce((sum, f) => sum + f.totalBeds, 0);
  const occupiedBeds = filteredFacilities.reduce((sum, f) => sum + f.occupiedBeds, 0);
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalStaff = filteredFacilities.reduce((sum, f) => sum + f.totalStaff, 0);
  const presentStaff = filteredFacilities.reduce((sum, f) => sum + f.presentStaff, 0);
  const staffAttendanceRate = totalStaff > 0 ? Math.round((presentStaff / totalStaff) * 100) : 0;

  // Filtered inventory rows
  const filteredInventoryRows = inventory.filter(item => {
    const fac = facilityMap.get(item.phcId);
    const drug = drugMap.get(item.drugId);
    const fc = forecasts.get(`${item.phcId}-${item.drugId}`);
    if (!fac || !drug || !fc) return false;

    if (selectedState !== 'ALL' && fac.state !== selectedState) return false;
    if (drugFilter !== 'ALL' && item.drugId !== drugFilter) return false;
    if (urgencyFilter !== 'ALL' && fc.status !== urgencyFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = fac.name.toLowerCase().includes(q);
      const matchDistrict = fac.district.toLowerCase().includes(q);
      const matchDrug = drug.name.toLowerCase().includes(q);
      if (!matchName && !matchDistrict && !matchDrug) return false;
    }

    return true;
  });

  // Export current filtered inventory as official e-Aushadhi / DVDMS CSV
  const handleExportCSV = () => {
    const rowsToExport = filteredInventoryRows.map(item => {
      const fac = facilityMap.get(item.phcId);
      const drug = drugMap.get(item.drugId);
      const fc = forecasts.get(`${item.phcId}-${item.drugId}`);
      return {
        phcName: fac?.name || item.phcId,
        district: fac?.district || '',
        state: fac?.state || '',
        drugName: drug?.name || item.drugId,
        currentStock: item.currentStock,
        unit: drug?.unit || 'units',
        daysOfCover: fc?.daysOfCover || item.daysOfCover
      };
    });

    const csvContent = exportToEAushadhiCSV(rowsToExport);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eAushadhi_Inventory_${selectedState}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* 4 Spacious Executive Metric Cards: Stocks, Beds, Personnel, Transfers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Critical Stockouts */}
        <div className="p-6 rounded-3xl bg-white border border-rose-200 shadow-xs hover:border-rose-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Stockout Alerts</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-700 tracking-tight">
            {criticalItemsCount}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Facilities below 7-day reserve buffer
          </div>
        </div>

        {/* Bed Capacity & Occupancy */}
        <div className="p-6 rounded-3xl bg-white border border-blue-200 shadow-xs hover:border-blue-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Bed Occupancy</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-blue-700 tracking-tight">
            {bedOccupancyRate}%
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {occupiedBeds} / {totalBeds} Active Inpatient Beds
          </div>
        </div>

        {/* Medical Personnel Attendance */}
        <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Staff Attendance</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
            {staffAttendanceRate}%
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {presentStaff} / {totalStaff} Verified On-Duty
          </div>
        </div>

        {/* Pending Transfers */}
        <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-xs hover:border-amber-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Redistribution Orders</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-700 tracking-tight">
            {pendingTransfers.length}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            FEFO batches ready for dispatch
          </div>
        </div>
      </div>

      {/* Corporate Workspace Segment Controller (No Visual Clustering) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('MAP')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'MAP'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>GIS Logistics Network</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSFERS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'TRANSFERS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-500" />
            <span>Cross-District Redistribution</span>
            {pendingTransfers.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white">
                {pendingTransfers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'INVENTORY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span>Essential Medicine Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('HEALTH_RESOURCES')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'HEALTH_RESOURCES'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Sentinel Health Telemetry</span>
          </button>
        </div>

        {/* Clinical Advisory Trigger */}
        <button
          onClick={() => setShowAdvisoryModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer ml-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Surge Directives</span>
        </button>
      </div>

      {/* TAB 1: GIS NETWORK & SPATIAL TOPOLOGY */}
      {activeTab === 'MAP' && (
        <MapView
          facilities={facilities}
          transfers={transfers}
          forecasts={forecasts}
          drugs={drugs}
          selectedFacilityId={selectedFacilityId}
          onSelectFacility={(id) => setSelectedFacilityId(id)}
          selectedState={selectedState}
        />
      )}

      {/* TAB 2: REDISTRIBUTION ORDERS & TRANSFERS */}
      {activeTab === 'TRANSFERS' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Cross-District Medicine Redistribution & FEFO Supply Directives
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Balancing critical deficits by transferring surplus batches nearing expiry (First-Expiry-First-Out)
              </p>
            </div>

            <span className="text-xs px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200">
              {pendingTransfers.length} Actionable Pending
            </span>
          </div>

          {/* Transfers List */}
          {pendingTransfers.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto opacity-80" />
              <p className="font-bold text-slate-900 text-base">All Supplies Balanced</p>
              <p className="text-xs text-slate-500">No urgent facility deficits require cross-district transfer at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTransfers.map((transfer) => {
                const source = facilityMap.get(transfer.sourcePhcId);
                const target = facilityMap.get(transfer.targetPhcId);
                const drug = drugMap.get(transfer.drugId);
                const isEditing = editingTransferId === transfer.id;

                return (
                  <div
                    key={transfer.id}
                    className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-2xs"
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Source -> Target Route */}
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider">Donor Facility</span>
                          <div className="font-bold text-slate-900 text-sm sm:text-base">{source?.name}</div>
                          <div className="text-xs text-slate-500 font-medium">{source?.district}, {source?.state}</div>
                        </div>

                        <div className="flex flex-col items-center px-4">
                          <span className="text-xs font-mono text-slate-500 font-bold">{transfer.distanceKm} km</span>
                          <ArrowRight className="w-5 h-5 text-amber-600 my-0.5" />
                          <span className="text-[11px] text-slate-500 font-medium">~{transfer.estimatedHours}h transit</span>
                        </div>

                        <div className="text-left">
                          <span className="text-[10px] uppercase font-bold text-rose-700 block tracking-wider">Recipient Deficit</span>
                          <div className="font-bold text-slate-900 text-sm sm:text-base">{target?.name}</div>
                          <div className="text-xs text-slate-500 font-medium">{target?.district}, {target?.state}</div>
                        </div>
                      </div>

                      {/* Drug Quantity & Badges */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-right shadow-2xs">
                          <div className="text-xs text-slate-500 font-medium">{drug?.name}</div>
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                value={editQtyValue}
                                onChange={(e) => setEditQtyValue(parseInt(e.target.value, 10) || 0)}
                                className="w-24 bg-slate-50 border border-amber-500 rounded-lg px-2 py-1 text-xs text-slate-900 font-bold"
                              />
                              <button
                                onClick={() => {
                                  onModifyTransferQty(transfer.id, editQtyValue);
                                  setEditingTransferId(null);
                                }}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="text-lg font-black text-emerald-700 flex items-center justify-end gap-1.5">
                              <span>{(transfer.modifiedQuantity || transfer.quantity).toLocaleString()} {drug?.unit}</span>
                              <button
                                onClick={() => {
                                  setEditingTransferId(transfer.id);
                                  setEditQtyValue(transfer.quantity);
                                }}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
                                title="Modify Transfer Quantity"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {transfer.donorMonthsToExpiry < 6 && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-bold">
                            FEFO: {transfer.donorMonthsToExpiry}m to Expiry
                          </div>
                        )}

                        {drug?.requiresColdChain && (
                          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 font-bold">
                            Cold Chain (2°C-8°C)
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveModalTransfer(transfer)}
                          className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs cursor-pointer transition-colors"
                          title="Generate Gate Pass Challan"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onRejectTransfer(transfer.id)}
                          className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition-colors border border-slate-200 hover:border-rose-300 shadow-2xs cursor-pointer"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => onApproveTransfer(transfer.id)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-102 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve Transfer</span>
                        </button>
                      </div>
                    </div>

                    {/* Transfer Reason */}
                    <div className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 font-medium">
                      <strong className="text-slate-900 font-bold">Clinical Justification: </strong>
                      <span>{transfer.reason}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ESSENTIAL MEDICINE SUPPLY LEDGER TABLE */}
      {activeTab === 'INVENTORY' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Essential Medicine Supply & Stock Buffer Monitor
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Hierarchical inventory auditing with e-Aushadhi / DVDMS compliance
              </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search facility or drug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 w-56 font-medium shadow-2xs"
                />
              </div>

              <select
                value={drugFilter}
                onChange={(e) => setDrugFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="ALL">All Essential Drugs</option>
                {drugs.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="CRITICAL">Critical (&lt;7d)</option>
                <option value="WARNING">Warning (&lt;14d)</option>
                <option value="HEALTHY">Healthy Buffer</option>
                <option value="SURPLUS">Surplus</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold transition-all shadow-2xs cursor-pointer"
                title="Download e-Aushadhi formatted CSV manifest"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Export e-Aushadhi CSV</span>
              </button>
            </div>
          </div>

          {/* Clean High-Contrast Table with Generous Padding */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-5">Healthcare Facility</th>
                  <th className="py-4 px-5">Medicine & NLEM Code</th>
                  <th className="py-4 px-5 text-right">Current Stock</th>
                  <th className="py-4 px-5 text-right">Daily Consumption</th>
                  <th className="py-4 px-5 text-center">Days Cover</th>
                  <th className="py-4 px-5 text-center">Risk Tier</th>
                  <th className="py-4 px-5">Forecast Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInventoryRows.slice(0, 20).map(item => {
                  const fac = facilityMap.get(item.phcId);
                  const drug = drugMap.get(item.drugId);
                  const fc = forecasts.get(`${item.phcId}-${item.drugId}`);
                  const nlemInfo = nlemMap.get(item.drugId);
                  if (!fac || !drug || !fc) return null;

                  const isCritical = fc.status === 'CRITICAL';
                  const isWarning = fc.status === 'WARNING';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedFacilityId(fac.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{fac.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{fac.district}, {fac.state}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{drug.name}</span>
                          {nlemInfo && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono border border-slate-200 font-bold">
                              {nlemInfo.nlemCode}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{drug.unit} {nlemInfo ? `• ATC: ${nlemInfo.atcCode}` : ''}</div>
                      </td>
                      <td className="py-4 px-5 text-right font-mono font-bold text-slate-900 text-sm">
                        {item.currentStock.toLocaleString()}
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-slate-600 text-xs">
                        {item.dailyAvgConsumption} / day
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`font-mono font-bold text-sm ${
                          isCritical ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          {fc.daysOfCover}d
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isCritical ? 'bg-rose-100 text-rose-800' :
                          isWarning ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {fc.status}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-xs text-slate-700 font-medium">
                          {fc.status === 'CRITICAL' 
                            ? 'Stockout risk within 7 days' 
                            : fc.status === 'WARNING' 
                            ? 'Buffer below 14 days' 
                            : fc.isSurgeAffected 
                            ? `Outbreak surge (+${Math.round((fc.surgeMultiplier - 1) * 100)}%)` 
                            : 'Normal buffer'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SENTINEL HEALTH TELEMETRY (REAL RESOURCE MONITORING) */}
      {activeTab === 'HEALTH_RESOURCES' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Sentinel Health Resource & Disease Emergency Telemetry
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    ABDM / HMIS Integrated
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Real-time visibility into medicine stock buffers, bed occupancy, and medical staff attendance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onOpenDiagnostics && (
                <button
                  onClick={onOpenDiagnostics}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Verify Health Telemetry</span>
                </button>
              )}

              {onSyncPublicFeeds && (
                <button
                  onClick={onSyncPublicFeeds}
                  disabled={isSyncingPublicFeeds}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingPublicFeeds ? 'animate-spin' : ''}`} />
                  <span>{isSyncingPublicFeeds ? 'Syncing...' : 'Sync Health Telemetry'}</span>
                </button>
              )}
            </div>
          </div>

          {/* District Resource Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.values(healthTelemetry).map(telemetry => (
              <div
                key={telemetry.district}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-base block">
                      {telemetry.district}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{telemetry.state}</span>
                  </div>
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    telemetry.surgeSeverity === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                    telemetry.surgeSeverity === 'ELEVATED' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {telemetry.surgeSeverity} Status
                  </span>
                </div>

                {/* 3 Core Resource Badges */}
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-medium block uppercase">Beds</span>
                    <span className="font-bold text-slate-900 text-sm">{telemetry.bedOccupancyRate}%</span>
                    <span className="text-[10px] text-slate-400 block">{telemetry.occupiedBeds}/{telemetry.totalBeds}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-medium block uppercase">Staff</span>
                    <span className="font-bold text-slate-900 text-sm">{telemetry.staffAttendanceRate}%</span>
                    <span className="text-[10px] text-slate-400 block">{telemetry.presentMedicalStaff}/{telemetry.totalMedicalStaff}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-medium block uppercase">Stockouts</span>
                    <span className={`font-bold text-sm ${telemetry.criticalStockoutsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {telemetry.criticalStockoutsCount}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Critical</span>
                  </div>
                </div>

                {telemetry.activeSurgeEvent && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{telemetry.activeSurgeEvent} (Demand {telemetry.demandMultiplier}x)</span>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Source: {telemetry.syncSource}</span>
                  <span>{telemetry.lastSyncTimestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facility Details Drawer */}
      {selectedFacilityId && (
        <FacilityDetailDrawer
          facility={facilityMap.get(selectedFacilityId) || null}
          drugs={drugs}
          inventory={inventory}
          forecasts={forecasts}
          onClose={() => setSelectedFacilityId(null)}
          onRequestTransferForDrug={() => {}}
        />
      )}

      {/* Gate Pass / Challan Modal */}
      {activeModalTransfer && (
        <TransferChallanModal
          transfer={activeModalTransfer}
          facilities={facilities}
          drugs={drugs}
          onClose={() => setActiveModalTransfer(null)}
          onConfirmApprove={(id: string) => {
            onApproveTransfer(id);
            setActiveModalTransfer(null);
          }}
        />
      )}

      {/* Clinical Advisory Directive Modal */}
      {showAdvisoryModal && (
        <GeminiAdvisoryModal
          outbreak={outbreaks[0]}
          facilities={facilities}
          onClose={() => setShowAdvisoryModal(false)}
        />
      )}
    </div>
  );
};
