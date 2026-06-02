import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

if (
  supabaseUrl.includes("placeholder-project") ||
  supabaseUrl === "https://your-project-url.supabase.co" ||
  supabaseAnonKey === "your-anon-key" ||
  supabaseAnonKey === "placeholder-key"
) {
  console.warn(
    "Supabase credentials not configured or using placeholders. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
