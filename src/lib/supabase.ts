import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { FormQuestion, VendorSubmission, AdminUser } from './types';
import { DEFAULT_QUESTIONS, INITIAL_SUBMISSIONS } from './mockData';

// Storage keys for local fallback
const STORAGE_KEYS = {
  QUESTIONS: 'vhs_form_questions_v3',
  SUBMISSIONS: 'vhs_vendor_submissions_v3',
  AUTH: 'vhs_admin_auth_v1',
  SUPABASE_CONFIG: 'vhs_supabase_config_v1',
};

// Known legacy sample IDs to auto-purge
const LEGACY_MOCK_IDS = new Set([
  'VHS-20260917-8492',
  'VHS-20260917-7104',
  'VHS-20260917-6320',
  'VHS-20260916-5219',
  'VHS-20260916-4108',
  'VHS-20260915-3094',
  'VHS-20260914-2081',
]);

export function isSampleSubmission(sub: VendorSubmission): boolean {
  if (!sub) return false;
  if (LEGACY_MOCK_IDS.has(sub.id)) return true;
  const name = (sub.venture_name || '').toLowerCase();
  const comp = (sub.company_name || '').toLowerCase();
  if (
    name.includes('greenvalley') ||
    name.includes('highland dairy') ||
    name.includes('oceanfresh') ||
    name.includes('bakecraft') ||
    name.includes('cleanmax') ||
    name.includes('tropical beverages') ||
    name.includes('prime mill')
  ) {
    return true;
  }
  if (
    comp.includes('greenvalley') ||
    comp.includes('highland milk') ||
    comp.includes('munambam') ||
    comp.includes('bakecraft') ||
    comp.includes('southern chemicals') ||
    comp.includes('tropical agro') ||
    comp.includes('prime agro')
  ) {
    return true;
  }
  return false;
}

// Immediately wipe all old mock storage in browser
try {
  localStorage.removeItem('vhs_vendor_submissions_v1');
  localStorage.removeItem('vhs_vendor_submissions_v2');
  localStorage.removeItem('vhs_form_questions_v1');
  localStorage.removeItem('vhs_form_questions_v2');

  const existingSubs = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  if (existingSubs) {
    const parsed: VendorSubmission[] = JSON.parse(existingSubs);
    const cleaned = parsed.filter((s) => !isSampleSubmission(s));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(cleaned));
  }
} catch (e) {
  console.warn('Could not auto-clean localStorage sample data', e);
}


const DEFAULT_SUPABASE_URL = 'https://mdvpieficowbguqmmjch.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdnBpZWZpY293Ymd1cW1tamNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2Mjg1MDgsImV4cCI6MjEwNTIwNDUwOH0.N_21120F_HRxoCklMczNlqZ2WJZfl1XORc1004CG3t8';

// Initial default configuration
let supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
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
    const parsed: FormQuestion[] = JSON.parse(data);
    return parsed.filter(
      (q) =>
        q.id !== 'cust_delivery_lead_time' &&
        q.id !== 'cust_vendor_tier' &&
        q.id !== 'cust_fssai_gst' &&
        q.id !== 'cust_sample_availability'
    );
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
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
      return [];
    }
    const parsed: VendorSubmission[] = JSON.parse(data);
    return parsed.filter((s) => !isSampleSubmission(s));
  } catch {
    return [];
  }
}

function setLocalSubmissions(submissions: VendorSubmission[]) {
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
}

// ---------------- FORM QUESTIONS REPOSITORY ---------------- //

// ---------------- FORM QUESTIONS REPOSITORY ---------------- //

export async function fetchFormQuestions(): Promise<FormQuestion[]> {
  const client = getSupabaseClient();
  if (client) {
    const { data, error } = await client
      .from('form_questions')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Supabase fetch questions error:', error);
      throw new Error(`Failed to fetch questions from Supabase: ${error.message}`);
    }
    if (data && data.length > 0) {
      return data as FormQuestion[];
    }

    // Seed defaults into Supabase if empty
    try {
      const defaultWithCreated = DEFAULT_QUESTIONS.map((q) => ({
        ...q,
        created_at: new Date().toISOString(),
      }));
      await client.from('form_questions').upsert(defaultWithCreated);
      return defaultWithCreated;
    } catch (err) {
      console.warn('Supabase questions auto-seed note:', err);
      return DEFAULT_QUESTIONS;
    }
  }
  return getLocalQuestions();
}

export async function saveFormQuestion(question: FormQuestion): Promise<FormQuestion> {
  const client = getSupabaseClient();
  if (client) {
    const { data, error } = await client
      .from('form_questions')
      .upsert(question)
      .select()
      .single();

    if (error) {
      console.error('Supabase save question error:', error);
      throw new Error(`Failed to save question to Supabase: ${error.message}`);
    }
    if (data) return data as FormQuestion;
  }

  // Fallback to local storage ONLY if Supabase is unconfigured
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
    const { error } = await client
      .from('form_questions')
      .delete()
      .eq('id', questionId);

    if (error) {
      console.error('Supabase delete question error:', error);
      throw new Error(`Failed to delete question from Supabase: ${error.message}`);
    }
    return true;
  }

  const questions = getLocalQuestions();
  const filtered = questions.filter((q) => q.id !== questionId);
  setLocalQuestions(filtered);
  return true;
}

// ---------------- VENDOR SUBMISSIONS REPOSITORY ---------------- //

export async function fetchSubmissions(): Promise<VendorSubmission[]> {
  const client = getSupabaseClient();
  let cloudSubmissions: VendorSubmission[] = [];

  if (client) {
    try {
      const { data, error } = await client
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch submissions error:', error);
      } else if (data) {
        // Auto-purge sample test records from Supabase
        const sampleRecords = data.filter((s: VendorSubmission) => isSampleSubmission(s));
        if (sampleRecords.length > 0) {
          const sampleIds = sampleRecords.map((s: VendorSubmission) => s.id);
          client.from('submissions').delete().in('id', sampleIds).then(() => {});
        }

        const cleaned = data.filter((s: VendorSubmission) => !isSampleSubmission(s)) as VendorSubmission[];

        // Hydrate product_items from custom_answers._product_items if top-level column was missing
        cloudSubmissions = cleaned.map((sub) => {
          if ((!sub.product_items || sub.product_items.length === 0) && sub.custom_answers?._product_items) {
            return {
              ...sub,
              product_items: sub.custom_answers._product_items,
            };
          }
          return sub;
        });
      }
    } catch (err) {
      console.warn('Failed to query Supabase cloud submissions:', err);
    }
  }

  // Get local submissions
  const localSubs = getLocalSubmissions();
  const cloudMap = new Map<string, VendorSubmission>();
  cloudSubmissions.forEach((s) => cloudMap.set(s.id, s));

  // Auto-sync any local submissions that are not yet uploaded to Supabase Cloud
  const unSyncedLocals = localSubs.filter((s) => !cloudMap.has(s.id));
  if (unSyncedLocals.length > 0 && client) {
    const uploadPayloads = unSyncedLocals.map((s) => {
      const enrichedCustomAnswers = {
        ...(s.custom_answers || {}),
        _product_items: s.product_items || [],
      };
      const { product_items, ...compat } = s;
      return {
        ...compat,
        custom_answers: enrichedCustomAnswers,
      };
    });

    try {
      client
        .from('submissions')
        .upsert(uploadPayloads)
        .then(({ error: upsertErr }) => {
          if (!upsertErr) {
            console.log(`Auto-synced ${unSyncedLocals.length} local submissions to Supabase Cloud!`);
          } else {
            console.warn('Auto-sync upsert warning:', upsertErr.message);
          }
        });
    } catch (syncErr) {
      console.warn('Auto-sync error:', syncErr);
    }

    // Include unSyncedLocals in current results
    unSyncedLocals.forEach((s) => cloudMap.set(s.id, s));
  }

  const allMerged = Array.from(cloudMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Keep local storage cache updated with complete merged data
  if (allMerged.length > 0) {
    setLocalSubmissions(allMerged);
  }

  return allMerged;
}

export async function createVendorSubmission(
  submissionData: Omit<VendorSubmission, 'id' | 'created_at' | 'status'>
): Promise<VendorSubmission> {
  // Generate unique formatted ID: VHS-YYYYMMDD-XXXX
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newId = `VHS-${dateStr}-${randomSuffix}`;
  const nowIso = new Date().toISOString();

  // Embed product_items in custom_answers._product_items for guaranteed DB schema compatibility across all versions
  const enrichedCustomAnswers = {
    ...(submissionData.custom_answers || {}),
    _product_items: submissionData.product_items || [],
  };

  const newSubmission: VendorSubmission = {
    ...submissionData,
    id: newId,
    status: 'new',
    created_at: nowIso,
    custom_answers: enrichedCustomAnswers,
  };

  // 1. Always update local storage first so vendor screen responds instantly without data loss
  const localSubmissions = getLocalSubmissions();
  localSubmissions.unshift(newSubmission);
  setLocalSubmissions(localSubmissions);

  // 2. Persist to Supabase Cloud directly using compatible payload
  const client = getSupabaseClient();
  if (client) {
    try {
      const { product_items, ...compatPayload } = newSubmission;
      const { error } = await client.from('submissions').insert([compatPayload]);
      if (error) {
        console.error('Supabase Cloud insert error:', error.message);
      } else {
        console.log('Successfully saved vendor submission to Supabase Cloud!');
      }
    } catch (cloudErr) {
      console.error('Error persisting submission to Supabase Cloud:', cloudErr);
    }
  }

  return newSubmission;
}


export async function updateSubmissionStatus(
  id: string,
  status: VendorSubmission['status'],
  notes?: string
): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    const updatePayload: any = { status };
    if (notes !== undefined) updatePayload.notes = notes;

    const { error } = await client
      .from('submissions')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Supabase update submission status error:', error);
      throw new Error(`Failed to update submission in Supabase: ${error.message}`);
    }
    return true;
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
    const { error } = await client
      .from('submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete submission error:', error);
      throw new Error(`Failed to delete submission from Supabase: ${error.message}`);
    }
    return true;
  }

  const submissions = getLocalSubmissions();
  const filtered = submissions.filter((s) => s.id !== id);
  setLocalSubmissions(filtered);
  return true;
}

export async function clearAllSubmissions(): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    const { error } = await client
      .from('submissions')
      .delete()
      .neq('id', '___force_clear_all___');

    if (error) {
      console.error('Supabase clear submissions error:', error);
      throw new Error(`Failed to clear submissions in Supabase: ${error.message}`);
    }
    // Also purge local cache
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    return true;
  }

  localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
  setLocalSubmissions([]);
  return true;
}


export async function resetQuestionsToCore(): Promise<FormQuestion[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      // Delete non-default questions from Supabase if any
      await client
        .from('form_questions')
        .delete()
        .eq('is_default', false);
    } catch (err) {
      console.warn('Supabase reset questions failed:', err);
    }
  }

  setLocalQuestions(DEFAULT_QUESTIONS);
  return DEFAULT_QUESTIONS;
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
    error: 'Invalid email or password. Please verify your credentials.',
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
    product_items JSONB DEFAULT '[]'::jsonb,
    custom_answers JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration check: ensure product_items column exists if table already created
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS product_items JSONB DEFAULT '[]'::jsonb;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 4. Form Questions RLS Policies
DROP POLICY IF EXISTS "Public form questions viewable by all" ON public.form_questions;
DROP POLICY IF EXISTS "Admins full access to form questions" ON public.form_questions;
DROP POLICY IF EXISTS "Allow anon all form questions" ON public.form_questions;

CREATE POLICY "Allow anon all form questions"
    ON public.form_questions FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 5. Submissions RLS Policies (Allows ALL devices to Insert, Read, Update, and Delete)
DROP POLICY IF EXISTS "Public can insert vendor submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins full access to submissions" ON public.submissions;
DROP POLICY IF EXISTS "Public full access to submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow anon all submissions" ON public.submissions;

CREATE POLICY "Allow anon all submissions"
    ON public.submissions FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 6. Enable Realtime Publications for instant cross-device updates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.form_questions;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;


-- 7. Insert Default Questions Seed
INSERT INTO public.form_questions (id, label, type, placeholder, helper_text, required, is_default, order_index)
VALUES 
    ('venture_name', 'Vendor Name', 'text', 'e.g. Malabar Organic Harvests', 'Vendor trade name or brand', true, true, 0),
    ('company_name', 'Distribution', 'text', 'e.g. Malabar Agro & Distribution Pvt Ltd', 'Distribution network or registered company name', true, true, 1),
    ('phone', 'Phone', 'text', '+91 98470 12345', 'Direct contact number for Purchase Order approvals', true, true, 2),

    ('products', 'Products Offered', 'multiselect', 'Type product category or name and press Enter', 'List your key items, brands, or product categories', true, true, 3)
ON CONFLICT (id) DO NOTHING;
`;

