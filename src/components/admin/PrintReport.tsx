import React, { useEffect } from 'react';
import { Printer, ArrowLeft, Building2, Phone, Calendar, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { FormQuestion, VendorSubmission } from '../../lib/types';

interface PrintReportProps {
  submissions: VendorSubmission[];
  questions: FormQuestion[];
  onBack: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({
  submissions,
  questions,
  onBack,
}) => {
  const customQuestions = questions.filter((q) => !q.is_default);

  const printTimestamp = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 sm:p-8 print:p-0">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print max-w-5xl mx-auto mb-6 p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-lg">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300">
            Ready to print ({submissions.length} records)
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Now</span>
          </button>
        </div>
      </div>

      {/* Printable Document Container */}
      <div className="max-w-5xl mx-auto print-container space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Vaduthala Hyper Shopee"
              className="h-14 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                Vaduthala Hyper Shopee
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                Vendor Control & Supplier Registration Master Docket
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <p className="font-bold text-slate-900">Generated: {printTimestamp}</p>
            <p>Total Records: {submissions.length}</p>
            <p>Report Type: Verified Supplier Directory</p>
          </div>
        </div>

        {/* Printable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
                <th className="p-2 border-r border-slate-300">Ref ID / Date</th>
                <th className="p-2 border-r border-slate-300">Venture & Company</th>
                <th className="p-2 border-r border-slate-300">Phone</th>
                <th className="p-2 border-r border-slate-300">Products Offered</th>
                <th className="p-2 border-r border-slate-300">Key Criteria / Details</th>
                <th className="p-2 text-center w-20">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {submissions.map((sub, idx) => {
                const dateStr = new Date(sub.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={sub.id} className="align-top hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono">
                      <strong className="block text-slate-900">{sub.id}</strong>
                      <span className="text-[10px] text-slate-500">{dateStr}</span>
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <strong className="block text-slate-900">{sub.venture_name}</strong>
                      <span className="text-[11px] text-slate-600 block">{sub.company_name}</span>
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono font-medium">
                      {sub.phone}
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      {Array.isArray(sub.products) ? (
                        <div className="flex flex-wrap gap-1">
                          {sub.products.map((p, pIdx) => (
                            <span
                              key={pIdx}
                              className="inline-block px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700 font-medium"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        sub.products
                      )}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-[11px] space-y-1">
                      {customQuestions.map((q) => {
                        const val = sub.custom_answers?.[q.id];
                        if (val === undefined || val === null || val === '') return null;
                        const formatted = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val);
                        return (
                          <div key={q.id}>
                            <span className="text-slate-500">{q.label}: </span>
                            <span className="font-semibold text-slate-800">{formatted}</span>
                          </div>
                        );
                      })}
                      {sub.notes && (
                        <div className="text-[10px] text-emerald-800 italic bg-emerald-50 p-1 rounded">
                          Note: {sub.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-center uppercase font-bold text-[10px]">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          sub.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'in_review'
                            ? 'bg-amber-100 text-amber-800'
                            : sub.status === 'contacted'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {sub.status || 'New'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Authorization Section */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-8 text-center text-xs">
          <div>
            <div className="h-12 border-b border-slate-400 mb-1" />
            <p className="font-semibold text-slate-700">Prepared By (Procurement)</p>
          </div>
          <div>
            <div className="h-12 border-b border-slate-400 mb-1" />
            <p className="font-semibold text-slate-700">Verified By (QC / Inventory)</p>
          </div>
          <div>
            <div className="h-12 border-b border-slate-400 mb-1" />
            <p className="font-semibold text-slate-700">Approved By (Store Manager)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
