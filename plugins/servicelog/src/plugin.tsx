import { Cloud } from 'lucide-react';
import {
  ApiBlueprint,
  PageBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { rootRouteRef } from './routes';
import { BackstageServiceDataSource, servicelogApiRef } from './api';

const servicelogApi = ApiBlueprint.make({
  params: (defineParams) =>
    defineParams({
      api: servicelogApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) => new BackstageServiceDataSource(discoveryApi, fetchApi),
    }),
});

const servicelogPage = PageBlueprint.make({
  params: {
    path: '/servicelog',
    routeRef: rootRouteRef,
    title: 'Service Offerings',
    icon: <Cloud />,
    loader: () => import('./components/ServiceLogPage').then((m) => <m.ServiceLogPage />),
  },
});

/**
 * The `servicelog` frontend plugin (STORY 2.3 checkpoint C). Supplies
 * ServiceLog content only -- Backstage's own app shell provides the chrome
 * around it (see docs/backstage-compatibility.md #4/#8). The standalone
 * Sidebar is never imported here or anywhere in this package.
 */
export const servicelogPlugin = createFrontendPlugin({
  pluginId: 'servicelog',
  info: { packageJson: () => import('../package.json') },
  routes: { root: rootRouteRef },
  extensions: [servicelogApi, servicelogPage],
});

export default servicelogPlugin;
