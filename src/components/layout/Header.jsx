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
  // Prefer explicit variant logos, then legacy fields, then static mklogo asset
  const chosen = data.logo_light_url || data.logo_dark_url || data.site_logo_url || data.logo_url || '/assets/images/mklogo.png';
  setLogo(chosen);
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
