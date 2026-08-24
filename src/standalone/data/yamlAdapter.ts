import * as yaml from 'js-yaml';
import catalogRaw from '../../../metadata/services.yaml?raw';
import { loadCatalog } from '../../../metadata/lib/validate';
import { Service } from '../../app/data/types';

/**
 * Standalone-only data adapter: the one place in this codebase allowed to
 * use a Vite-specific loading mechanism (`?raw` import) or know that the
 * catalog source is a single YAML file on disk. Everything downstream of
 * this module -- ServiceLogFeature, ServiceOfferingsPage, FilterBar,
 * ServiceCard, ServiceDetailDrawer -- only ever sees a plain `Service[]`.
 *
 * Loads eagerly/synchronously (matching V1 behavior) rather than
 * introducing async loading states this story doesn't call for. A future
 * Backstage host would supply its own adapter here without any change to
 * the product UI components.
 */
const CATALOG_FILE = 'metadata/services.yaml';

const { services: loadedServices, errors } = loadCatalog(yaml.load(catalogRaw), CATALOG_FILE);

if (errors.length > 0) {
  const details = errors
    .map((error) => {
      const expected = error.expected ? ` (expected: ${error.expected})` : '';
      return `  ${error.file} ${error.path}: ${error.message}${expected}`;
    })
    .join('\n');
  // ServiceLog must never silently accept, reinterpret, or coerce unknown
  // controlled metadata -- an invalid catalog fails loudly here rather than
  // rendering a partial or miscoerced service list.
  throw new Error(`ServiceLog metadata failed validation:\n${details}`);
}

export const services: Service[] = loadedServices;
