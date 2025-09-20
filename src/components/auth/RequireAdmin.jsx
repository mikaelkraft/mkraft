import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../utils/authService';

const RequireAdmin = ({ children }) => {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const isAdmin = await authService.isAdmin();
        if (mounted) {
          setAllowed(isAdmin);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  if (loading) return null; // optionally show a spinner
  if (!allowed) return <Navigate to="/portfolio-home-hero" replace />;
  return children;
};

export default RequireAdmin;
