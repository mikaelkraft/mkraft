import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { LogIn, Mail, Lock, AlertCircle, Github } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { ADMIN_EMAIL } from '../../utils/authService';

const Login = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState('');

  const { signIn, signInWithOAuth } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn(email, password);
      if (result.success) {
        onSuccess?.();
        onClose?.();
        navigate('/admin-dashboard-content-management');
        showToast('Login successful', { type: 'success' });
      } else {
        setError(result.error || 'Invalid credentials');
        showToast(result.error || 'Invalid credentials', { type: 'error' });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.log('Sign in error:', err);
      showToast('An unexpected error occurred', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setOauthLoading(provider);
    setError('');
    try {
      const result = await signInWithOAuth(provider);
      if (result.success) {
        showToast(`Redirecting to ${provider} authentication...`, { type: 'info' });
        // OAuth will redirect, so we don't close the modal here
      } else {
        setError(result.error || 'OAuth authentication failed');
        showToast(result.error || 'OAuth authentication failed', { type: 'error' });
      }
    } catch (err) {
      setError('An unexpected error occurred during OAuth authentication');
      console.log('OAuth sign in error:', err);
      showToast('An unexpected error occurred during OAuth authentication', { type: 'error' });
    } finally {
      setOauthLoading(null);
    }
  };

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface border border-border-accent rounded-lg p-6 shadow-glow-primary">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Admin Access
          </h2>
          <p className="text-text-secondary">
            Sign in to manage your portfolio
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={() => handleOAuthSignIn('google')}
            disabled={oauthLoading === 'google' || isLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
            iconPosition="left"
          >
            {oauthLoading === 'google' ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            ) : (
              <GoogleIcon />
            )}
            {oauthLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </Button>

          <Button
            onClick={() => handleOAuthSignIn('github')}
            disabled={oauthLoading === 'github' || isLoading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            iconPosition="left"
          >
            {oauthLoading === 'github' ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-600 border-t-white" />
            ) : (
              <Github className="w-5 h-5" />
            )}
            {oauthLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-accent"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-surface text-text-secondary">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ADMIN_EMAIL}
                required
                autoComplete="email"
                className="w-full pl-10"
                disabled={isLoading || oauthLoading}
              />
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full pl-10"
                disabled={isLoading || oauthLoading}
              />
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full shadow-glow-primary"
            disabled={isLoading || oauthLoading}
            iconName={isLoading ? 'Loader2' : 'LogIn'}
            iconPosition="left"
          >
            {isLoading ? 'Signing In…' : 'Sign In'}
          </Button>
        </form>

        {onClose && (
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
              disabled={isLoading || oauthLoading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;