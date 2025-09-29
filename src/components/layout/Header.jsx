import React, { useEffect, useState } from 'react';
import settingsService from '../../utils/settingsService';
import Image from '../AppImage';

function Header() {
  const [logo, setLogo] = useState(null);
  const [title, setTitle] = useState('');
  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await settingsService.getSettings();
      if (!mounted || !res.success) return;
      const data = res.data || {};
      setLogo(data.site_logo_url || data.logo_url || null);
      setTitle(data.site_title || 'Site');
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <header className="flex items-center gap-3 p-3 border-b border-[var(--color-border)]">
      {logo ? (
        <Image src={logo} alt={title + ' logo'} className="h-10 w-auto object-contain" />
      ) : (
        <div className="text-xl font-heading">{title}</div>
      )}
    </header>
  );
}

export default Header;
