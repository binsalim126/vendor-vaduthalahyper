import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Phone, 
  MessageSquare, 
  ChevronDown, 
  ChevronRight, 
  Tag, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Store, 
  Building2, 
  RefreshCw,
  Eye,
  SlidersHorizontal,
  X,
  Trash2
} from 'lucide-react';
import { FormQuestion, SubmissionStatus, VendorSubmission } from '../../lib/types';
import { exportSubmissionsToExcel } from '../../lib/exportExcel';
import { SubmissionDetailModal } from './SubmissionDetailModal';
import { updateSubmissionStatus, deleteSubmission, clearAllSubmissions } from '../../lib/supabase';

interface SubmissionsViewProps {
  submissions: VendorSubmission[];
  questions: FormQuestion[];
  onSubmissionsChange: (submissions: VendorSubmission[]) => void;
  onOpenPrintReport: (filteredSubs: VendorSubmission[]) => void;
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; bg: string; text: string; border: string }> = {
  new: { label: 'New', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  in_review: { label: 'In Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  contacted: { label: 'Contacted', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export const SubmissionsView: React.FC<SubmissionsViewProps> = ({
  submissions,
  questions,
  onSubmissionsChange,
  onOpenPrintReport,
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | '7days' | 'month' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Accordion state (expanded submission IDs)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Modal detail view state
  const [selectedSubmission, setSelectedSubmission] = useState<VendorSubmission | null>(null);

  // Multi-select for bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle single accordion
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all / Collapse all
  const expandAll = () => {
    setExpandedIds(new Set(filteredSubmissions.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Status update handler
  const handleStatusChange = async (id: string, newStatus: SubmissionStatus, notes?: string) => {
    await updateSubmissionStatus(id, newStatus, notes);
    onSubmissionsChange(
      submissions.map((s) => (s.id === id ? { ...s, status: newStatus, notes: notes !== undefined ? notes : s.notes } : s))
    );
  };

  const handleDelete = async (id: string, ventureName?: string) => {
    const label = ventureName ? `vendor "${ventureName}" (${id})` : `vendor registration #${id}`;
    if (window.confirm(`Are you sure you want to permanently delete ${label}? This cannot be undone.`)) {
      await deleteSubmission(id);
      onSubmissionsChange(submissions.filter((s) => s.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (window.confirm(`Are you sure you want to permanently delete ${count} selected vendor(s)?`)) {
      const idsToDelete = Array.from(selectedIds);
      await Promise.all(idsToDelete.map((id) => deleteSubmission(id)));
      onSubmissionsChange(submissions.filter((s) => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete ALL vendor registrations? This will clear all submissions permanently.')) {
      await clearAllSubmissions();
      onSubmissionsChange([]);
      setSelectedIds(new Set());
    }
  };

  // Filter logic
  const filteredSubmissions = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysAgo = todayStart - 7 * 86400000;
    const monthAgo = todayStart - 30 * 86400000;

    return submissions.filter((sub) => {
      // 1. Text Search (venture, company, phone, products)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesVenture = sub.venture_name.toLowerCase().includes(q);
        const matchesCompany = sub.company_name.toLowerCase().includes(q);
        const matchesPhone = sub.phone.toLowerCase().includes(q);
        const matchesId = sub.id.toLowerCase().includes(q);
        const matchesProducts = Array.isArray(sub.products) && sub.products.some((p) => p.toLowerCase().includes(q));
        const matchesProductItems = Array.isArray(sub.product_items) && sub.product_items.some((item) => 
          (item.name || '').toLowerCase().includes(q) ||
          String(item.quantity || '').toLowerCase().includes(q) ||
          (item.unit || '').toLowerCase().includes(q) ||
          (item.notes || '').toLowerCase().includes(q)
        );

        if (!matchesVenture && !matchesCompany && !matchesPhone && !matchesId && !matchesProducts && !matchesProductItems) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'all' && sub.status !== statusFilter) {
        return false;
      }

      // 3. Date filter
      const subTime = new Date(sub.created_at).getTime();
      if (dateFilter === 'today') {
        if (subTime < todayStart) return false;
      } else if (dateFilter === 'yesterday') {
        if (subTime < yesterdayStart || subTime >= todayStart) return false;
      } else if (dateFilter === '7days') {
        if (subTime < sevenDaysAgo) return false;
      } else if (dateFilter === 'month') {
        if (subTime < monthAgo) return false;
      } else if (dateFilter === 'custom' && customDate) {
        const targetDate = new Date(customDate).toDateString();
        const subDate = new Date(sub.created_at).toDateString();
        if (targetDate !== subDate) return false;
      }

      return true;
    });
  }, [submissions, searchQuery, dateFilter, customDate, statusFilter]);

  // Group filtered submissions by Day (Date string)
  const groupedSubmissions = useMemo(() => {
    const groups: { dateLabel: string; dateKey: string; submissions: VendorSubmission[] }[] = [];
    const map = new Map<string, VendorSubmission[]>();

    filteredSubmissions.forEach((sub) => {
      const d = new Date(sub.created_at);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(sub);
    });

    // Sort group keys descending (newest day first)
    const sortedKeys = Array.from(map.keys()).sort().reverse();
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date(Date.now() - 86400000);
    const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

    sortedKeys.forEach((key) => {
      const items = map.get(key)!;
      const sampleDate = new Date(items[0].created_at);
      let label = sampleDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      if (key === todayStr) {
        label = `Today — ${label}`;
      } else if (key === yesterdayStr) {
        label = `Yesterday — ${label}`;
      }

      groups.push({
        dateKey: key,
        dateLabel: label,
        submissions: items,
      });
    });

    return groups;
  }, [filteredSubmissions]);

  const customQuestions = questions.filter((q) => !q.is_default);

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by venture, company, phone, reference ID, or products..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Export & Print Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => exportSubmissionsToExcel(filteredSubmissions, questions)}
              className="flex-1 md:flex-initial px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
              title="Download Excel spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export to Excel</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPrintReport(filteredSubmissions)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              title="Open clean printable view"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print View</span>
            </button>

            {submissions.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                title="Clear all submissions"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Filter Pills & Status Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Date range filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Date:
            </span>

            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7days', label: 'Last 7 Days' },
              { id: 'month', label: 'This Month' },
              { id: 'custom', label: 'Pick Date' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setDateFilter(f.id as any)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  dateFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}

            {dateFilter === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="text-xs px-2 py-0.5 bg-white border border-emerald-400 rounded-lg outline-none"
              />
            )}
          </div>

          {/* Status selector & Expand All controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in_review">In Review</option>
                <option value="contacted">Contacted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="border-l border-slate-200 pl-2 flex items-center gap-1">
              <button
                type="button"
                onClick={expandAll}
                className="text-[11px] text-slate-500 hover:text-emerald-700 font-medium px-2 py-1 rounded hover:bg-slate-100"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="text-[11px] text-slate-500 hover:text-emerald-700 font-medium px-2 py-1 rounded hover:bg-slate-100"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Result Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredSubmissions.length}</strong> of{' '}
          {submissions.length} total vendor registrations
        </span>
        {searchQuery || dateFilter !== 'all' || statusFilter !== 'all' ? (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setDateFilter('all');
              setStatusFilter('all');
              setCustomDate('');
            }}
            className="text-emerald-700 hover:underline font-semibold"
          >
            Clear all filters
          </button>
        ) : null}
      </div>

      {/* Batch Selection Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-slate-700">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold text-slate-200">
              {selectedIds.size === 1 ? 'vendor selected' : 'vendors selected'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Deselect All
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-900/40 flex items-center gap-1.5 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Day-by-Day Grouped Accordion List */}
      {groupedSubmissions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No submissions found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or clearing date filters to see other vendor records.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedSubmissions.map((group) => (
            <div key={group.dateKey} className="space-y-3">
              {/* Day Header Badge */}
              <div className="flex items-center gap-3 px-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {group.dateLabel}
                </h2>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {group.submissions.length} {group.submissions.length === 1 ? 'submission' : 'submissions'}
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* Submissions in this day */}
              <div className="space-y-3">
                {group.submissions.map((sub) => {
                  const isExpanded = expandedIds.has(sub.id);
                  const isSelected = selectedIds.has(sub.id);
                  const statusInfo = STATUS_CONFIG[sub.status || 'new'];
                  const formattedTime = new Date(sub.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });

                  const rawPhone = sub.phone.replace(/[^0-9]/g, '');
                  const cleanPhoneForWhatsApp = rawPhone.startsWith('91')
                    ? rawPhone
                    : rawPhone.length === 10
                    ? `91${rawPhone}`
                    : rawPhone;
                  const whatsappUrl = `https://wa.me/${cleanPhoneForWhatsApp}?text=${encodeURIComponent(
                    `Hello ${sub.venture_name} (${sub.company_name}), this is Vaduthala Hyper Shopee Procurement regarding your vendor registration #${sub.id}.`
                  )}`;

                  return (
                    <div
                      key={sub.id}
                      className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                        isSelected
                          ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-xs'
                          : 'border-slate-200/90 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      {/* Accordion Summary Row */}
                      <div
                        onClick={() => toggleExpand(sub.id)}
                        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Left Side: Checkbox, Expand Chevron, Venture, Company, Phone */}
                        <div className="flex items-start gap-3">
                          {/* Multi-select checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelect(sub.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 mt-1 shrink-0"
                            title="Select vendor"
                          />

                          <button
                            type="button"
                            className="mt-1 p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900">
                                {sub.venture_name}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                {sub.id}
                              </span>
                              <span
                                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1 text-slate-600">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                {sub.company_name}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 font-mono font-medium text-slate-700">
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                {sub.phone}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                {formattedTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Products preview & Quick Action buttons */}
                        <div
                          className="flex items-center gap-2 self-end md:self-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Quick WhatsApp Button */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>

                          {/* Quick Details View Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(sub)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="View Full Profile Modal"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span className="hidden sm:inline">Details</span>
                          </button>

                          {/* Inline Status Changer */}
                          <select
                            value={sub.status || 'new'}
                            onChange={(e) => handleStatusChange(sub.id, e.target.value as SubmissionStatus)}
                            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 outline-none cursor-pointer hover:border-emerald-500"
                          >
                            <option value="new">New</option>
                            <option value="in_review">In Review</option>
                            <option value="contacted">Contacted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>

                          {/* Direct Delete Vendor Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(sub.id, sub.venture_name)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200/80 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                            title={`Delete vendor "${sub.venture_name}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-slate-100 bg-slate-50/60 p-5 space-y-4"
                          >
                            {/* Products Section */}
                            <div>
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                Registered Products & Quantities ({sub.product_items && sub.product_items.length > 0 ? sub.product_items.length : sub.products.length}):
                              </span>

                              {sub.product_items && sub.product_items.length > 0 ? (
                                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                        <th className="py-2 px-3 w-8 text-center">#</th>
                                        <th className="py-2 px-3">Product Name / Item</th>
                                        <th className="py-2 px-3 text-right">Quantity</th>
                                        <th className="py-2 px-3">Unit</th>
                                        <th className="py-2 px-3">Packaging / Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-800">
                                      {sub.product_items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                          <td className="py-2 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                                          <td className="py-2 px-3 font-semibold text-slate-900">{item.name}</td>
                                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">{item.quantity}</td>
                                          <td className="py-2 px-3 text-slate-600 font-medium">{item.unit}</td>
                                          <td className="py-2 px-3 text-[11px] text-slate-500">{item.notes || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {sub.products.map((p, pIdx) => (
                                    <span
                                      key={pIdx}
                                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs"
                                    >
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Custom Answers Grid */}
                            {customQuestions.length > 0 && (
                              <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                  Custom Question Answers:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                  {customQuestions.map((q) => {
                                    const ans = sub.custom_answers?.[q.id];
                                    let displayVal = '-';
                                    if (ans !== undefined && ans !== null && ans !== '') {
                                      if (typeof ans === 'boolean') {
                                        displayVal = ans ? 'Yes' : 'No';
                                      } else if (Array.isArray(ans)) {
                                        displayVal = ans.join(', ');
                                      } else {
                                        displayVal = String(ans);
                                      }
                                    }
                                    return (
                                      <div
                                        key={q.id}
                                        className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-0.5 shadow-2xs"
                                      >
                                        <p className="text-[10px] font-semibold text-slate-400 truncate">
                                          {q.label}
                                        </p>
                                        <p className="text-xs font-bold text-slate-800">
                                          {displayVal}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Admin Notes Row */}
                            {sub.notes && (
                              <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-xs text-emerald-900">
                                <span className="font-bold">Procurement Note: </span>
                                <span>{sub.notes}</span>
                              </div>
                            )}

                            {/* Card Footer Actions */}
                            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-mono">
                                Registered: {new Date(sub.created_at).toLocaleString('en-IN')}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleDelete(sub.id, sub.venture_name)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                                title="Delete this vendor registration"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                <span>Delete Vendor Record</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal Component */}
      <SubmissionDetailModal
        submission={selectedSubmission}
        questions={questions}
        onClose={() => setSelectedSubmission(null)}
        onUpdateStatus={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
};
