import React, { useState } from 'react';
import { PHCFacility, Drug, InventoryItem } from '../types';
import { ForecastResult } from '../services/forecastingEngine';
import { useTranslation } from '../context/TranslationContext';
import { X, AlertTriangle, CheckCircle, Thermometer, Users, Bed, ArrowRight, Zap } from 'lucide-react';

interface FacilityDetailDrawerProps {
  facility: PHCFacility | null;
  drugs: Drug[];
  inventory: InventoryItem[];
  forecasts: Map<string, ForecastResult>;
  onClose: () => void;
  onRequestTransferForDrug: (drugId: string, facilityId: string) => void;
}

export const FacilityDetailDrawer: React.FC<FacilityDetailDrawerProps> = ({
  facility,
  drugs,
  inventory,
  forecasts,
  onClose,
  onRequestTransferForDrug
}) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!facility) return null;

  const facilityInventory = inventory.filter(i => i.phcId === facility.id);
  const drugMap = new Map(drugs.map(d => [d.id, d]));

  const filteredItems = facilityInventory.filter(item => {
    if (activeCategory === 'ALL') return true;
    const drug = drugMap.get(item.drugId);
    return drug?.category === activeCategory;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header (Hospital Clean Light Theme) */}
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                facility.type === 'DISTRICT_WAREHOUSE' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                facility.type === 'CHC' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {facility.type}
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold">{facility.facilityCode}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1.5">{facility.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {facility.block}, {facility.district} • State of {facility.state}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vital Facility Health KPIs */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Bed className="w-3.5 h-3.5 text-sky-600" />
                Beds
              </span>
              <span className={`text-[10px] font-bold ${facility.occupiedBeds >= facility.totalBeds * 0.9 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {facility.totalBeds > 0 ? Math.round((facility.occupiedBeds / facility.totalBeds) * 100) : 0}%
              </span>
            </div>
            <div className="text-base font-black text-slate-900">
              {facility.occupiedBeds} <span className="text-xs text-slate-500 font-normal">/ {facility.totalBeds}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                Staff
              </span>
              <span className="text-[10px] font-bold text-emerald-700">
                {Math.round((facility.presentStaff / facility.totalStaff) * 100)}%
              </span>
            </div>
            <div className="text-base font-black text-slate-900">
              {facility.presentStaff} <span className="text-xs text-slate-500 font-normal">/ {facility.totalStaff}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                Cold Chain
              </span>
            </div>
            <div className="text-xs font-bold mt-1">
              {facility.hasColdChainEquipment ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> ILR Active
                </span>
              ) : (
                <span className="text-slate-400">Unassigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Data Quality Flag Alert */}
        {facility.dataQualityIssues.length > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs flex items-center gap-2 text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{facility.dataQualityIssues[0]}</span>
          </div>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-50/70 border-b border-slate-200 overflow-x-auto text-xs">
        {['ALL', 'ANTIPYRETIC', 'REHYDRATION', 'ANTIBIOTIC', 'VACCINE', 'MATERNAL'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-colors shadow-2xs ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Drug Inventory List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-slate-50/40">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
          <span>DRUG STOCK & FORECAST COVER</span>
          <span>DAYS OF COVER (DOC)</span>
        </div>

        {filteredItems.map(item => {
          const drug = drugMap.get(item.drugId);
          const fc = forecasts.get(`${item.phcId}-${item.drugId}`);
          if (!drug || !fc) return null;

          const isCritical = fc.status === 'CRITICAL';
          const isWarning = fc.status === 'WARNING';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                isCritical
                  ? 'bg-rose-50/80 border-rose-300 shadow-2xs'
                  : isWarning
                  ? 'bg-amber-50/80 border-amber-300 shadow-2xs'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{drug.name}</span>
                    {drug.requiresColdChain && (
                      <span className="p-1 rounded bg-sky-50 border border-sky-200 text-[10px] text-sky-800 font-bold flex items-center gap-0.5">
                        <Thermometer className="w-3 h-3 text-sky-600" /> Cold Chain
                      </span>
                    )}
                    {fc.isSurgeAffected && (
                      <span className="p-1 rounded bg-rose-100 border border-rose-300 text-[10px] font-bold text-rose-800 flex items-center gap-0.5">
                        <Zap className="w-3 h-3 text-rose-600" /> Surge +{(fc.surgeMultiplier * 100 - 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">{drug.genericName}</div>
                </div>

                <div className="text-right">
                  <div className={`text-base font-black ${
                    isCritical ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {fc.daysOfCover} <span className="text-xs font-normal">days</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Stockout Risk (7d): <strong className={isCritical ? 'text-rose-700 font-bold' : 'text-slate-700'}>{fc.stockoutRisk7d}%</strong>
                  </div>
                </div>
              </div>

              {/* Progress Bar of Days of Cover */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-medium">
                  <span>Current Stock: <strong className="text-slate-900">{item.currentStock.toLocaleString()} {drug.unit}</strong></span>
                  <span>7d Forecast: <strong className="text-slate-900">{fc.forecastMean7d}</strong></span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, (fc.daysOfCover / 28) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Prediction Interval Band */}
              <div className="mt-2.5 p-2 rounded-lg bg-white/90 border border-slate-200 text-[11px] flex items-center justify-between text-slate-600">
                <span className="font-mono text-[10px] font-bold text-slate-800">
                  95% Confidence Band: [{fc.confidenceLower7d} - {fc.confidenceUpper7d}] {drug.unit}
                </span>
                <span className="text-[10px] text-slate-500">
                  Batch: {item.batchNumber} (Exp: {item.monthsToExpiry.toFixed(1)}mo)
                </span>
              </div>

              {/* Action trigger if critical */}
              {isCritical && (
                <div className="mt-3 pt-2.5 border-t border-rose-200 flex items-center justify-between">
                  <span className="text-xs text-rose-700 flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Critical depletion imminent
                  </span>
                  <button
                    onClick={() => onRequestTransferForDrug(drug.id, facility.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Request Transfer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
