import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { ADMIN_EMAIL } from '../../utils/authService';

const Login = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
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
            Sign in to manage your cyberpunk portfolio
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full shadow-glow-primary"
            disabled={isLoading}
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
              disabled={isLoading}
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