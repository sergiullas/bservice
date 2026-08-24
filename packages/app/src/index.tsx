import ReactDOM from 'react-dom/client';
import { createApp } from '@backstage/frontend-defaults';
import servicelogPlugin from '@internal/plugin-servicelog';

/**
 * STORY 2.3 experimental Backstage harness app. Backstage's new frontend
 * system app shell (nav, sign-in, theme, routing) owns everything here
 * except the one feature installed below -- see
 * docs/backstage-compatibility.md and STORY 2.3 section 4. The
 * standalone Sidebar/theme (src/standalone) is never imported by this
 * package.
 *
 * React 18: the new frontend system's default app shell
 * (@backstage/plugin-app) transitively needs React 18-only hooks
 * (framer-motion), so this harness -- and the workspace it shares a
 * hoisted React copy with -- runs on 18. See STORY 2.3 section 8 (which
 * permits this "if required for shared-code compatibility") and
 * docs/backstage-compatibility.md section 3 for how this was verified,
 * not assumed.
 */
const app = createApp({
  features: [servicelogPlugin],
});

const root = app.createRoot();
const rootEl = document.getElementById('root')!;
ReactDOM.createRoot(rootEl).render(root);
