import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

const hasInvalidSupabaseUrl =
  !!supabaseUrl && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(supabaseUrl)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars are missing. Create a .env file from .env.example and add your project URL + anon key.'
  )
} else if (hasInvalidSupabaseUrl) {
  console.warn(
    'Supabase URL looks wrong. It should be your project URL like https://<project-ref>.supabase.co, not localhost or 127.0.0.1.'
  )
}

export const supabase = createClient(supabaseUrl || 'https://example.supabase.co', supabaseAnonKey || 'public-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
