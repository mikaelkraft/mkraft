import supabase from './supabase';

export const ADMIN_EMAIL = 'mikewillkraft@gmail.com';

class AuthService {
  // Detect local/dev environment (Vite)
  isDevEnv() {
    try {
      const viteDev = typeof import.meta !== 'undefined' && import.meta && import.meta.env && !!import.meta.env.DEV;
      const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
      return !!(viteDev || isLocalhost);
    } catch (_) {
      return false;
    }
  }
  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        return { 
          success: false, 
          error: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.' 
        };
      }
      return { success: false, error: 'An unexpected error occurred during sign in' };
    }
  }

  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || '',
            role: userData.role || 'admin'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        return { 
          success: false, 
          error: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.' 
        };
      }
      return { success: false, error: 'An unexpected error occurred during sign up' };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      // Dev-only cleanup
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('dev_admin');
          window.localStorage.removeItem('dev_admin_email');
          window.localStorage.removeItem('dev_admin_code');
        }
      } catch (_) {}

      return { success: true };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to authentication service. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'An unexpected error occurred during sign out' };
    }
  }

  // Request email OTP or magic link (admin email only)
  async requestOtp(email) {
    try {
      if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        return { success: false, error: 'This email is not allowed.' };
      }
      // Local dev fallback: generate a code and store it locally
      if (this.isDevEnv()) {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('dev_admin_email', email);
          window.localStorage.setItem('dev_admin_code', code);
          // Surface in console for local testing
          console.log('[DEV ONLY] Admin OTP code:', code);
        }
        return { success: true, data: { dev: true } };
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          shouldCreateUser: true,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('AuthRetryableFetchError')
      ) {
        return {
          success: false,
          error:
            'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.',
        };
      }
      return { success: false, error: 'Failed to send OTP' };
    }
  }

  // Verify email OTP code
  async verifyOtp(email, token) {
    try {
      if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        return { success: false, error: 'This email is not allowed.' };
      }

      // Local dev fallback: accept local code and set dev admin flag
      if (this.isDevEnv()) {
        const storedEmail = typeof window !== 'undefined' ? window.localStorage.getItem('dev_admin_email') : null;
        const storedCode = typeof window !== 'undefined' ? window.localStorage.getItem('dev_admin_code') : null;
        if (storedEmail && storedCode && storedEmail.toLowerCase() === email.toLowerCase() && String(token) === String(storedCode)) {
          try {
            window.localStorage.setItem('dev_admin', 'true');
            window.localStorage.removeItem('dev_admin_code');
          } catch (_) {}
          return { success: true, data: { dev: true } };
        }
        return { success: false, error: 'Invalid code (dev)' };
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Ensure profile exists/updated
      if (data?.user?.id) {
        await this.ensureAdminProfile(data.user.id, email);
      }

      return { success: true, data };
    } catch (error) {
      if (
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('AuthRetryableFetchError')
      ) {
        return {
          success: false,
          error:
            'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.',
        };

        // Clear dev admin flag
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('dev_admin');
            window.localStorage.removeItem('dev_admin_email');
            window.localStorage.removeItem('dev_admin_code');
          }
        } catch (_) {}
      }
      return { success: false, error: 'Invalid or expired OTP' };
    }
  }

  async ensureAdminProfile(userId, email) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: userId,
            email,
            full_name: email.split('@')[0],
            role: 'admin',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select('id')
        .single();

      if (error) {
        console.log('ensureAdminProfile error:', error);
      }
      return { success: true, data };
    } catch (e) {
      console.log('ensureAdminProfile catch:', e);
      return { success: false };
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to authentication service. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to get session' };
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load user profile' };
    }
  }

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        return { 
          success: false, 
          error: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.' 
        };
      }
      return { success: false, error: 'Failed to send reset email' };
    }
  }

  // Listen for auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Check if user is admin
  async isAdmin() {
    try {
      // Local dev admin shortcut
      try {
        if (typeof window !== 'undefined' && window.localStorage.getItem('dev_admin') === 'true') {
          return true;
        }
      } catch (_) {}

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        return false;
      }

      return data.role === 'admin';
    } catch (error) {
      return false;
    }
  }
}

const authService = new AuthService();
export default authService;