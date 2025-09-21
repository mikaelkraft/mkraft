import supabase from './supabase';
import { api } from './api/client';

const USE_API = import.meta.env.VITE_USE_API === 'true';

class NewsletterService {
  // Subscribe to newsletter
  async subscribe(email, name = '') {
    try {
      if (!email || !this.isValidEmail(email)) {
        return { success: false, error: 'Valid email is required' };
      }

      if (USE_API) {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const data = await api.post('/newsletter', { email, name }, headers);
        return { success: true, data };
      } else {
        // Direct Supabase implementation
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .insert({
            email: email.toLowerCase().trim(),
            name: name.trim(),
            subscribed_at: new Date().toISOString(),
            is_active: true
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            return { success: false, error: 'Email is already subscribed' };
          }
          return { success: false, error: error.message };
        }

        return { success: true, data };
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to subscribe to newsletter' };
    }
  }

  // Unsubscribe from newsletter
  async unsubscribe(email) {
    try {
      if (!email || !this.isValidEmail(email)) {
        return { success: false, error: 'Valid email is required' };
      }

      if (USE_API) {
        const data = await api.delete('/newsletter', { email });
        return { success: true, data };
      } else {
        // Direct Supabase implementation
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .update({ 
            is_active: false,
            unsubscribed_at: new Date().toISOString()
          })
          .eq('email', email.toLowerCase().trim())
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data };
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to unsubscribe from newsletter' };
    }
  }

  // Check if email is already subscribed
  async checkSubscription(email) {
    try {
      if (!email || !this.isValidEmail(email)) {
        return { success: false, error: 'Valid email is required' };
      }

      if (USE_API) {
        const data = await api.get('/newsletter', { email });
        return { success: true, data };
      } else {
        // Direct Supabase implementation
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .select('email, is_active')
          .eq('email', email.toLowerCase().trim())
          .eq('is_active', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // No rows returned
            return { success: true, data: { subscribed: false } };
          }
          return { success: false, error: error.message };
        }

        return { success: true, data: { subscribed: true, email: data.email } };
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to check subscription status' };
    }
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

const newsletterService = new NewsletterService();
export default newsletterService;