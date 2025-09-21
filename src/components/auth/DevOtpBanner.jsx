import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';

const DevOtpBanner = () => {
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    try {
      const isDev = typeof import.meta !== 'undefined' && import.meta && import.meta.env && import.meta.env.DEV;
      const isDevAdmin = typeof window !== 'undefined' && window.localStorage.getItem('dev_admin') === 'true';
      if (isDev && isDevAdmin) {
        setVisible(true);
        setCode(window.localStorage.getItem('dev_admin_code') || '');
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, []);

  if (!visible) return null;

  const handleCopy = async () => {
    try {
      const value = window.localStorage.getItem('dev_admin_code') || code || '';
      if (!value) return;
      await navigator.clipboard.writeText(value);
      console.log('Copied dev OTP code to clipboard');
    } catch (error) {
      console.error('Error copying OTP code:', error);
    }
  };

  const handleHide = () => setVisible(false);

  const handleClear = () => {
    try {
      window.localStorage.removeItem('dev_admin_code');
      setCode('');
    } catch (error) {
      console.error('Error clearing OTP code:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] bg-surface/95 backdrop-blur border border-yellow-400/30 rounded-lg shadow-glow-primary p-3 flex items-center gap-2">
      <span className="text-xs text-yellow-300 font-medium">Dev OTP</span>
      <span className="text-xs text-text-secondary">Code is in console</span>
      <Button size="xs" variant="outline" onClick={handleCopy} iconName="Clipboard">
        Copy
      </Button>
      <Button size="xs" variant="ghost" onClick={handleClear} iconName="Eraser">
        Clear
      </Button>
      <Button size="xs" variant="ghost" onClick={handleHide} iconName="X">
        Hide
      </Button>
    </div>
  );
};

export default DevOtpBanner;
