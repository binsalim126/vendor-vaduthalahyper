import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Check, PlusCircle, ArrowLeft, Printer, ShieldCheck, ShoppingBag, PhoneCall, Building2 } from 'lucide-react';
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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = new Date(submission.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-8 text-center relative overflow-hidden">
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
            Application Submitted!
          </h2>
          <p className="text-emerald-100 text-sm font-normal max-w-sm mx-auto">
            Thank you for registering with Vaduthala Hyper Shopee. Our procurement team will review your details.
          </p>
        </div>

        {/* Details Card */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Submission Reference Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Reference ID
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
                  <span className="text-emerald-700">Copied to clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Reference ID</span>
                </>
              )}
            </button>
          </div>

          {/* Submission Info Summary */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Submission Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                <Building2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Venture & Company</p>
                  <p className="font-semibold text-slate-800">{submission.venture_name}</p>
                  <p className="text-xs text-slate-500">{submission.company_name}</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                <PhoneCall className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Contact Phone</p>
                  <p className="font-semibold text-slate-800 font-mono">{submission.phone}</p>
                  <p className="text-xs text-slate-500">{formattedDate} • {formattedTime}</p>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-600">
                  Products Registered ({submission.products.length}):
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {submission.products.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Your data has been safely encrypted and forwarded to Vaduthala Hyper Shopee procurement desk.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Confirmation Slip</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-600/20 active:scale-[0.98]"
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
