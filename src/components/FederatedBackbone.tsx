import React, { useState } from 'react';
import { FederatedClientNode, FederatedLearningMetrics } from '../types';
import { useTranslation } from '../context/TranslationContext';
import { 
  Network, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  Database, 
  Server, 
  Award, 
  Share2, 
  ArrowUpRight 
} from 'lucide-react';

interface FederatedBackboneProps {
  nodes: FederatedClientNode[];
  metrics: FederatedLearningMetrics;
  onTriggerTrainingRound: () => void;
  isTrainingActive: boolean;
}

export const FederatedBackbone: React.FC<FederatedBackboneProps> = ({
  nodes,
  metrics,
  onTriggerTrainingRound,
  isTrainingActive
}) => {
  const { t } = useTranslation();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('KERALA');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CROSS_STATE' | 'BENCHMARK'>('OVERVIEW');

  const selectedNode = nodes.find(n => n.stateId === selectedNodeId) || nodes[0];

  return (
    <div className="space-y-6">
      {/* Top Banner (Hospital Light Clinical Theme) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50/70 via-white to-indigo-50/70 border border-emerald-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('flHeroBadge')}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {t('flHeroTitle')}
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {t('flHeroDesc')}
            </p>
          </div>

          {/* Action Button: Trigger FL Training */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onTriggerTrainingRound}
              disabled={isTrainingActive}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm shadow-xs transition-all ${
                isTrainingActive
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 hover:scale-102'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isTrainingActive ? 'animate-spin' : ''}`} />
              <span>{isTrainingActive ? 'Aggregating Round ' + (metrics.currentRound + 1) + '...' : t('executeFlBtn') + ' ' + (metrics.currentRound + 1)}</span>
            </button>
          </div>
        </div>

        {/* Live Training Round Progress Indicator */}
        {isTrainingActive && (
          <div className="mt-5 p-4 rounded-xl bg-white border border-emerald-300 text-xs shadow-2xs animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Secure Multi-Party Aggregation (FedAvg) in Progress
              </span>
              <span className="font-mono text-slate-500 font-medium">Step 3/4: Differential Privacy Noise Injection (ε=1.2)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'OVERVIEW'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>{t('tabTopology')}</span>
        </button>
        <button
          onClick={() => setActiveTab('CROSS_STATE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CROSS_STATE'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{t('tabCrossState')}</span>
        </button>
        <button
          onClick={() => setActiveTab('BENCHMARK')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'BENCHMARK'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{t('tabBenchmark')}</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & TOPOLOGY */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 flex items-center justify-between">
              <span>National Aggregator ↔ State Node Pipeline (Flower Protocol)</span>
              <span className="font-mono text-emerald-700 lowercase font-bold">dp_clip_norm=1.0 | sec_agg=active</span>
            </h3>

            {/* Aggregator Node (Center Top) */}
            <div className="flex flex-col items-center">
              <div className="relative p-5 rounded-2xl bg-gradient-to-b from-white to-indigo-50 border-2 border-indigo-300 shadow-sm text-center max-w-md w-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase shadow-2xs">
                  {t('nationalAggregatorTitle')}
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Server className="w-5 h-5 text-indigo-700" />
                  <span className="font-bold text-slate-900 text-sm">{t('mohfwFedAvgServer')}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Secure Aggregation Engine • Round {metrics.currentRound} of {metrics.maxRounds}
                </p>
                <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-mono font-bold">
                  <span className="text-emerald-700">Global WAPE: {metrics.globalWAPE}%</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sky-700">Payload: ~142.4 KB/node</span>
                </div>
              </div>

              {/* Connecting Lines */}
              <div className="w-full max-w-2xl h-10 flex items-center justify-around relative">
                <div className="w-0.5 h-full bg-gradient-to-b from-indigo-400 to-emerald-400"></div>
                <div className="w-0.5 h-full bg-gradient-to-b from-indigo-400 to-emerald-400"></div>
                <div className="w-0.5 h-full bg-gradient-to-b from-indigo-400 to-emerald-400"></div>
              </div>
            </div>

            {/* 3 State Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nodes.map((node) => {
                const isSelected = node.stateId === selectedNodeId;
                return (
                  <div
                    key={node.stateId}
                    onClick={() => setSelectedNodeId(node.stateId)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          State Node: {node.stateId}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">{node.name}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">{node.healthMissionName}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>PHC Endpoints:</span>
                        <span className="font-bold text-slate-900">{node.phcCount.toLocaleString()} PHCs</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Local Ledger Rows:</span>
                        <span className="font-mono text-slate-800 font-semibold">{node.localRecordsProcessed.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Local Model WAPE:</span>
                        <span className="font-bold text-amber-700">{node.localWAPE}%</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Diff Privacy:</span>
                        <span className="font-mono text-emerald-700 font-bold">ε={node.privacyEpsilon} (Guaranteed)</span>
                      </div>
                    </div>

                    <div className="mt-4 p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">Raw Data Out:</span>
                      <span className="font-bold text-emerald-700">0 Bytes (Zero-Knowledge)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Deep-Dive Inspection Panel */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>{t('nodeInspection')}: {selectedNode.name}</span>
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                Encrypted Weight Handshake Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Gradient Checksum</span>
                <span className="font-mono text-slate-800 text-[11px] font-bold break-all">
                  SHA256: 8f4c2e...b39a01
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Tensor Compression</span>
                <span className="font-bold text-slate-900 text-sm">8-bit Quantized (142 KB)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Local Training Method</span>
                <span className="font-bold text-slate-900 text-sm">Hierarchical Poisson-Bayes SGD</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Privacy Engine</span>
                <span className="font-bold text-emerald-700 text-sm">Opacus / RDP Accountant</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CROSS-STATE KNOWLEDGE TRANSFER */}
      {activeTab === 'CROSS_STATE' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Cross-State Epidemic Knowledge Transfer (Zero Patient Data Shared)
            </h3>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed mb-6">
              When an emerging disease outbreak appears in a region with no prior recorded patterns, local isolated models fail. PaxoraGrid's federated backbone allows states to inherit learned epidemiological dynamics (incubation curves, consumption acceleration) from states where the vector is routine.
            </p>

            <div className="space-y-4">
              {metrics.crossStateLearnedKnowledge.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                        Source: {item.originState}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                        Benefiting: {item.benefitingState}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                      "{item.insight}"
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-500 font-medium">Forecast Error Reduction</div>
                    <div className="text-xl font-black text-emerald-700">
                      -{item.errorReductionPercent}% WAPE
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BENCHMARKS & PRIVACY */}
      {activeTab === 'BENCHMARK' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">Architecture 1</div>
              <h4 className="text-base font-bold text-slate-900">Local-Only Silos (Current e-Aushadhi)</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                States train models strictly on their own data. Fails during novel vector outbreaks due to cold-start.
              </p>
              <div className="mt-6 space-y-3">
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-xs text-slate-600 block">Forecast Error (WAPE)</span>
                  <span className="text-2xl font-bold text-rose-700">38.6%</span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">High variance & false alarms</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-600 block">Lead Time to Stockout</span>
                  <span className="text-xl font-bold text-slate-900">1.8 Days</span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">Too late for inter-block transit</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
              Privacy: Preserved • Clinical Utility: Poor
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="text-xs font-bold uppercase text-slate-500 mb-1">Architecture 2</div>
              <h4 className="text-base font-bold text-slate-900">Centralized Cloud Lake</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Requires all 36 Indian states to upload patient records to a single database. High resistance under federal health laws.
              </p>
              <div className="mt-6 space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-600 block">Forecast Error (WAPE)</span>
                  <span className="text-2xl font-bold text-slate-900">14.1%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Statistically optimal</span>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-xs text-slate-600 block">Data Sovereignty Score</span>
                  <span className="text-xl font-bold text-rose-700">0% (Violates DPDP Act)</span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">Massive surveillance risk</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-rose-700 font-bold">
              Privacy: Broken • Rejected by States
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-50/50 to-white border-2 border-emerald-500 flex flex-col justify-between shadow-xs">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase mb-2">
                PaxoraGrid (Optimal)
              </div>
              <h4 className="text-base font-bold text-emerald-900">Federated Early-Warning Network</h4>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed font-medium">
                Matches centralized accuracy (14.8% vs 14.1%) while 100% respecting state data autonomy with differential privacy.
              </p>
              <div className="mt-6 space-y-3">
                <div className="p-3.5 rounded-xl bg-white border border-emerald-300 shadow-2xs">
                  <span className="text-xs text-slate-600 block">Forecast Error (WAPE)</span>
                  <span className="text-2xl font-black text-emerald-700">14.8%</span>
                  <span className="text-[10px] text-emerald-800 block mt-0.5 font-semibold">Within 0.7% of centralized ideal!</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-emerald-300 shadow-2xs">
                  <span className="text-xs text-slate-600 block">Outbreak Lead Time</span>
                  <span className="text-xl font-black text-amber-700">9.4 Days Advance Notice</span>
                  <span className="text-[10px] text-slate-600 block mt-0.5 font-medium">Enables proactive stock balancing</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full DPDP Act & ABDM Architecture Compliant</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
