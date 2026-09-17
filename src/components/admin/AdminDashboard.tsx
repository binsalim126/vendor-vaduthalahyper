import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Store, 
  Menu, 
  X, 
  Sparkles,
  ShieldAlert,
  Printer
} from 'lucide-react';
import { FormQuestion, VendorSubmission, AdminUser } from '../../lib/types';
import { DashboardOverview } from './DashboardOverview';
import { FormBuilder } from './FormBuilder';
import { SubmissionsView } from './SubmissionsView';
import { SettingsView } from './SettingsView';
import { PrintReport } from './PrintReport';
import { signOutAdmin } from '../../lib/supabase';

interface AdminDashboardProps {
  user: AdminUser;
  questions: FormQuestion[];
  submissions: VendorSubmission[];
  onQuestionsChange: (questions: FormQuestion[]) => void;
  onSubmissionsChange: (submissions: VendorSubmission[]) => void;
  onLogout: () => void;
  onOpenVendorForm: () => void;
  onResetData: () => void;
}

type AdminTab = 'overview' | 'builder' | 'submissions' | 'settings' | 'print';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  questions,
  submissions,
  onQuestionsChange,
  onSubmissionsChange,
  onLogout,
  onOpenVendorForm,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [printSubmissions, setPrintSubmissions] = useState<VendorSubmission[]>(submissions);

  const handleOpenPrintReport = (subsToPrint: VendorSubmission[]) => {
    setPrintSubmissions(subsToPrint);
    setActiveTab('print');
  };

  const handleLogout = async () => {
    await signOutAdmin();
    onLogout();
  };

  // If currently in dedicated print mode
  if (activeTab === 'print') {
    return (
      <PrintReport
        submissions={printSubmissions}
        questions={questions}
        onBack={() => setActiveTab('submissions')}
      />
    );
  }

  const navItems: { id: AdminTab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'submissions', label: 'Submissions', icon: Users, count: submissions.length },
    { id: 'builder', label: 'Form Builder', icon: Layers, count: questions.filter(q => !q.is_default).length },
    { id: 'settings', label: 'Settings & DB', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 sticky top-0 h-screen">
        {/* Top Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-xs shrink-0">
            <img src="/logo.png" alt="Vaduthala Logo" className="h-7 w-auto object-contain" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Vendor Control
            </h2>
            <span className="text-[10px] text-emerald-400 font-semibold block">
              Vaduthala Hyper Shopee
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Public portal quick link & user status footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={onOpenVendorForm}
            className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-colors border border-slate-700/60"
          >
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Vendor Portal</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          {/* User profile & logout */}
          <div className="p-2.5 bg-slate-950/60 rounded-xl flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-[11px] font-bold text-white block truncate">
                {user.name || 'Admin Manager'}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {user.email}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white rounded-lg">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">
            Vendor Control Admin
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl font-semibold ${
                activeTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && <span>({item.count})</span>}
            </button>
          ))}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onOpenVendorForm();
                setMobileMenuOpen(false);
              }}
              className="text-emerald-400 font-semibold flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>Open Public Form</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-red-400 font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <DashboardOverview
            submissions={submissions}
            questions={questions}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenPrintReport={handleOpenPrintReport}
          />
        )}

        {activeTab === 'submissions' && (
          <SubmissionsView
            submissions={submissions}
            questions={questions}
            onSubmissionsChange={onSubmissionsChange}
            onOpenPrintReport={handleOpenPrintReport}
          />
        )}

        {activeTab === 'builder' && (
          <FormBuilder
            questions={questions}
            onQuestionsChange={onQuestionsChange}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView onDataReset={onResetData} />
        )}
      </main>
    </div>
  );
};
