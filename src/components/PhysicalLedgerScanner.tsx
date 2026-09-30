import React, { useState } from 'react';
import { Camera, Sparkles, CheckCircle, FileText, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Drug } from '../types';

interface PhysicalLedgerScannerProps {
  drugs: Drug[];
  onApplyExtractedStock: (extractedStocks: { drugId: string; quantity: number }[]) => void;
  onClose: () => void;
}

export const PhysicalLedgerScanner: React.FC<PhysicalLedgerScannerProps> = ({
  onApplyExtractedStock,
  onClose
}) => {
  const [selectedSample, setSelectedSample] = useState<'REGISTER' | 'BLISTER_BATCH' | 'DELIVERY_CHALLAN'>('REGISTER');
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [digitizedResult, setDigitizedResult] = useState<any | null>(null);

  const sampleDescriptions = {
    REGISTER: 'Sample: Handwritten PHC Drug Stock Register (Folio #42, Paracetamol, ORS, IV Saline)',
    BLISTER_BATCH: 'Sample: Physical Box Photo of Paracetamol 500mg (Batch BAT-2026-01-419)',
    DELIVERY_CHALLAN: 'Sample: District Drug Warehouse Inbound Delivery Receipt'
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImageBase64(reader.result as string);
        setDigitizedResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunDigitization = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/digitize-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleType: selectedSample,
          imageBase64: customImageBase64
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDigitizedResult(data.extractedRegister);
      }
    } catch (err) {
      console.error('Failed to digitize register:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!digitizedResult?.items) return;
    const formatted = digitizedResult.items.map((item: any) => ({
      drugId: item.drugId || 'DRUG-01',
      quantity: item.quantityRemaining || item.quantity || 100
    }));
    onApplyExtractedStock(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-800">
        {/* Header (Hospital Clean Light Theme) */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Camera className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Gemini Vision: Physical Stock Ledger OCR</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                  Multimodal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Digitizes paper registers & medicine barcodes into ABDM schema</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Select Standard Document or Upload Photo:
              </label>
              <label className="flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-[11px] font-bold cursor-pointer hover:bg-emerald-50 transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Image</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {customImageBase64 ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-emerald-400 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Custom Photo Attached</span>
                    <span className="text-[10px] text-slate-500">Ready for multimodal extraction</span>
                  </div>
                </div>
                <button
                  onClick={() => setCustomImageBase64(null)}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Clear Photo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'REGISTER' as const, label: 'Handwritten Ledger', icon: FileText },
                  { id: 'BLISTER_BATCH' as const, label: 'Medicine Box / QR', icon: Camera },
                  { id: 'DELIVERY_CHALLAN' as const, label: 'Warehouse Receipt', icon: Upload }
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedSample(opt.id);
                        setDigitizedResult(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedSample === opt.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1 text-emerald-600" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {!customImageBase64 && (
              <div className="mt-2 text-[11px] text-slate-500 italic font-medium">
                {sampleDescriptions[selectedSample]}
              </div>
            )}
          </div>

          {/* Action to scan */}
          {!digitizedResult && (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <Camera className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-slate-600 text-xs font-medium">
                Ready to transcribe with Gemini 3.8 Flash Vision. Extracts medicine generic name, batch numbers, remaining balance, and expiry date.
              </p>
              <button
                onClick={handleRunDigitization}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-102 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Transcribing with Gemini Vision...' : 'Digitize Document with Gemini AI'}</span>
              </button>
            </div>
          )}

          {/* Result view */}
          {digitizedResult && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 text-xs block">OCR Extraction Succeeded!</span>
                  <span className="text-[11px] text-slate-600 font-medium">{digitizedResult.facilityName} • Date: {digitizedResult.date}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-mono font-bold">
                  {digitizedResult.items?.length || 0} Lines Extracted
                </span>
              </div>

              {/* Items Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Medicine</th>
                      <th className="py-2.5 px-3">Batch #</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                      <th className="py-2.5 px-3 text-right">Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {digitizedResult.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900">{item.drugName}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{item.batchNumber}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700 text-right">
                          {item.quantityRemaining}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500 text-right">{item.expiryDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {digitizedResult.auditNotes && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <strong>Auditor Note: </strong> {digitizedResult.auditNotes}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDigitizedResult(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Rescan
                </button>
                <button
                  onClick={handleApply}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Apply to PHC Ledger</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
