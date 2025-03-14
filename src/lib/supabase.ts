
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const SUPABASE_URL = "https://jytgracbheteftrayvyo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dGdyYWNiaGV0ZWZ0cmF5dnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NzQxMDgsImV4cCI6MjA1NzQ1MDEwOH0.V_SZD2qs8kOKwxDeTBLxY5yj2NWEpDzunZDP9zf5y3g";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials');
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
