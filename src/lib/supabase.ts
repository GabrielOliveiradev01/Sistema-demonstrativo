import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Cliente Supabase para uso no browser (React). Use nas páginas e componentes. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
