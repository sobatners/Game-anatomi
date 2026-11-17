import { useEffect, useState } from 'react';

/**
 * desktop   : layar lebar & tinggi (laptop, tablet landscape besar)
 * portrait  : HP / tablet posisi tegak  -> 3D di atas, panel di bawah
 * landscape : HP posisi mendatar        -> 3D di kiri, panel di kanan
 */
export type LayoutMode = 'desktop' | 'portrait' | 'landscape';

function detect(): LayoutMode {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  const h = window.innerHeight;
  const compact = w < 1024 || h < 560;
  if (!compact) return 'desktop';
  return w > h ? 'landscape' : 'portrait';
}

export function useLayout(): { mode: LayoutMode; compact: boolean; isTouch: boolean } {
  const [mode, setMode] = useState<LayoutMode>(detect);

  useEffect(() => {
    const update = () => setMode(detect());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  const isTouch =
    typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches === true;

  return { mode, compact: mode !== 'desktop', isTouch };
}
