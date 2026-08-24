import { coreServices, createBackendPlugin } from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * The `servicelog` backend plugin -- STORY 2.3 checkpoint D. Serves
 * validated, normalized `Service[]` at `/api/servicelog/services` for the
 * `servicelog` frontend plugin's data adapter to consume. All
 * Backstage-specific discovery/auth/API usage stays in this package and
 * `src/service/router.ts`; the actual YAML validation/normalization is the
 * same Story 2.2 `@servicelog/metadata` library the standalone host uses,
 * not a second implementation.
 */
export const servicelogPlugin = createBackendPlugin({
  pluginId: 'servicelog',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        config: coreServices.rootConfig,
      },
      async init({ logger, httpRouter, httpAuth, config }) {
        httpRouter.use(await createRouter({ logger, httpAuth, config }));
      },
    });
  },
});

export default servicelogPlugin;
