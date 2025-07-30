/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required. Make sure to set them in your .env.local file for local development, and in your Vercel project settings for deployment.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);