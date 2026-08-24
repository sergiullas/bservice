import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// Guest auth: this harness has no real identity provider (see STORY 2.3
// checkpoint A / docs/backstage-compatibility.md #9). It is still real,
// httpAuth-validated credential flow -- Backstage's own standard minimal
// answer for "give me a working signed-in session locally" -- not a bypass
// of the servicelog-backend route's auth check.
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

backend.add(import('@internal/plugin-servicelog-backend'));

backend.start();
