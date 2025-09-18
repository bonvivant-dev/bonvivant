import { supabaseBrowserClient } from '@/shared/utils/supabase/client'

export async function signInWithGoogle() {
  await supabaseBrowserClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}
