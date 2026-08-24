import { useState } from 'react';

let counter = 0;

/**
 * React 17-safe replacement for React 18's `useId`. The shared ServiceLog
 * core has to run under whichever React major the host provides (the
 * standalone app is still on React 17, see STORY 2.3 section 8), so it
 * can't rely on an API that doesn't exist there.  A plain per-mount counter
 * is sufficient here: every use is a client-only, non-SSR'd id for wiring
 * aria-describedby/aria-controls, not a hydration-sensitive id.
 */
export function useStableId(prefix: string): string {
  const [id] = useState(() => `${prefix}-${++counter}`);
  return id;
}
