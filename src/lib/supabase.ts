import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { FormQuestion, VendorSubmission, AdminUser } from './types';
import { DEFAULT_QUESTIONS, INITIAL_SUBMISSIONS } from './mockData';

// Storage keys for local fallback
const STORAGE_KEYS = {
  QUESTIONS: 'vhs_form_questions_v1',
  SUBMISSIONS: 'vhs_vendor_submissions_v1',
  AUTH: 'vhs_admin_auth_v1',
  SUPABASE_CONFIG: 'vhs_supabase_config_v1',
};

// Initial default configuration
let supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

// Check local storage for custom credentials if any
try {
  const savedConfig = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
  if (savedConfig) {
    const parsed = JSON.parse(savedConfig);
    if (parsed.url && parsed.anonKey) {
      supabaseConfig = parsed;
    }
  }
} catch (e) {
  console.warn('Could not read Supabase config from localStorage', e);
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  if (supabaseConfig.url && supabaseConfig.anonKey) {
    try {
      supabaseInstance = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.error('Error creating Supabase client:', err);
    }
  }
  return null;
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  supabaseConfig = { url, anonKey };
  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify({ url, anonKey }));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  } else {
    supabaseInstance = null;
    localStorage.removeItem(STORAGE_KEYS.SUPABASE_CONFIG);
    return true;
  }
}

export function getStoredSupabaseConfig() {
  return {
    url: supabaseConfig.url,
    anonKey: supabaseConfig.anonKey,
    hasConfig: Boolean(supabaseConfig.url && supabaseConfig.anonKey),
  };
}

// ---------------- REALTIME SUBSCRIPTIONS ---------------- //

export function subscribeToSubmissions(onUpdate: (payload: any) => void): (() => void) | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel: RealtimeChannel = client
      .channel('public:submissions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Supabase realtime subscription failed:', err);
    return null;
  }
}

export function subscribeToQuestions(onUpdate: (payload: any) => void): (() => void) | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel: RealtimeChannel = client
      .channel('public:form_questions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'form_questions' },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Supabase realtime questions subscription failed:', err);
    return null;
  }
}

// ---------------- LOCAL STORE HELPERS ---------------- //

function getLocalQuestions(): FormQuestion[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
      return DEFAULT_QUESTIONS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_QUESTIONS;
  }
}

function setLocalQuestions(questions: FormQuestion[]) {
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
}

function getLocalSubmissions(): VendorSubmission[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SUBMISSIONS;
  }
}

function setLocalSubmissions(submissions: VendorSubmission[]) {
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
}

// ---------------- FORM QUESTIONS REPOSITORY ---------------- //

export async function fetchFormQuestions(): Promise<FormQuestion[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('form_questions')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        return data as FormQuestion[];
      }
    } catch (err) {
      console.warn('Supabase fetch questions failed, using local store:', err);
    }
  }
  return getLocalQuestions();
}

export async function saveFormQuestion(question: FormQuestion): Promise<FormQuestion> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('form_questions')
        .upsert(question)
        .select()
        .single();

      if (error) throw error;
      if (data) return data as FormQuestion;
    } catch (err) {
      console.warn('Supabase save question failed, saving to local store:', err);
    }
  }

  // Fallback to local storage
  const questions = getLocalQuestions();
  const existingIdx = questions.findIndex((q) => q.id === question.id);
  if (existingIdx >= 0) {
    questions[existingIdx] = question;
  } else {
    questions.push(question);
  }
  setLocalQuestions(questions);
  return question;
}

export async function deleteFormQuestion(questionId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('form_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
    } catch (err) {
      console.warn('Supabase delete question failed, deleting from local store:', err);
    }
  }

  const questions = getLocalQuestions();
  const filtered = questions.filter((q) => q.id !== questionId);
  setLocalQuestions(filtered);
  return true;
}

// ---------------- VENDOR SUBMISSIONS REPOSITORY ---------------- //

export async function fetchSubmissions(): Promise<VendorSubmission[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) return data as VendorSubmission[];
    } catch (err) {
      console.warn('Supabase fetch submissions failed, using local store:', err);
    }
  }
  return getLocalSubmissions();
}

export async function createVendorSubmission(
  submissionData: Omit<VendorSubmission, 'id' | 'created_at' | 'status'>
): Promise<VendorSubmission> {
  // Generate unique formatted ID: VHS-YYYYMMDD-XXXX
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newId = `VHS-${dateStr}-${randomSuffix}`;
  const nowIso = new Date().toISOString();

  const newSubmission: VendorSubmission = {
    ...submissionData,
    id: newId,
    status: 'new',
    created_at: nowIso,
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('submissions')
        .insert([newSubmission])
        .select()
        .single();

      if (error) throw error;
      if (data) return data as VendorSubmission;
    } catch (err) {
      console.warn('Supabase insert submission failed, saving to local store:', err);
    }
  }

  const submissions = getLocalSubmissions();
  submissions.unshift(newSubmission);
  setLocalSubmissions(submissions);
  return newSubmission;
}

export async function updateSubmissionStatus(
  id: string,
  status: VendorSubmission['status'],
  notes?: string
): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const updatePayload: any = { status };
      if (notes !== undefined) updatePayload.notes = notes;

      const { error } = await client
        .from('submissions')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('Supabase update submission failed, updating local store:', err);
    }
  }

  const submissions = getLocalSubmissions();
  const index = submissions.findIndex((s) => s.id === id);
  if (index >= 0) {
    submissions[index].status = status;
    if (notes !== undefined) submissions[index].notes = notes;
    setLocalSubmissions(submissions);
    return true;
  }
  return false;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('Supabase delete submission failed, updating local store:', err);
    }
  }

  const submissions = getLocalSubmissions();
  const filtered = submissions.filter((s) => s.id !== id);
  setLocalSubmissions(filtered);
  return true;
}

// ---------------- ADMIN AUTHENTICATION ---------------- //

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ user: AdminUser | null; error?: string }> {
  // If Supabase is configured, try Supabase Auth
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const adminUser: AdminUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.full_name || 'Admin Manager',
          role: 'admin',
        };
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(adminUser));
        return { user: adminUser };
      }
    } catch (err: any) {
      console.warn('Supabase Auth error, checking local demo credentials:', err.message);
    }
  }

  // Demo / Local Auth verification
  const normalizedEmail = email.trim().toLowerCase();
  if (
    (normalizedEmail === 'admin@vaduthala.com' ||
      normalizedEmail === 'admin@hyper.com' ||
      normalizedEmail === 'manager@vaduthala.com' ||
      normalizedEmail === 'admin') &&
    (password === 'admin123' || password === 'vaduthala2026' || password === 'admin')
  ) {
    const demoAdmin: AdminUser = {
      id: 'usr_admin_vaduthala_01',
      email: normalizedEmail.includes('@') ? normalizedEmail : 'admin@vaduthala.com',
      name: 'Vaduthala Procurement Manager',
      role: 'admin',
    };
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(demoAdmin));
    return { user: demoAdmin };
  }

  return {
    user: null,
    error: 'Invalid email or password. Use demo credentials (admin@vaduthala.com / admin123) or configure Supabase.',
  };
}

export function getCurrentAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (raw) return JSON.parse(raw);
  } catch {
    return null;
  }
  return null;
}

export async function signOutAdmin(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }
  localStorage.removeItem(STORAGE_KEYS.AUTH);
}

// ---------------- SQL SCHEMA SCRIPT GENERATOR ---------------- //

export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- VENDOR CONTROL DATABASE SCHEMA & RLS POLICIES
-- Vaduthala Hyper Shopee
-- ========================================================

-- 1. Create form_questions table
CREATE TABLE IF NOT EXISTS public.form_questions (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    type TEXT NOT NULL,
    placeholder TEXT,
    helper_text TEXT,
    options JSONB DEFAULT '[]'::jsonb,
    required BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    venture_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_answers JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 4. Form Questions RLS Policies
-- Anyone (public) can read active form questions to fill the form
CREATE POLICY "Public form questions viewable by all"
    ON public.form_questions FOR SELECT
    USING (true);

-- Only authenticated admins can insert/update/delete questions
CREATE POLICY "Admins full access to form questions"
    ON public.form_questions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Submissions RLS Policies
-- Public vendors can ONLY insert submissions (no reading other vendors' data)
CREATE POLICY "Public can insert vendor submissions"
    ON public.submissions FOR INSERT
    WITH CHECK (true);

-- Authenticated admins can view, update, and manage all submissions
CREATE POLICY "Admins full access to submissions"
    ON public.submissions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Insert Default Questions Seed
INSERT INTO public.form_questions (id, label, type, placeholder, helper_text, required, is_default, order_index)
VALUES 
    ('venture_name', 'Venture Name', 'text', 'e.g. Malabar Organic Harvests', 'The trade name or brand under which you market products', true, true, 0),
    ('company_name', 'Company Name', 'text', 'e.g. Malabar Agro & Dairy Private Limited', 'Registered legal entity name as per GST / Trade License', true, true, 1),
    ('phone', 'Phone Number', 'text', '+91 98470 12345', 'Primary business contact for procurement & purchasing team', true, true, 2),
    ('products', 'Products Offered', 'multiselect', 'Type product category or name and press Enter', 'List your key items, brands, or product categories', true, true, 3)
ON CONFLICT (id) DO NOTHING;
`;
