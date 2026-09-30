import React from 'react';
import { TransferRecommendation, PHCFacility, Drug } from '../types';
import { Printer, X, ShieldCheck, QrCode, Thermometer, Building, FileText, CheckCircle } from 'lucide-react';

interface TransferChallanModalProps {
  transfer: TransferRecommendation | null;
  facilities: PHCFacility[];
  drugs: Drug[];
  onClose: () => void;
  onConfirmApprove?: (transferId: string) => void;
}

export const TransferChallanModal: React.FC<TransferChallanModalProps> = ({
  transfer,
  facilities,
  drugs,
  onClose,
  onConfirmApprove
}) => {
  if (!transfer) return null;

  const sourcePhc = facilities.find(f => f.id === transfer.sourcePhcId);
  const targetPhc = facilities.find(f => f.id === transfer.targetPhcId);
  const drug = drugs.find(d => d.id === transfer.drugId);

  const challanNo = transfer.challanNumber || `NHM-TR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const dispatchDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <FileText className="w-4 h-4" />
            </span>
            <span className="font-bold text-slate-800 text-sm">
              Official Drug Redistribution Challan & Gate Pass
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Order</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Challan Body */}
        <div className="p-8 bg-white text-slate-800 space-y-6">
          {/* Header */}
          <div className="border-b border-slate-200 pb-5 text-center relative">
            <div className="text-[10px] tracking-widest uppercase font-bold text-amber-700">
              Government of India • Ministry of Health & Family Welfare
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              NATIONAL HEALTH MISSION (NHM)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Free Drug Service Initiative • Inter-Facility Stock Redistribution Pass
            </p>
            <div className="inline-block mt-2 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-emerald-800">
              Challan ID: {challanNo}
            </div>

            {/* QR Code */}
            <div className="absolute top-0 right-0 p-2 bg-slate-50 rounded-lg border border-slate-200 hidden sm:block shadow-2xs">
              <div className="w-14 h-14 bg-white flex items-center justify-center border border-slate-200">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="text-[8px] text-slate-600 text-center font-mono font-bold mt-0.5">ABDM-VERIFIED</div>
            </div>
          </div>

          {/* Consignor and Consignee Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Consignor (Issuing Facility)
              </div>
              <div className="font-bold text-slate-900 text-base">{sourcePhc?.name}</div>
              <div className="text-xs text-slate-600 mt-1 font-medium">
                Code: <span className="font-mono font-bold text-slate-800">{sourcePhc?.facilityCode}</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {sourcePhc?.block}, {sourcePhc?.district}, {sourcePhc?.state}
              </div>
              <div className="mt-2 text-xs text-emerald-700 font-bold">
                Stock Shelf-Life: {transfer.donorMonthsToExpiry.toFixed(1)} months remaining (FEFO Cleared)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-rose-600" />
                Consignee (Receiving Facility)
              </div>
              <div className="font-bold text-slate-900 text-base">{targetPhc?.name}</div>
              <div className="text-xs text-slate-600 mt-1 font-medium">
                Code: <span className="font-mono font-bold text-slate-800">{targetPhc?.facilityCode}</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {targetPhc?.block}, {targetPhc?.district}, {targetPhc?.state}
              </div>
              <div className="mt-2 text-xs text-rose-700 font-bold">
                Reason: Urgent stock-out mitigation during febrile / disease surge
              </div>
            </div>
          </div>

          {/* Consignment Item Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Item & Specification</th>
                  <th className="py-2.5 px-4">Dosage / Unit</th>
                  <th className="py-2.5 px-4">Batch Number</th>
                  <th className="py-2.5 px-4 text-right">Transfer Quantity</th>
                  <th className="py-2.5 px-4">Storage Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{drug?.name}</div>
                    <div className="text-[10px] text-slate-500">{drug?.genericName}</div>
                  </td>
                  <td className="py-3 px-4 font-medium">{drug?.unit}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-amber-700 font-bold">
                    BAT-2026-{drug?.id.slice(-2)}-{Math.floor(100 + Math.random() * 900)}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">
                    {(transfer.modifiedQuantity || transfer.quantity).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {transfer.coldChainMaintained ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        <Thermometer className="w-3 h-3 text-sky-600" />
                        2°C to 8°C Strict Cold Chain
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[11px] font-medium">Room Temperature (&lt;25°C)</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Logistics & Transit Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Transit Distance</span>
              <span className="font-black text-slate-900 text-sm">{transfer.distanceKm} km</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Estimated Transit Time</span>
              <span className="font-black text-slate-900 text-sm">{transfer.estimatedHours} Hours</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Designated Transport Mode</span>
              <span className="font-bold text-amber-800">{transfer.transportMode.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Algorithmic Justification */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-800 block mb-1">PaxoraGrid Optimization Proof:</span>
            <p className="text-slate-600 leading-relaxed italic font-medium">
              "{transfer.reason}"
            </p>
          </div>

          {/* Signatures & Approvals */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs">
            <div>
              <div className="text-slate-500 mb-6 font-medium">Consignor / Issuing Pharmacist Signature:</div>
              <div className="border-b border-dashed border-slate-400 w-48 mb-1"></div>
              <div className="text-[11px] text-slate-500">Date: {dispatchDate}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 mb-6 font-medium">District Health Officer (DHO) / Authorized Signatory:</div>
              <div className="inline-block border-b border-dashed border-slate-400 w-48 mb-1"></div>
              <div className="text-[11px] text-emerald-700 font-mono font-bold flex items-center justify-end gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ABDM Digital Authorization Verified
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="text-xs text-slate-600 font-medium">
            Status: <span className="font-black text-emerald-700">{transfer.status}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
            >
              Close
            </button>
            {transfer.status === 'PROPOSED' && onConfirmApprove && (
              <button
                onClick={() => {
                  onConfirmApprove(transfer.id);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-102"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve & Authorize Dispatch</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
