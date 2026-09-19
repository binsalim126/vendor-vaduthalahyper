import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  PlusCircle, 
  Printer, 
  ShieldCheck, 
  Package, 
  PhoneCall, 
  Building2, 
  FileText,
  Calendar,
  Clock,
  Store
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VendorSubmission } from '../../lib/types';

interface SubmissionSuccessProps {
  submission: VendorSubmission;
  onReset: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  submission,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire festive confetti animation
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#009639', '#10B981', '#059669', '#34D399', '#111827'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(submission.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(submission.created_at).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = new Date(submission.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Calculate items count
  const hasDetailedItems = submission.product_items && submission.product_items.length > 0;
  const itemsCount = hasDetailedItems ? submission.product_items!.length : submission.products.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden printable-slip"
      >
        {/* Top Celebration Banner (Screen only) */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-8 text-center relative overflow-hidden no-print">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-lg"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>

          <h2 className="text-2xl font-bold tracking-tight mb-1">
            Application & Products Submitted!
          </h2>
          <p className="text-emerald-100 text-sm font-normal max-w-md mx-auto">
            Your vendor registration and product supply details have been securely recorded. Print or save your confirmation slip below.
          </p>
        </div>

        {/* Printable Official Header (Visible on print & in slip) */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Official Letterhead Header for Slip */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo.png"
                alt="Vaduthala Hyper Shopee"
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Vaduthala Hyper Shopee
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  Official Supplier Onboarding Confirmation Slip
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Slip Reference
              </span>
              <span className="text-sm sm:text-base font-mono font-extrabold text-emerald-700 block">
                {submission.id}
              </span>
            </div>
          </div>

          {/* Reference Banner with 1-click copy (No-print buttons) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Your Registration Reference ID
              </span>
              <span className="text-lg font-mono font-bold text-slate-800">
                {submission.id}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied ID</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Reference ID</span>
                </>
              )}
            </button>
          </div>

          {/* Submission Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Venture / Legal Entity</p>
                <p className="font-bold text-slate-900 text-sm">{submission.venture_name}</p>
                <p className="text-xs text-slate-600">{submission.company_name}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <PhoneCall className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Contact & Date</p>
                <p className="font-bold text-slate-900 font-mono">{submission.phone}</p>
                <p className="text-xs text-slate-500">{formattedDate} • {formattedTime}</p>
              </div>
            </div>
          </div>

          {/* Itemized Products & Quantities Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Registered Products & Supply Quantities ({itemsCount})
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Verified Breakdown
              </span>
            </div>

            {hasDetailedItems ? (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Product / Item Description</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Specifications / Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {submission.product_items!.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-right text-emerald-700">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-600">
                          {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500">
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Fallback to simple tags if no detailed items */
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap gap-1.5">
                {submission.products.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Custom Responses (if any) */}
          {submission.custom_answers && Object.keys(submission.custom_answers).length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Additional Details:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(submission.custom_answers).map(([key, val]) => {
                  if (val === undefined || val === null || val === '') return null;
                  const display = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : Array.isArray(val) ? val.join(', ') : String(val);
                  return (
                    <div key={key} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[10px] capitalize">{key.replace('cust_', '').replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-slate-800">{display}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Printable Authorization & Verification Footer */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Vaduthala Hyper Shopee Procurement & Vendor Control Desk</span>
              </div>
              <span className="font-mono text-[10px]">Status: NEW / SUBMITTED</span>
            </div>

            {/* Print Signature Section (Visible on physical paper) */}
            <div className="hidden print-only pt-8 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="h-10 border-b border-slate-400 mb-1" />
                <p className="font-semibold text-slate-700">Vendor Representative Signature</p>
              </div>
              <div>
                <div className="h-10 border-b border-slate-400 mb-1" />
                <p className="font-semibold text-slate-700">Vaduthala Procurement Officer</p>
              </div>
            </div>
          </div>

          {/* Action Buttons (Hidden when printing) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-3.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <Printer className="w-4 h-4" />
              <span>Print Confirmation Slip</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-600/20 active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Another Application</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
