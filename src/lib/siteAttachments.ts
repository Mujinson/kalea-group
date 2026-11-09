import { supabase } from '@/integrations/supabase/client';

/** Opens a site attachment; private files (e.g. copied from a quote) get a short-lived signed URL. */
export async function openSiteAttachment(a: { file_url?: string; storage_bucket?: string | null; storage_path?: string | null }) {
  const win = window.open('', '_blank');
  let url = a.file_url || '';
  if (a.storage_bucket && a.storage_path) {
    const { data } = await supabase.storage.from(a.storage_bucket).createSignedUrl(a.storage_path, 600);
    if (data?.signedUrl) url = data.signedUrl;
  }
  if (win) win.location.href = url; else window.open(url, '_blank');
}
