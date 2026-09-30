import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ESSENTIAL_DRUGS, 
  INITIAL_FACILITIES, 
  generateInitialInventory, 
  INITIAL_OUTBREAKS, 
  INITIAL_FEDERATED_NODES, 
  INITIAL_FL_METRICS, 
  INITIAL_TRANSFER_RECOMMENDATIONS 
} from './data/mockData';
import { 
  PHCFacility, 
  Drug, 
  InventoryItem, 
  OutbreakEvent, 
  FederatedClientNode, 
  FederatedLearningMetrics, 
  TransferRecommendation 
} from './types';
import { calculateForecasts } from './services/forecastingEngine';
import { generateOptimizedTransfers } from './services/optimizerEngine';
import { auditFacilityData } from './services/dataQualityEngine';
import { Header, ActiveView } from './components/Header';
import { DhoDashboard } from './components/DhoDashboard';
import { FederatedBackbone } from './components/FederatedBackbone';
import { PhcFieldLogger } from './components/PhcFieldLogger';
import { SurgeSimulator } from './components/SurgeSimulator';
import { GeminiLiveVoiceModal } from './components/GeminiLiveVoiceModal';
import { GeminiChatbotModal } from './components/GeminiChatbotModal';
import { RealTimeDataDiagnosticsModal } from './components/RealTimeDataDiagnosticsModal';
import { AdminAuthScreen, AdminProfile } from './components/AdminAuthScreen';
import { TranslationProvider, useTranslation } from './context/TranslationContext';
import { getAllIndiaFacilities } from './data/indiaStates';
import { 
  fetchAllDistrictHealthResources, 
  DistrictHealthResourceTelemetry 
} from './services/livePublicDataService';
import { 
  auth, 
  signOutUser, 
  persistApprovedTransfer, 
  persistFieldReport 
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function PaxoraAppContent() {
  const { t } = useTranslation();
  
  // Gatekeeper Admin Authentication
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(() => {
    try {
      const saved = localStorage.getItem('paxora_admin_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [activeView, setActiveView] = useState<ActiveView>('DHO_DASHBOARD');
  const [selectedState, setSelectedState] = useState<string>(() => {
    return adminProfile?.state || 'ALL';
  });

  // Interactive AI & Diagnostics Modals
  const [showLiveVoice, setShowLiveVoice] = useState<boolean>(false);
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  // Core Data States - All 36 Indian States & UTs
  const initialAllFacilities = useMemo(() => getAllIndiaFacilities(INITIAL_FACILITIES), []);
  const [facilities, setFacilities] = useState<PHCFacility[]>(initialAllFacilities);
  const [drugs] = useState<Drug[]>(ESSENTIAL_DRUGS);
  const [inventory, setInventory] = useState<InventoryItem[]>(() => 
    generateInitialInventory(initialAllFacilities, ESSENTIAL_DRUGS)
  );
  const [outbreaks, setOutbreaks] = useState<OutbreakEvent[]>(INITIAL_OUTBREAKS);
  const [transfers, setTransfers] = useState<TransferRecommendation[]>(INITIAL_TRANSFER_RECOMMENDATIONS);
  
  // Real-Time Health Resource & Stock Feeds
  const [healthTelemetry, setHealthTelemetry] = useState<Record<string, DistrictHealthResourceTelemetry>>({});
  const [isSyncingTelemetry, setIsSyncingTelemetry] = useState<boolean>(false);
  const [telemetrySyncTime, setTelemetrySyncTime] = useState<string>('');

  // Federated Learning States
  const [federatedNodes, setFederatedNodes] = useState<FederatedClientNode[]>(INITIAL_FEDERATED_NODES);
  const [flMetrics, setFlMetrics] = useState<FederatedLearningMetrics>(INITIAL_FL_METRICS);
  const [isFlTrainingActive, setIsFlTrainingActive] = useState<boolean>(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !adminProfile) {
        const newProfile: AdminProfile = {
          displayName: user.displayName || user.email?.split('@')[0] || 'Executive Health Officer',
          email: user.email || 'admin@mohfw.gov.in',
          role: 'District Medical Officer (DMO / DHO)',
          state: 'ALL',
          isDemo: false
        };
        setAdminProfile(newProfile);
        try {
          localStorage.setItem('paxora_admin_profile', JSON.stringify(newProfile));
        } catch {
          // ignore
        }
      }
    });
    return () => unsubscribe();
  }, [adminProfile]);

  // Sync Live Health Telemetry (e-Aushadhi / HMIS / IDSP feeds)
  const handleSyncHealthTelemetry = useCallback(async () => {
    setIsSyncingTelemetry(true);
    try {
      const liveData = await fetchAllDistrictHealthResources();
      setHealthTelemetry(liveData);
      setTelemetrySyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to sync health resource telemetry:', err);
    } finally {
      setIsSyncingTelemetry(false);
    }
  }, []);

  // Fetch initial telemetry on mount
  useEffect(() => {
    handleSyncHealthTelemetry();
  }, [handleSyncHealthTelemetry]);

  // Compute live hierarchical forecasts whenever inventory, facilities, or outbreaks change
  const forecasts = useMemo(() => {
    return calculateForecasts(inventory, facilities, drugs, outbreaks);
  }, [inventory, facilities, drugs, outbreaks]);

  // Compute data quality audit flags
  const auditFlags = useMemo(() => {
    return auditFacilityData(facilities, inventory, drugs);
  }, [facilities, inventory, drugs]);

  // Approve a Transfer Recommendation & persist to Firestore
  const handleApproveTransfer = (transferId: string) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === transferId) {
        const approvedQty = t.modifiedQuantity || t.quantity;
        const challanNumber = `NHM-TR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

        // Adjust stock in inventory: subtract from donor, add to recipient
        setInventory(currentInv => currentInv.map(item => {
          if (item.phcId === t.sourcePhcId && item.drugId === t.drugId) {
            const nextStock = Math.max(0, item.currentStock - approvedQty);
            const nextDays = Math.round((nextStock / item.dailyAvgConsumption) * 10) / 10;
            return { ...item, currentStock: nextStock, daysOfCover: nextDays };
          }
          if (item.phcId === t.targetPhcId && item.drugId === t.drugId) {
            const nextStock = item.currentStock + approvedQty;
            const nextDays = Math.round((nextStock / item.dailyAvgConsumption) * 10) / 10;
            return { ...item, currentStock: nextStock, daysOfCover: nextDays };
          }
          return item;
        }));

        // Persist to Firestore
        persistApprovedTransfer({
          id: t.id,
          sourcePhcId: t.sourcePhcId,
          targetPhcId: t.targetPhcId,
          drugId: t.drugId,
          quantity: approvedQty,
          approvedBy: adminProfile?.displayName || 'Dr. R. Menon, DHO Wayanad',
          challanNumber
        }).catch(err => console.warn('Firestore transfer persistence warning:', err));

        return {
          ...t,
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          approvedBy: adminProfile?.displayName || 'Dr. R. Menon, DHO Wayanad',
          challanNumber
        };
      }
      return t;
    }));
  };

  // Modify transfer quantity
  const handleModifyTransferQty = (transferId: string, newQty: number) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === transferId) {
        return {
          ...t,
          modifiedQuantity: newQty,
          status: 'MODIFIED'
        };
      }
      return t;
    }));
  };

  // Reject a transfer recommendation
  const handleRejectTransfer = (transferId: string) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === transferId) {
        return { ...t, status: 'REJECTED' };
      }
      return t;
    }));
  };

  // Approve all pending transfers
  const handleApproveAllTransfers = () => {
    transfers.filter(t => t.status === 'PROPOSED').forEach(t => {
      handleApproveTransfer(t.id);
    });
  };

  // Field updates from 60s logger
  const handleUpdateFacilityData = (
    facilityId: string,
    updates: {
      occupiedBeds?: number;
      presentStaff?: number;
      stockUpdates?: { drugId: string; newStock: number }[];
    }
  ) => {
    const targetFacility = facilities.find(f => f.id === facilityId);
    setFacilities(prev => prev.map(f => {
      if (f.id === facilityId) {
        return {
          ...f,
          occupiedBeds: updates.occupiedBeds ?? f.occupiedBeds,
          presentStaff: updates.presentStaff ?? f.presentStaff,
          lastReportedTimestamp: 'Just now',
          isSilent: false,
          dataQualityIssues: []
        };
      }
      return f;
    }));

    persistFieldReport({
      phcId: facilityId,
      facilityName: targetFacility?.name || facilityId,
      occupiedBeds: updates.occupiedBeds ?? targetFacility?.occupiedBeds ?? 0,
      presentStaff: updates.presentStaff ?? targetFacility?.presentStaff ?? 0
    }).catch(err => console.warn('Firestore report persistence warning:', err));

    if (updates.stockUpdates && updates.stockUpdates.length > 0) {
      setInventory(prev => prev.map(item => {
        if (item.phcId === facilityId) {
          const match = updates.stockUpdates!.find(u => u.drugId === item.drugId);
          if (match) {
            const nextDays = Math.round((match.newStock / item.dailyAvgConsumption) * 10) / 10;
            return {
              ...item,
              currentStock: match.newStock,
              daysOfCover: nextDays
            };
          }
        }
        return item;
      }));
    }
  };

  // Trigger Federated Training Round
  const handleTriggerTrainingRound = () => {
    if (isFlTrainingActive) return;
    setIsFlTrainingActive(true);

    setFederatedNodes(prev => prev.map(n => ({ ...n, status: 'TRAINING_LOCAL' })));

    setTimeout(() => {
      setFederatedNodes(prev => prev.map(n => ({ ...n, status: 'UPLOADING_WEIGHTS' })));

      setTimeout(() => {
        const nextRound = flMetrics.currentRound + 1;
        const improvedWape = Math.max(12.4, Math.round((flMetrics.globalWAPE - 0.7) * 10) / 10);
        const nextLoss = Math.max(0.12, Math.round((0.198 - 0.02) * 1000) / 1000);

        setFlMetrics(prev => ({
          ...prev,
          currentRound: nextRound,
          globalWAPE: improvedWape,
          status: 'IDLE',
          totalTransferredBytesKB: prev.totalTransferredBytesKB + 427,
          weightHistory: [
            ...prev.weightHistory,
            { round: nextRound, wape: improvedWape, loss: nextLoss }
          ]
        }));

        setFederatedNodes(prev => prev.map(n => ({
          ...n,
          status: 'SYNCED',
          localWAPE: Math.max(14.0, Math.round((n.localWAPE - 0.6) * 10) / 10),
          lastContributionTimestamp: 'Just now'
        })));

        setIsFlTrainingActive(false);
      }, 1500);
    }, 1500);
  };

  // Trigger Outbreak Surge
  const handleTriggerOutbreak = (outbreakId: string) => {
    setOutbreaks(prev => prev.map(o => {
      if (o.id === outbreakId) {
        return { ...o, active: true, demandMultiplier: 3.2 };
      }
      return o;
    }));

    const newTransfers = generateOptimizedTransfers(facilities, drugs, inventory, forecasts);
    setTransfers(newTransfers);
  };

  // Reset Demo to initial state
  const handleResetDemo = () => {
    setFacilities(initialAllFacilities);
    setInventory(generateInitialInventory(initialAllFacilities, ESSENTIAL_DRUGS));
    setOutbreaks(INITIAL_OUTBREAKS);
    setTransfers(INITIAL_TRANSFER_RECOMMENDATIONS);
    setFlMetrics(INITIAL_FL_METRICS);
    setFederatedNodes(INITIAL_FEDERATED_NODES);
  };

  // Sign out admin
  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch {
      // ignore
    }
    localStorage.removeItem('paxora_admin_profile');
    setAdminProfile(null);
  };

  // Pending transfers count for badges
  const pendingCount = transfers.filter(t => t.status === 'PROPOSED').length;

  // GATEKEEPER: If not authenticated as Admin, show Admin Login Screen FIRST!
  if (!adminProfile) {
    return (
      <AdminAuthScreen
        onAuthenticated={(profile) => {
          setAdminProfile(profile);
          if (profile.state) setSelectedState(profile.state);
          try {
            localStorage.setItem('paxora_admin_profile', JSON.stringify(profile));
          } catch {
            // ignore
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        pendingTransfersCount={pendingCount}
        onOpenDiagnostics={() => setShowDiagnostics(true)}
        adminProfile={adminProfile}
        onSignOut={handleSignOut}
        onOpenVoice={() => setShowLiveVoice(false)}
        onOpenChat={() => setShowChatbot(true)}
        onRunStorylineDemo={() => setActiveView('OUTBREAK_SIMULATOR')}
      />

      {/* Main View Container with Generous Corporate Spacing */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeView === 'DHO_DASHBOARD' && (
          <DhoDashboard
            facilities={facilities}
            drugs={drugs}
            inventory={inventory}
            forecasts={forecasts}
            transfers={transfers}
            outbreaks={outbreaks}
            auditFlags={auditFlags}
            selectedState={selectedState}
            onApproveTransfer={handleApproveTransfer}
            onRejectTransfer={handleRejectTransfer}
            onModifyTransferQty={handleModifyTransferQty}
            healthTelemetry={healthTelemetry}
            onSyncPublicFeeds={handleSyncHealthTelemetry}
            isSyncingPublicFeeds={isSyncingTelemetry}
            lastSyncTime={telemetrySyncTime}
            onOpenDiagnostics={() => setShowDiagnostics(true)}
          />
        )}

        {activeView === 'FEDERATED_GRID' && (
          <FederatedBackbone
            nodes={federatedNodes}
            metrics={flMetrics}
            onTriggerTrainingRound={handleTriggerTrainingRound}
            isTrainingActive={isFlTrainingActive}
          />
        )}

        {activeView === 'PHC_LOGGER' && (
          <PhcFieldLogger
            facilities={facilities}
            drugs={drugs}
            inventory={inventory}
            isOfflineMode={false}
            onUpdateFacilityData={handleUpdateFacilityData}
          />
        )}

        {activeView === 'OUTBREAK_SIMULATOR' && (
          <SurgeSimulator
            outbreaks={outbreaks}
            transfers={transfers}
            onTriggerOutbreak={handleTriggerOutbreak}
            onApproveAllTransfers={handleApproveAllTransfers}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Gemini Live Voice Modal */}
      {showLiveVoice && (
        <GeminiLiveVoiceModal onClose={() => setShowLiveVoice(false)} />
      )}

      {/* Gemini Chatbot Modal */}
      {showChatbot && (
        <GeminiChatbotModal onClose={() => setShowChatbot(false)} />
      )}

      {/* Real-Time Health Telemetry Diagnostics Modal */}
      {showDiagnostics && (
        <RealTimeDataDiagnosticsModal onClose={() => setShowDiagnostics(false)} />
      )}

      {/* Executive Clean Corporate Footer */}
      <footer className="mt-auto border-t border-slate-200/90 bg-white/95 px-6 py-4 text-xs text-slate-500 text-center shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-800">
            PaxoraGrid • Federated National Health Resource & Supply Chain Platform
          </span>
          <span className="font-mono text-[11px] text-slate-500 font-semibold">
            DPDP Act 2023 Compliant • Federated FedAvg Core • Verified Stock & Bed Grid
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <TranslationProvider>
      <PaxoraAppContent />
    </TranslationProvider>
  );
}
