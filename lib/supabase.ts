import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cxmumqgcroayesfzeqxs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bXVtcWdjcm9heWVzZnplcXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTMxNTYsImV4cCI6MjA5MDk2OTE1Nn0.ld4lv58cMaEfq3jEFGGRs_YxK8TcFTZAJmO_CqcIChM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
