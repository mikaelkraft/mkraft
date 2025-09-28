import { useMemo } from 'react';

// Simple placeholder; future: fetch from /api/settings/features and cache
export function useFeature(flagKey) {
  return useMemo(() => {
    // For now always enabled; can add map of temporary off flags
    return true;
  }, [flagKey]);
}

export default useFeature;
