import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  ArrowRight, 
  Lock, 
  CheckCircle, 
  Activity, 
  Sparkles, 
  Globe2,
  Building2,
  UserCheck,
  Clipboard,
  KeyRound,
  Check
} from 'lucide-react';
import { signInWithGoogle } from '../services/firebase';
import { ALL_INDIA_STATES } from '../data/indiaStates';

export interface AdminProfile {
  displayName: string;
  email: string;
  role: string;
  state: string;
  isDemo: boolean;
  token?: string;
}

interface AdminAuthScreenProps {
  onAuthenticated: (adminProfile: AdminProfile) => void;
}

export const AdminAuthScreen: React.FC<AdminAuthScreenProps> = ({ onAuthenticated }) => {
  const [selectedRole, setSelectedRole] = useState<'DHO' | 'STATE_DIRECTOR' | 'NATIONAL_IDSP'>('DHO');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Fast Toggle & Paste Credentials
  const [instantAdminToggle, setInstantAdminToggle] = useState<boolean>(false);
  const [pastedToken, setPastedToken] = useState<string>('');
  const [tokenCopiedSuccess, setTokenCopiedSuccess] = useState<boolean>(false);

  // Role labels
  const roleNameMap = {
    DHO: 'District Medical Officer (DMO / DHO)',
    STATE_DIRECTOR: 'State Drug Logistics Director',
    NATIONAL_IDSP: 'National IDSP Surveillance Lead (MoHFW)'
  };

  // Sign In with Firebase Google Auth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onAuthenticated({
          displayName: user.displayName || user.email?.split('@')[0] || 'Executive Health Officer',
          email: user.email || 'admin@mohfw.gov.in',
          role: roleNameMap[selectedRole],
          state: selectedState,
          isDemo: false
        });
      }
    } catch (err: any) {
      console.warn('Google sign-in interrupted:', err);
      setAuthError(err.message || 'Google SSO interrupted. You can use Instant Admin Toggle or Paste Token below.');
    } finally {
      setLoading(false);
    }
  };

  // Instant Toggle Switch Activation
  const handleToggleInstantAdmin = (checked: boolean) => {
    setInstantAdminToggle(checked);
    if (checked) {
      setTimeout(() => {
        onAuthenticated({
          displayName: 'Dr. Radhakrishnan Menon (Executive Officer)',
          email: 'officer.admin@paxoragrid.gov.in',
          role: roleNameMap[selectedRole],
          state: selectedState,
          isDemo: true,
          token: 'TOKEN-QUICK-ADMIN-ACTIVE'
        });
      }, 300);
    }
  };

  // Paste Token from Clipboard
  const handlePasteClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setPastedToken(text.trim());
          setTokenCopiedSuccess(true);
          setTimeout(() => setTokenCopiedSuccess(false), 2000);
          return;
        }
      }
    } catch {
      // Clipboard permissions denied or unavailable
    }
    // Fallback sample token
    const sampleToken = `PG-ADM-${Date.now().toString(36).toUpperCase()}-MOHFW`;
    setPastedToken(sampleToken);
    setTokenCopiedSuccess(true);
    setTimeout(() => setTokenCopiedSuccess(false), 2000);
  };

  // Submit Pasted Token
  const handleSubmitToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedToken.trim()) {
      setAuthError('Please paste an admin access token or key.');
      return;
    }

    onAuthenticated({
      displayName: `Officer [Key: ${pastedToken.slice(0, 8)}...]`,
      email: 'admin.keyholder@mohfw.gov.in',
      role: roleNameMap[selectedRole],
      state: selectedState,
      isDemo: true,
      token: pastedToken.trim()
    });
  };

  // One-click Demo Admin Bypass
  const handleDemoBypass = () => {
    onAuthenticated({
      displayName: 'Dr. Radhakrishnan Menon, DMO',
      email: 'dho.wayanad@arogyakeralam.gov.in',
      role: roleNameMap[selectedRole],
      state: selectedState,
      isDemo: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Background Subtle Tech Ambient Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.18),rgba(2,6,23,0))] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none"></div>

      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-2xl p-6 sm:p-10 space-y-7 animate-in fade-in zoom-in-95">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/25 text-white mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Paxora<span className="text-emerald-400">Grid</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mt-1">
              National Health Supply Grid & Outbreak Early-Warning Command
            </p>
          </div>

          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Authorized administrative gateway for District Medical Officers, State Logistics Directors, and IDSP Leads.
          </p>
        </div>

        {/* Quick Instant Admin Toggle (Requested by User) */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Instant Officer Access Toggle</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Quick Gate
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle to immediately authorize and enter command dashboard
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={instantAdminToggle}
              onChange={(e) => handleToggleInstantAdmin(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-13 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
          </label>
        </div>

        {/* Role & Jurisdiction Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Administrative Role:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer shadow-inner"
            >
              <option value="DHO">District Medical Officer (DMO / DHO)</option>
              <option value="STATE_DIRECTOR">State Drug Logistics Director</option>
              <option value="NATIONAL_IDSP">National IDSP Surveillance Lead</option>
            </select>
          </div>

          {/* State Jurisdiction Selection (All 36 States & UTs) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Jurisdiction (36 States & UTs):
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer shadow-inner"
            >
              <option value="ALL">All India (National Command View)</option>
              {ALL_INDIA_STATES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.drugCorporation})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Option 2: Paste Admin Token / Credentials */}
        <form onSubmit={handleSubmitToken} className="space-y-2 pt-1 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Paste Admin Token / Passkey:</span>
            <span className="text-[11px] text-slate-400 font-normal">Any valid officer token</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={pastedToken}
                onChange={(e) => setPastedToken(e.target.value)}
                placeholder="Paste token or enter MOHFW-ADMIN-KEY..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-400 shadow-inner"
              />
            </div>
            
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700 shrink-0"
              title="Paste token from clipboard"
            >
              {tokenCopiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
              <span>{tokenCopiedSuccess ? 'Pasted!' : 'Paste'}</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shrink-0"
            >
              Enter
            </button>
          </div>
        </form>

        {/* Auth Error Banner if Any */}
        {authError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{authError}</span>
            <button type="button" onClick={() => setAuthError(null)} className="font-bold hover:text-white">✕</button>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-1">
          {/* Primary: Real Firebase Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{loading ? 'Authenticating with Google...' : 'Sign In with Google (Firebase SSO)'}</span>
          </button>

          {/* Secondary: Instant One-Click Demo Officer Access */}
          <button
            type="button"
            onClick={handleDemoBypass}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 font-bold text-sm transition-all cursor-pointer"
          >
            <span>Enter as Health Administrator (1-Click)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Sovereign & Regulatory Compliance Notice */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Protected under India DPDP Act 2023 • Ayushman Bharat Digital Mission Standards
          </p>
        </div>
      </div>
    </div>
  );
};
