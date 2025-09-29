import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { getCanonicalUrl } from '../../utils/canonical';

// Canonical tag injector. Place once near root so every route updates tag.
export default function Canonical() {
  const location = useLocation();
  // External flag (window.__SUPPRESS_CANONICAL) can be toggled by routes like 404.
  const suppress = typeof window !== 'undefined' && window.__SUPPRESS_CANONICAL;
  if (suppress) return null;
  const canonical = getCanonicalUrl(location.pathname + location.search);
  return (
    <Helmet>
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
}