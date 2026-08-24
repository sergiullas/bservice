import { createApiRef, type DiscoveryApi, type FetchApi } from '@backstage/core-plugin-api';
import type { Service } from '@servicelog/core';

/**
 * STORY 2.3 checkpoint D's frontend-facing seam. `ServiceLogFeature` (and
 * everything in @servicelog/core -- ServiceOfferingsPage, FilterBar,
 * ServiceCard, ServiceDetailDrawer) never sees this interface and has no
 * idea data came from Backstage; it only ever receives a plain `Service[]`
 * prop. Backstage-specific discovery/auth/fetch usage is confined to
 * `BackstageServiceDataSource` below.
 */
export interface ServiceDataSource {
  getServices(): Promise<Service[]>;
}

export const servicelogApiRef = createApiRef<ServiceDataSource>({
  id: 'plugin.servicelog.service',
});

export class BackstageServiceDataSource implements ServiceDataSource {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  async getServices(): Promise<Service[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('servicelog');
    const response = await this.fetchApi.fetch(`${baseUrl}/services`);
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `ServiceLog backend request failed (${response.status} ${response.statusText})${body ? `: ${body}` : ''}`,
      );
    }
    const payload = (await response.json()) as { services: Service[] };
    return payload.services;
  }
}
