import { User } from '@supabase/supabase-js'

import { supabaseBrowserClient } from '@/shared/utils/supabase/client'

class AuthService {
  async checkAdminStatus(user: User): Promise<boolean> {
    try {
      const { data: profile, error } = await supabaseBrowserClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (error || !profile) {
        await this.createUserProfile(user)
        return false
      }

      return profile.role === 'admin'
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false
    }
  }

  private async createUserProfile(user: User) {
    try {
      await supabaseBrowserClient
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email || '',
            role: 'user',
          },
        ])
        .single()
    } catch (error) {
      console.error('Failed to create user profile:', error)
    }
  }

  async signOut(): Promise<void> {
    const confirmed = window.confirm('로그아웃하시겠습니까?')
    if (!confirmed) return

    const { error } = await supabaseBrowserClient.auth.signOut()
    if (error) throw error
  }

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabaseBrowserClient.auth.getSession()

    if (error) throw error
    return session
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabaseBrowserClient.auth.onAuthStateChange(
      async (event, session) => {
        callback(session?.user ?? null)
      },
    )
  }
}

export const authService = new AuthService()
