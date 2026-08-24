import { createDevApp } from '@backstage/frontend-dev-utils';
import servicelogPlugin from '../src/plugin';

/**
 * STORY 2.3 checkpoint C's isolated plugin dev harness: `npm start` in
 * this package (via `backstage-cli package start`) hot-reloads the
 * servicelog plugin alone, without running packages/app or
 * packages/backend.
 */
createDevApp({ features: [servicelogPlugin] });
