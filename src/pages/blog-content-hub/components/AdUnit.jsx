import React, { useEffect, useRef } from 'react';
import { ensureAdSenseLoaded, pushAd } from '../../../utils/adsense';

const AdUnit = ({ publisherId, slotId, layout = 'in-article', format = 'auto', className = '' }) => {
  const insRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ok = await ensureAdSenseLoaded(publisherId);
      if (!mounted) return;
      if (ok && insRef.current) {
        // Allow a tick for DOM insertion
        setTimeout(() => pushAd(), 0);
      }
    })();
    return () => { mounted = false; };
  }, [publisherId, slotId]);

  if (!publisherId || !slotId) return null;

  const client = publisherId.startsWith('ca-pub-') ? publisherId : `ca-pub-${publisherId}`;

  return (
    <div className={`bg-surface border border-border-accent/20 rounded-lg overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle block"
        ref={insRef}
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdUnit;
