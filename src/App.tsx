import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/vendor/SplashScreen';
import { VendorForm } from './components/vendor/VendorForm';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { 
  fetchFormQuestions, 
  fetchSubmissions, 
  getCurrentAdminUser,
  subscribeToSubmissions,
  subscribeToQuestions
} from './lib/supabase';
import { FormQuestion, VendorSubmission, AdminUser } from './lib/types';
import { DEFAULT_QUESTIONS, INITIAL_SUBMISSIONS } from './lib/mockData';

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'vendor' | 'admin_login' | 'admin_dashboard'>('vendor');
  
  // Data States
  const [questions, setQuestions] = useState<FormQuestion[]>(DEFAULT_QUESTIONS);
  const [submissions, setSubmissions] = useState<VendorSubmission[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data and check authentication status
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [fetchedQuestions, fetchedSubmissions] = await Promise.all([
        fetchFormQuestions(),
        fetchSubmissions(),
      ]);
      setQuestions(fetchedQuestions);
      setSubmissions(fetchedSubmissions);

      const currentUser = getCurrentAdminUser();
      if (currentUser) {
        setAdminUser(currentUser);
      }

      // Check hash route (e.g., #admin)
      if (window.location.hash === '#admin') {
        if (currentUser) {
          setView('admin_dashboard');
        } else {
          setView('admin_login');
        }
      }
    } catch (err) {
      console.warn('Error loading initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Listen to hash changes & refetch data
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        const currentUser = getCurrentAdminUser();
        if (currentUser) {
          setView('admin_dashboard');
        } else {
          setView('admin_login');
        }
        // Refetch submissions when navigating to admin
        fetchSubmissions().then(setSubmissions).catch(() => {});
      } else if (window.location.hash === '' || window.location.hash === '#vendor') {
        setView('vendor');
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Background polling interval every 10s as a failsafe backup to Realtime
    const pollInterval = setInterval(() => {
      fetchSubmissions().then(setSubmissions).catch(() => {});
    }, 10000);

    // Setup Supabase Realtime Listeners
    const unsubSubmissions = subscribeToSubmissions((payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        setSubmissions((prev) => [payload.new as VendorSubmission, ...prev.filter(s => s.id !== payload.new.id)]);
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setSubmissions((prev) => prev.map(s => s.id === payload.new.id ? payload.new as VendorSubmission : s));
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setSubmissions((prev) => prev.filter(s => s.id !== payload.old.id));
      }
    });

    const unsubQuestions = subscribeToQuestions((payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        setQuestions((prev) => [...prev.filter(q => q.id !== payload.new.id), payload.new as FormQuestion]);
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setQuestions((prev) => prev.map(q => q.id === payload.new.id ? payload.new as FormQuestion : q));
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setQuestions((prev) => prev.filter(q => q.id !== payload.old.id));
      }
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearInterval(pollInterval);
      if (unsubSubmissions) unsubSubmissions();
      if (unsubQuestions) unsubQuestions();
    };
  }, []);


  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setView('admin_dashboard');
    window.location.hash = '#admin';
    fetchSubmissions().then(setSubmissions).catch(() => {});
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setView('vendor');
    window.location.hash = '';
  };

  const handleOpenAdminLogin = () => {
    fetchSubmissions().then(setSubmissions).catch(() => {});
    if (adminUser) {
      setView('admin_dashboard');
      window.location.hash = '#admin';
    } else {
      setView('admin_login');
      window.location.hash = '#admin';
    }
  };

  const handleOpenVendorForm = () => {
    setView('vendor');
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Branded Loading / Entry Splash Screen */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} minDuration={1200} />
      )}

      {/* 2. Public Vendor Form */}
      {view === 'vendor' && (
        <VendorForm
          questions={questions}
          onSubmissionSuccess={(newSub) => {
            setSubmissions((prev) => [newSub, ...prev.filter(s => s.id !== newSub.id)]);
          }}
          onOpenAdminLogin={handleOpenAdminLogin}
        />
      )}

      {/* 3. Admin Login Page */}
      {view === 'admin_login' && (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onBackToVendor={handleOpenVendorForm}
        />
      )}

      {/* 4. Authenticated Admin Dashboard */}
      {view === 'admin_dashboard' && adminUser && (
        <AdminDashboard
          user={adminUser}
          questions={questions}
          submissions={submissions}
          onQuestionsChange={(updatedQuestions) => setQuestions(updatedQuestions)}
          onSubmissionsChange={(updatedSubmissions) => setSubmissions(updatedSubmissions)}
          onLogout={handleAdminLogout}
          onOpenVendorForm={handleOpenVendorForm}
          onResetData={loadInitialData}
        />
      )}
    </div>
  );
}

export default App;
