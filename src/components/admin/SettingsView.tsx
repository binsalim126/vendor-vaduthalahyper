import React, { useState } from 'react';
import { 
  Database, 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink, 
  Server, 
  Code2, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  SUPABASE_SQL_SCHEMA, 
  getSupabaseClient 
} from '../../lib/supabase';
import { DEFAULT_QUESTIONS, INITIAL_SUBMISSIONS } from '../../lib/mockData';

interface SettingsViewProps {
  onDataReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataReset }) => {
  const currentConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.anonKey);
  const [isCopied, setIsCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const success = saveSupabaseConfig(supabaseUrl.trim(), supabaseAnonKey.trim());
    if (success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } else {
      setSaveStatus('error');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestResult('Testing connection...');
    const client = getSupabaseClient();
    if (!client) {
      setTestResult('No Supabase credentials configured. Running in high-performance local store mode.');
      return;
    }

    try {
      const { data, error } = await client.from('form_questions').select('count', { count: 'exact', head: true });
      if (error) {
        setTestResult(`Connection test warning: ${error.message}. Please verify table creation via the SQL script below.`);
      } else {
        setTestResult('Successfully connected to Supabase backend! Tables are live and verified.');
      }
    } catch (e: any) {
      setTestResult(`Connection failed: ${e.message}`);
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset local submissions and questions to the realistic sample dataset?')) {
      localStorage.setItem('vhs_form_questions_v1', JSON.stringify(DEFAULT_QUESTIONS));
      localStorage.setItem('vhs_vendor_submissions_v1', JSON.stringify(INITIAL_SUBMISSIONS));
      onDataReset();
      alert('Sample dataset restored successfully.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <span>Database & Integration Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure your Supabase backend instance, manage tables and RLS security policies, or manage sample data.
        </p>
      </div>

      {/* Grid: Credentials & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Supabase Connection Setup */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Supabase Cloud Credentials
              </h2>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                currentConfig.hasConfig
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {currentConfig.hasConfig ? 'Configured' : 'Local Fallback Mode Active'}
            </span>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test Connection</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20 active:scale-95"
              >
                {saveStatus === 'saved' ? 'Settings Saved!' : 'Save Credentials'}
              </button>
            </div>
          </form>

          {testResult && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{testResult}</span>
            </div>
          )}
        </div>

        {/* Demo Data & Quick Tools */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Sample Data Management
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Reset your workspace data to the default realistic FMCG/grocery supplier dataset anytime for demonstrations or presentations.
            </p>

            <button
              type="button"
              onClick={handleResetSampleData}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Reset & Reload Sample Data</span>
            </button>
          </div>

          <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200/70 space-y-2 text-emerald-950 text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Row Level Security (RLS) Active</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Public vendors can ONLY insert records into the submissions table. Authenticated admins have full privileges to view, update, and manage records.
            </p>
          </div>
        </div>
      </div>

      {/* SQL Setup Script Helper */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Supabase SQL Schema & RLS Policies (1-Click Copy)
            </h3>
          </div>

          <button
            type="button"
            onClick={handleCopySql}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied SQL!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL to Clipboard</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Paste this script into your Supabase Dashboard SQL Editor (<span className="font-mono text-emerald-700">Project &gt; SQL Editor &gt; New Query</span>) to set up tables and security policies:
        </p>

        <div className="relative">
          <pre className="p-4 bg-slate-900 text-emerald-300 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      </div>
    </div>
  );
};
