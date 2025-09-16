import React, { useState } from 'react';
import { X } from 'lucide-react';
import Login from './Login';
import Signup from './Signup';

const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState(defaultMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-full p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative w-full max-w-md">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-surface border border-border-accent rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary transition-all shadow-glow-primary"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Auth Form */}
          {mode === 'login' ? (
            <Login onClose={onClose} onSuccess={handleSuccess} />
          ) : (
            <Signup onClose={onClose} onSuccess={handleSuccess} />
          )}

          {/* Mode Switch */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary hover:text-primary/80 transition-colors text-sm"
            >
              {mode === 'login' 
                ? "Need an admin account? Sign up" :"Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;