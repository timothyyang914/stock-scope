import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Safety check to ensure we only use Supabase if real credentials exist
export const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!isSupabaseConfigured && process.env.NODE_ENV === 'production') {
    console.warn('Supabase credentials missing. Check your Vercel environments.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
