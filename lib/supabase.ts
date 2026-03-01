import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('Supabase credentials missing during build or runtime.');
    }
}

// Only initialize if we have a URL to prevent "supabaseUrl is required" error during static build
export const supabase = supabaseUrl
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as any;
