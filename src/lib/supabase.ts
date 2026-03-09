import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-for-build";

/** Cliente Supabase para uso no browser (React). Use nas páginas e componentes. */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
