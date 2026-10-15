/**
 * THE swap point. Components get their data through this one export (via DataProvider).
 * With VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY set, the app talks to Supabase;
 * without them it runs on local sample data in the browser.
 */
import type { Repositories } from './repositories'
import { createLocalRepositories } from './local'
import { createSupabaseRepositories } from './supabase'
import { isSupabaseConfigured } from './supabase/client'

export function createRepositories(): Repositories {
  return isSupabaseConfigured ? createSupabaseRepositories() : createLocalRepositories()
}

export type { Repositories } from './repositories'
