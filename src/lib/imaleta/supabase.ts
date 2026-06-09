import { createClient } from "@supabase/supabase-js";

function baseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export function createIMaletaServiceClient() {
  return baseClient().schema("imaleta");
}

export function createIMaletaStorageClient() {
  return baseClient();
}
