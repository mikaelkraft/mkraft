import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import newsletterService from '../../../utils/newsletterService';

const NewsletterSubscription = ({ currentTheme }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const getThemeClasses = () => {
    switch(currentTheme) {
      case 'neural':
        return {
          bg: 'bg-gradient-to-br from-purple-900/10 to-blue-900/10',
          border: 'border-purple-500/20',
          text: 'text-purple-200',
          accent: 'text-purple-400',
          cardBg: 'bg-purple-900/20 border-purple-500/30',
          input: 'bg-purple-900/30 border-purple-500/30 text-purple-100 placeholder-purple-300/70 focus:border-purple-400'
        };
      case 'futuristic':
        return {
          bg: 'bg-gradient-to-br from-slate-900/10 to-blue-900/10',
          border: 'border-blue-400/20',
          text: 'text-blue-200',
          accent: 'text-blue-400',
          cardBg: 'bg-slate-900/20 border-blue-400/30',
          input: 'bg-slate-900/30 border-blue-400/30 text-blue-100 placeholder-blue-300/70 focus:border-blue-400'
        };
      case 'dark':
        return {
          bg: 'bg-gradient-to-br from-gray-900/10 to-blue-900/10',
          border: 'border-blue-500/20',
          text: 'text-blue-200',
          accent: 'text-blue-400',
          cardBg: 'bg-gray-900/20 border-blue-500/30',
          input: 'bg-gray-900/30 border-blue-500/30 text-blue-100 placeholder-blue-300/70 focus:border-blue-400'
        };
      case 'light':
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-blue-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          accent: 'text-blue-600',
          cardBg: 'bg-white border-gray-200 shadow-lg',
          input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
        };
      default: // cyberpunk
        return {
          bg: 'bg-gradient-to-br from-surface/10 to-primary/5',
          border: 'border-primary/20',
          text: 'text-text-primary',
          accent: 'text-primary',
          cardBg: 'bg-surface/20 border-primary/30',
          input: 'bg-surface/30 border-primary/30 text-text-primary placeholder-text-secondary focus:border-primary'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Email is required');
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await newsletterService.subscribe(email, name);
      
      if (result.success) {
        setMessage('Successfully subscribed to newsletter!');
        setSuccess(true);
        setEmail('');
        setName('');
      } else {
        setMessage(result.error || 'Failed to subscribe');
        setSuccess(false);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }

    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage('');
      setSuccess(false);
    }, 5000);
  };

  return (
    <section className={`py-20 ${themeClasses.bg} border-t ${themeClasses.border}`}>
      <div className="max-w-4xl mx-auto px-6">
        <div className={`${themeClasses.cardBg} border rounded-xl p-8 md:p-12 text-center`}>
          {/* Header */}
          <div className="mb-8">
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full ${themeClasses.cardBg} border flex items-center justify-center`}>
              <Icon name="Mail" size={32} className={themeClasses.accent} />
            </div>
            <h2 className={`text-3xl md:text-4xl font-heading font-bold ${themeClasses.text} mb-4`}>
              Stay Updated
            </h2>
            <p className={`text-lg ${themeClasses.text} opacity-80 max-w-2xl mx-auto`}>
              Get the latest insights on technology, cybersecurity, and development directly in your inbox. 
              Join developers from around the world.
            </p>
          </div>

          {/* Subscription Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-fast`}
                disabled={loading}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-fast`}
                required
                disabled={loading}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="whitespace-nowrap"
                iconName={loading ? "Loader2" : "Send"}
                iconPosition="right"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg border text-sm ${
                success 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <div className="flex items-center gap-2">
                  <Icon 
                    name={success ? "CheckCircle" : "AlertCircle"} 
                    size={16} 
                    className={success ? "text-green-400" : "text-red-400"} 
                  />
                  {message}
                </div>
              </div>
            )}
          </form>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-opacity-20 border-current">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${themeClasses.cardBg} border flex items-center justify-center mb-3`}>
                  <Icon name="Zap" size={16} className={themeClasses.accent} />
                </div>
                <h4 className={`font-semibold ${themeClasses.text} mb-1`}>Weekly Insights</h4>
                <p className={`text-sm ${themeClasses.text} opacity-70`}>Latest tech trends and tutorials</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${themeClasses.cardBg} border flex items-center justify-center mb-3`}>
                  <Icon name="Shield" size={16} className={themeClasses.accent} />
                </div>
                <h4 className={`font-semibold ${themeClasses.text} mb-1`}>No Spam</h4>
                <p className={`text-sm ${themeClasses.text} opacity-70`}>Unsubscribe anytime, privacy protected</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${themeClasses.cardBg} border flex items-center justify-center mb-3`}>
                  <Icon name="Users" size={16} className={themeClasses.accent} />
                </div>
                <h4 className={`font-semibold ${themeClasses.text} mb-1`}>Join 2.5K+</h4>
                <p className={`text-sm ${themeClasses.text} opacity-70`}>Developers and tech enthusiasts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSubscription;