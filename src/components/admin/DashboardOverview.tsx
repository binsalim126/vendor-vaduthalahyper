import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Printer, 
  Sparkles, 
  Store, 
  TrendingUp,
  Tag
} from 'lucide-react';
import { FormQuestion, SubmissionStatus, VendorSubmission } from '../../lib/types';
import { exportSubmissionsToExcel } from '../../lib/exportExcel';

interface DashboardOverviewProps {
  submissions: VendorSubmission[];
  questions: FormQuestion[];
  onNavigateTab: (tab: 'submissions' | 'builder' | 'settings') => void;
  onOpenPrintReport: (subs: VendorSubmission[]) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  submissions,
  questions,
  onNavigateTab,
  onOpenPrintReport,
}) => {
  const totalSubmissions = submissions.length;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todaySubmissions = submissions.filter(
    (s) => new Date(s.created_at).getTime() >= todayStart
  ).length;

  const approvedSubmissions = submissions.filter((s) => s.status === 'approved').length;
  const inReviewSubmissions = submissions.filter((s) => s.status === 'in_review' || s.status === 'new').length;
  const customQuestionsCount = questions.filter((q) => !q.is_default).length;

  // Compute top product categories
  const productFrequency: Record<string, number> = {};
  submissions.forEach((s) => {
    if (Array.isArray(s.products)) {
      s.products.forEach((p) => {
        productFrequency[p] = (productFrequency[p] || 0) + 1;
      });
    }
  });

  const topProducts = Object.entries(productFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Status counts
  const statusCounts: Record<SubmissionStatus, number> = {
    new: submissions.filter((s) => s.status === 'new').length,
    in_review: submissions.filter((s) => s.status === 'in_review').length,
    contacted: submissions.filter((s) => s.status === 'contacted').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vaduthala Hyper Shopee Procurement HQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Vendor Control Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Monitor incoming vendor registrations, configure dynamic onboarding questions, and manage supplier authorizations in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={() => exportSubmissionsToExcel(submissions, questions)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/40 active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPrintReport(submissions)}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submissions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Submissions
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {totalSubmissions}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">All-time registrations</p>
          </div>
        </div>

        {/* Today's Submissions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Today's Inflow
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {todaySubmissions}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">Submitted today</p>
          </div>
        </div>

        {/* Approved Vendors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Approved Suppliers
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
              {approvedSubmissions}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              {totalSubmissions > 0
                ? `${Math.round((approvedSubmissions / totalSubmissions) * 100)}% approval rate`
                : 'No submissions yet'}
            </p>
          </div>
        </div>

        {/* Dynamic Criteria */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Form Questions
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {questions.length}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              {customQuestionsCount} custom + 4 default fields
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Section: Status Distribution + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Distribution */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Application Pipeline Status</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('submissions')}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { key: 'new', label: 'New / Unreviewed', count: statusCounts.new, bg: 'bg-blue-500', light: 'bg-blue-50 text-blue-700' },
              { key: 'in_review', label: 'Under Review', count: statusCounts.in_review, bg: 'bg-amber-500', light: 'bg-amber-50 text-amber-700' },
              { key: 'contacted', label: 'Contacted Vendor', count: statusCounts.contacted, bg: 'bg-purple-500', light: 'bg-purple-50 text-purple-700' },
              { key: 'approved', label: 'Approved Supplier', count: statusCounts.approved, bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700' },
              { key: 'rejected', label: 'Not Eligible / Rejected', count: statusCounts.rejected, bg: 'bg-rose-500', light: 'bg-rose-50 text-rose-700' },
            ].map((item) => {
              const pct = totalSubmissions > 0 ? Math.round((item.count / totalSubmissions) * 100) : 0;
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="font-mono font-bold text-slate-800">
                      {item.count} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.bg} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Product Offerings */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Top Registered Products & Lines</span>
            </h3>
            <span className="text-xs text-slate-400">By occurrence</span>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No product data available yet.</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map(([product, count], idx) => (
                <div
                  key={product}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{product}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {count} {count === 1 ? 'vendor' : 'vendors'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Submissions Quick View */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>Latest Vendor Registrations</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('submissions')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>Open All Submissions</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 font-semibold">Reference ID</th>
                <th className="pb-3 font-semibold">Venture Name</th>
                <th className="pb-3 font-semibold">Company</th>
                <th className="pb-3 font-semibold">Phone</th>
                <th className="pb-3 font-semibold">Products</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {submissions.slice(0, 5).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-700">{s.id}</td>
                  <td className="py-3 font-bold text-slate-900">{s.venture_name}</td>
                  <td className="py-3 text-slate-600">{s.company_name}</td>
                  <td className="py-3 font-mono text-slate-700">{s.phone}</td>
                  <td className="py-3 text-slate-500 max-w-[200px] truncate">
                    {Array.isArray(s.products) ? s.products.join(', ') : s.products}
                  </td>
                  <td className="py-3">
                    <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
