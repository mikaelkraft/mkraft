import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const Login = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('admin@cyberkraft.dev');
  const [password, setPassword] = useState('CyberKraft2024!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);

      if (result.success) {
        onSuccess?.();
        onClose?.();
        // Navigate to admin dashboard
        navigate('/admin-dashboard-content-management');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.log('Login error:', error);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cyberkraft.dev"
              required
              autoComplete="email"
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-border-primary text-primary focus:ring-primary focus:ring-offset-0"
                disabled={isLoading}
              />
              <span className="ml-2 text-text-secondary">Remember me</span>
            </label>
            <button
              type="button"
              className="text-primary hover:text-primary/80 transition-colors"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full shadow-glow-primary"
            disabled={isLoading}
            iconName={isLoading ? 'Loader2' : 'LogIn'}
            iconPosition="left"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-primary">
          <div className="text-center">
            <p className="text-text-secondary text-sm mb-3">
              Demo Credentials for Testing:
            </p>
            <div className="bg-background/50 rounded-lg p-3 text-xs font-mono">
              <div className="text-text-secondary">Email: admin@cyberkraft.dev</div>
              <div className="text-text-secondary">Password: CyberKraft2024!</div>
            </div>
          </div>
        </div>

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