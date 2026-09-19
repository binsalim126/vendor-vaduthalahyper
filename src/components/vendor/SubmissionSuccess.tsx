import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Share2,
  Download,
  Sparkles
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
  const [shareStatus, setShareStatus] = useState<string | null>(null);

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

  // Handle Share Slip (via Native Share API or Clipboard Fallback)
  const handleShare = async () => {
    const itemsText = hasDetailedItems
      ? submission.product_items!.map((i, idx) => `${idx + 1}. ${i.name} - ${i.quantity} ${i.unit}`).join('\n')
      : submission.products.join(', ');

    const shareText = `📋 *Vaduthala Hyper Shopee - Vendor Registration Slip*\n` +
      `---------------------------------------\n` +
      `🆔 *Ref ID:* ${submission.id}\n` +
      `👤 *Vendor Name:* ${submission.venture_name}\n` +
      `🏢 *Distribution:* ${submission.company_name}\n` +
      `📞 *Phone:* ${submission.phone}\n` +
      `📦 *Products & Quantities:* \n${itemsText}\n` +
      `---------------------------------------\n` +
      `Status: VERIFIED & SUBMITTED ON CLOUD`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vendor Registration Slip - ${submission.id}`,
          text: shareText,
          url: window.location.href,
        });
        setShareStatus('Slip shared successfully!');
        setTimeout(() => setShareStatus(null), 3000);
      } catch (err) {
        console.warn('Share error or canceled:', err);
      }
    } else {
      // Copy formatted text to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setShareStatus('Slip details copied to clipboard! Share on WhatsApp or Email.');
        setTimeout(() => setShareStatus(null), 4000);
      } catch (e) {
        alert('Could not copy slip details.');
      }
    }
  };

  // Handle Download Slip as a clean standalone HTML document
  const handleDownloadSlip = () => {
    const itemsRows = hasDetailedItems
      ? submission.product_items!
          .map(
            (i, idx) =>
              `<tr><td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">${idx + 1}</td><td style="padding:6px;border:1px solid #cbd5e1;font-weight:bold;">${i.name}</td><td style="padding:6px;border:1px solid #cbd5e1;text-align:right;font-family:monospace;color:#047857;font-weight:bold;">${i.quantity}</td><td style="padding:6px;border:1px solid #cbd5e1;">${i.unit}</td></tr>`
          )
          .join('')
      : submission.products
          .map((p, idx) => `<tr><td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">${idx + 1}</td><td style="padding:6px;border:1px solid #cbd5e1;" colspan="3">${p}</td></tr>`)
          .join('');

    const slipHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Vendor Registration Slip - ${submission.id}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #0f172a; max-width: 650px; margin: 0 auto; line-height: 1.5; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 20px; font-weight: 800; text-transform: uppercase; color: #0f172a; }
    .sub { font-size: 12px; color: #059669; font-weight: 600; }
    .ref { font-family: monospace; font-size: 16px; font-weight: 800; color: #047857; text-align: right; }
    .info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; background: #f8fafc; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
    th { background: #f1f5f9; padding: 8px; border: 1px solid #cbd5e1; text-align: left; font-size: 11px; text-transform: uppercase; }
    .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">Vaduthala Hyper Shopee</div>
      <div class="sub">Official Supplier Onboarding Confirmation Slip</div>
    </div>
    <div class="ref">
      <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Ref ID</div>
      ${submission.id}
    </div>
  </div>

  <div class="info">
    <div>
      <strong style="color:#64748b; font-size:10px; text-transform:uppercase;">Vendor Name</strong><br>
      <span style="font-size:14px; font-weight:bold;">${submission.venture_name}</span><br>
      <span style="color:#475569;">Distribution: ${submission.company_name}</span>
    </div>
    <div>
      <strong style="color:#64748b; font-size:10px; text-transform:uppercase;">Contact & Date</strong><br>
      <span style="font-family:monospace; font-weight:bold;">Phone: ${submission.phone}</span><br>
      <span style="color:#64748b;">${formattedDate} • ${formattedTime}</span>
    </div>
  </div>

  <div style="font-size: 12px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; color: #334155;">
    Registered Product Catalogue Lines (${itemsCount})
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:30px;text-align:center;">#</th>
        <th>Product / Item Description</th>
        <th style="width:80px;text-align:right;">Quantity</th>
        <th style="width:60px;">Unit</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <div class="footer">
    Verified & recorded by Vaduthala Hyper Shopee Procurement Desk.<br>
    <strong>Status: VERIFIED & SUBMITTED ON CLOUD DATABASE</strong>
  </div>
</body>
</html>`;

    const blob = new Blob([slipHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vendor_Registration_Slip_${submission.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden printable-slip"
      >
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 sm:p-8 text-center relative overflow-hidden no-print">
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
            Your vendor registration and product supply details have been securely recorded.
          </p>
        </div>

        {/* Top Prominent Action Bar */}
        <div className="bg-emerald-50/90 border-b border-emerald-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Slip Quick Actions
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-700/20 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Slip</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSlip}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Slip</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Submit Another Slip</span>
            </button>
          </div>
        </div>

        {/* Printable Official Header */}
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

          {/* Reference Banner with 1-click copy */}
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

          {/* Share Status Toast */}
          <AnimatePresence>
            {shareStatus && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{shareStatus}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submission Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Vendor Name & Distribution</p>
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
                Additional Operational Details:
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

          {/* Bottom Action Buttons */}
          <div className="space-y-3 pt-2 no-print">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Share Slip Button */}
              <button
                type="button"
                onClick={handleShare}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Slip</span>
              </button>

              {/* Download Slip Button */}
              <button
                type="button"
                onClick={handleDownloadSlip}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Slip</span>
              </button>
            </div>

            {/* Submit Another Application Button */}
            <button
              type="button"
              onClick={onReset}
              className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-2xl border border-slate-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Submit Another Application</span>
            </button>

            {/* Optional Print Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
              >
                Print physical paper copy
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
