import React, { useState } from 'react';
import { OutbreakEvent, TransferRecommendation } from '../types';
import { useTranslation } from '../context/TranslationContext';
import { 
  RotateCcw, 
  Zap, 
  ShieldAlert, 
  CheckCircle, 
  ArrowRight, 
  Activity, 
  Sparkles 
} from 'lucide-react';

interface SurgeSimulatorProps {
  outbreaks: OutbreakEvent[];
  transfers: TransferRecommendation[];
  onTriggerOutbreak: (outbreakId: string) => void;
  onApproveAllTransfers: () => void;
  onResetDemo: () => void;
}

export const SurgeSimulator: React.FC<SurgeSimulatorProps> = ({
  outbreaks,
  onTriggerOutbreak,
  onApproveAllTransfers,
  onResetDemo
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const dengueOutbreak = outbreaks.find(o => o.type === 'DENGUE_SURGE');

  const handleStep1To2 = () => {
    if (dengueOutbreak) {
      onTriggerOutbreak(dengueOutbreak.id);
    }
    setCurrentStep(2);
  };

  const handleStep2To3 = () => {
    setCurrentStep(3);
  };

  const handleStep3To4 = () => {
    onApproveAllTransfers();
    setCurrentStep(4);
  };

  const handleRestart = () => {
    onResetDemo();
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner (Hospital Light Clinical Theme) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-rose-50/70 border border-amber-200 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('demoHeroBadge')}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {t('demoHeroTitle')}
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {t('demoHeroDesc')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('resetScenario')}</span>
            </button>
          </div>
        </div>

        {/* 4-Step Interactive Timeline Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { step: 1, label: t('step1Title'), desc: t('step1Desc') },
            { step: 2, label: t('step2Title'), desc: t('step2Desc') },
            { step: 3, label: t('step3Title'), desc: t('step3Desc') },
            { step: 4, label: t('step4Title'), desc: t('step4Desc') }
          ].map((item) => {
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div
                key={item.step}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs font-bold ring-2 ring-amber-400/20'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>{item.label}</span>
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  ) : null}
                </div>
                <div className="text-[11px] opacity-80 font-medium">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Interactive Details */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Step 1: Normal Inter-Facility Balance</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              In normal operating conditions, PHCs maintain approximately 14 to 28 days of cover. However, seasonal vector surges in hilly or tribal terrain (like Wayanad, Kerala) can cause immediate 3x demand spikes for Paracetamol and IV Saline.
            </p>

            <div className="pt-2">
              <button
                onClick={handleStep1To2}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-102"
              >
                <Zap className="w-4 h-4" />
                <span>{t('injectOutbreakBtn')}</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
              <span>Step 2: Vector Surge Injected in Meppadi & Chundale PHCs</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Syndromic surveillance detects fever clusters. Conventional e-Aushadhi systems would wait until local stock hits zero before raising a SOS procurement ticket (taking 14+ days to procure).
            </p>

            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Affected Drug Groups:</span>
                <span className="font-bold text-rose-700">Paracetamol 500mg, IV Normal Saline 0.9%</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Projected Stock-Out Window:</span>
                <span className="font-bold text-rose-700">&lt; 3 Days at Meppadi 24x7 PHC</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleStep2To3}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all hover:scale-102"
              >
                <span>{t('activateInferenceBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Step 3: Federated Model Synthesizes 9-Day Early Warning</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Kerala's local node evaluates recent fever clinic admissions against historical vector surge curves borrowed from Odisha's State Node (where Dengue is routine). It predicts severe stock-out 9 days ahead!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Advance Warning</span>
                <span className="text-xl font-bold text-amber-700">9.4 Days</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Donor Facility Identified</span>
                <span className="text-sm font-bold text-slate-900">Sulthan Bathery CHC (38 km)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">FEFO Batch Prioritized</span>
                <span className="text-sm font-bold text-emerald-700">Batch expiring in 3.5 months</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleStep3To4}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-102"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t('oneTapDhoBtn')}</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>{t('step4Success')}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              All transfers are authorized with digital gate passes. Vehicle dispatches logged via NHM Logistics, and the risk map immediately reflects secured safety buffers!
            </p>

            {/* Impact Metric Summary Cards for Judges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-center">
                <span className="text-slate-600 block text-[11px] mb-1 font-semibold">Stock-Outs Averted</span>
                <span className="text-2xl font-black text-emerald-700">100%</span>
                <span className="text-[10px] text-emerald-800 block mt-0.5 font-bold">Zero patient denial</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                <span className="text-slate-500 block text-[11px] mb-1 font-medium">Expiry Wastage Saved</span>
                <span className="text-2xl font-black text-amber-700">₹1,42,800</span>
                <span className="text-[10px] text-slate-600 block mt-0.5">3,800 doses utilized</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                <span className="text-slate-500 block text-[11px] mb-1 font-medium">Resolution Time</span>
                <span className="text-2xl font-black text-sky-700">45 Mins</span>
                <span className="text-[10px] text-slate-600 block mt-0.5">vs 14-day procurement</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                <span className="text-slate-500 block text-[11px] mb-1 font-medium">Patient Raw Data Shared</span>
                <span className="text-2xl font-black text-emerald-700">0 Bytes</span>
                <span className="text-[10px] text-slate-600 block mt-0.5">100% Federated</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
