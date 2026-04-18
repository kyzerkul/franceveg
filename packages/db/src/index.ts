import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient(url: string, key: string) {
  return createClient(url, key)
}

export function createSupabaseServerClient(url: string, serviceRoleKey: string) {
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Re-export types
export type { SupabaseClient } from '@supabase/supabase-js'
export * from '@france-veg/types'
