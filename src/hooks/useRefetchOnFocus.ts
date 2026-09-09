import { useEffect, useRef } from 'react';

export function useRefetchOnFocus(refetchFn: () => void) {
  const ref = useRef(refetchFn);
  ref.current = refetchFn;

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') ref.current();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);
}
