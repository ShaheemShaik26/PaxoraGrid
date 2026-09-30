import React from 'react';
import { 
  Shield, 
  Network, 
  Smartphone, 
  Zap, 
  MapPin, 
  HeartPulse,
  Languages,
  Activity,
  Mic,
  MessageSquare,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../services/i18n';
import { ALL_INDIA_STATES } from '../data/indiaStates';

export type ActiveView = 'DHO_DASHBOARD' | 'FEDERATED_GRID' | 'PHC_LOGGER' | 'OUTBREAK_SIMULATOR';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  pendingTransfersCount: number;
  onOpenDiagnostics?: () => void;
  adminProfile?: {
    displayName: string;
    role: string;
    email: string;
    isDemo: boolean;
  } | null;
  onSignOut?: () => void;
  onOpenVoice?: () => void;
  onOpenChat?: () => void;
  onRunStorylineDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  selectedState,
  setSelectedState,
  pendingTransfersCount,
  onOpenDiagnostics,
  adminProfile,
  onSignOut,
  onOpenVoice,
  onOpenChat,
  onRunStorylineDemo
}) => {
  const { t, currentLanguage, setCurrentLanguage } = useTranslation();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">
                Paxora<span className="text-emerald-600">Grid</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                National PHC Platform
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              {t('appTagline')}
            </p>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <nav className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs">
          <button
            onClick={() => setActiveView('DHO_DASHBOARD')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeView === 'DHO_DASHBOARD'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Health Resource Command</span>
            {pendingTransfersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                {pendingTransfersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('FEDERATED_GRID')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeView === 'FEDERATED_GRID'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Network className="w-4 h-4 text-teal-600" />
            <span>Federated State Grid</span>
          </button>

          <button
            onClick={() => setActiveView('PHC_LOGGER')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeView === 'PHC_LOGGER'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>PHC Field Terminal</span>
          </button>

          <button
            onClick={() => setActiveView('OUTBREAK_SIMULATOR')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeView === 'OUTBREAK_SIMULATOR'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Emergency Drill</span>
          </button>
        </nav>

        {/* Right Section: Language, State, AI Tools, Admin Profile */}
        <div className="flex items-center gap-2.5">
          {/* Major Indian Language Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs shadow-2xs">
            <Languages className="w-4 h-4 text-slate-500" />
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
              aria-label="Select Official Language"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* All 36 States & UTs Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs shadow-2xs">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs max-w-[160px] truncate"
            >
              <option value="ALL">All India (36 States & UTs)</option>
              {ALL_INDIA_STATES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Health Telemetry Diagnostics Button */}
          {onOpenDiagnostics && (
            <button
              onClick={onOpenDiagnostics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="Inspect health resource and stock telemetry"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Telemetry</span>
            </button>
          )}

          {/* Real-time Voice & Chatbot Tools */}
          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs cursor-pointer transition-all hover:scale-105"
              title="Start Gemini Live Voice Conversation (gemini-3.8-live)"
            >
              <Mic className="w-4 h-4 text-rose-600" />
            </button>
          )}

          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs cursor-pointer transition-all hover:scale-105"
              title="Open Gemini Chatbot (Search & Maps Grounded)"
            >
              <MessageSquare className="w-4 h-4 text-indigo-600" />
            </button>
          )}

          {/* Admin Profile & Sign Out */}
          {adminProfile && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {adminProfile.displayName}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {adminProfile.role}
                </div>
              </div>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors cursor-pointer"
                  title="Sign Out of Admin Console"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
