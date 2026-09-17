import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Printer, 
  Phone, 
  MessageSquare, 
  Building2, 
  Store, 
  Clock, 
  Calendar, 
  ShoppingBag, 
  CheckCircle2, 
  FileText, 
  Trash2, 
  Save, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { FormQuestion, SubmissionStatus, VendorSubmission } from '../../lib/types';

interface SubmissionDetailModalProps {
  submission: VendorSubmission | null;
  questions: FormQuestion[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: SubmissionStatus, notes?: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; bg: string; text: string; border: string }> = {
  new: { label: 'New / Unreviewed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  in_review: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  contacted: { label: 'Contacted', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  approved: { label: 'Approved Supplier', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rejected: { label: 'Not Eligible', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  questions,
  onClose,
  onUpdateStatus,
  onDelete,
}) => {
  if (!submission) return null;

  const [currentStatus, setCurrentStatus] = useState<SubmissionStatus>(submission.status || 'new');
  const [adminNotes, setAdminNotes] = useState<string>(submission.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  const customQuestions = questions.filter((q) => !q.is_default);

  const handleSave = () => {
    onUpdateStatus(submission.id, currentStatus, adminNotes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePrintSingle = () => {
    window.print();
  };

  const rawPhone = submission.phone.replace(/[^0-9]/g, '');
  const cleanPhoneForWhatsApp = rawPhone.startsWith('91') ? rawPhone : (rawPhone.length === 10 ? `91${rawPhone}` : rawPhone);
  const whatsappUrl = `https://wa.me/${cleanPhoneForWhatsApp}?text=${encodeURIComponent(
    `Hello ${submission.venture_name} (${submission.company_name}), this is Vaduthala Hyper Shopee Procurement team regarding your vendor registration #${submission.id}.`
  )}`;

  const formattedDate = new Date(submission.created_at).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(submission.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 rounded-xl">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold tracking-wider uppercase">
                  {submission.id}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {submission.venture_name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintSingle}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Print this application slip"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print Slip</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Header (Visible only on print) */}
          <div className="hidden print-only p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Vaduthala Hyper Shopee</h1>
                <p className="text-xs text-slate-500">Official Vendor Registration Record</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono font-bold">{submission.id}</p>
                <p className="text-xs text-slate-500">{formattedDate} {formattedTime}</p>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 no-print">
              {/* Direct Contact links */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${submission.phone}`}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call: {submission.phone}</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Vendor</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>

              {/* Timestamp info */}
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {formattedTime}
                </span>
              </div>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Venture / Brand Name
                </span>
                <p className="text-base font-bold text-slate-800">{submission.venture_name}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Registered Legal Entity
                </span>
                <p className="text-base font-bold text-slate-800">{submission.company_name}</p>
              </div>
            </div>

            {/* Products Offered */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Products Offered ({submission.products.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {submission.products.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Dynamic Custom Questions & Answers */}
            {customQuestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Custom Form Responses</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customQuestions.map((q) => {
                    const ans = submission.custom_answers?.[q.id];
                    let displayValue: React.ReactNode = '-';

                    if (ans !== undefined && ans !== null && ans !== '') {
                      if (typeof ans === 'boolean') {
                        displayValue = (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              ans
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ans ? 'Yes' : 'No'}
                          </span>
                        );
                      } else if (Array.isArray(ans)) {
                        displayValue = ans.join(', ');
                      } else {
                        displayValue = String(ans);
                      }
                    }

                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1"
                      >
                        <p className="text-xs text-slate-500 font-medium">{q.label}</p>
                        <p className="text-sm font-semibold text-slate-800">{displayValue}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status & Admin Notes (Editable in Modal) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 no-print">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Application Status
                  </label>
                  <select
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value as SubmissionStatus)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option value="new">New / Unreviewed</option>
                    <option value="in_review">Under Review</option>
                    <option value="contacted">Contacted</option>
                    <option value="approved">Approved Supplier</option>
                    <option value="rejected">Not Eligible</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs self-end"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Update Status & Notes</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Procurement Officer Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Discussed bulk discount margins with sales head on call. Sent vendor contract draft..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-600 resize-y"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-slate-100/70 p-4 border-t border-slate-200 flex items-center justify-between no-print">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete submission #${submission.id}?`)) {
                  onDelete(submission.id);
                  onClose();
                }
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Submission</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
