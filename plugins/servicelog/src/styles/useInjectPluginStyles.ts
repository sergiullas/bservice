import { useEffect } from 'react';
// Generated at build time from src/styles/servicelog-plugin.css -- see
// scripts/build-css.mjs and STORY 2.3 checkpoint B1.
import { SERVICELOG_PLUGIN_CSS } from './generated/servicelog-css';

let injected = false;

/**
 * Injects the plugin's scoped stylesheet into the document exactly once.
 * Everything it defines is either host-neutral (design tokens, the
 * `.metadata-label` component class) or scoped under `.servicelog-scope`
 * -- see servicelog-plugin.css -- so this is safe to call from a page
 * that mounts once per session, without needing removal on unmount.
 */
export function useInjectServicelogStyles(): void {
  useEffect(() => {
    if (injected) return;
    const style = document.createElement('style');
    style.setAttribute('data-servicelog-plugin-styles', '');
    style.textContent = SERVICELOG_PLUGIN_CSS;
    document.head.appendChild(style);
    injected = true;
  }, []);
}
