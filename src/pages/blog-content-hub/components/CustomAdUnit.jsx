import React, { useEffect, useRef } from 'react';
import { loadExternalScript } from '../../../utils/scriptLoader';

// Renders custom/Yllix ad units. For script-based widgets, we optionally load a script URL.
const CustomAdUnit = ({ scriptUrl, html, className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let canceled = false;
    (async () => {
      if (scriptUrl) {
        await loadExternalScript(scriptUrl);
      }
      if (!canceled && containerRef.current && html) {
        // Insert provided HTML snippet into container
        containerRef.current.innerHTML = html;
      }
    })();
    return () => { canceled = true; };
  }, [scriptUrl, html]);

  if (!scriptUrl && !html) return null;
  return (
    <div className={`bg-surface border border-border-accent/20 rounded-lg overflow-hidden ${className}`}>
      <div ref={containerRef} />
    </div>
  );
};

export default CustomAdUnit;
