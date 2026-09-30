import React, { useState, useEffect } from 'react';
import { Sparkles, X, CheckCircle, ShieldAlert, Activity, Truck } from 'lucide-react';
import { OutbreakEvent, PHCFacility } from '../types';

interface GeminiAdvisoryModalProps {
  outbreak: OutbreakEvent;
  facilities: PHCFacility[];
  onClose: () => void;
}

interface AdvisoryData {
  summary: string;
  clinicalGuidance: string;
  logisticsStrategy: string;
  leadTimeAdvantage: string;
  recommendedActions: string[];
  isAiGenerated: boolean;
}

export const GeminiAdvisoryModal: React.FC<GeminiAdvisoryModalProps> = ({
  outbreak,
  facilities,
  onClose
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [advisory, setAdvisory] = useState<AdvisoryData | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAdvisory() {
      try {
        setLoading(true);
        const res = await fetch('/api/gemini/clinical-advisory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            outbreakName: outbreak.title,
            state: outbreak.state,
            district: outbreak.districts.join(', '),
            criticalDrugs: ['Paracetamol 500mg IP', 'IV Normal Saline 0.9%', 'Oral Rehydration Salts WHO'],
            facilitiesAtRisk: `${facilities.filter(f => f.state === outbreak.state).length} PHCs across ${outbreak.districts.join(', ')}`,
            daysAdvanceNotice: outbreak.daysAdvanceNotice
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setAdvisory(data);
        }
      } catch (err) {
        console.error('Failed to fetch Gemini advisory:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAdvisory();
    return () => { isMounted = false; };
  }, [outbreak, facilities]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-3xl bg-white border border-indigo-200 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-800">
        {/* Header (Hospital Clean Light Theme) */}
        <div className="px-6 py-4 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Gemini 3.8 Flash Clinical & Logistics Copilot</span>
                {advisory?.isAiGenerated && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono border border-emerald-200 font-bold">
                    Live Model Generation
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{outbreak.title} • {outbreak.state} Command</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5 text-xs text-slate-700">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-600">
                Gemini 3.8 Flash synthesizing epidemiological vectors, NHM protocol & FEFO logistics...
              </p>
            </div>
          ) : advisory ? (
            <>
              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 text-slate-800 shadow-2xs">
                <span className="font-bold text-indigo-900 block mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-700" />
                  Epidemiological Situation Summary
                </span>
                <p className="leading-relaxed text-xs font-medium">{advisory.summary}</p>
              </div>

              {/* Clinical Protocol vs Logistics Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-2 shadow-2xs">
                  <span className="font-bold text-amber-900 text-xs block flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    Medical Officer Clinical Protocol
                  </span>
                  <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                    {advisory.clinicalGuidance}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-2 shadow-2xs">
                  <span className="font-bold text-emerald-900 text-xs block flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-700" />
                    Logistics & FEFO Strategy
                  </span>
                  <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                    {advisory.logisticsStrategy}
                  </p>
                </div>
              </div>

              {/* Lead Time Advantage */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block font-medium">Lead-Time Advantage Gained via Federated Learning:</span>
                  <span className="font-bold text-slate-800">{advisory.leadTimeAdvantage}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-amber-700 font-mono">+{outbreak.daysAdvanceNotice} Days</span>
                </div>
              </div>

              {/* Immediate Directives */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900 text-xs block">Immediate Directives for District Health Officer:</span>
                <div className="space-y-1.5">
                  {advisory.recommendedActions?.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">Failed to generate advisory.</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>ABDM & NHM Clinical Decision Support Integration</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-colors shadow-2xs"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
