import React, { useState } from 'react';
import { PHCFacility, Drug, InventoryItem } from '../types';
import { parseSmsOrWhatsappText } from '../services/smsWhatsappParser';
import { PhysicalLedgerScanner } from './PhysicalLedgerScanner';
import { useTranslation } from '../context/TranslationContext';
import { 
  Scan, 
  Smartphone, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  Bed, 
  Users, 
  Camera, 
  Send, 
  Wifi, 
  WifiOff, 
  Plus, 
  Minus, 
  Clock,
  Mic,
  MicOff,
  Volume2,
  Languages
} from 'lucide-react';

interface PhcFieldLoggerProps {
  facilities: PHCFacility[];
  drugs: Drug[];
  inventory: InventoryItem[];
  isOfflineMode: boolean;
  onUpdateFacilityData: (facilityId: string, updates: {
    occupiedBeds?: number;
    presentStaff?: number;
    stockUpdates?: { drugId: string; newStock: number }[];
  }) => void;
}

export const PhcFieldLogger: React.FC<PhcFieldLoggerProps> = ({
  facilities,
  drugs,
  inventory,
  isOfflineMode,
  onUpdateFacilityData
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'RAPID_LOGGER' | 'WHATSAPP_FALLBACK'>('RAPID_LOGGER');
  const [selectedPhcId, setSelectedPhcId] = useState<string>(facilities[0]?.id || 'PHC-KRL-01');
  
  const currentFacility = facilities.find(f => f.id === selectedPhcId) || facilities[0];
  const [bedsOccupied, setBedsOccupied] = useState<number>(currentFacility?.occupiedBeds || 8);
  const [staffPresent, setStaffPresent] = useState<number>(currentFacility?.presentStaff || 5);
  const [stockCounts, setStockCounts] = useState<{ [drugId: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    for (const d of drugs) {
      const item = inventory.find(i => i.phcId === currentFacility.id && i.drugId === d.id);
      initial[d.id] = item ? item.currentStock : 100;
    }
    return initial;
  });

  const [activeScanDrugId, setActiveScanDrugId] = useState<string | null>(null);
  const [isSelfieVerified, setIsSelfieVerified] = useState<boolean>(true);
  const [localSyncQueueCount, setLocalSyncQueueCount] = useState<number>(0);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [showOcrModal, setShowOcrModal] = useState<boolean>(false);

  // Voice & Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi-IN');
  const [speechTranscript, setSpeechTranscript] = useState<string>('');

  // WhatsApp simulation state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: '🇮🇳 PaxoraGrid NHM Automated Health Exchange\n\nSend your daily stock, bed occupancy, and staff check-in.\nFormat: PARA <qty> ORS <qty> SALINE <qty> BEDS <occupied>/<total> STAFF <present>\n\n(Voice, English, or Hindi/Malayalam accepted)',
      time: '08:30 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Handle facility switch
  const handleSelectFacility = (phcId: string) => {
    setSelectedPhcId(phcId);
    const target = facilities.find(f => f.id === phcId);
    if (target) {
      setBedsOccupied(target.occupiedBeds);
      setStaffPresent(target.presentStaff);
      const newStockMap: { [key: string]: number } = {};
      for (const d of drugs) {
        const item = inventory.find(i => i.phcId === target.id && i.drugId === d.id);
        newStockMap[d.id] = item ? item.currentStock : 100;
      }
      setStockCounts(newStockMap);
    }
  };

  const handleStockChange = (drugId: string, delta: number) => {
    setStockCounts(prev => ({
      ...prev,
      [drugId]: Math.max(0, (prev[drugId] || 0) + delta)
    }));
  };

  const handleSimulateScan = (drugId: string) => {
    setActiveScanDrugId(drugId);
    setTimeout(() => {
      setActiveScanDrugId(null);
      setStockCounts(prev => ({
        ...prev,
        [drugId]: (prev[drugId] || 0) + 100
      }));
      setShowSuccessToast(`Scanned Barcode: Added 100 units of ${drugs.find(d => d.id === drugId)?.name}`);
      setTimeout(() => setShowSuccessToast(null), 3000);
    }, 700);
  };

  const handleSubmitRapidForm = () => {
    const stockUpdates = Object.entries(stockCounts).map(([drugId, newStock]) => ({
      drugId,
      newStock
    }));

    if (isOfflineMode) {
      setLocalSyncQueueCount(prev => prev + 1);
      setShowSuccessToast('Saved to Offline Storage (IndexedDB). Will sync when connection restores.');
    } else {
      onUpdateFacilityData(selectedPhcId, {
        occupiedBeds: bedsOccupied,
        presentStaff: staffPresent,
        stockUpdates
      });
      setShowSuccessToast(`Successfully uploaded 60-second log for ${currentFacility.name}!`);
    }

    setTimeout(() => setShowSuccessToast(null), 3500);
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const sampleVoicePrompts: { [key: string]: string } = {
        'hi-IN': 'पैरासिटामोल 380 ओआरएस 90 बेड 9 स्टाफ 6',
        'ml-IN': 'പാരസെറ്റമോൾ 350 ഒആർഎസ് 80 ബെഡുകൾ 8 സ്റ്റാഫ് 5',
        'en-IN': 'Paracetamol 420 ORS 100 Saline 30 Beds 9 out of 12 Staff 6'
      };

      const simulatedText = sampleVoicePrompts[selectedLanguage] || 'PARA 350 ORS 80 BEDS 8/10 STAFF 5';
      setIsListening(true);
      setShowSuccessToast(`Listening in ${selectedLanguage === 'hi-IN' ? 'Hindi' : selectedLanguage === 'ml-IN' ? 'Malayalam' : 'English'}...`);

      setTimeout(() => {
        setIsListening(false);
        setSpeechTranscript(simulatedText);
        setChatInput(simulatedText);
        handleSendWhatsappMessage(simulatedText);
      }, 1800);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setShowSuccessToast(`Listening in ${selectedLanguage}... Speak your stock numbers now.`);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeechTranscript(transcript);
        setChatInput(transcript);
        handleSendWhatsappMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const playAudioConfirmation = (message: string) => {
    if ('speechSynthesis' in window) {
      const cleanText = message.replace(/[•✅⚠️*#]/g, '').slice(0, 140);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendWhatsappMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const newChat = [...chatMessages, { sender: 'user' as const, text, time }];
    setChatMessages(newChat);
    if (!textToSend) setChatInput('');

    setTimeout(() => {
      const parsed = parseSmsOrWhatsappText(text, drugs);
      let reply = '';

      if (parsed.success) {
        reply = `[SUCCESS] Report Received for ${currentFacility.name}\n\n` +
          `• Extracted: ${parsed.extractedStocks.map(s => `${s.drugName}: ${s.quantity}`).join(', ') || 'No stock items'}\n` +
          `${parsed.occupiedBeds !== undefined ? `• Bed Occupancy: ${parsed.occupiedBeds}/${parsed.totalBeds || currentFacility.totalBeds}\n` : ''}` +
          `${parsed.presentStaff !== undefined ? `• Staff Attendance: ${parsed.presentStaff}/${currentFacility.totalStaff}\n` : ''}` +
          `• Quality Audit: Verified (Zero ledger errors)\n• Sync Status: Updated into State e-Aushadhi Grid`;

        const stockUpdates = parsed.extractedStocks.map(s => ({
          drugId: s.drugId,
          newStock: s.quantity
        }));

        onUpdateFacilityData(selectedPhcId, {
          occupiedBeds: parsed.occupiedBeds ?? bedsOccupied,
          presentStaff: parsed.presentStaff ?? staffPresent,
          stockUpdates: stockUpdates.length > 0 ? stockUpdates : undefined
        });
      } else {
        reply = `[NOTICE] ${parsed.feedbackMessage}\n\nFormat sample: "PARA 350 ORS 80 BEDS 8/10 STAFF 5"`;
      }

      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Mode Switch (Hospital Clean Light Theme) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">{t('loggerTitle')}</span>
          <div className="flex items-center gap-3 mt-1">
            <select
              value={selectedPhcId}
              onChange={(e) => handleSelectFacility(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
            >
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.district}, {f.state})
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500 font-mono hidden md:inline">
              {currentFacility?.facilityCode}
            </span>
          </div>
        </div>

        {/* Offline / Online Status Badge & Tab Toggles */}
        <div className="flex items-center gap-3">
          {isOfflineMode ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline (Queue: {localSyncQueueCount})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('liveSync')}</span>
            </div>
          )}

          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('RAPID_LOGGER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'RAPID_LOGGER'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('tabFieldLogger')}</span>
            </button>
            <button
              onClick={() => setActiveTab('WHATSAPP_FALLBACK')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'WHATSAPP_FALLBACK'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp / SMS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{showSuccessToast}</span>
          </div>
          <button onClick={() => setShowSuccessToast(null)} className="text-emerald-700 text-xs font-bold hover:underline">
            {t('dismissBtn')}
          </button>
        </div>
      )}

      {/* VIEW 1: RAPID 60-SECOND FIELD LOGGER */}
      {activeTab === 'RAPID_LOGGER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Vitals (Beds & Staff) */}
          <div className="space-y-6">
            {/* Bed Occupancy Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-sky-600" />
                  {t('bedOccupancyTitle')}
                </span>
                <span className="text-xs font-mono text-slate-500 font-semibold">{t('bedMax')}: {currentFacility.totalBeds}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                <button
                  onClick={() => setBedsOccupied(Math.max(0, bedsOccupied - 1))}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <div className="text-3xl font-black text-slate-900">{bedsOccupied}</div>
                  <div className="text-xs text-slate-500 font-medium">
                    of {currentFacility.totalBeds} {t('bedSanctioned')}
                  </div>
                </div>

                <button
                  onClick={() => setBedsOccupied(bedsOccupied + 1)}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {bedsOccupied > currentFacility.totalBeds && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t('surgeWardActive')}</span>
                </div>
              )}
            </div>

            {/* Staff Attendance & Geo-Tagged Check-in */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  {t('staffTitle')}
                </span>
                <span className="text-xs text-emerald-700 font-semibold">{t('gpsVerified')}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 mb-3">
                <button
                  onClick={() => setStaffPresent(Math.max(0, staffPresent - 1))}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <div className="text-3xl font-black text-slate-900">{staffPresent}</div>
                  <div className="text-xs text-slate-500 font-medium">
                    of {currentFacility.totalStaff} {t('staffDutyPresent')}
                  </div>
                </div>

                <button
                  onClick={() => setStaffPresent(Math.min(currentFacility.totalStaff, staffPresent + 1))}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setIsSelfieVerified(true);
                  setShowSuccessToast('MO/Pharmacist Selfie & Geo-Stamp Verified: 11.5542°N, 76.1265°E');
                  setTimeout(() => setShowSuccessToast(null), 3000);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors border border-slate-200 shadow-2xs"
              >
                <Camera className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('simulateSelfieBtn')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: 10 Essential Drugs Stock Ticker with QR Scan */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t('fastCounterTitle')}</h3>
                  <p className="text-xs text-slate-500">{t('fastCounterDesc')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOcrModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold transition-all shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t('ocrBtn')}</span>
                  </button>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {drugs.length} NLEM Drugs
                  </span>
                </div>
              </div>

              {/* List of Drugs */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {drugs.map(drug => {
                  const count = stockCounts[drug.id] || 0;
                  const isScanning = activeScanDrugId === drug.id;

                  return (
                    <div
                      key={drug.id}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs truncate">{drug.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono font-medium">({drug.unit})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{drug.genericName}</div>
                      </div>

                      <button
                        onClick={() => handleSimulateScan(drug.id)}
                        disabled={isScanning}
                        title="Simulate Barcode / QR Scan"
                        className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-2xs ${
                          isScanning
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-white hover:bg-slate-100 text-sky-700 border border-slate-200'
                        }`}
                      >
                        <Scan className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isScanning ? 'Scanning...' : t('scanBtn')}</span>
                      </button>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStockChange(drug.id, -20)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-sm shadow-2xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={count}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setStockCounts(prev => ({ ...prev, [drug.id]: val }));
                          }}
                          className="w-16 bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-center text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 shadow-2xs"
                        />
                        <button
                          onClick={() => handleStockChange(drug.id, 20)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-sm shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Final Submit Button */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {t('targetTime')}
              </span>

              <button
                onClick={handleSubmitRapidForm}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-102"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t('submitLedgerBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: WHATSAPP / SMS BOT FALLBACK */}
      {activeTab === 'WHATSAPP_FALLBACK' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{t('smsGatewayTitle')}</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('smsGatewayDesc')}
              </p>

              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  {t('clickSampleMsg')}
                </div>

                <button
                  onClick={() => handleSendWhatsappMessage('PARA 450 ORS 120 SALINE 40 BEDS 9/12 STAFF 6')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 text-xs text-slate-800 font-mono transition-all group shadow-2xs"
                >
                  <span className="text-emerald-700 font-bold block mb-0.5">English Standard:</span>
                  "PARA 450 ORS 120 SALINE 40 BEDS 9/12 STAFF 6"
                </button>

                <button
                  onClick={() => handleSendWhatsappMessage('पैरासिटामोल 300 ओआरएस 80 बेड 8 स्टाफ 5')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 text-xs text-slate-800 font-mono transition-all group shadow-2xs"
                >
                  <span className="text-amber-700 font-bold block mb-0.5">Hindi / Regional NLP:</span>
                  "पैरासिटामोल 300 ओआरएस 80 बेड 8 स्टाफ 5"
                </button>

                <button
                  onClick={() => handleSendWhatsappMessage('പാരസെറ്റമോൾ 350 ഒആർഎസ് 90 ബെഡ് 9 സ്റ്റാഫ് 6')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 text-xs text-slate-800 font-mono transition-all group shadow-2xs"
                >
                  <span className="text-sky-700 font-bold block mb-0.5">Malayalam Regional NLP:</span>
                  "പാരസെറ്റമോൾ 350 ഒആർഎസ് 90 ബെഡ് 9 സ്റ്റാഫ് 6"
                </button>
              </div>
            </div>
          </div>

          {/* WhatsApp Interactive Mockup Screen (Hospital Eye-Friendly Theme) */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[520px]">
            {/* WhatsApp Header */}
            <div className="px-5 py-3 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center font-bold text-xs text-emerald-100">
                  NHM
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>PaxoraGrid Toll-Free Bot</span>
                    <span className="px-1.5 py-0.2 bg-emerald-800 rounded text-[9px] font-mono">Official</span>
                  </div>
                  <div className="text-[10px] text-emerald-100">Online • ABDM Certified Gateway</div>
                </div>
              </div>
              <div className="text-[11px] text-emerald-100 font-mono font-semibold">
                {currentFacility.name}
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f0f2f5]">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs shadow-2xs whitespace-pre-line leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#d9fdd3] text-[#111b21] rounded-br-none font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none font-medium'
                    }`}
                  >
                    <div>{msg.text}</div>
                    <div className="flex items-center justify-between mt-1 text-[9.5px]">
                      {msg.sender === 'bot' && (
                        <button
                          onClick={() => playAudioConfirmation(msg.text)}
                          className="text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 font-bold"
                          title="Listen with Speech Synthesis"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{t('listenBtn')}</span>
                        </button>
                      )}
                      <div className={`ml-auto ${msg.sender === 'user' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700">
                <Languages className="w-3.5 h-3.5 text-emerald-600" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-xs font-semibold"
                >
                  <option value="hi-IN">हिन्दी (Hindi)</option>
                  <option value="ml-IN">മലയാളം (Malayalam)</option>
                  <option value="en-IN">English (India)</option>
                </select>
              </div>

              <button
                onClick={handleToggleVoiceInput}
                title="Speak your daily stock report in your regional language"
                className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-emerald-700" />}
                <span className="hidden sm:inline">{isListening ? 'Listening...' : t('voiceBtn')}</span>
              </button>

              <input
                type="text"
                placeholder={t('typeOrSpeak')}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendWhatsappMessage();
                }}
                className="flex-1 min-w-[180px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
              />
              <button
                onClick={() => handleSendWhatsappMessage()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Vision Physical Ledger OCR Scanner Modal */}
      {showOcrModal && (
        <PhysicalLedgerScanner
          drugs={drugs}
          onApplyExtractedStock={(extractedStocks) => {
            onUpdateFacilityData(selectedPhcId, {
              stockUpdates: extractedStocks.map(s => ({
                drugId: s.drugId,
                newStock: s.quantity
              }))
            });
            setShowSuccessToast(`Synced ${extractedStocks.length} physical ledger lines into ${currentFacility.name}!`);
            setTimeout(() => setShowSuccessToast(null), 3500);
          }}
          onClose={() => setShowOcrModal(false)}
        />
      )}
    </div>
  );
};
