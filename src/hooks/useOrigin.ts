import { useEffect, useState } from 'react';

export function useOrigin() {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.origin) {
        setOrigin(window.location.origin);
      }
    } catch (error) {
      console.error('Error accessing window.location.origin:', error);
    }
  }, []);

  return origin;
}
