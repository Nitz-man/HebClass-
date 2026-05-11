import { useEffect, useState } from 'react';

// Respects the user's OS-level reduced-motion preference. Components can
// strip non-essential animation when this returns true (kids who get
// motion-sick, parents who set the system preference, etc.).
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
